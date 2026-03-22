"use no memo";

import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import brainUrl from '../assets/brain.glb?url';
import {
  createHighlightMaterial,
  type HighlightUniforms,
} from '../lib/brainHighlightMaterial';
import { REGION_HIGHLIGHT } from '../lib/regionHighlightConfig';

const NEUTRAL_COLOR = new THREE.Color('#888888');
const HEALTHY_TINT = new THREE.Color('#059669');

interface BrainMetrics {
  center: THREE.Vector3;
  size: THREE.Vector3;
  halfDiagonal: number;
}

interface BrainModelProps {
  predictedClass: string;
  highlightColor: string;
  brainRegion: string | null;
  onRequestFullscreen?: () => void;
  enableCameraSnap?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Particle burst effect                                              */
/* ------------------------------------------------------------------ */

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

  // Reset trigger when deactivated so burst fires again on next scan
  useEffect(() => {
    if (!active) {
      hasTriggeredRef.current = false;
    }
  }, [active]);

  const count = 30;
  const positions = useMemo(() => new Float32Array(count * 3), []);

  useFrame(({ clock }) => {
    if (!pointsRef.current || !active) return;

    if (!hasTriggeredRef.current) {
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

    if (!velocitiesRef.current) return;

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
      <pointsMaterial
        size={0.04}
        color={color}
        transparent
        opacity={1}
        sizeAttenuation
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Camera snap animation                                              */
/* ------------------------------------------------------------------ */

function CameraAnimator({
  controlsRef,
  brainRegion,
  brainMetricsRef,
  onRotateChange,
}: {
  controlsRef: React.RefObject<any>;
  brainRegion: string | null;
  brainMetricsRef: React.RefObject<BrainMetrics | null>;
  onRotateChange: (rotating: boolean) => void;
}) {
  const { camera } = useThree();
  const isAnimating = useRef(false);
  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const prevRegion = useRef<string | null>(null);

  useEffect(() => {
    if (!brainRegion) {
      isAnimating.current = false;
      prevRegion.current = null;
      return;
    }

    if (brainRegion === prevRegion.current) return;
    prevRegion.current = brainRegion;

    const metrics = brainMetricsRef.current;
    const config = REGION_HIGHLIGHT[brainRegion];
    if (!metrics || !config) return;

    // Look-at target = region center
    const lookAt = new THREE.Vector3();
    if (config.centerOffset) {
      lookAt.set(
        metrics.center.x + config.centerOffset[0] * metrics.size.x * 0.5,
        metrics.center.y + config.centerOffset[1] * metrics.size.y * 0.5,
        metrics.center.z + config.centerOffset[2] * metrics.size.z * 0.5,
      );
    } else {
      lookAt.copy(metrics.center);
    }

    // Camera position: orbit to configured direction, keep current distance
    const dir = new THREE.Vector3(...config.cameraDirection).normalize();
    const currentTarget = controlsRef.current?.target ?? metrics.center;
    const currentDist = camera.position.distanceTo(currentTarget);
    const camPos = lookAt.clone().add(dir.multiplyScalar(currentDist));

    targetPos.current.copy(camPos);
    targetLookAt.current.copy(lookAt);
    isAnimating.current = true;
    onRotateChange(false);
  }, [brainRegion, brainMetricsRef, camera, controlsRef, onRotateChange]);

  useFrame(() => {
    if (!isAnimating.current || !controlsRef.current) return;

    camera.position.lerp(targetPos.current, 0.04);
    controlsRef.current.target.lerp(targetLookAt.current, 0.04);
    controlsRef.current.update();

    if (camera.position.distanceTo(targetPos.current) < 0.01) {
      isAnimating.current = false;
    }
  });

  return null;
}

/* ------------------------------------------------------------------ */
/*  Brain mesh with shader-based region highlighting                   */
/* ------------------------------------------------------------------ */

function Brain({
  predictedClass,
  highlightColor,
  brainRegion,
  brainMetricsRef,
}: {
  predictedClass: string;
  highlightColor: string;
  brainRegion: string | null;
  brainMetricsRef: React.MutableRefObject<BrainMetrics | null>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const uniformsRef = useRef<HighlightUniforms | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const [metrics, setMetrics] = useState<BrainMetrics | null>(null);

  const { scene } = useGLTF(brainUrl);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Compute bounding box & apply highlight material
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const halfDiagonal = size.length() / 2;

    const m: BrainMetrics = { center, size, halfDiagonal };
    setMetrics(m);
    brainMetricsRef.current = m;

    // Single shared material for all meshes
    const { material, uniforms } = createHighlightMaterial({
      color: NEUTRAL_COLOR,
      metalness: 0.15,
      roughness: 0.6,
    });
    uniformsRef.current = uniforms;
    materialRef.current = material;

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });
  }, [clonedScene, brainMetricsRef]);

  // Region center for particle burst & point light
  const regionCenter = useMemo((): [number, number, number] => {
    if (!metrics || !brainRegion) return [0, 0, 0];
    const config = REGION_HIGHLIGHT[brainRegion];
    if (!config) return [metrics.center.x, metrics.center.y, metrics.center.z];
    if (config.centerOffset) {
      return [
        metrics.center.x + config.centerOffset[0] * metrics.size.x * 0.5,
        metrics.center.y + config.centerOffset[1] * metrics.size.y * 0.5,
        metrics.center.z + config.centerOffset[2] * metrics.size.z * 0.5,
      ];
    }
    return [metrics.center.x, metrics.center.y, metrics.center.z];
  }, [metrics, brainRegion]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !uniformsRef.current || !metrics) return;

    const u = uniformsRef.current;
    const mat = materialRef.current;
    const config = brainRegion ? REGION_HIGHLIGHT[brainRegion] : null;

    if (config && brainRegion) {
      // --- Active region highlighting ---
      const hCenter = u.uHighlightCenter.value;
      if (config.centerOffset) {
        hCenter.set(
          metrics.center.x + config.centerOffset[0] * metrics.size.x * 0.5,
          metrics.center.y + config.centerOffset[1] * metrics.size.y * 0.5,
          metrics.center.z + config.centerOffset[2] * metrics.size.z * 0.5,
        );
      } else {
        hCenter.copy(metrics.center);
      }
      u.uBrainCenter.value.copy(metrics.center);
      u.uHighlightColor.value.set(highlightColor);
      u.uHighlightRadius.value = config.radius * metrics.halfDiagonal;
      u.uHighlightMode.value = config.mode === 'sphere' ? 1 : 2;

      // Pulsing glow
      u.uHighlightStrength.value =
        1.0 + Math.sin(clock.getElapsedTime() * Math.PI) * 0.5;

      // Reset base emissive to avoid green bleed-through from previous healthy scan
      if (mat) {
        mat.emissive.lerp(new THREE.Color(0, 0, 0), 0.05);
        mat.emissiveIntensity *= 0.95;
      }
    } else {
      // Fade out shader glow smoothly
      u.uHighlightStrength.value *= 0.93;
      if (u.uHighlightStrength.value < 0.001) {
        u.uHighlightMode.value = 0;
        u.uHighlightStrength.value = 0;
      }

      // Base emissive: green tint for healthy, fade otherwise
      if (mat) {
        if (predictedClass === 'notumor') {
          mat.emissive.lerp(HEALTHY_TINT, 0.01);
          mat.emissiveIntensity = 0.03;
        } else {
          mat.emissiveIntensity *= 0.95;
        }
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />

      {/* Point light at region center when highlighting */}
      {brainRegion && (
        <pointLight
          position={regionCenter}
          color={highlightColor}
          intensity={0.5}
          distance={3}
        />
      )}

      {/* Particle burst at region center */}
      <ParticleBurst
        origin={regionCenter}
        color={highlightColor}
        active={brainRegion !== null}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Outer wrapper: Canvas, controls, auto-rotate management            */
/* ------------------------------------------------------------------ */

export default function BrainModel({
  predictedClass,
  highlightColor,
  brainRegion,
  onRequestFullscreen,
  enableCameraSnap = true,
}: BrainModelProps) {
  const [rotating, setRotating] = useState(true);
  const controlsRef = useRef<any>(null);
  const brainMetricsRef = useRef<BrainMetrics | null>(null);

  // Pause auto-rotate when viewing a tumor, resume on new scan
  useEffect(() => {
    if (brainRegion) {
      setRotating(false);
    } else {
      setRotating(true);
    }
  }, [brainRegion]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight
          position={[-3, 3, -3]}
          intensity={0.6}
          color="#ffffff"
        />
        <directionalLight
          position={[0, -3, 2]}
          intensity={0.3}
          color="#ffffff"
        />
        <hemisphereLight
          groundColor="#cccccc"
          color="#ffffff"
          intensity={0.5}
        />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.5}>
            <Brain
              predictedClass={predictedClass}
              highlightColor={highlightColor}
              brainRegion={brainRegion}
              brainMetricsRef={brainMetricsRef}
            />
          </Bounds>
        </Suspense>
        {enableCameraSnap && (
          <CameraAnimator
            controlsRef={controlsRef}
            brainRegion={brainRegion}
            brainMetricsRef={brainMetricsRef}
            onRotateChange={setRotating}
          />
        )}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.25}
          enableDamping
          makeDefault
          autoRotate={rotating}
          autoRotateSpeed={2}
        />
      </Canvas>

      {/* Fullscreen expand button — top right */}
      {onRequestFullscreen && (
        <button
          onClick={onRequestFullscreen}
          title="Fullscreen"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 13,
            cursor: 'pointer',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
      )}

      {/* Rotate toggle — bottom right */}
      <button
        onClick={() => setRotating((r) => !r)}
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: 13,
          cursor: 'pointer',
          color: '#333',
        }}
      >
        {rotating ? 'Pause' : 'Rotate'}
      </button>
    </div>
  );
}

useGLTF.preload(brainUrl);
