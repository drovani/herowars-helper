import SiteNavigation from "@/components/SiteNavigation";
import { Route } from "./+types/_index";

export default function Index(_: Route.ComponentProps) {
    return (
        <section>
            <h2 className="text-large">
                Welcome to another{" "}
                <a href="https://rovani.net" className="underline">
                    Rovani.net
                </a>{" "}
                project
            </h2>
            <div className="ml-10 flex flex-col items-baseline space-x-4">
                <SiteNavigation className="md:hidden" />
            </div>
        </section>
    );
}
