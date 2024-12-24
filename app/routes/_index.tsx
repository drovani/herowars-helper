import type { Route } from "./+types/_index";

export default function Index(_: Route.ComponentProps) {
  return (
    <section className="flex gap-8 flex-col">
      <h2 className="text-large">
        Welcome to another{" "}
        <a href="https://rovani.net" className="underline">
          Rovani.net
        </a>{" "}
        project
      </h2>
      <p>
        This content is not associated with NEXTERS, is not supported, sponsored or approved by NEXTERS, and NEXTERS is
        not responsible or liable for it
      </p>
    </section>
  );
}
