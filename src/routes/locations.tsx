import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listLocations } from "@/lib/cars.functions";
import { Nav } from "@/components/lumen/Nav";
import { Footer } from "@/components/lumen/Footer";
import { RouteCurtain } from "@/components/lumen/RouteCurtain";

const locOpts = queryOptions({ queryKey: ["locations"], queryFn: () => listLocations() });

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [
      { title: "Locations — 114 Rentals(A+)" },
      { name: "description", content: "Five cities. Handover on your terms." },
      { property: "og:title", content: "Locations — 114 Rentals(A+)" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(locOpts),
  component: LocationsPage,
});

function LocationsPage() {
  const { data: locations } = useSuspenseQuery(locOpts);
  return (
    <div className="relative min-h-screen bg-obsidian text-bone">
      <RouteCurtain />
      <Nav />
      <section className="px-8 pt-40 pb-16 md:px-14 md:pt-56">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-copper">Handover cities</p>
        <h1 className="mt-6 font-display text-[15vw] leading-[0.82] tracking-tighter md:text-[9vw]">
          Five <span className="font-serif-italic text-copper">cities.</span><br />
          One reserve.
        </h1>
      </section>
      <section className="mx-auto max-w-[1600px] px-8 pb-32 md:px-14">
        <div className="grid gap-8 md:grid-cols-2">
          {locations.map((l, i) => (
            <div key={l.id} className="tilt-card group relative aspect-[16/10] overflow-hidden border border-border/60 bg-card radial-copper noise">
              <div className="relative z-10 flex h-full flex-col justify-between p-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">
                  № {String(i + 1).padStart(2, "0")}
                </p>
                <div>
                  <p className="font-display text-[12vw] leading-[0.85] tracking-tighter text-bone md:text-[6vw]">
                    {l.city}
                  </p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    {l.country} · {l.address}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}