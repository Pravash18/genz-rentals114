import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/lumen/Nav";
import { Footer } from "@/components/lumen/Footer";
import { RouteCurtain } from "@/components/lumen/RouteCurtain";
import { MarqueeStrip } from "@/components/lumen/MarqueeStrip";
import { heroAtmosphereImg } from "@/lib/car-assets";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "The Experience — 114 Rentals(A+)" },
      { name: "description", content: "The 114 Rentals(A+) way — a private automotive ritual." },
      { property: "og:title", content: "The Experience — 114 Rentals(A+)" },
    ],
  }),
  component: ExperiencePage,
});

function ExperiencePage() {
  return (
    <div className="relative min-h-screen bg-obsidian text-bone">
      <RouteCurtain />
      <Nav />

      <section className="relative min-h-screen overflow-hidden pt-40">
        <img src={heroAtmosphereImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-obsidian/60 to-obsidian" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-8 pt-16 md:px-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-copper">Chapter II</p>
          <h1 className="mt-8 font-display text-[16vw] leading-[0.82] tracking-tighter md:text-[10vw]">
            The <span className="font-serif-italic text-copper">theatre</span><br />
            of arrival.
          </h1>
          <p className="mt-16 max-w-2xl font-serif-italic text-2xl leading-snug text-bone/80 md:text-3xl">
            You don't rent a car. You inherit an atmosphere. Everything else is just logistics.
          </p>
        </div>
      </section>

      <MarqueeStrip items={["Provenance", "Precision", "Presence", "Patience"]} />

      <section className="mx-auto max-w-[1400px] px-8 py-32 md:px-14 md:py-48">
        <div className="grid gap-16 md:grid-cols-3">
          {[
            { n: "01", t: "Reserve", d: "Select a vehicle, a city, dates. Or ring our concierge and describe the trip in a sentence — we'll do the rest." },
            { n: "02", t: "Prepare", d: "A route guide arrives by hand. Playlists, restaurants, roads locals actually drive. Yours before you land." },
            { n: "03", t: "Arrive", d: "Handover at your terminal, hotel, or a private garage. Champagne is optional. Sunlight is not." },
          ].map((s) => (
            <div key={s.n}>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">— {s.n}</p>
              <h3 className="mt-6 font-display text-5xl tracking-tighter text-bone">{s.t}</h3>
              <p className="mt-6 text-sm leading-relaxed text-bone/70">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 py-40 radial-copper noise">
        <div className="mx-auto max-w-[1200px] px-8 text-center md:px-14">
          <p className="font-serif-italic text-4xl leading-[1.2] text-bone md:text-6xl">
            "The best car rental I've ever been part of. Which is a sentence I've never said before,
            because the phrase was previously an oxymoron."
          </p>
          <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.3em] text-copper">
            Marco V. · Milan · Ferrari Roma · 4 days
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}