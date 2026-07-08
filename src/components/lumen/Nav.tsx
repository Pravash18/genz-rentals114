import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Nav() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
      <div className="flex items-center justify-between px-8 py-6 md:px-14 md:py-8">
        <Link to="/" className="font-display text-xl tracking-tighter text-bone">
          LUMEN<span className="text-copper">.</span>
        </Link>
        <nav className="hidden items-center gap-10 font-mono text-[11px] uppercase tracking-[0.25em] text-bone md:flex">
          <Link to="/fleet" className="link-underline">Fleet</Link>
          <Link to="/experience" className="link-underline">Experience</Link>
          <Link to="/locations" className="link-underline">Locations</Link>
          {email ? (
            <Link to="/dashboard" className="link-underline">Account</Link>
          ) : (
            <Link to="/auth" className="link-underline">Sign in</Link>
          )}
        </nav>
        <Link
          to={email ? "/fleet" : "/auth"}
          className="hidden md:inline-flex items-center gap-2 rounded-full border border-bone/30 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-bone transition hover:border-copper hover:text-copper"
        >
          Reserve
          <span className="text-copper">→</span>
        </Link>
      </div>
    </header>
  );
}