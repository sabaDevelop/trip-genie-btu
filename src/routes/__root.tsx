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

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-7xl font-semibold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="btn-primary mt-6 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium"
        >
          Go home
        </Link>
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You can try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary rounded-full px-5 py-2.5 text-sm font-medium"
          >
            Try again
          </button>
          <Link
            to="/"
            className="btn-ghost rounded-full px-5 py-2.5 text-sm font-medium"
          >
            Go home
          </Link>
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
      { title: "TripGenie AI — Plan your perfect trip with AI" },
      {
        name: "description",
        content:
          "TripGenie AI generates personalized, day-by-day travel itineraries in seconds. Tell us your destination, style, and budget — get a full plan instantly.",
      },
      { name: "author", content: "TripGenie AI" },
      { property: "og:title", content: "TripGenie AI — Plan your perfect trip with AI" },
      {
        property: "og:description",
        content:
          "Personalized AI travel itineraries in seconds. Destinations, activities, restaurants, hidden gems, and packing lists tailored to you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "TripGenie AI — Plan your perfect trip with AI" },
      { name: "description", content: "TripGenie AI generates personalized, day-by-day travel itineraries in seconds. Tell us your destination, style, and budget — get a full plan instantly." },
      { property: "og:description", content: "TripGenie AI generates personalized, day-by-day travel itineraries in seconds. Tell us your destination, style, and budget — get a full plan instantly." },
      { name: "twitter:description", content: "TripGenie AI generates personalized, day-by-day travel itineraries in seconds. Tell us your destination, style, and budget — get a full plan instantly." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3572e022-fe15-4d15-8e9a-bdbc249e409c/id-preview-effa0641--681fd80f-3c3b-4685-b270-56620f2995ab.lovable.app-1783378365972.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3572e022-fe15-4d15-8e9a-bdbc249e409c/id-preview-effa0641--681fd80f-3c3b-4685-b270-56620f2995ab.lovable.app-1783378365972.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap",
      },
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

function Header() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl glass px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl btn-primary text-base font-bold">
            ✦
          </span>
          <span className="text-base font-semibold tracking-tight">
            TripGenie <span className="gradient-text">AI</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-full px-4 py-2 text-muted-foreground transition hover:text-foreground data-[status=active]:bg-white/70 data-[status=active]:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/planner"
            className="rounded-full px-4 py-2 text-muted-foreground transition hover:text-foreground data-[status=active]:bg-white/70 data-[status=active]:text-foreground"
          >
            Planner
          </Link>
        </nav>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} TripGenie AI · Crafted for wanderers.
        </footer>
      </div>
    </QueryClientProvider>
  );
}
