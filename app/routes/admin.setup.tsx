import { Route } from ".react-router/types/app/routes/+types/admin.setup";
import { initializeEquipmentBlobs } from "@/lib/initialize-equipment-blobs";
import { initializeMissionBlobs } from "@/lib/initialize-mission-blobs";
import { data } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
    try {
        const url = new URL(request.url);
        const mode = url.searchParams.get("mode") || "basic";
        const data = url.searchParams.get("data");

        // Set initialization options based on mode
        const options = {
            skipExisting: mode !== "force",
            failIfExists: mode === "safe",
            forceUpdate: mode === "force",
        };

        const resultE =
            !data || data === "equipment"
                ? await initializeEquipmentBlobs(options)
                : { status: "not loaded" };
        const resultM =
            !data || data === "missions"
                ? await initializeMissionBlobs(options)
                : { status: "not loaded" };

        return {
            message: "Equipment blob initialization complete",
            mode,
            results: { equipment: { ...resultE }, mission: { ...resultM } },
        };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown error";
        console.error("Setup failed:", message);

        return data(
            {
                message: "Blob initialization failed",
                error: message,
            },
            {
                status:
                    error instanceof Error &&
                    error.message.includes("Existing equipment")
                        ? 409
                        : 500,
            }
        );
    }
}

export default function AdminSetup({ loaderData }: Route.ComponentProps) {
    const results = loaderData;

    return (
        <div>
            <pre>{JSON.stringify(results, null, "\t")}</pre>
        </div>
    );
}
