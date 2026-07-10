import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListAll,
  adminUpsertCar,
  adminDeleteCar,
  adminUpsertLocation,
  adminDeleteLocation,
  adminUpdateBookingStatus,
  adminDeleteBooking,
} from "@/lib/admin.functions";
import { Nav } from "@/components/lumen/Nav";
import { RouteCurtain } from "@/components/lumen/RouteCurtain";
import { formatUsd } from "@/lib/format";
import { toast } from "sonner";

const ADMIN_EMAIL = "stoicpravash@gmail.com";

const adminOpts = queryOptions({
  queryKey: ["admin", "all"],
  queryFn: () => adminListAll(),
});

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Lumen" },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user || data.user.email !== ADMIN_EMAIL) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(adminOpts),
  component: AdminPage,
});

type Tab = "cars" | "locations" | "bookings" | "users";

function AdminPage() {
  const { data } = useSuspenseQuery(adminOpts);
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("cars");
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "all"] });

  return (
    <div className="relative min-h-screen bg-obsidian text-bone">
      <RouteCurtain />
      <Nav />
      <div className="mx-auto max-w-[1600px] px-8 pt-40 pb-24 md:px-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-copper">Admin console</p>
        <h1 className="mt-6 font-display text-[12vw] leading-[0.85] tracking-tighter md:text-[6vw]">
          Command <span className="font-serif-italic text-copper">center.</span>
        </h1>

        <div className="mt-12 flex flex-wrap gap-3 border-b border-border pb-4">
          {(["cars", "locations", "bookings", "users"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full border px-5 py-2 font-mono text-[10px] uppercase tracking-[0.3em] transition ${
                tab === t
                  ? "border-copper bg-copper text-obsidian"
                  : "border-border text-muted-foreground hover:border-copper hover:text-bone"
              }`}
            >
              {t} · {(data[t] as unknown[]).length}
            </button>
          ))}
        </div>

        <div className="mt-10">
          {tab === "cars" && <CarsPanel cars={data.cars} locations={data.locations} onChange={refresh} />}
          {tab === "locations" && <LocationsPanel locations={data.locations} onChange={refresh} />}
          {tab === "bookings" && <BookingsPanel bookings={data.bookings} onChange={refresh} />}
          {tab === "users" && <UsersPanel users={data.users} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- CARS ---------------- */

type CarRow = Record<string, any>;
type LocationRow = { id: string; city: string; country: string; address?: string | null; lat?: number | null; lng?: number | null };

const emptyCar = (): CarRow => ({
  slug: "",
  name: "",
  brand: "",
  category: "Exotic",
  tagline: "",
  description: "",
  hero_image: "",
  daily_price_cents: 100000,
  deposit_cents: 500000,
  horsepower: null,
  top_speed_kph: null,
  zero_to_hundred: null,
  seats: 2,
  transmission: "Automatic",
  status: "available",
  location_id: null,
});

function CarsPanel({ cars, locations, onChange }: { cars: CarRow[]; locations: LocationRow[]; onChange: () => void }) {
  const [editing, setEditing] = useState<CarRow | null>(null);
  const upsert = useServerFn(adminUpsertCar);
  const del = useServerFn(adminDeleteCar);

  const save = async (row: CarRow) => {
    try {
      await upsert({ data: row as any });
      toast.success("Car saved");
      setEditing(null);
      onChange();
    } catch (e) {
      toast.error("Save failed", { description: String(e) });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this car?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      onChange();
    } catch (e) {
      toast.error("Delete failed", { description: String(e) });
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {cars.length} vehicles
        </p>
        <button
          onClick={() => setEditing(emptyCar())}
          className="rounded-full bg-copper px-5 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-obsidian hover:bg-copper-glow"
        >
          + New car
        </button>
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-card">
            <tr className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <th className="p-3">Slug</th>
              <th className="p-3">Brand / Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Daily</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3">{c.brand} {c.name}</td>
                <td className="p-3">{c.category}</td>
                <td className="p-3 text-copper">{formatUsd(c.daily_price_cents)}</td>
                <td className="p-3">{c.status}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => setEditing(c)} className="text-copper hover:underline">Edit</button>
                  <button onClick={() => remove(c.id)} className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <CarModal car={editing} locations={locations} onCancel={() => setEditing(null)} onSave={save} />
      )}
    </div>
  );
}

function CarModal({
  car,
  locations,
  onCancel,
  onSave,
}: {
  car: CarRow;
  locations: LocationRow[];
  onCancel: () => void;
  onSave: (c: CarRow) => Promise<void>;
}) {
  const [row, setRow] = useState<CarRow>(car);
  const set = (k: string, v: any) => setRow((r) => ({ ...r, [k]: v }));
  const num = (v: string) => (v === "" ? null : Number(v));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-obsidian/80 p-6" onClick={onCancel}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-border bg-card p-8" onClick={(e) => e.stopPropagation()}>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-copper">
          {car.id ? "Edit car" : "New car"}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Field label="Slug" value={row.slug} onChange={(v) => set("slug", v)} />
          <Field label="Category" value={row.category} onChange={(v) => set("category", v)} />
          <Field label="Brand" value={row.brand} onChange={(v) => set("brand", v)} />
          <Field label="Name" value={row.name} onChange={(v) => set("name", v)} />
          <Field label="Tagline" value={row.tagline ?? ""} onChange={(v) => set("tagline", v)} full />
          <Field label="Description" value={row.description ?? ""} onChange={(v) => set("description", v)} full multiline />
          <Field label="Hero image key" value={row.hero_image ?? ""} onChange={(v) => set("hero_image", v)} full />
          <Field label="Daily price (cents)" type="number" value={String(row.daily_price_cents)} onChange={(v) => set("daily_price_cents", Number(v))} />
          <Field label="Deposit (cents)" type="number" value={String(row.deposit_cents)} onChange={(v) => set("deposit_cents", Number(v))} />
          <Field label="Horsepower" type="number" value={row.horsepower ?? ""} onChange={(v) => set("horsepower", num(v))} />
          <Field label="Top speed (kph)" type="number" value={row.top_speed_kph ?? ""} onChange={(v) => set("top_speed_kph", num(v))} />
          <Field label="0–100 (s)" type="number" value={row.zero_to_hundred ?? ""} onChange={(v) => set("zero_to_hundred", num(v))} />
          <Field label="Seats" type="number" value={String(row.seats)} onChange={(v) => set("seats", Number(v))} />
          <Field label="Transmission" value={row.transmission} onChange={(v) => set("transmission", v)} />
          <Field label="Status" value={row.status} onChange={(v) => set("status", v)} />
          <label className="col-span-2 block">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Pickup location</span>
            <select
              value={row.location_id ?? ""}
              onChange={(e) => set("location_id", e.target.value || null)}
              className="mt-2 w-full border border-border bg-input px-3 py-2 font-mono text-sm text-bone"
            >
              <option value="">— none —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.city}, {l.country}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-full border border-border px-5 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Cancel</button>
          <button onClick={() => onSave(row)} className="rounded-full bg-copper px-5 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-obsidian hover:bg-copper-glow">Save</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- LOCATIONS ---------------- */

function LocationsPanel({ locations, onChange }: { locations: LocationRow[]; onChange: () => void }) {
  const [editing, setEditing] = useState<LocationRow | null>(null);
  const upsert = useServerFn(adminUpsertLocation);
  const del = useServerFn(adminDeleteLocation);

  const save = async (row: LocationRow) => {
    try {
      await upsert({ data: row as any });
      toast.success("Location saved");
      setEditing(null);
      onChange();
    } catch (e) {
      toast.error("Save failed", { description: String(e) });
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this location?")) return;
    try {
      await del({ data: { id } });
      toast.success("Deleted");
      onChange();
    } catch (e) {
      toast.error("Delete failed", { description: String(e) });
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{locations.length} locations</p>
        <button
          onClick={() => setEditing({ id: "", city: "", country: "", address: "", lat: null, lng: null } as LocationRow)}
          className="rounded-full bg-copper px-5 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-obsidian hover:bg-copper-glow"
        >
          + New location
        </button>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-card">
            <tr className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <th className="p-3">City</th><th className="p-3">Country</th><th className="p-3">Address</th><th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="p-3">{l.city}</td>
                <td className="p-3">{l.country}</td>
                <td className="p-3 text-muted-foreground">{l.address ?? "—"}</td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => setEditing(l)} className="text-copper hover:underline">Edit</button>
                  <button onClick={() => remove(l.id)} className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <LocationModal loc={editing} onCancel={() => setEditing(null)} onSave={save} />}
    </div>
  );
}

function LocationModal({ loc, onCancel, onSave }: { loc: LocationRow; onCancel: () => void; onSave: (l: LocationRow) => Promise<void> }) {
  const [row, setRow] = useState<LocationRow>(loc);
  const set = (k: keyof LocationRow, v: any) => setRow((r) => ({ ...r, [k]: v }));
  const payload = () => {
    const out: any = { ...row };
    if (!out.id) delete out.id;
    return out;
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-obsidian/80 p-6" onClick={onCancel}>
      <div className="w-full max-w-lg border border-border bg-card p-8" onClick={(e) => e.stopPropagation()}>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-copper">{loc.id ? "Edit location" : "New location"}</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Field label="City" value={row.city} onChange={(v) => set("city", v)} />
          <Field label="Country" value={row.country} onChange={(v) => set("country", v)} />
          <Field label="Address" value={row.address ?? ""} onChange={(v) => set("address", v)} full />
          <Field label="Lat" type="number" value={row.lat ?? ""} onChange={(v) => set("lat", v === "" ? null : Number(v))} />
          <Field label="Lng" type="number" value={row.lng ?? ""} onChange={(v) => set("lng", v === "" ? null : Number(v))} />
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-full border border-border px-5 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Cancel</button>
          <button onClick={() => onSave(payload())} className="rounded-full bg-copper px-5 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-obsidian hover:bg-copper-glow">Save</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- BOOKINGS ---------------- */

function BookingsPanel({ bookings, onChange }: { bookings: any[]; onChange: () => void }) {
  const updateStatus = useServerFn(adminUpdateBookingStatus);
  const del = useServerFn(adminDeleteBooking);

  const setStatus = async (id: string, status: string) => {
    try { await updateStatus({ data: { id, status } }); toast.success("Updated"); onChange(); }
    catch (e) { toast.error("Failed", { description: String(e) }); }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete booking?")) return;
    try { await del({ data: { id } }); toast.success("Deleted"); onChange(); }
    catch (e) { toast.error("Failed", { description: String(e) }); }
  };

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-left font-mono text-xs">
        <thead className="bg-card">
          <tr className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <th className="p-3">Booking</th><th className="p-3">Car</th><th className="p-3">Dates</th>
            <th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-t border-border align-top">
              <td className="p-3 text-muted-foreground">
                <div>{b.id.slice(0, 8)}…</div>
                <div className="text-[9px]">{b.user_id.slice(0, 8)}…</div>
              </td>
              <td className="p-3">{b.cars ? `${b.cars.brand} ${b.cars.name}` : "—"}</td>
              <td className="p-3">{b.start_date} → {b.end_date}</td>
              <td className="p-3 text-copper">{formatUsd(b.total_cents)}</td>
              <td className="p-3">
                <select
                  value={b.status}
                  onChange={(e) => setStatus(b.id, e.target.value)}
                  className="border border-border bg-input px-2 py-1 font-mono text-[10px]"
                >
                  {["pending_payment", "confirmed", "in_progress", "completed", "cancelled"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="p-3 text-right">
                <button onClick={() => remove(b.id)} className="text-red-400 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No bookings yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- USERS ---------------- */

function UsersPanel({ users }: { users: any[] }) {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-left font-mono text-xs">
        <thead className="bg-card">
          <tr className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <th className="p-3">Email</th><th className="p-3">User ID</th>
            <th className="p-3">Joined</th><th className="p-3">Last sign in</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-border">
              <td className="p-3">{u.email ?? "—"}</td>
              <td className="p-3 text-muted-foreground">{u.id.slice(0, 12)}…</td>
              <td className="p-3">{u.created_at?.slice(0, 10)}</td>
              <td className="p-3">{u.last_sign_in_at?.slice(0, 10) ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- shared field ---------------- */

function Field({
  label,
  value,
  onChange,
  type = "text",
  full = false,
  multiline = false,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  full?: boolean;
  multiline?: boolean;
}) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-2 w-full border border-border bg-input px-3 py-2 font-mono text-sm text-bone focus:border-copper focus:outline-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full border border-border bg-input px-3 py-2 font-mono text-sm text-bone focus:border-copper focus:outline-none"
        />
      )}
    </label>
  );
}