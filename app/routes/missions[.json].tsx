import { createReadableStreamFromReadable } from "@react-router/node";
import { Readable } from "node:stream";
import { MissionRepository } from "~/repositories/MissionRepository";
import type { Route } from "./+types/missions[.json]";

export async function loader({ request }: Route.LoaderArgs) {
  const missionRepo = new MissionRepository(request);
  const missionsResult = await missionRepo.findAll({
    orderBy: { column: "slug", ascending: true }
  });

  if (missionsResult.error) {
    throw new Response("Failed to load missions", { status: 500 });
  }

  const missions = missionsResult.data || [];
  const missionsJson = JSON.stringify(missions, null, 2);

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
