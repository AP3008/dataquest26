"use no memo";

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AppState } from '../types';

function WireframeMesh({ speed }: { speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geoRef = useRef<THREE.PlaneGeometry>(null);
  const positionsRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (geoRef.current) {
      positionsRef.current = geoRef.current.attributes.position.array.slice() as unknown as Float32Array;
    }
  }, []);

  useFrame(({ clock }) => {
    if (!geoRef.current || !positionsRef.current) return;
    const time = clock.getElapsedTime() * speed;
    const pos = geoRef.current.attributes.position;
    const original = positionsRef.current;

    for (let i = 0; i < pos.count; i++) {
      const x = original[i * 3];
      const y = original[i * 3 + 1];
      const z = Math.sin(x * 2 + time * 0.5) * Math.sin(y * 2 + time * 0.3) * 0.15;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]} position={[0, -1, -2]}>
      <planeGeometry ref={geoRef} args={[12, 12, 48, 48]} />
      <meshBasicMaterial wireframe color="#c0c0c0" transparent opacity={0.15} />
    </mesh>
  );
}

function FloatingParticles() {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const time = clock.getElapsedTime();
    pointsRef.current.rotation.y = time * 0.02;
    pointsRef.current.rotation.x = Math.sin(time * 0.01) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#aaaaaa" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

function Scene({ speed }: { speed: number }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <WireframeMesh speed={speed} />
      <FloatingParticles />
    </>
  );
}

interface Background3DProps {
  appState: AppState;
}

export default function Background3D({ appState }: Background3DProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) return null;

  const speed = appState === 'analyzing' ? 2.5 : appState === 'results' ? 0.3 : 0.6;
  const opacity = appState === 'results' ? 0.15 : 1;

  return (
    <div
      className="fixed inset-0 -z-10 transition-opacity duration-500"
      style={{ opacity }}
    >
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <Scene speed={speed} />
      </Canvas>
    </div>
  );
}
