import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyBookings } from "@/lib/bookings.functions";
import { Nav } from "@/components/lumen/Nav";
import { Footer } from "@/components/lumen/Footer";
import { RouteCurtain } from "@/components/lumen/RouteCurtain";
import { carImageFor } from "@/lib/car-assets";
import { formatUsd, daysBetween } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const fetchBookings = useServerFn(listMyBookings);
  const q = useQuery({ queryKey: ["my-bookings"], queryFn: () => fetchBookings() });
  const [email, setEmail] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const bookings = q.data ?? [];
  const now = Date.now();
  const upcoming = bookings.filter((b) => new Date(b.end_date).getTime() >= now);
  const past = bookings.filter((b) => new Date(b.end_date).getTime() < now);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="relative min-h-screen bg-obsidian text-bone">
      <RouteCurtain />
      <Nav />

      <section className="px-8 pt-40 pb-16 md:px-14 md:pt-56">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-copper">Your reserve</p>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-display text-[14vw] leading-[0.82] tracking-tighter md:text-[7vw]">
            Welcome<br />
            <span className="font-serif-italic text-copper">back.</span>
          </h1>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Signed in as</p>
            <p className="mt-2 font-mono text-sm text-bone">{email}</p>
            <button
              onClick={signOut}
              className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground link-underline"
            >
              Sign out →
            </button>
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 px-8 py-16 md:px-14">
        <div className="grid grid-cols-3 gap-6 md:grid-cols-4">
          <Stat label="Upcoming" value={String(upcoming.length)} />
          <Stat label="Past trips" value={String(past.length)} />
          <Stat label="Cities visited" value={String(new Set(bookings.map((b) => b.pickup_location_id).filter(Boolean)).size)} />
          <Stat label="Total km" value="—" hidden />
        </div>
      </section>

      <section className="px-8 py-20 md:px-14">
        <h2 className="mb-10 font-mono text-[11px] uppercase tracking-[0.35em] text-copper">— Upcoming</h2>
        {q.isLoading ? (
          <p className="font-mono text-sm text-muted-foreground">Loading…</p>
        ) : upcoming.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {upcoming.map((b) => (
              <TripCard key={b.id} b={b} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="px-8 pb-20 md:px-14">
          <h2 className="mb-10 font-mono text-[11px] uppercase tracking-[0.35em] text-copper">— Past trips</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {past.map((b) => (
              <TripCard key={b.id} b={b} muted />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

function Stat({ label, value, hidden = false }: { label: string; value: string; hidden?: boolean }) {
  return (
    <div className={hidden ? "hidden md:block" : ""}>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-5xl tracking-tighter text-bone md:text-7xl">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border bg-card p-16 text-center">
      <p className="font-serif-italic text-3xl text-bone">The garage is empty.</p>
      <p className="mt-3 text-sm text-muted-foreground">Time to pick a weapon.</p>
      <Link
        to="/fleet"
        className="mt-8 inline-flex rounded-full bg-copper px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-obsidian hover:bg-copper-glow"
      >
        Browse fleet →
      </Link>
    </div>
  );
}

type BookingRow = {
  id: string;
  start_date: string;
  end_date: string;
  total_cents: number;
  status: string;
  cars: { name: string; brand: string; hero_image: string; slug: string };
};

function TripCard({ b, muted = false }: { b: BookingRow; muted?: boolean }) {
  return (
    <Link
      to="/bookings/$id"
      params={{ id: b.id }}
      className={`group grid grid-cols-[1fr_1.4fr] overflow-hidden border border-border/60 bg-card transition ${muted ? "opacity-70 hover:opacity-100" : ""}`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={carImageFor(b.cars.hero_image)}
          alt={b.cars.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col justify-between p-6">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-copper">
            {b.status.replace("_", " ")}
          </p>
          <p className="mt-3 font-display text-2xl leading-tight tracking-tighter text-bone">
            {b.cars.brand}<br />
            <span className="font-serif-italic text-copper">{b.cars.name}</span>
          </p>
        </div>
        <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <p>{b.start_date} → {b.end_date}</p>
          <p className="mt-1 text-bone">{daysBetween(b.start_date, b.end_date)}d · {formatUsd(b.total_cents)}</p>
        </div>
      </div>
    </Link>
  );
}