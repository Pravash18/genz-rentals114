import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Procedural alloy wheel — no external model.
 * Continuously spins on Z, with scroll velocity nudging the speed
 * so the ambient motion tracks how the user is browsing.
 */
function AlloyWheel({ scrollBoost }: { scrollBoost: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);

  // Build spokes once
  const spokes = useMemo(() => {
    const arr: { rot: number }[] = [];
    const count = 7;
    for (let i = 0; i < count; i++) arr.push({ rot: (i / count) * Math.PI * 2 });
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    // Base slow spin + scroll boost that decays each frame
    const spin = 0.18 + scrollBoost.current;
    group.current.rotation.z += spin * delta;
    scrollBoost.current *= 0.94; // ease back to baseline
  });

  const metal = { color: "#d8ceba", metalness: 1, roughness: 0.28 } as const;
  const darkMetal = { color: "#2a2622", metalness: 0.9, roughness: 0.45 } as const;
  const tire = { color: "#1a1815", metalness: 0.2, roughness: 0.85 } as const;

  return (
    <group ref={group} rotation={[Math.PI / 2, 0, 0]}>
      {/* Tire — thick torus */}
      <mesh castShadow>
        <torusGeometry args={[2.2, 0.55, 24, 96]} />
        <meshStandardMaterial {...tire} />
      </mesh>
      {/* Outer rim lip */}
      <mesh>
        <torusGeometry args={[2.05, 0.14, 20, 96]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {/* Inner rim ring */}
      <mesh>
        <torusGeometry args={[1.75, 0.08, 16, 96]} />
        <meshStandardMaterial {...darkMetal} />
      </mesh>
      {/* Hub */}
      <mesh>
        <cylinderGeometry args={[0.42, 0.42, 0.35, 32]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      {/* Center cap */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.06, 24]} />
        <meshStandardMaterial color="#8a7a5c" metalness={1} roughness={0.15} />
      </mesh>
      {/* Spokes — tapered boxes radiating out */}
      {spokes.map((s, i) => (
        <group key={i} rotation={[0, s.rot, 0]}>
          <mesh position={[0, 0, 1.1]}>
            <boxGeometry args={[0.28, 0.18, 1.7]} />
            <meshStandardMaterial {...metal} />
          </mesh>
          {/* Spoke shadow gap */}
          <mesh position={[0, -0.02, 1.1]}>
            <boxGeometry args={[0.14, 0.19, 1.72]} />
            <meshStandardMaterial {...darkMetal} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function BackgroundAlloy() {
  const [mounted, setMounted] = useState(false);
  const scrollBoost = useRef(0);
  const lastY = useRef(0);

  useEffect(() => {
    setMounted(true);
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      lastY.current = y;
      // Cap the boost so a fast scroll doesn't fling the wheel
      scrollBoost.current = Math.max(-2.5, Math.min(2.5, scrollBoost.current + dy * 0.012));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{
        mixBlendMode: "multiply",
        opacity: 0.16,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 32 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 5]} intensity={0.7} />
        <Suspense fallback={null}>
          {/* Position wheel to bottom-right so content breathes over it */}
          <group position={[3.4, -1.4, 0]} scale={1.35}>
            <AlloyWheel scrollBoost={scrollBoost} />
          </group>
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}