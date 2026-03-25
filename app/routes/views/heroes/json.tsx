import { Readable } from "node:stream";

import { createReadableStreamFromReadable } from "@react-router/node";

import type { Route } from "./+types/json";

// ABOUTME: Hero JSON export route — streams all hero data as a downloadable JSON file.
// ABOUTME: Uses the repository factory to work in both static and live modes.

import {
  transformCompleteHeroToRecord,
  transformBasicHeroToRecord,
  sortHeroRecords,
  createHeroesJsonString,
} from "~/lib/hero-transformations";
import { createHeroRepository } from "~/repositories/factory";

export async function loader({ request }: Route.LoaderArgs) {
  const heroRepo = createHeroRepository(request);
  const heroesResult = await heroRepo.findAll();

  if (heroesResult.error) {
    throw new Response("Failed to load heroes", { status: 500 });
  }

  // Transform heroes to HeroRecord format
  const heroes = heroesResult.data
    ? await Promise.all(
        heroesResult.data.map(async (hero) => {
          const completeHeroResult = await heroRepo.findWithAllData(hero.slug);
          if (completeHeroResult.data) {
            return transformCompleteHeroToRecord(completeHeroResult.data);
          }
          // Fallback to basic hero if complete data is not available
          return transformBasicHeroToRecord(hero);
        }),
      )
    : [];

  const sortedHeroes = sortHeroRecords(heroes);
  const heroesJson = createHeroesJsonString(sortedHeroes);

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
