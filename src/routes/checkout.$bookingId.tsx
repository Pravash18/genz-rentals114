import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getBooking, mockPayBooking } from "@/lib/bookings.functions";
import { Nav } from "@/components/lumen/Nav";
import { RouteCurtain } from "@/components/lumen/RouteCurtain";
import { carImageFor } from "@/lib/car-assets";
import { formatUsd, daysBetween } from "@/lib/format";
import { toast } from "sonner";

const bookingOpts = (id: string) =>
  queryOptions({ queryKey: ["booking", id], queryFn: () => getBooking({ data: { id } }) });

export const Route = createFileRoute("/checkout/$bookingId")({
  head: () => ({
    meta: [
      { title: "Checkout — 114 Rentals(A+)" },
      { name: "description", content: "Complete your 114 Rentals(A+) reservation." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  const { data: booking } = useSuspenseQuery(bookingOpts(bookingId));
  const payFn = useServerFn(mockPayBooking);

  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12 / 29");
  const [cvc, setCvc] = useState("123");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  if (!booking) {
    return (
      <div className="grid min-h-screen place-items-center bg-obsidian text-bone">
        Booking not found. <Link to="/fleet" className="ml-2 text-copper">Browse fleet →</Link>
      </div>
    );
  }

  const car = (booking as unknown as { cars: { name: string; brand: string; hero_image: string } }).cars;
  const days = daysBetween(booking.start_date, booking.end_date);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("processing");
    try {
      const last4 = cardNumber.replace(/\s/g, "").slice(-4);
      await payFn({ data: { bookingId, last4 } });
      setStatus("success");
      setTimeout(() => navigate({ to: "/bookings/$id", params: { id: bookingId } }), 2200);
    } catch (err) {
      toast.error("Payment failed", { description: (err as Error).message });
      setStatus("idle");
    }
  };

  return (
    <div className="relative min-h-screen bg-obsidian text-bone">
      <RouteCurtain />
      <Nav />

      {status === "success" && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-obsidian text-center">
          <div className="rise-in">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-copper">Confirmed</p>
            <p className="mt-8 font-display text-[16vw] leading-[0.85] tracking-tighter md:text-[8vw]">
              The keys<br />
              are <span className="font-serif-italic text-copper">yours.</span>
            </p>
            <p className="mt-8 font-serif-italic text-2xl text-bone/70">
              Redirecting to your trip…
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-8 px-8 pt-40 pb-24 md:px-14">
        <div className="col-span-12 md:col-span-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">Checkout · Step 2 / 2</p>
          <h1 className="mt-8 font-display text-[14vw] leading-[0.82] tracking-tighter md:text-[6vw]">
            Confirm the<br />
            <span className="font-serif-italic text-copper">handover.</span>
          </h1>

          <div className="mt-12 border border-border bg-card">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={carImageFor(car.hero_image)} alt={car.name} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-3 p-6 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase tracking-[0.25em] text-[10px]">Vehicle</span>
                <span className="text-bone font-display text-lg">{car.brand} {car.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground uppercase tracking-[0.25em] text-[10px]">Dates</span>
                <span>{booking.start_date} → {booking.end_date} ({days}d)</span>
              </div>
              <div className="mt-4 border-t border-border pt-4 flex justify-between">
                <span className="text-muted-foreground uppercase tracking-[0.25em] text-[10px]">Total</span>
                <span className="text-copper font-display text-2xl">{formatUsd(booking.total_cents)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 md:col-start-7">
          <div className="border border-border bg-card p-8 md:p-10">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">Payment method</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                Encrypted · Simulated
              </p>
            </div>

            {/* Card visual */}
            <div className="mb-8 aspect-[16/10] w-full rounded-xl border border-copper/40 bg-gradient-to-br from-obsidian via-card to-obsidian p-6 shadow-xl">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <p className="font-serif-italic text-2xl text-copper">114 Rentals(A+)</p>
                  <div className="h-8 w-12 rounded bg-champagne/30" />
                </div>
                <div>
                  <p className="font-mono text-xl tracking-widest text-bone">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </p>
                  <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    <span>{name || "Cardholder"}</span>
                    <span>{expiry || "MM / YY"}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <PayField label="Name on card" value={name} onChange={setName} placeholder="J. Smith" />
              <PayField label="Card number" value={cardNumber} onChange={setCardNumber} />
              <div className="grid grid-cols-2 gap-4">
                <PayField label="Expiry" value={expiry} onChange={setExpiry} />
                <PayField label="CVC" value={cvc} onChange={setCvc} />
              </div>
              <button
                type="submit"
                disabled={status !== "idle"}
                className="mt-6 w-full rounded-full bg-copper py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-obsidian transition hover:bg-copper-glow disabled:opacity-50"
              >
                {status === "processing" ? "Processing…" : `Pay ${formatUsd(booking.total_cents)} →`}
              </button>
              <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                Demo payment · No real charge is made
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full border border-border bg-input px-4 py-3 font-mono text-sm text-bone focus:border-copper focus:outline-none"
      />
    </label>
  );
}