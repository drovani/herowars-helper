import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { Route } from "./+types/root";
import SiteHeader from "./components/SiteHeader";
import SitePanel from "./components/SitePanel";
import styles from "./tailwind.css?url";

export const links: Route.LinksFunction = () => [
    { rel: "stylesheet", href: styles, as: "style" },
];

export const meta = (_: Route.MetaArgs) => {
    return [
        { title: "Hero Wars Helper: Heroes" },
        {
            name: "description",
            content: "A helper app for Hero Wars: Alliance mobile game",
        },
    ];
};
export default function App(_: Route.ComponentProps) {
    return (
        <html lang="en" className="h-full bg-gray-100">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                <div className="grid min-h-screen max-w-screen-xl mx-auto md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
                    <SitePanel />
                    <div className="flex flex-col">
                        <SiteHeader />
                        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                            <Outlet />
                        </main>
                    </div>
                </div>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}
