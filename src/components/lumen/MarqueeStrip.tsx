export function MarqueeStrip({ items }: { items: string[] }) {
  const seq = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-border/60 py-10">
      <div className="marquee-track gap-16 whitespace-nowrap font-display text-[7vw] leading-none tracking-tighter text-bone">
        {seq.map((s, i) => (
          <span key={i} className="flex items-center gap-16">
            <span className={i % 2 === 1 ? "font-serif-italic text-copper" : ""}>{s}</span>
            <span className="text-copper">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}