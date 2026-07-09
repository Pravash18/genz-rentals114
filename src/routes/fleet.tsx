import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listCars } from "@/lib/cars.functions";
import { Nav } from "@/components/lumen/Nav";
import { Footer } from "@/components/lumen/Footer";
import { RouteCurtain } from "@/components/lumen/RouteCurtain";
import { carImageFor } from "@/lib/car-assets";
import { formatUsd } from "@/lib/format";

const carsOpts = queryOptions({ queryKey: ["cars"], queryFn: () => listCars() });

export const Route = createFileRoute("/fleet")({
  head: () => ({
    meta: [
      { title: "The Fleet — Lumen" },
      { name: "description", content: "The complete Lumen reserve — exotic, grand tourer, luxury EV, SUV, and classic vehicles." },
      { property: "og:title", content: "The Fleet — Lumen" },
      { property: "og:description", content: "The complete Lumen reserve." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(carsOpts),
  component: FleetPage,
});

function FleetPage() {
  const { data: cars } = useSuspenseQuery(carsOpts);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(cars.map((c) => c.category)))],
    [cars],
  );
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? cars : cars.filter((c) => c.category === cat);

  return (
    <div className="relative min-h-screen bg-obsidian text-bone">
      <RouteCurtain />
      <Nav />

      <section className="px-8 pt-40 pb-16 md:px-14 md:pt-56">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-copper">
          The fleet · {cars.length} vehicles
        </p>
          <h1 className="mt-6 font-display text-[16vw] leading-[0.86] tracking-tighter md:text-[9vw]">
          Choose your<br />
          <span className="font-serif-italic text-copper">companion.</span>
        </h1>
      </section>

      <section className="sticky top-0 z-30 border-y border-border/60 bg-obsidian/85 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto px-8 py-5 md:px-14">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`whitespace-nowrap rounded-full border px-5 py-2 font-mono text-[10px] uppercase tracking-[0.25em] transition ${
                cat === c ? "border-copper bg-copper text-obsidian" : "border-border text-muted-foreground hover:border-copper hover:text-bone"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="px-8 py-20 md:px-14">
        <div className="grid grid-cols-1 gap-x-6 gap-y-24 md:grid-cols-2">
          {filtered.map((c, i) => (
            <Link
              key={c.id}
              to="/fleet/$slug"
              params={{ slug: c.slug }}
              className={`group block ${i % 2 === 1 ? "md:mt-32" : ""}`}
            >
              <div className="tilt-card relative aspect-[4/3] overflow-hidden border border-border/60 bg-card">
                <img
                  src={carImageFor(c.hero_image)}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute right-4 top-4 rounded-full bg-obsidian/70 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.3em] text-copper backdrop-blur">
                  {c.category}
                </div>
              </div>
              <div className="mt-6 flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    № {String(i + 1).padStart(3, "0")} · {c.brand}
                  </p>
                  <p className="mt-2 font-display text-4xl tracking-tighter text-bone md:text-5xl">
                    {c.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">from</p>
                  <p className="mt-2 font-display text-2xl text-copper">{formatUsd(c.daily_price_cents)}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">/ day</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}