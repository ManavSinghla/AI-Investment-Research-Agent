import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * AlphaLens signature visual.
 *
 * The brand is "AlphaLens" and the headline is "See What The Market
 * Doesn't." — so the 3D signature is a literal lens: a refractive glass
 * disc hangs in a quiet field of small market-data points. Points that
 * sit behind the glass bend and brighten as they pass through it, the
 * same way the product claims to bend raw data into a clear signal.
 * Everything else in the scene stays still and monochrome so the lens
 * reads as the one deliberate move, not decoration.
 */

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function DataField({ count = 260 }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.6 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 0.9;
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
      positions[i * 3 + 2] = (r * Math.cos(phi)) * 0.6 - 0.5;
    }
    return positions;
  }, [count]);

  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.035;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#e5e2e1"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// A handful of points sit deliberately behind the glass and get a warm
// highlight — the "signal" the lens reveals.
function RevealedPoints() {
  const ref = useRef();
  const positions = useMemo(() => {
    const pts = [
      [0.3, 0.15, -0.6],
      [-0.4, -0.2, -0.8],
      [0.1, -0.45, -0.5],
      [-0.15, 0.4, -0.7],
      [0.5, -0.05, -0.9],
    ];
    return new Float32Array(pts.flat());
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.material.opacity = 0.6 + Math.sin(t * 1.4) * 0.3;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Lens({ reducedMotion, pointer }) {
  const group = useRef();
  const mesh = useRef();

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    if (!reducedMotion) {
      group.current.rotation.y = t * 0.12;
      group.current.position.y = Math.sin(t * 0.6) * 0.12;
    }
    // Gentle parallax toward the cursor, always on (small, not gimmicky).
    const targetX = pointer.current.x * 0.35;
    const targetY = pointer.current.y * 0.2;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -targetY, 0.04);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetX * 0.15, 0.04);
  });

  return (
    <group ref={group}>
      <mesh ref={mesh} rotation={[0.15, 0, 0]}>
        <cylinderGeometry args={[1.55, 1.55, 0.32, 64, 1, false]} />
        <MeshTransmissionMaterial
          samples={6}
          thickness={1.1}
          roughness={0.04}
          transmission={1}
          ior={1.35}
          chromaticAberration={0.02}
          anisotropy={0.15}
          distortion={0.15}
          distortionScale={0.2}
          temporalDistortion={reducedMotion ? 0 : 0.08}
          color="#e9e7e2"
          attenuationColor="#c6c6c7"
          attenuationDistance={1.2}
          background={new THREE.Color('#141313')}
        />
      </mesh>
      {/* Thin rim to catch a highlight, like ground glass edge */}
      <mesh rotation={[0.15, 0, 0]}>
        <torusGeometry args={[1.55, 0.012, 16, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function Scene({ reducedMotion }) {
  const { size } = useThree();
  const pointer = useRef({ x: 0, y: 0 });

  useFrame(({ pointer: p }) => {
    pointer.current.x = p.x;
    pointer.current.y = p.y;
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.4} color="#8e9192" />
      <DataField />
      <RevealedPoints />
      <Float speed={reducedMotion ? 0 : 1.1} rotationIntensity={reducedMotion ? 0 : 0.15} floatIntensity={reducedMotion ? 0 : 0.4}>
        <Lens reducedMotion={reducedMotion} pointer={pointer} />
      </Float>
    </>
  );
}

export default function LensField({ className = '' }) {
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Avoid mounting WebGL before the layout settles (prevents a flash of
    // a mis-sized canvas on first paint).
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!ready) return <div className={className} aria-hidden="true" />;

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Scene reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
