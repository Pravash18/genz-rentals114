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
    <header className="fixed top-4 left-4 right-4 z-50">
      <div className="glass-strong flex items-center justify-between px-6 py-4 md:px-8">
        <Link to="/" className="font-mono text-sm uppercase tracking-[0.2em] text-bone">
          LUMEN<span className="text-copper">/</span>
        </Link>
        <nav className="hidden items-center gap-8 font-mono text-[11px] uppercase tracking-[0.25em] text-bone md:flex">
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
          className="hidden md:inline-flex items-center gap-2 border border-copper bg-copper px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-obsidian transition hover:bg-copper-glow"
        >
          Reserve
          <span>→</span>
        </Link>
      </div>
    </header>
  );
}