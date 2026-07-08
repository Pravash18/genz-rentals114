
# LUMEN — Spatial Car Rental Experience

An elegant-maximalist rental platform where cars feel like they're floating in the room. Real auth + database, admin-managed fleet, simulated checkout, aggressive 3D and motion.

## Visual direction (locked)

- **Mood**: Editorial maximalism meets showroom spatial UI. Think Bugatti press site × Apple Vision × Zellerfeld × Bureau Borsche.
- **Palette**: Obsidian `#0A0A0B` base, Bone `#EDE7DA` ink, Molten Copper `#C2410C` accent, Deep Emerald `#0F3D2E` secondary, Champagne `#D4B896` highlight. Layered radial gradients + noise texture.
- **Type**: `Fraunces` (display, high optical contrast, 500-italic for pull quotes) + `Instrument Serif` (hero italic) + `Geist Mono` (specs, plate numbers, prices). Massive 12–20vw display headers.
- **Motion**: Framer Motion + GSAP ScrollTrigger + Lenis smooth scroll. Every route transition = full-screen curtain wipe with car silhouette morphing. Hover = magnetic cursor, tilt-parallax, chromatic aberration on images.
- **3D**: React Three Fiber. Rotatable car viewer on detail page (glTF), floating spec cards orbiting the model, environment HDRI reflections, bloom + depth-of-field.

## Sitemap

```
/                        Hero — 3D car floats through headline, marquee fleet strip, editorial sections
/fleet                   Filterable grid, category tabs (Exotic / Grand Tourer / SUV / Classic / EV), tilt cards
/fleet/$slug             Spatial detail — R3F 3D viewer, orbiting spec cards, availability calendar, booking CTA
/experience              Story/brand page — parallax editorial, motion graphics
/locations               Interactive map, city cards
/auth                    Sign in / sign up (email + Google)
/checkout/$bookingId     Mock payment (card form, Apple/Google Pay buttons, animated success)
/_authenticated/dashboard    Upcoming trips, past trips, saved cars, profile
/_authenticated/bookings/$id Trip detail + itinerary
/_authenticated/admin        Admin fleet manager (role-gated)
```

## Backend (Lovable Cloud)

Tables (all with `GRANT` + RLS per platform rules):
- `profiles` — id (FK auth.users), full_name, avatar_url, phone, license_verified
- `user_roles` — separate table, `app_role` enum (`admin`, `user`), `has_role()` security-definer fn
- `cars` — id, slug, name, brand, category, daily_price_cents, deposit_cents, seats, transmission, horsepower, top_speed, hero_image, gallery[], model_3d_url, description, location_id, status
- `locations` — id, city, country, address, lat, lng
- `bookings` — id, user_id, car_id, start_date, end_date, total_cents, status (`pending_payment` | `confirmed` | `cancelled` | `completed`), pickup_location_id
- `payments_mock` — id, booking_id, method, last4, status, paid_at (simulated only)
- `favorites` — user_id, car_id

RLS: public SELECT on `cars` / `locations`; user-scoped on `bookings`/`favorites`/`profiles`; admin write on `cars` via `has_role`.

Auth: email/password + Google via Lovable broker. `_authenticated/route.tsx` integration-managed gate. Profile auto-created via trigger.

Server functions (`createServerFn`): `listCars`, `getCarBySlug`, `createBooking`, `getMyBookings`, `mockPayBooking` (updates status → confirmed after 2s delay), admin CRUD for cars.

## Payment (mock)

`/checkout/$bookingId` renders a luxe card form with real Stripe-Elements-style visuals but calls `mockPayBooking`. Animated success sequence: card flips → key handoff illustration → confetti of copper particles → redirect to dashboard.

## Component inventory

- `SpatialCarViewer` (R3F, OrbitControls, Environment, ContactShadows)
- `MagneticButton`, `TiltCard`, `MarqueeStrip`, `NoiseOverlay`
- `RouteCurtain` (AnimatePresence full-page transition)
- `SmoothScrollProvider` (Lenis)
- `CursorFollower` (custom cursor + hover states)
- `BookingCalendar` (date range, disabled ranges from existing bookings)
- Admin: `CarEditor`, `FleetTable`

## Dependencies to add

`@react-three/fiber @react-three/drei three framer-motion gsap lenis @fontsource/fraunces @fontsource-variable/instrument-serif @fontsource-variable/geist-mono date-fns react-day-picker`

## Assets

- Generate hero imagery + 6 car photos (premium quality) via imagegen — Porsche 911 GT3, Lambo Revuelto, Rolls Spectre, Range Rover, Ferrari Roma, Mercedes G-Wagon, plus editorial spreads.
- Use free CC0 glTF car model (or lightweight primitive stand-in) for R3F viewer initially; swap per-car later.

## Build order

1. Enable Lovable Cloud → migration for all tables + RLS + grants + seed 12 cars + 5 locations + admin role bootstrap.
2. Design tokens in `src/styles.css`, fonts, smooth scroll + cursor providers in `__root.tsx`, updated head meta.
3. Shared primitives: MagneticButton, TiltCard, RouteCurtain, NoiseOverlay, MarqueeStrip.
4. Public routes: `/`, `/fleet`, `/fleet/$slug` (with R3F viewer), `/experience`, `/locations`.
5. Auth route (email + Google) + `configure_social_auth`.
6. Booking flow → mock checkout → confirmation animation.
7. `_authenticated/dashboard` + `bookings/$id`.
8. `_authenticated/admin` fleet CRUD (role-gated).
9. Verify: build, Playwright screenshot hero + detail + checkout success.

## Technical notes (for devs)

- R3F components wrapped in `<ClientOnly>` — SSR-safe.
- Lenis + GSAP init inside `useEffect` only.
- All server fns using auth take `requireSupabaseAuth`; append bearer middleware to `src/start.ts` if not present.
- Public routes call publishable-client server fns for car/location reads.
- `og:image` set per leaf (car detail uses car hero).
- Admin route lives under `_authenticated/admin` with `beforeLoad` `has_role` check via server fn.
