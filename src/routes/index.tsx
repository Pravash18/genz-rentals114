import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listCars } from "@/lib/cars.functions";
import { Nav } from "@/components/lumen/Nav";
import { Footer } from "@/components/lumen/Footer";
import { MarqueeStrip } from "@/components/lumen/MarqueeStrip";
import { TiltImage } from "@/components/lumen/TiltImage";
import { RouteCurtain } from "@/components/lumen/RouteCurtain";
import { carImageFor, heroAtmosphereImg } from "@/lib/car-assets";
import { formatUsd } from "@/lib/format";

const carsOpts = queryOptions({ queryKey: ["cars"], queryFn: () => listCars() });

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(carsOpts),
  component: Index,
});

function Index() {
  const { data: cars } = useSuspenseQuery(carsOpts);
  const featured = cars.slice(0, 3);
  const remaining = cars.slice(3);

  return (
    <div className="relative min-h-screen overflow-hidden bg-obsidian text-bone">
      <RouteCurtain />
      <Nav />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen">
        <img
          src={heroAtmosphereImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-obsidian/20 to-obsidian" />
        <div className="relative z-10 flex min-h-screen flex-col justify-between px-8 pt-40 pb-16 md:px-14">
          <div className="grid grid-cols-12 gap-4">
            <p className="col-span-12 font-mono text-[11px] uppercase tracking-[0.35em] text-copper md:col-span-3">
              № 001 · Est. 2026<br />
              Private automotive reserve
            </p>
            <div className="col-span-12 md:col-span-9">
              <h1 className="font-display text-[16vw] leading-[0.82] tracking-tighter text-bone md:text-[11vw]">
                Not a<br />
                <span className="font-serif-italic text-copper">rental.</span><br />
                A ritual.
              </h1>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-12 gap-6">
            <p className="col-span-12 max-w-md font-serif-italic text-xl leading-snug text-bone/80 md:col-span-5 md:text-2xl">
              Twelve engines. Five cities. A concierge who reads maps and moods. Every arrival is
              staged — every departure, unforgettable.
            </p>
            <div className="col-span-12 flex items-end justify-end md:col-span-7">
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/fleet"
                  className="group inline-flex items-center gap-3 rounded-full bg-copper px-8 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-obsidian transition hover:bg-copper-glow"
                >
                  Enter the reserve
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  to="/experience"
                  className="link-underline font-mono text-[11px] uppercase tracking-[0.3em]"
                >
                  The philosophy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <MarqueeStrip items={["Monaco", "Los Angeles", "Dubai", "Tokyo", "Milan"]} />

      {/* ─── EDITORIAL: FEATURED FLEET ─── */}
      <section className="relative px-8 py-32 md:px-14 md:py-48">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">
              — The fleet
            </p>
            <h2 className="mt-6 font-display text-6xl leading-[0.9] tracking-tighter md:text-8xl">
              Twelve<br />
              <span className="font-serif-italic text-copper">obsessions.</span>
            </h2>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Each vehicle chosen for a specific mood, a specific road. Not filler. Not fleet inventory.
              Cars we would drive on our own weekends.
            </p>
          </div>
          <div className="col-span-12 grid gap-6 md:col-span-8 md:grid-cols-3">
            {featured.map((c, i) => (
              <Link
                key={c.id}
                to="/fleet/$slug"
                params={{ slug: c.slug }}
                className={`group relative block ${i === 1 ? "md:mt-24" : ""}`}
              >
                <div className="tilt-card relative aspect-[3/4] overflow-hidden border border-border/60 bg-card">
                  <img
                    src={carImageFor(c.hero_image)}
                    alt={c.name}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/90 to-transparent p-5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-copper">
                      № 00{i + 1}
                    </p>
                    <p className="mt-2 font-display text-2xl leading-tight text-bone">
                      {c.brand}<br />
                      <span className="font-serif-italic text-copper">{c.name}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  <span>{c.category}</span>
                  <span className="text-bone">{formatUsd(c.daily_price_cents)} <span className="text-muted-foreground">/ day</span></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SPATIAL EDITORIAL BLOCK ─── */}
      <section className="relative overflow-hidden border-y border-border/60 py-40 radial-copper noise">
        <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-8 px-8 md:px-14">
          <div className="col-span-12 md:col-span-5 md:pt-32">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">
              Chapter I · Provenance
            </p>
            <h3 className="mt-6 font-display text-5xl leading-[0.9] tracking-tighter md:text-7xl">
              Every key comes with a<br />
              <span className="font-serif-italic text-copper">story</span> —<br />
              not just a receipt.
            </h3>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-bone/70">
              Handover is a ceremony. Champagne on the terrace. Route notes drawn by a local. Return
              — whenever, wherever. That's the point.
            </p>
          </div>
          <div className="col-span-12 relative md:col-span-7">
            {featured[1] && (
              <TiltImage
                src={carImageFor(featured[1].hero_image)}
                alt={featured[1].name}
                className="aspect-[4/3] w-full overflow-hidden"
                intensity={10}
              />
            )}
          </div>
        </div>
      </section>

      {/* ─── REST OF FLEET GRID ─── */}
      <section className="relative px-8 py-32 md:px-14">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">— Complete collection</p>
            <h3 className="mt-6 font-display text-5xl leading-[0.9] tracking-tighter md:text-7xl">
              More <span className="font-serif-italic text-copper">temptations.</span>
            </h3>
          </div>
          <Link to="/fleet" className="link-underline font-mono text-[10px] uppercase tracking-[0.3em]">
            All {cars.length} vehicles →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {remaining.map((c) => (
            <Link
              key={c.id}
              to="/fleet/$slug"
              params={{ slug: c.slug }}
              className="group block border border-border/60 bg-card"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={carImageFor(c.hero_image)}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="flex items-baseline justify-between p-6">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-copper">{c.category}</p>
                  <p className="mt-2 font-display text-2xl text-bone">
                    {c.brand} <span className="font-serif-italic text-copper">{c.name}</span>
                  </p>
                </div>
                <p className="font-mono text-xs text-bone">{formatUsd(c.daily_price_cents)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
