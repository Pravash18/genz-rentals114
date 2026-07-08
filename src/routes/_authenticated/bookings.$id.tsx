import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBooking } from "@/lib/bookings.functions";
import { Nav } from "@/components/lumen/Nav";
import { Footer } from "@/components/lumen/Footer";
import { RouteCurtain } from "@/components/lumen/RouteCurtain";
import { carImageFor } from "@/lib/car-assets";
import { formatUsd, daysBetween } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/bookings/$id")({
  component: BookingDetail,
});

function BookingDetail() {
  const { id } = Route.useParams();
  const fetchBooking = useServerFn(getBooking);
  const q = useQuery({ queryKey: ["booking", id], queryFn: () => fetchBooking({ data: { id } }) });

  if (q.isLoading) {
    return <div className="grid min-h-screen place-items-center bg-obsidian text-bone">Loading…</div>;
  }
  const b = q.data;
  if (!b) {
    return (
      <div className="grid min-h-screen place-items-center bg-obsidian text-bone">
        <div className="text-center">
          <p>Booking not found.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-copper">← Dashboard</Link>
        </div>
      </div>
    );
  }
  const car = (b as unknown as { cars: { name: string; brand: string; hero_image: string; slug: string; tagline: string | null; description: string | null } }).cars;
  const loc = (b as unknown as { locations: { city: string; country: string } | null }).locations;
  const days = daysBetween(b.start_date, b.end_date);

  return (
    <div className="relative min-h-screen bg-obsidian text-bone">
      <RouteCurtain />
      <Nav />

      <section className="mx-auto max-w-[1600px] px-8 pt-40 pb-16 md:px-14 md:pt-56">
        <Link to="/dashboard" className="link-underline font-mono text-[10px] uppercase tracking-[0.3em] text-copper">
          ← Your reserve
        </Link>
        <div className="mt-12 grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-7">
            <div className="relative aspect-[16/11] overflow-hidden border border-border/60">
              <img src={carImageFor(car.hero_image)} alt={car.name} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="col-span-12 md:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">
              {b.status === "confirmed" ? "✓ Confirmed" : b.status.replace("_", " ")}
            </p>
            <h1 className="mt-6 font-display text-6xl leading-[0.9] tracking-tighter text-bone md:text-7xl">
              {car.brand}<br />
              <span className="font-serif-italic text-copper">{car.name}</span>
            </h1>
            {car.tagline && (
              <p className="mt-6 font-serif-italic text-xl text-bone/70">{car.tagline}</p>
            )}

            <div className="mt-10 space-y-6 border-y border-border py-8 font-mono text-xs">
              <DetailRow k="Pickup" v={b.start_date} />
              <DetailRow k="Return" v={b.end_date} />
              <DetailRow k="Duration" v={`${days} ${days === 1 ? "day" : "days"}`} />
              {loc && <DetailRow k="Handover" v={`${loc.city}, ${loc.country}`} />}
              <DetailRow k="Total paid" v={formatUsd(b.total_cents)} highlight />
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3">
              <button className="rounded-full border border-border py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone hover:border-copper">
                Concierge
              </button>
              <button className="rounded-full border border-border py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone hover:border-copper">
                Route guide
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function DetailRow({ k, v, highlight = false }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="uppercase tracking-[0.25em] text-[10px] text-muted-foreground">{k}</span>
      <span className={highlight ? "font-display text-3xl text-copper" : "text-bone"}>{v}</span>
    </div>
  );
}