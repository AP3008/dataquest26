"use no memo";

import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import brainUrl from '../assets/brain.glb?url';

const NEUTRAL_COLOR = new THREE.Color('#888888');
const HEALTHY_TINT = new THREE.Color('#059669');

interface BrainModelProps {
  predictedClass: string;
  highlightColor: string;
  brainRegion: string | null;
}

// Particle burst effect
function ParticleBurst({
  origin,
  color,
  active,
}: {
  origin: [number, number, number];
  color: string;
  active: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const startTimeRef = useRef(0);
  const hasTriggeredRef = useRef(false);

  const count = 30;
  const positions = useMemo(() => new Float32Array(count * 3), []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    if (active && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      startTimeRef.current = clock.getElapsedTime();
      const vels = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = origin[0];
        positions[i * 3 + 1] = origin[1];
        positions[i * 3 + 2] = origin[2];
        vels[i * 3] = (Math.random() - 0.5) * 2;
        vels[i * 3 + 1] = (Math.random() - 0.5) * 2;
        vels[i * 3 + 2] = (Math.random() - 0.5) * 2;
      }
      velocitiesRef.current = vels;
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (!hasTriggeredRef.current || !velocitiesRef.current) return;

    const elapsed = clock.getElapsedTime() - startTimeRef.current;
    if (elapsed > 1) {
      (pointsRef.current.material as THREE.PointsMaterial).opacity = 0;
      return;
    }

    const vels = velocitiesRef.current;
    const dt = 0.016;
    for (let i = 0; i < count; i++) {
      positions[i * 3] += vels[i * 3] * dt;
      positions[i * 3 + 1] += vels[i * 3 + 1] * dt;
      positions[i * 3 + 2] += vels[i * 3 + 2] * dt;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    (pointsRef.current.material as THREE.PointsMaterial).opacity = 1 - elapsed;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color={color} transparent opacity={1} sizeAttenuation />
    </points>
  );
}

function Brain({
  predictedClass,
  highlightColor,
  brainRegion,
}: {
  predictedClass: string;
  highlightColor: string;
  brainRegion: string | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const rotationSpeed = useRef(0.003);
  const [hasResult, setHasResult] = useState(false);
  const scanStartRef = useRef(0);
  const materialsReady = useRef(false);

  const { scene } = useGLTF(brainUrl);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Apply gray materials to prevent black blob
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: NEUTRAL_COLOR.clone(),
          metalness: 0.15,
          roughness: 0.6,
          emissive: new THREE.Color('#000000'),
          emissiveIntensity: 0,
        });
      }
    });
    materialsReady.current = true;
  }, [clonedScene]);

  // Trigger scan spin on first result
  useEffect(() => {
    if (predictedClass) {
      setHasResult(true);
      scanStartRef.current = performance.now() / 1000;
      rotationSpeed.current = 0.03;
    }
  }, [predictedClass]);

  const targetColor = useMemo(() => new THREE.Color(highlightColor), [highlightColor]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !materialsReady.current) return;

    // Ease rotation speed back to idle after scan spin
    if (hasResult) {
      const elapsed = clock.getElapsedTime() - scanStartRef.current;
      if (elapsed > 1) {
        rotationSpeed.current += (0.003 - rotationSpeed.current) * 0.02;
      }
    }

    groupRef.current.rotation.y += rotationSpeed.current;

    // Tumor highlighting or healthy tint
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (brainRegion) {
          mat.color.lerp(targetColor, 0.03);
          const pulse = 0.05 + Math.sin(clock.getElapsedTime() * Math.PI) * 0.1 + 0.1;
          mat.emissive.copy(targetColor);
          mat.emissiveIntensity = pulse;
        } else if (predictedClass === 'notumor') {
          mat.color.lerp(NEUTRAL_COLOR, 0.03);
          mat.emissive.lerp(HEALTHY_TINT, 0.01);
          mat.emissiveIntensity = 0.03;
        } else {
          mat.color.lerp(NEUTRAL_COLOR, 0.03);
          mat.emissiveIntensity *= 0.95;
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />

      {/* Point light at center when highlighting */}
      {brainRegion && (
        <pointLight
          position={[0, 0, 0]}
          color={highlightColor}
          intensity={0.5}
          distance={3}
        />
      )}

      {/* Particle burst */}
      <ParticleBurst
        origin={[0, 0, 0]}
        color={highlightColor}
        active={brainRegion !== null}
      />
    </group>
  );
}

export default function BrainModel({
  predictedClass,
  highlightColor,
  brainRegion,
}: BrainModelProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ alpha: true }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-3, 3, -3]} intensity={0.6} color="#ffffff" />
      <directionalLight position={[0, -3, 2]} intensity={0.3} color="#ffffff" />
      <hemisphereLight groundColor="#cccccc" color="#ffffff" intensity={0.5} />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.5}>
          <Brain
            predictedClass={predictedClass}
            highlightColor={highlightColor}
            brainRegion={brainRegion}
          />
        </Bounds>
      </Suspense>
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
        enableDamping
        makeDefault
      />
    </Canvas>
  );
}

useGLTF.preload(brainUrl);
