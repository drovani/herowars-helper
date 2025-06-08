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
import SiteHeader from "~/components/SiteHeader";
import type { Route } from "./+types/root";
import { SiteSidebar } from "./components/SiteSidebar";
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import styles from "./tailwind.css?url";

export const links: Route.LinksFunction = () => [{ rel: "stylesheet", href: styles, as: "style" }];

export const meta = (_: Route.MetaArgs) => {
  return [
    { title: "Hero Wars Helper: Heroes" },
    {
      name: "description",
      content: "A helper app for Hero Wars: Alliance mobile game",
    },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  return { request };
};

export function Layout(props: Route.ComponentProps) {
  const request = props?.loaderData?.request;
  const matches = useMatches() as UIMatch<
    unknown,
    {
      breadcrumb?: (
        matches: UIMatch<unknown, unknown>
      ) => { href?: string; title: string } | { href?: string; title: string }[];
    }
  >[];

  const breadcrumbs = matches.filter((match) => match.handle && match.handle.breadcrumb) as UIMatch<
    unknown,
    {
      breadcrumb: (
        matches: UIMatch<unknown, unknown>
      ) => { href?: string | undefined; title: string } | { href?: string | undefined; title: string }[];
    }
  >[];

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
            <SiteSidebar />
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
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
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
