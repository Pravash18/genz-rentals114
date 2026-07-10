import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const adminListAll = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [cars, locations, bookings, users] = await Promise.all([
      supabaseAdmin.from("cars").select("*, locations(city, country)").order("created_at", { ascending: false }),
      supabaseAdmin.from("locations").select("*").order("city"),
      supabaseAdmin
        .from("bookings")
        .select("*, cars(name, brand), locations:pickup_location_id(city)")
        .order("created_at", { ascending: false }),
      supabaseAdmin.auth.admin.listUsers(),
    ]);

    return {
      cars: cars.data ?? [],
      locations: locations.data ?? [],
      bookings: bookings.data ?? [],
      users: (users.data?.users ?? []).map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      })),
    };
  });

const carSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  hero_image: z.string().nullable().optional(),
  daily_price_cents: z.number().int().nonnegative(),
  deposit_cents: z.number().int().nonnegative(),
  horsepower: z.number().int().nullable().optional(),
  top_speed_kph: z.number().int().nullable().optional(),
  zero_to_hundred: z.number().nullable().optional(),
  seats: z.number().int().min(1),
  transmission: z.string().min(1),
  status: z.string().min(1),
  location_id: z.string().uuid().nullable().optional(),
});

export const adminUpsertCar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => carSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("cars").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteCar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("cars").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const locationSchema = z.object({
  id: z.string().uuid().optional(),
  city: z.string().min(1),
  country: z.string().min(1),
  address: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

export const adminUpsertLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => locationSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("locations").upsert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("locations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: string }) =>
    z.object({ id: z.string().uuid(), status: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("bookings").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("bookings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });