import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCarBySlug } from "@/lib/cars.functions";
import { createBooking } from "@/lib/bookings.functions";
import { useServerFn } from "@tanstack/react-start";
import { Nav } from "@/components/lumen/Nav";
import { Footer } from "@/components/lumen/Footer";
import { RouteCurtain } from "@/components/lumen/RouteCurtain";
import { SpatialCarViewer } from "@/components/lumen/SpatialCarViewer";
import { formatUsd, daysBetween } from "@/lib/format";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const carOpts = (slug: string) =>
  queryOptions({ queryKey: ["car", slug], queryFn: () => getCarBySlug({ data: { slug } }) });

export const Route = createFileRoute("/fleet/$slug")({
  loader: async ({ context, params }) => {
    const car = await context.queryClient.ensureQueryData(carOpts(params.slug));
    if (!car) throw notFound();
    return { car };
  },
  head: ({ loaderData }) => {
    const car = loaderData?.car;
    if (!car) return { meta: [{ title: "Not found — 114 Rentals(A+)" }] };
    return {
      meta: [
        { title: `${car.brand} ${car.name} — 114 Rentals(A+)` },
        { name: "description", content: car.tagline ?? car.description ?? "Book with 114 Rentals(A+)." },
        { property: "og:title", content: `${car.brand} ${car.name} — 114 Rentals(A+)` },
        { property: "og:description", content: car.tagline ?? "" },
      ],
    };
  },
  component: CarDetail,
});

function CarDetail() {
  const { slug } = Route.useParams();
  const { data: car } = useSuspenseQuery(carOpts(slug));
  if (!car) return null;

  const navigate = useNavigate();
  const bookFn = useServerFn(createBooking);
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const dayAfter = new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10);
  const [start, setStart] = useState(tomorrow);
  const [end, setEnd] = useState(dayAfter);
  const [busy, setBusy] = useState(false);
  const days = daysBetween(start, end);
  const subtotal = days * car.daily_price_cents;
  const total = subtotal + car.deposit_cents;

  const onReserve = async () => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      toast("Sign in to reserve", { description: "You'll be back here in one click." });
      navigate({ to: "/auth", search: { next: `/fleet/${slug}` } });
      return;
    }
    if (new Date(end) <= new Date(start)) {
      toast.error("Return date must be after pickup.");
      return;
    }
    setBusy(true);
    try {
      const booking = await bookFn({
        data: { carId: car.id, startDate: start, endDate: end, pickupLocationId: car.location_id },
      });
      navigate({ to: "/checkout/$bookingId", params: { bookingId: booking.id } });
    } catch (e) {
      toast.error("Could not create booking", { description: String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-obsidian text-bone">
      <RouteCurtain />
      <Nav />

      {/* ─── SPATIAL HERO ─── */}
      <section className="relative min-h-screen overflow-hidden pt-32">
        <div className="relative z-10 mx-auto grid max-w-[1800px] grid-cols-12 gap-6 px-8 pb-24 md:px-14">
          <div className="col-span-12 md:col-span-4">
            <Link to="/fleet" className="link-underline font-mono text-[10px] uppercase tracking-[0.3em] text-copper">
              ← Return to fleet
            </Link>
            <p className="mt-16 font-mono text-[10px] uppercase tracking-[0.35em] text-copper">
              № {car.slug}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {car.brand} · {car.category}
            </p>
            <h1 className="mt-6 font-display text-[15vw] leading-[0.82] tracking-tighter text-bone md:text-[7vw]">
              {car.name.split(" ").map((w: string, i: number) => (
                <span key={i}>
                  {i === 0 ? w : <span className="font-serif-italic text-copper"> {w}</span>}
                </span>
              ))}
            </h1>
            {car.tagline && (
              <p className="mt-8 font-serif-italic text-2xl leading-snug text-bone/80">
                {car.tagline}
              </p>
            )}
          </div>
          <div className="col-span-12 md:col-span-8">
            <SpatialCarViewer className="h-[70vh] w-full" />
          </div>
        </div>
      </section>

      {/* ─── SPECS ─── */}
      <section className="border-y border-border/60 px-8 py-20 md:px-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <Spec label="Horsepower" value={car.horsepower ? `${car.horsepower}` : "—"} unit="hp" />
          <Spec label="Top Speed" value={car.top_speed_kph ? `${car.top_speed_kph}` : "—"} unit="km/h" />
          <Spec label="0 → 100" value={car.zero_to_hundred ? `${car.zero_to_hundred}` : "—"} unit="sec" />
          <Spec label="Transmission" value={car.transmission ?? "—"} unit={`${car.seats ?? "?"} seats`} />
        </div>
      </section>

      {/* ─── DESCRIPTION + BOOKING ─── */}
      <section className="mx-auto grid max-w-[1600px] grid-cols-12 gap-8 px-8 py-24 md:px-14 md:py-32">
        <div className="col-span-12 md:col-span-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">
            The philosophy
          </p>
          <p className="mt-8 font-display text-3xl leading-[1.15] tracking-tight text-bone md:text-4xl">
            {car.description}
          </p>
          {car.locations && (
            <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Handover in <span className="text-copper">{(car.locations as { city: string }).city}</span>
            </p>
          )}
        </div>

        <div className="col-span-12 md:col-span-5 md:col-start-8">
          <div className="border border-border bg-card p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">
              Reserve · from {formatUsd(car.daily_price_cents)} / day
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Pickup</span>
                <input
                  type="date"
                  value={start}
                  min={today}
                  onChange={(e) => setStart(e.target.value)}
                  className="mt-2 w-full border border-border bg-input px-3 py-3 font-mono text-sm text-bone focus:border-copper focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Return</span>
                <input
                  type="date"
                  value={end}
                  min={start}
                  onChange={(e) => setEnd(e.target.value)}
                  className="mt-2 w-full border border-border bg-input px-3 py-3 font-mono text-sm text-bone focus:border-copper focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-8 space-y-2 border-y border-border py-6 font-mono text-xs">
              <Row label={`${formatUsd(car.daily_price_cents)} × ${days} ${days === 1 ? "day" : "days"}`} value={formatUsd(subtotal)} />
              <Row label="Refundable deposit" value={formatUsd(car.deposit_cents)} />
              <Row label="Total" value={formatUsd(total)} bold />
            </div>
            <button
              onClick={onReserve}
              disabled={busy}
              className="mt-8 w-full rounded-full bg-copper py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-obsidian transition hover:bg-copper-glow disabled:opacity-50"
            >
              {busy ? "Reserving…" : "Reserve now →"}
            </button>
            <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              Free cancellation · 48 h
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Spec({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-copper">{label}</p>
      <p className="mt-4 font-display text-6xl leading-none tracking-tighter text-bone md:text-7xl">
        {value}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{unit}</p>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-bone" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className={bold ? "text-copper font-display text-xl" : ""}>{value}</span>
    </div>
  );
}