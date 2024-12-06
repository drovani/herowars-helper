import { missionDAL } from "@/lib/mission-dal";
import { createReadableStreamFromReadable } from "@react-router/node";
import { Readable } from "node:stream";

export async function loader() {
    const missions = await missionDAL.getAllMissions();
    const file = createReadableStreamFromReadable(
        Readable.from(JSON.stringify(missions))
    );

    return new Response(file, {
        headers: {
            "Content-Disposition": 'attachment; filename="missions.json"',
            "Content-Type": "application/json",
        },
    });
}
