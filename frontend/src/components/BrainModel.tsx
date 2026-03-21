"use no memo";

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const NEUTRAL_COLOR = new THREE.Color('#6b6b6b');
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
  const opacityRef = useRef(1);

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
      opacityRef.current = 0;
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
    opacityRef.current = 1 - elapsed;
    (pointsRef.current.material as THREE.PointsMaterial).opacity = opacityRef.current;
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

// Individual brain part with highlighting
function BrainPart({
  geometry,
  position,
  scale,
  rotation,
  isHighlighted,
  highlightColor,
  isWireframe,
  scalePulse,
}: {
  geometry: 'sphere' | 'cylinder';
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  isHighlighted: boolean;
  highlightColor: string;
  isWireframe?: boolean;
  scalePulse?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetColor = useMemo(() => new THREE.Color(highlightColor), [highlightColor]);
  const currentEmissive = useRef(0);
  const currentScale = useRef(1);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;

    if (isHighlighted) {
      mat.color.lerp(targetColor, 0.05);
      const pulse = 0.1 + Math.sin(clock.getElapsedTime() * Math.PI) * 0.15 + 0.15;
      currentEmissive.current += (pulse - currentEmissive.current) * 0.05;
      mat.emissive.copy(targetColor);
      mat.emissiveIntensity = currentEmissive.current;

      if (scalePulse) {
        currentScale.current += (1.4 - currentScale.current) * 0.03;
        meshRef.current.scale.setScalar(currentScale.current);
      }
    } else {
      mat.color.lerp(NEUTRAL_COLOR, 0.05);
      currentEmissive.current *= 0.95;
      mat.emissiveIntensity = currentEmissive.current;
    }
  });

  const baseOpacity = isWireframe ? 0.1 : 1;

  return (
    <mesh ref={meshRef} position={position} scale={scale} rotation={rotation}>
      {geometry === 'sphere' ? (
        <sphereGeometry args={[1, 32, 32]} />
      ) : (
        <cylinderGeometry args={[0.08, 0.12, 1, 16]} />
      )}
      <meshStandardMaterial
        color={NEUTRAL_COLOR}
        metalness={0.2}
        roughness={0.7}
        wireframe={isWireframe}
        transparent={isWireframe}
        opacity={isHighlighted && isWireframe ? 0.5 : baseOpacity}
      />
    </mesh>
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

  // Trigger scan spin on first result
  useEffect(() => {
    if (predictedClass) {
      setHasResult(true);
      scanStartRef.current = performance.now() / 1000;
      rotationSpeed.current = 0.03;
    }
  }, [predictedClass]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    // Ease rotation speed back to idle after scan spin
    if (hasResult) {
      const elapsed = clock.getElapsedTime() - scanStartRef.current;
      if (elapsed > 1) {
        rotationSpeed.current += (0.003 - rotationSpeed.current) * 0.02;
      }
    }

    groupRef.current.rotation.y += rotationSpeed.current;

    // Healthy tint for notumor
    if (predictedClass === 'notumor') {
      groupRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.emissive.lerp(HEALTHY_TINT, 0.01);
          mat.emissiveIntensity = 0.03;
        }
      });
    }
  });

  const isCerebral = brainRegion === 'cerebral';
  const isMeninges = brainRegion === 'meninges';
  const isPituitary = brainRegion === 'pituitary';

  return (
    <group ref={groupRef}>
      {/* Left hemisphere */}
      <BrainPart
        geometry="sphere"
        position={[-0.35, 0, 0]}
        scale={[0.72, 0.85, 1.0]}
        isHighlighted={isCerebral}
        highlightColor={highlightColor}
      />
      {/* Right hemisphere */}
      <BrainPart
        geometry="sphere"
        position={[0.35, 0, 0]}
        scale={[0.72, 0.85, 1.0]}
        isHighlighted={isCerebral}
        highlightColor={highlightColor}
      />
      {/* Cerebellum */}
      <BrainPart
        geometry="sphere"
        position={[0, -0.6, -0.3]}
        scale={[0.55, 0.45, 0.5]}
        isHighlighted={false}
        highlightColor={highlightColor}
      />
      {/* Brain stem */}
      <BrainPart
        geometry="cylinder"
        position={[0, -1.0, 0]}
        scale={[1, 1, 1]}
        isHighlighted={false}
        highlightColor={highlightColor}
      />
      {/* Pituitary gland */}
      <BrainPart
        geometry="sphere"
        position={[0, -0.7, 0.2]}
        scale={[0.12, 0.12, 0.12]}
        isHighlighted={isPituitary}
        highlightColor={highlightColor}
        scalePulse={isPituitary}
      />
      {/* Meninges wireframe shell */}
      <BrainPart
        geometry="sphere"
        position={[0, -0.05, 0]}
        scale={[1.15, 1.0, 1.1]}
        isHighlighted={isMeninges}
        highlightColor={highlightColor}
        isWireframe
      />

      {/* Point light at highlighted region */}
      {brainRegion && (
        <pointLight
          position={
            isCerebral
              ? [0, 0.3, 0]
              : isPituitary
                ? [0, -0.7, 0.2]
                : [0, 0, 0]
          }
          color={highlightColor}
          intensity={0.5}
          distance={3}
        />
      )}

      {/* Particle burst */}
      <ParticleBurst
        origin={
          isCerebral
            ? [0, 0.3, 0]
            : isPituitary
              ? [0, -0.7, 0.2]
              : isMeninges
                ? [0, 0, 0.8]
                : [0, 0, 0]
        }
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
      camera={{ position: [0, 0.3, 3.5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 2]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-2, 1, -2]} intensity={0.3} />
      <Brain
        predictedClass={predictedClass}
        highlightColor={highlightColor}
        brainRegion={brainRegion}
      />
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enablePan={false}
        minDistance={2.5}
        maxDistance={5}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
        enableDamping
      />
    </Canvas>
  );
}
