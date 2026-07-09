import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  PresentationControls,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";

// Public, CORS-enabled glTF from the three.js examples repository.
// Draco-compressed; drei's useGLTF loads the decoder from gstatic automatically.
const MODEL_URL =
  "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/ferrari.glb";

function CarModel() {
  const { scene } = useGLTF(MODEL_URL);
  return <primitive object={scene} scale={2.6} position={[0, -0.55, 0]} />;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 6, 3]} intensity={0.6} />
      <Suspense fallback={null}>
        <PresentationControls
          global
          cursor
          snap={false}
          speed={1.4}
          zoom={0.9}
          rotation={[0, -Math.PI / 6, 0]}
          polar={[-Math.PI / 8, Math.PI / 6]}
          azimuth={[-Infinity, Infinity]}
        >
          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
            <CarModel />
          </Float>
        </PresentationControls>
        <ContactShadows
          position={[0, -1.05, 0]}
          opacity={0.35}
          scale={12}
          blur={2.6}
          far={4}
        />
        <Environment preset="city" />
      </Suspense>
    </>
  );
}

export function SpatialCarViewer({ className = "" }: { className?: string }) {
  // Skip on SSR — R3F needs the browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className={className} aria-hidden />;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [4.5, 1.6, 6], fov: 32 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent", touchAction: "none" }}
      >
        <Scene />
      </Canvas>
      <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground">
        Drag to orbit · 360°
      </p>
    </div>
  );
}

useGLTF.preload(MODEL_URL);