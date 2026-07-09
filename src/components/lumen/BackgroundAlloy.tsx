import { useEffect, useRef, useState } from "react";
import alloyImg from "@/assets/alloy-wheel.png";

/**
 * Ambient background alloy — a real photographed wheel, spun continuously
 * on the page. Scroll velocity nudges the rotation so it feels alive
 * without ever competing with the content.
 */
export function BackgroundAlloy() {
  const [mounted, setMounted] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const angle = useRef(0);
  const velocity = useRef(0.08); // deg per frame baseline
  const boost = useRef(0);
  const lastY = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      lastY.current = y;
      boost.current = Math.max(-3, Math.min(3, boost.current + dy * 0.02));
    };

    const tick = () => {
      angle.current = (angle.current + velocity.current + boost.current) % 360;
      boost.current *= 0.92; // decay to baseline
      if (imgRef.current) {
        imgRef.current.style.transform = `translate3d(0,0,0) rotate(${angle.current}deg)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      style={{ mixBlendMode: "multiply", opacity: 0.14 }}
    >
      {/* Positioned so ~60% of the wheel bleeds off the bottom-right corner */}
      <img
        ref={imgRef}
        src={alloyImg}
        alt=""
        width={1024}
        height={1024}
        className="absolute select-none will-change-transform"
        style={{
          right: "-18vw",
          bottom: "-22vw",
          width: "min(90vh, 78vw)",
          height: "min(90vh, 78vw)",
          filter: "contrast(1.05) saturate(0.9)",
        }}
      />
    </div>
  );
}