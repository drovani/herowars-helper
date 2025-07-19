import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
  type UIMatch,
} from "react-router";
import { useEffect, useState } from "react";
import SiteHeader from "~/components/SiteHeader";
import type { Route } from "./+types/root";
import { SiteSidebar } from "./components/SiteSidebar";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { formatTitle, siteConfig } from "./config/site";
import { AuthProvider } from "./contexts/AuthContext";
import styles from "./tailwind.css?url";

export const links: Route.LinksFunction = () => [{ rel: "stylesheet", href: styles, as: "style" }];

export const meta = (_: Route.MetaArgs) => {
  return [
    { title: formatTitle() },
    {
      name: "description",
      content: siteConfig.meta.description,
    },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  return { request };
};

export function Layout(props: Route.ComponentProps) {
  const request = props?.loaderData?.request;
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Handle hydration to prevent router context errors
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Safely get matches only after hydration
  let matches: UIMatch<
    unknown,
    {
      breadcrumb?: (
        matches: UIMatch<unknown, unknown>
      ) => { href?: string; title: string } | { href?: string; title: string }[];
    }
  >[] = [];

  let breadcrumbs: UIMatch<
    unknown,
    {
      breadcrumb: (
        matches: UIMatch<unknown, unknown>
      ) => { href?: string | undefined; title: string } | { href?: string | undefined; title: string }[];
    }
  >[] = [];

  // Only call useMatches after hydration to prevent context errors
  if (isHydrated) {
    try {
      matches = useMatches() as UIMatch<
        unknown,
        {
          breadcrumb?: (
            matches: UIMatch<unknown, unknown>
          ) => { href?: string; title: string } | { href?: string; title: string }[];
        }
      >[];

      breadcrumbs = matches.filter((match) => match.handle && match.handle.breadcrumb) as UIMatch<
        unknown,
        {
          breadcrumb: (
            matches: UIMatch<unknown, unknown>
          ) => { href?: string | undefined; title: string } | { href?: string | undefined; title: string }[];
        }
      >[];
    } catch (error) {
      // Fallback to empty breadcrumbs if router context is not available
      console.warn('Router context not available during hydration:', error);
      breadcrumbs = [];
    }
  }

  return (
    <html lang="en" className="h-full bg-gray-100">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="max-h-screen">
        <AuthProvider request={request as unknown as Request}>
          <SidebarProvider defaultOpen={true}>
            <SiteSidebar settings={{
              site_title: siteConfig.title,
              site_subtitle: siteConfig.subtitle,
              site_logo: <img src={siteConfig.logo.src} alt={siteConfig.logo.alt} className="size-8" />,
            }} />
            <SidebarInset>
              <SiteHeader breadcrumbs={breadcrumbs} />
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-4xl">
                <Outlet />
              </main>
            </SidebarInset>
          </SidebarProvider>
        </AuthProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    // Check for router context errors specifically
    if (error.message.includes('useContext') || error.message.includes('useMatches') || 
        error.message.includes('data router') || error.message.includes('Cannot read properties of null')) {
      message = "Hydration Error";
      details = "The page is reloading due to a development hot-reload issue. This should resolve automatically.";
      
      // Auto-reload in development for hydration errors
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } else {
      details = error.message;
    }
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {message === "Hydration Error" && (
        <p className="mt-2 text-sm text-gray-600">
          Automatically reloading in 2 seconds...
        </p>
      )}
      {stack && import.meta.env.DEV && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export default function App() {
  return <Outlet />;
}
