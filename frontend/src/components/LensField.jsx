import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ponytail: check prefers-reduced-motion directly on mount
const isReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.035;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
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
  const positions = useMemo(() => new Float32Array([
    0.3, 0.15, -0.6,
    -0.4, -0.2, -0.8,
    0.1, -0.45, -0.5,
    -0.15, 0.4, -0.7,
    0.5, -0.05, -0.9,
  ]), []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 1.4) * 0.3;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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

function Lens({ reducedMotion }) {
  const group = useRef();

  // ponytail: read pointer directly from state.pointer instead of maintaining custom listeners in a parent component
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    if (!reducedMotion) {
      group.current.rotation.y = t * 0.12;
      group.current.position.y = Math.sin(t * 0.6) * 0.12;
    }
    const targetX = state.pointer.x * 0.35;
    const targetY = state.pointer.y * 0.2;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -targetY, 0.04);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetX * 0.15, 0.04);
  });

  return (
    <group ref={group}>
      <mesh rotation={[0.15, 0, 0]}>
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
      <mesh rotation={[0.15, 0, 0]}>
        <torusGeometry args={[1.55, 0.012, 16, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function LensField({ className = '' }) {
  const reducedMotion = isReducedMotion();

  // ponytail: omitted the ready state and requestAnimationFrame layout settling logic.
  // Standard CSS container handles layout from mount, and canvas auto-resizes.
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-4, -2, -3]} intensity={0.4} color="#8e9192" />
        <DataField />
        <RevealedPoints />
        <Lens reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
