import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { SmoothScroll } from "@/components/lumen/SmoothScroll";
import { BackgroundAlloy } from "@/components/lumen/BackgroundAlloy";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-copper">Nothing here</p>
        <h1 className="mt-6 font-display text-[18vw] leading-none tracking-tighter text-bone md:text-[10vw]">
          <span className="font-serif-italic text-copper">4</span>04
        </h1>
        <p className="mt-6 text-sm text-muted-foreground">
          This road doesn't exist yet. Take the scenic route back.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-copper px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-bone transition hover:bg-copper"
          >
            Return home →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lumen — Automotive Reserve" },
      { name: "description", content: "A private automotive reserve. Curated exotic, grand-tourer and classic rentals across Monaco, Los Angeles, Dubai, Tokyo and Milan." },
      { name: "author", content: "Lumen" },
      { property: "og:title", content: "Lumen — Automotive Reserve" },
      { property: "og:description", content: "A private automotive reserve. Curated exotic, grand-tourer and classic rentals across Monaco, Los Angeles, Dubai, Tokyo and Milan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Lumen — Automotive Reserve" },
      { name: "twitter:description", content: "A private automotive reserve. Curated exotic, grand-tourer and classic rentals across Monaco, Los Angeles, Dubai, Tokyo and Milan." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2d3351f3-79ef-41eb-b8d1-1d278985cc85/id-preview-03e5f682--14d4d967-a652-4e1b-ae48-8e2ddbf05e01.lovable.app-1783573884614.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2d3351f3-79ef-41eb-b8d1-1d278985cc85/id-preview-03e5f682--14d4d967-a652-4e1b-ae48-8e2ddbf05e01.lovable.app-1783573884614.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScroll />
      <BackgroundAlloy />
      <Outlet />
      <Toaster theme="dark" />
    </QueryClientProvider>
  );
}
