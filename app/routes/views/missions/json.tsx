import { createReadableStreamFromReadable } from "@react-router/node";
import { Readable } from "node:stream";
import { MissionRepository } from "~/repositories/MissionRepository";
import type { Route } from "./+types/json";

export async function loader({ request }: Route.LoaderArgs) {
  const missionRepo = new MissionRepository(request);
  
  // Get missions with proper sorting
  const missionsResult = await missionRepo.findAll({
    orderBy: [
      { column: "chapter_id", ascending: true },
      { column: "level", ascending: true }
    ]
  });

  if (missionsResult.error) {
    throw new Response("Failed to load missions", { status: 500 });
  }

  // Get chapters
  const chaptersResult = await missionRepo.findAllChapters();
  if (chaptersResult.error) {
    throw new Response("Failed to load chapters", { status: 500 });
  }

  const missions = missionsResult.data || [];
  const chapters = chaptersResult.data || [];

  // Format missions to match schema (remove database-specific fields)
  const formattedMissions = missions.map(mission => ({
    slug: mission.slug,
    name: mission.name,
    ...(mission.hero_slug && { hero_slug: mission.hero_slug }),
    energy_cost: mission.energy_cost
  }));

  // Create the schema-compliant structure
  const exportData = {
    chapters: chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title
    })),
    missions: formattedMissions
  };

  const missionsJson = JSON.stringify(exportData, null, 2);

  const file = createReadableStreamFromReadable(Readable.from(missionsJson));

  return new Response(file, {
    headers: {
      "Content-Disposition": 'attachment; filename="missions.json"',
      "Content-Type": "application/json",
      "Cache-Control": "no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
