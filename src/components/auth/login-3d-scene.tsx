import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, MeshDistortMaterial, Sphere, Torus, Icosahedron } from "@react-three/drei";
import * as THREE from "three";

/**
 * Real WebGL 3D scene for the login brand pane.
 * - Soft cream/emerald palette (no black)
 * - Quiet, physical motion (orbit, float, distort)
 */

function FloatingLeaf({ position, scale = 1, color = "#a7f3d0" }: { position: [number, number, number]; scale?: number; color?: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  // Build a leaf-ish shape from a stretched, slightly bent plane
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.6, 0.2, 0.9, 0.7, 0, 1.4);
    shape.bezierCurveTo(-0.9, 0.7, -0.6, 0.2, 0, 0);
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 4 });
    g.center();
    return g;
  }, []);
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * 0.35;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.1}>
      <mesh ref={ref} position={position} scale={scale} geometry={geometry} castShadow>
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} />
      </mesh>
    </Float>
  );
}

function OrbitingSeeds() {
  const group = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    group.current.rotation.y += dt * 0.25;
    group.current.rotation.x = Math.sin(performance.now() * 0.0003) * 0.15;
  });
  const items = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => {
        const a = (i / 9) * Math.PI * 2;
        const r = 2.4;
        return [Math.cos(a) * r, Math.sin(a * 2) * 0.4, Math.sin(a) * r] as [number, number, number];
      }),
    []
  );
  return (
    <group ref={group}>
      {items.map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <icosahedronGeometry args={[0.11, 0]} />
          <meshStandardMaterial color={i % 2 ? "#e8c97a" : "#34d399"} roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function CoreOrb() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    ref.current.rotation.x += dt * 0.15;
    ref.current.rotation.y += dt * 0.2;
  });
  return (
    <Float speed={1.1} rotationIntensity={0.3} floatIntensity={0.6}>
      <Sphere ref={ref} args={[1.05, 96, 96]} castShadow>
        {/* @ts-expect-error drei material typing */}
        <MeshDistortMaterial color="#10b981" emissive="#0a7a4e" emissiveIntensity={0.25} roughness={0.25} metalness={0.55} distort={0.32} speed={1.4} />
      </Sphere>
    </Float>
  );
}

function GoldRing() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    ref.current.rotation.z += dt * 0.18;
    ref.current.rotation.x = Math.PI / 2.5;
  });
  return (
    <Torus ref={ref} args={[1.7, 0.025, 32, 200]}>
      <meshStandardMaterial color="#e8c97a" emissive="#c9a84c" emissiveIntensity={0.35} roughness={0.25} metalness={0.85} />
    </Torus>
  );
}

function Backdrop() {
  // soft ground disc to catch light, no black
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]} receiveShadow>
      <circleGeometry args={[6, 64]} />
      <meshStandardMaterial color="#0c4a32" roughness={1} metalness={0} transparent opacity={0.4} />
    </mesh>
  );
}

function FacetCrystal({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Float speed={1.6} rotationIntensity={1.4} floatIntensity={0.8}>
      <Icosahedron args={[0.38, 0]} position={position} castShadow>
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.7} flatShading />
      </Icosahedron>
    </Float>
  );
}

export function Login3DScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.4, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      {/* Lights */}
      <ambientLight intensity={0.55} color="#f6f5ec" />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.4}
        color="#fff3d6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-4, -2, -3]} intensity={1.1} color="#34d399" />
      <pointLight position={[4, -1, 2]} intensity={0.8} color="#e8c97a" />

      <Suspense fallback={null}>
        <Environment preset="sunset" />
        <CoreOrb />
        <GoldRing />
        <OrbitingSeeds />
        <FloatingLeaf position={[-2.4, 1.4, 0.2]} scale={0.9} color="#a7f3d0" />
        <FloatingLeaf position={[2.5, -1.3, 0.5]} scale={0.7} color="#6ee7b7" />
        <FloatingLeaf position={[1.9, 1.6, -0.8]} scale={0.55} color="#34d399" />
        <FacetCrystal position={[-2.6, -1.2, 0.8]} color="#e8c97a" />
        <FacetCrystal position={[2.2, 0.2, 1.2]} color="#a7f3d0" />
        <Backdrop />
      </Suspense>
    </Canvas>
  );
}
