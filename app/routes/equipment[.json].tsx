import { createReadableStreamFromReadable } from "@react-router/node";
import { Readable } from "node:stream";
import EquipmentRepository from "~/services/EquipmentRepository";
import type { Route } from "./+types/equipment[.json]";

export async function loader(_: Route.LoaderArgs) {
  const equipmentJson = await EquipmentRepository.getAllAsJson();

  const file = createReadableStreamFromReadable(Readable.from(equipmentJson));

  return new Response(file, {
    headers: {
      "Content-Disposition": 'attachment; filename="equipment.json"',
      "Content-Type": "application/json",
      "Cache-Control": "no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
