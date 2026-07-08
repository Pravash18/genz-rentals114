import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function publicClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listCars = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("cars")
    .select("id, slug, name, brand, category, daily_price_cents, horsepower, top_speed_kph, zero_to_hundred, hero_image, tagline, location_id")
    .order("daily_price_cents", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getCarBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: car, error } = await sb
      .from("cars")
      .select("*, locations(city, country)")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return car;
  });

export const listLocations = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("locations").select("*").order("city");
  if (error) throw new Error(error.message);
  return data ?? [];
});