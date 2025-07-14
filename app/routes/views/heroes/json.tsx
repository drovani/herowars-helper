import { createReadableStreamFromReadable } from "@react-router/node";
import { Readable } from "node:stream";
import { createDatabaseHeroService } from "~/services/DatabaseHeroService";
import type { Route } from "./+types/json";

export async function loader({ request }: Route.LoaderArgs) {
  const heroService = createDatabaseHeroService(request);
  const heroesJson = await heroService.getAllAsJson();

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
