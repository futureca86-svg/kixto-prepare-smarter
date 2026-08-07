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
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { ErrorScreen } from "@/components/system/ErrorScreen";
import { OfflineBanner } from "@/components/system/OfflineBanner";
import { logAppError } from "@/lib/system/error-log";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
    void logAppError(error, { module: "router", component: "RootErrorComponent" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg">
        <ErrorScreen
          error={error}
          onRetry={() => {
            router.invalidate();
            reset();
          }}
          onReload={() => window.location.reload()}
        />
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kixto — A New Way to Prepare for CA" },
      { name: "description", content: "Kixto is a modern preparation system built specifically for CA students. Every feature is designed from the ground up to simplify studying, revision, practice and consistency." },
      { name: "author", content: "Kixto" },
      { property: "og:title", content: "Kixto — A New Way to Prepare for CA" },
      { property: "og:description", content: "A modern preparation system built specifically for CA students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
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

  useEffect(() => {
    const onError = (event: ErrorEvent) =>
      void logAppError(event.error ?? event.message, { module: "window", component: "onerror" });
    const onRejection = (event: PromiseRejectionEvent) =>
      void logAppError(event.reason, { module: "window", component: "unhandledrejection" });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineBanner />
      {/* Global boundary: a crash anywhere below still renders a recovery screen. */}
      <ErrorBoundary name="application">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </ErrorBoundary>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
