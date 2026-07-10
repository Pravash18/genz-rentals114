import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Nav } from "@/components/lumen/Nav";
import { RouteCurtain } from "@/components/lumen/RouteCurtain";
import { toast } from "sonner";

const searchSchema = z.object({ next: z.string().optional() });

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — 114 Rentals(A+)" },
      { name: "description", content: "Access your 114 Rentals(A+) reserve." },
    ],
  }),
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: (next as string) || "/dashboard" });
    });
  }, [navigate, next]);

  const handleGoogle = async () => {
    if (next) sessionStorage.setItem("lumen:next", next);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) toast.error("Google sign-in failed");
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        const saved = sessionStorage.getItem("lumen:next");
        sessionStorage.removeItem("lumen:next");
        navigate({ to: saved || next || "/dashboard" });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Welcome to 114 Rentals(A+)", { description: "Check your email if verification is required." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: next || "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-obsidian text-bone">
      <RouteCurtain />
      <Nav />
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-12 items-center px-8 py-40 md:px-14">
        <div className="col-span-12 md:col-span-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">
            {mode === "sign-in" ? "Welcome back" : "Join the reserve"}
          </p>
          <h1 className="mt-8 font-display text-[15vw] leading-[0.82] tracking-tighter md:text-[7vw]">
            {mode === "sign-in" ? (
              <>Return<br /><span className="font-serif-italic text-copper">to the</span><br />road.</>
            ) : (
              <>The <span className="font-serif-italic text-copper">keys</span><br />are yours.</>
            )}
          </h1>
          <p className="mt-12 max-w-md font-serif-italic text-xl text-bone/70">
            A member's account unlocks reservations, trip history, saved vehicles, and priority concierge lines in every city.
          </p>
        </div>
        <div className="col-span-12 mt-16 md:col-span-5 md:col-start-8 md:mt-0">
          <div className="border border-border bg-card p-10">
            <div className="mb-8 flex gap-2 font-mono text-[10px] uppercase tracking-[0.25em]">
              <button
                onClick={() => setMode("sign-in")}
                className={`rounded-full border px-4 py-2 transition ${mode === "sign-in" ? "border-copper bg-copper text-obsidian" : "border-border text-muted-foreground"}`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode("sign-up")}
                className={`rounded-full border px-4 py-2 transition ${mode === "sign-up" ? "border-copper bg-copper text-obsidian" : "border-border text-muted-foreground"}`}
              >
                Create account
              </button>
            </div>
            <button
              onClick={handleGoogle}
              className="mb-6 flex w-full items-center justify-center gap-3 rounded-full border border-bone/30 bg-bone/5 py-4 font-mono text-[10px] uppercase tracking-[0.3em] text-bone transition hover:border-copper"
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 11v2h5.5c-.2 1.5-1.6 4.3-5.5 4.3-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.6-2.6C16.9 2.6 14.7 1.6 12 1.6 6.2 1.6 1.6 6.2 1.6 12s4.6 10.4 10.4 10.4c6 0 10-4.2 10-10.1 0-.7-.1-1.2-.2-1.7H12z"/></svg>
              Continue with Google
            </button>
            <div className="mb-6 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
            </div>
            <form onSubmit={submit} className="space-y-4">
              {mode === "sign-up" && (
                <Field label="Full name" value={name} onChange={setName} type="text" />
              )}
              <Field label="Email" value={email} onChange={setEmail} type="email" required />
              <Field label="Password" value={password} onChange={setPassword} type="password" required />
              <button
                type="submit"
                disabled={busy}
                className="mt-4 w-full rounded-full bg-copper py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-obsidian transition hover:bg-copper-glow disabled:opacity-50"
              >
                {busy ? "…" : mode === "sign-in" ? "Sign in →" : "Create account →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border border-border bg-input px-4 py-3 font-mono text-sm text-bone focus:border-copper focus:outline-none"
      />
    </label>
  );
}