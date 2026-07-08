import { useRef, type MouseEvent } from "react";

export function TiltImage({
  src,
  alt,
  className = "",
  intensity = 8,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  intensity?: number;
  eager?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1400px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) scale(1.02)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(1400px) rotateX(0) rotateY(0) scale(1)";
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`transition-transform duration-500 [transform-style:preserve-3d] ${className}`}
    >
      <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} className="h-full w-full object-cover" />
    </div>
  );
}