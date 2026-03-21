"use no memo";

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AppState } from '../types';

// Simplex 3D noise GLSL (Ashima Arts)
const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}

float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
${simplexNoise}
uniform float uTime;
uniform vec2 uMouse;
varying vec2 vUv;

void main() {
  vec2 st = vUv * 2.0 - 1.0;
  st += uMouse * 0.06;

  float n = 0.0;
  n += 0.5 * snoise(vec3(st * 1.2, uTime * 0.12));
  n += 0.25 * snoise(vec3(st * 2.4, uTime * 0.18));
  n += 0.125 * snoise(vec3(st * 4.8, uTime * 0.25));
  n += 0.0625 * snoise(vec3(st * 9.6, uTime * 0.32));

  float brightness = smoothstep(-0.4, 0.7, n);
  brightness = mix(0.85, 1.0, brightness);

  gl_FragColor = vec4(vec3(brightness), 1.0);
}
`;

function CloudPlane({ mousePosition, speed }: { mousePosition: { x: number; y: number }; speed: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const smoothMouse = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = clock.getElapsedTime() * speed;
    // Smooth mouse interpolation
    smoothMouse.current.x += (mousePosition.x - smoothMouse.current.x) * 0.03;
    smoothMouse.current.y += (mousePosition.y - smoothMouse.current.y) * 0.03;
    matRef.current.uniforms.uMouse.value.set(smoothMouse.current.x, smoothMouse.current.y);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

function AtmosphericParticles({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const pointsRef = useRef<THREE.Points>(null);
  const smoothMouse = useRef({ x: 0, y: 0 });

  const count = 500;
  const { positions, depths } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const dep = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      dep[i] = pos[i * 3 + 2]; // store original z as depth
    }
    return { positions: pos, depths: dep };
  }, []);

  const basePositions = useMemo(() => positions.slice(), [positions]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const time = clock.getElapsedTime();

    // Smooth mouse
    smoothMouse.current.x += (mousePosition.x - smoothMouse.current.x) * 0.02;
    smoothMouse.current.y += (mousePosition.y - smoothMouse.current.y) * 0.02;

    const pos = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      // Slow organic drift
      const drift = Math.sin(time * 0.15 + i * 0.7) * 0.08;
      // Mouse parallax — deeper particles move less
      const depthFactor = (depths[i] + 2) / 4; // normalize 0..1
      const mx = smoothMouse.current.x * 0.3 * depthFactor;
      const my = smoothMouse.current.y * 0.3 * depthFactor;

      pos.setXYZ(i, bx + mx + drift, by + my + drift * 0.7, bz);
    }
    pos.needsUpdate = true;

    // Slow global rotation
    pointsRef.current.rotation.z = time * 0.008;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#999999"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Scene({ mousePosition, speed }: { mousePosition: { x: number; y: number }; speed: number }) {
  return (
    <>
      <CloudPlane mousePosition={mousePosition} speed={speed} />
      <AtmosphericParticles mousePosition={mousePosition} />
    </>
  );
}

interface Background3DProps {
  mousePosition: { x: number; y: number };
  appState: AppState;
}

export default function Background3D({ mousePosition, appState }: Background3DProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) return null;

  const speed = appState === 'analyzing' ? 2.0 : appState === 'results' ? 0.4 : 0.7;

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false }}
      >
        <Scene mousePosition={mousePosition} speed={speed} />
      </Canvas>
    </div>
  );
}
