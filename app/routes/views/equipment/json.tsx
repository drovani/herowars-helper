import { createReadableStreamFromReadable } from "@react-router/node";
import { Readable } from "node:stream";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import type { Route } from "./+types/json";

export async function loader({ request }: Route.LoaderArgs) {
  const equipmentRepository = new EquipmentRepository(request);
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
