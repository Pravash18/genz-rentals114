import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    carId: string;
    startDate: string;
    endDate: string;
    pickupLocationId?: string | null;
  }) =>
    z
      .object({
        carId: z.string().uuid(),
        startDate: z.string(),
        endDate: z.string(),
        pickupLocationId: z.string().uuid().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: car, error: carErr } = await supabase
      .from("cars")
      .select("id, daily_price_cents, deposit_cents")
      .eq("id", data.carId)
      .maybeSingle();
    if (carErr || !car) throw new Error("Car not found");

    const days = Math.max(
      1,
      Math.round(
        (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86400000,
      ),
    );
    const total = days * car.daily_price_cents + car.deposit_cents;

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        car_id: data.carId,
        start_date: data.startDate,
        end_date: data.endDate,
        pickup_location_id: data.pickupLocationId ?? null,
        total_cents: total,
        status: "pending_payment",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return booking;
  });

export const getBooking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: b, error } = await context.supabase
      .from("bookings")
      .select("*, cars(*), locations:pickup_location_id(city, country)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return b;
  });

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*, cars(name, brand, hero_image, slug)")
      .order("start_date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const mockPayBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bookingId: string; last4: string }) =>
    z.object({ bookingId: z.string().uuid(), last4: z.string().length(4) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // Simulate a payment processor delay
    await new Promise((r) => setTimeout(r, 1200));
    const { error } = await context.supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", data.bookingId);
    if (error) throw new Error(error.message);
    return { ok: true, last4: data.last4 };
  });