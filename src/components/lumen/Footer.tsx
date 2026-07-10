import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-obsidian">
      <div className="mx-auto max-w-[1600px] px-8 py-24 md:px-14 md:py-32">
        <div className="grid gap-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-[10vw] leading-[0.85] tracking-tighter text-bone md:text-[6vw]">
              Drive<br />
              <span className="font-serif-italic text-copper">something</span><br />
              worth<br />
              remembering.
            </p>
          </div>
          <FooterCol title="Explore" links={[
            { to: "/fleet", label: "Fleet" },
            { to: "/experience", label: "Experience" },
            { to: "/locations", label: "Locations" },
          ]} />
          <FooterCol title="Account" links={[
            { to: "/auth", label: "Sign in" },
            { to: "/dashboard", label: "Dashboard" },
          ]} />
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <p className="text-bone">Concierge</p>
            <p className="mt-3">24 / 7</p>
            <p>+377 · 04 · 88 88</p>
            <p>concierge@lumen.rent</p>
          </div>
        </div>
        <div className="mt-24 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} 114 Rentals(A+) Automotive Reserve</p>
          <p>Monaco · Los Angeles · Dubai · Tokyo · Milan</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-copper">{title}</p>
      <ul className="mt-6 space-y-3 font-display text-2xl text-bone">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="link-underline">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}