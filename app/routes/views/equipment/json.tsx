// ABOUTME: Equipment JSON export route — streams all equipment data as a downloadable JSON file.
// ABOUTME: Uses the repository factory to work in both static and live modes.

import { Readable } from "node:stream";

import { createReadableStreamFromReadable } from "@react-router/node";

import type { Route } from "./+types/json";

import { createEquipmentRepository } from "~/repositories/factory";

export async function loader({ request }: Route.LoaderArgs) {
  const equipmentRepository = createEquipmentRepository(request);
  const equipmentResult = await equipmentRepository.getAllAsJson();

  if (equipmentResult.error) {
    throw new Response("Failed to load equipment", { status: 500 });
  }

  const equipmentJson = JSON.stringify(equipmentResult.data, null, 2);
  const file = createReadableStreamFromReadable(Readable.from([equipmentJson]));

  return new Response(file, {
    headers: {
      "Content-Disposition": 'attachment; filename="equipment.json"',
      "Content-Type": "application/json",
      "Cache-Control": "no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
