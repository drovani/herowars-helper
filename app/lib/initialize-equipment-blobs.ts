import type { EquipmentRecord } from "@/data/equipment.zod";
import equipmentData from "@/data/equipments.json";
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

export async function initializeEquipmentBlobs(
    options: InitializationOptions = {}
): Promise<InitializationResult> {
    const {
        skipExisting = true,
        failIfExists = false,
        forceUpdate = false,
    } = options;
    const details: string[] = [];

    try {
        details.push("Starting equipment blob initialization...");

        const store = getStore({ name: "equipment", siteID: "herowars-helper", token: "nfp_issmYycyeVFStWR9YVMPn5zYUjpyr47i43b8" });

        // Check for existing data by listing all keys
        const existingKeys = await store.list();
        const existingCount = existingKeys.blobs.length;

        if (existingCount > 0) {
            details.push(`Found ${existingCount} existing equipment items`);

            if (failIfExists) {
                throw new Error(
                    "Existing equipment data found. Aborting initialization."
                );
            }
        }

        let successCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        // Process each equipment item
        for (const equipment of equipmentData as unknown as EquipmentRecord[]) {
            try {
                // Check if this specific item exists
                const exists = Boolean(await store.get(equipment.slug));

                if (exists && !forceUpdate) {
                    if (skipExisting) {
                        details.push(
                            `⤍ Skipping existing item: ${equipment.name} (${equipment.slug})`
                        );
                        skippedCount++;
                        continue;
                    } else {
                        throw new Error(
                            "Item already exists and skipExisting is false"
                        );
                    }
                }

                // Store the equipment data
                await store.set(equipment.slug, JSON.stringify(equipment));

                const action = exists ? "Updated" : "Stored";
                details.push(
                    `✓ Successfully ${action.toLowerCase()} ${
                        equipment.name
                    } (${equipment.slug})`
                );
                successCount++;
            } catch (error) {
                console.error(`✗ Failed to handle ${equipment.name}:`, error);
                errorCount++;
            }
        }

        details.push("\nInitialization complete:");
        details.push(`✓ Successfully stored ${successCount} equipment items`);
        details.push(`⤍ Skipped ${skippedCount} existing items`);
        if (errorCount > 0) {
            details.push(`✗ Failed to store ${errorCount} equipment items`);
        }

        return {
            success: successCount,
            skipped: skippedCount,
            errors: errorCount,
            total: equipmentData.length,
            existingCount,
            details
        };
    } catch (error) {
        console.error("Fatal error during initialization:", error);
        throw error;
    }
}
