import type { Mission } from "@/data/mission.zod";
import missionData from "@/data/missions.json";
import { getStore } from "@netlify/blobs";

interface InitializationOptions {
    /** If true, will skip items that already exist */
    skipExisting?: boolean;
    /** If true, will throw an error if any items exist */
    failIfExists?: boolean;
    /** If true, will force update all items regardless of existence */
    forceUpdate?: boolean;
}

interface InitializationResult {
    success: number;
    skipped: number;
    errors: number;
    total: number;
    existingCount: number;
    details: string[];
}

export async function initializeMissionBlobs(
    options: InitializationOptions = {}
): Promise<InitializationResult> {
    const {
        skipExisting = true,
        failIfExists = false,
        forceUpdate = false,
    } = options;
    const details: string[] = [];

    try {
        details.push("Starting mission blob initialization...");

        const store = getStore({ name: "missions", siteID: "herowars-helper", token: "nfp_issmYycyeVFStWR9YVMPn5zYUjpyr47i43b8" });

        // Check for existing data by listing all keys
        const existingKeys = await store.list();
        const existingCount = existingKeys.blobs.length;

        if (existingCount > 0) {
            details.push(`Found ${existingCount} existing mission items`);

            if (failIfExists) {
                throw new Error(
                    "Existing mission data found. Aborting initialization."
                );
            }
        }

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        // Process each mission item
        for (const mission of missionData as Mission[]) {
            try {
                // Check if this specific item exists
                const exists = Boolean(await store.get(mission.id));

                if (exists && !forceUpdate) {
                    if (skipExisting) {
                        details.push(
                            `⤍ Skipping existing mission: ${mission.chapter}-${mission.mission_number} ${mission.name}`
                        );
                        skippedCount++;
                        continue;
                    } else {
                        throw new Error(
                            "Mission already exists and skipExisting is false"
                        );
                    }
                }

                // Store the mission data
                await store.set(mission.id, JSON.stringify(mission));

                const action = exists ? "Updated" : "Stored";
                details.push(
                    `✓ Successfully ${action.toLowerCase()} ${
                        mission.chapter
                    }-${mission.mission_number} ${mission.name}`
                );
                successCount++;
            } catch (error) {
                console.error(
                    `✗ Failed to handle ${mission.chapter}-${mission.mission_number} ${mission.name}:`,
                    error
                );
                errorCount++;
            }
        }

        details.push("Initialization complete:");
        details.push(`✓ Successfully stored ${successCount} mission items`);
        details.push(`⤍ Skipped ${skippedCount} existing items`);
        if (errorCount > 0) {
            details.push(`✗ Failed to store ${errorCount} mission items`);
        }

        return {
            success: successCount,
            skipped: skippedCount,
            errors: errorCount,
            total: missionData.length,
            existingCount,
            details,
        };
    } catch (error) {
        console.error("Fatal error during initialization:", error);
        throw error;
    }
}
