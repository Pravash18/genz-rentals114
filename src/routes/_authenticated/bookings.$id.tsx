import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBooking } from "@/lib/bookings.functions";
import { Nav } from "@/components/lumen/Nav";
import { Footer } from "@/components/lumen/Footer";
import { RouteCurtain } from "@/components/lumen/RouteCurtain";
import { carImageFor } from "@/lib/car-assets";
import { formatUsd, daysBetween } from "@/lib/format";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/bookings/$id")({
  component: BookingDetail,
});

function BookingDetail() {
  const { id } = Route.useParams();
  const fetchBooking = useServerFn(getBooking);
  const q = useQuery({ queryKey: ["booking", id], queryFn: () => fetchBooking({ data: { id } }) });
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");

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
              <button
                onClick={() => setConciergeOpen(true)}
                className="rounded-full border border-border py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone transition hover:border-copper hover:text-copper"
              >
                Concierge
              </button>
              <button
                onClick={() => setRouteOpen(true)}
                className="rounded-full border border-border py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone transition hover:border-copper hover:text-copper"
              >
                Route guide
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <ConciergeDialog
        open={conciergeOpen}
        onOpenChange={setConciergeOpen}
        car={`${car.brand} ${car.name}`}
        city={loc?.city}
        message={message}
        setMessage={setMessage}
        phone={phone}
        setPhone={setPhone}
        onSubmit={() => {
          if (!message.trim()) {
            toast.error("Add a message so the concierge can help.");
            return;
          }
          toast.success("Concierge notified", {
            description: "A specialist will reach out within 15 minutes.",
          });
          setMessage("");
          setPhone("");
          setConciergeOpen(false);
        }}
      />

      <RouteGuideDialog
        open={routeOpen}
        onOpenChange={setRouteOpen}
        city={loc?.city}
        car={`${car.brand} ${car.name}`}
      />
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

function ConciergeDialog({
  open,
  onOpenChange,
  car,
  city,
  message,
  setMessage,
  phone,
  setPhone,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  car: string;
  city?: string;
  message: string;
  setMessage: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  onSubmit: () => void;
}) {
  const quick = [
    "Arrange airport handover",
    "Add a second driver",
    "Request a chase car for photography",
    "Extend my booking by a day",
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border border-border bg-obsidian text-bone">
        <DialogHeader>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">Private concierge</p>
          <DialogTitle className="font-display text-4xl leading-none tracking-tighter text-bone">
            How can we <span className="font-serif-italic text-copper">assist</span>?
          </DialogTitle>
          <DialogDescription className="text-bone/60">
            Your dedicated specialist for the {car}{city ? ` in ${city}` : ""}. Reachable 24/7.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap gap-2">
            {quick.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setMessage(message ? `${message}\n${q}` : q)}
                className="rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/80 transition hover:border-copper hover:text-copper"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Contact number (optional)
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              className="border-border bg-obsidian text-bone"
            />
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell your concierge what you need…"
              rows={5}
              className="border-border bg-obsidian text-bone"
            />
          </div>

          <div className="rounded-md border border-border/60 p-3 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/60">
            Direct line · +1 (114) 555-0114 · concierge@114rentals.com
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-bone hover:border-copper"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="rounded-full bg-copper px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-obsidian hover:opacity-90"
          >
            Send to concierge
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type Route = { name: string; distance: string; duration: string; highlight: string; note: string };

const ROUTE_LIBRARY: Record<string, Route[]> = {
  Monaco: [
    { name: "Grande Corniche → Èze", distance: "32 km", duration: "1h 20m", highlight: "Cliffside hairpins with the Med below", note: "Break at Château Èze for espresso at sunrise." },
    { name: "Col de Turini loop", distance: "108 km", duration: "3h", highlight: "The legendary Monte Carlo rally stage", note: "Alpine air, low traffic before 10am." },
    { name: "Monaco → Portofino", distance: "195 km", duration: "3h 30m", highlight: "A1 coastal cruise into Ligurian harbours", note: "Reserve valet at Splendido on arrival." },
  ],
  "Los Angeles": [
    { name: "Mulholland → Malibu", distance: "68 km", duration: "2h", highlight: "Ridge-top canyon carving into PCH", note: "Coffee stop at Rock Store, breakfast at Malibu Farm." },
    { name: "Angeles Crest Highway", distance: "104 km", duration: "2h 40m", highlight: "Empty switchbacks above the smog line", note: "Fuel up before Clear Creek — no stations for 90 km." },
    { name: "PCH → Santa Barbara", distance: "150 km", duration: "2h 30m", highlight: "Pacific horizon the whole way", note: "Lunch at San Ysidro Ranch." },
  ],
  Dubai: [
    { name: "Jebel Jais summit", distance: "165 km", duration: "2h", highlight: "UAE's highest road — 20 km of pristine tarmac", note: "Start pre-dawn to beat the heat." },
    { name: "Hatta mountain loop", distance: "130 km", duration: "1h 45m", highlight: "Rugged Hajar wadis and reservoir vistas", note: "Border checkpoint — carry passport." },
    { name: "Al Qudra desert road", distance: "80 km", duration: "1h", highlight: "Dead-straight ribbon through the dunes", note: "Best at golden hour for photography." },
  ],
  Tokyo: [
    { name: "Hakone Turnpike", distance: "140 km", duration: "2h 30m", highlight: "The Touge classic — Fuji in the mirror", note: "Weekday mornings only. Onsen stop at Yunessun." },
    { name: "Wangan bay run", distance: "60 km", duration: "1h", highlight: "Neon-lit expressway through Rainbow Bridge", note: "After midnight for the full aesthetic." },
    { name: "Izu peninsula loop", distance: "260 km", duration: "5h", highlight: "Coastal sweepers and volcanic overlooks", note: "Ryokan stay recommended overnight." },
  ],
  Milan: [
    { name: "Passo dello Stelvio", distance: "215 km", duration: "3h 20m", highlight: "48 stacked hairpins above 2700m", note: "Only open May–October. Layer up." },
    { name: "Lake Como grand tour", distance: "170 km", duration: "3h", highlight: "Villa Balbianello, Bellagio, Varenna", note: "Lunch at Il Gatto Nero, Cernobbio." },
    { name: "Franciacorta wine route", distance: "120 km", duration: "2h", highlight: "Rolling vineyards and Renaissance villas", note: "Tastings at Bellavista by appointment." },
  ],
};

function RouteGuideDialog({
  open,
  onOpenChange,
  city,
  car,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  city?: string;
  car: string;
}) {
  const routes = (city && ROUTE_LIBRARY[city]) || [
    { name: "The Open Road", distance: "—", duration: "—", highlight: "Curated route pending for this handover city", note: "Message your concierge for a bespoke itinerary." },
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border border-border bg-obsidian text-bone">
        <DialogHeader>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">
            Route guide{city ? ` · ${city}` : ""}
          </p>
          <DialogTitle className="font-display text-4xl leading-none tracking-tighter text-bone">
            Roads worth <span className="font-serif-italic text-copper">the {car.split(" ")[0]}</span>
          </DialogTitle>
          <DialogDescription className="text-bone/60">
            Hand-picked drives from our chief route editor. Save one and we'll pre-load it to your car's nav.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {routes.map((r) => (
            <div key={r.name} className="border border-border/60 p-5 transition hover:border-copper">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl tracking-tight text-bone">{r.name}</h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-copper whitespace-nowrap">
                  {r.distance} · {r.duration}
                </span>
              </div>
              <p className="mt-2 font-serif-italic text-bone/80">{r.highlight}</p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Concierge note · {r.note}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toast.success(`${r.name} sent to your car's nav`)}
                  className="rounded-full bg-copper px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-obsidian hover:opacity-90"
                >
                  Send to car
                </button>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(r.name + (city ? " " + city : ""))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-bone hover:border-copper"
                >
                  Preview on map
                </a>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}