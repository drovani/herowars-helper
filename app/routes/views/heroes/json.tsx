import { createReadableStreamFromReadable } from "@react-router/node";
import { Readable } from "node:stream";
import HeroDataService from "~/services/HeroDataService";
import type { Route } from "./+types/json";

export async function loader(_: Route.LoaderArgs) {
  const heroesJson = await HeroDataService.getAllAsJson();

  const file = createReadableStreamFromReadable(Readable.from(heroesJson));

  return new Response(file, {
    headers: {
      "Content-Disposition": 'attachment; filename="heroes.json"',
      "Content-Type": "application/json",
      "Cache-Control": "no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
