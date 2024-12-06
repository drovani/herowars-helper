import {
    EQUIPMENT_QUALITIES,
    EquipmentMutation,
    EquipmentMutationSchema,
    EquipmentRecord,
} from "@/data/equipment.zod";
import equipmentData from "@/data/equipments.json";
import { generateSlug } from "@/lib/utils";
import { getStore } from "@netlify/blobs";

/**
 * In-memory cache for equipment when Netlify blob storage is unavailable
 */
class LocalEquipmentCache {
    private equipment: Map<string, EquipmentRecord> = new Map();
    private initialized: boolean = false;

    constructor() {
        this.initializeFromJson();
    }

    private initializeFromJson() {
        const records = equipmentData as unknown as EquipmentRecord[];
        records.forEach((record) => {
            this.equipment.set(record.slug, record);
        });
        this.initialized = true;
    }

    async getAll(slugs?: string[]): Promise<EquipmentRecord[]> {
        let equipment = Array.from(this.equipment.values());

        if (slugs) {
            equipment = equipment.filter((e) =>
                slugs.some((s) => e.slug === s)
            );
        }

        return equipment.sort((a, b) =>
            a.quality !== b.quality
                ? EQUIPMENT_QUALITIES.indexOf(a.quality) -
                  EQUIPMENT_QUALITIES.indexOf(b.quality)
                : a.name.localeCompare(b.name)
        );
    }

    async get(slug: string): Promise<EquipmentRecord | null> {
        return this.equipment.get(slug) || null;
    }

    async set(slug: string, record: EquipmentRecord): Promise<void> {
        this.equipment.set(slug, record);
    }

    async delete(slug: string): Promise<void> {
        this.equipment.delete(slug);
    }

    isInitialized(): boolean {
        return this.initialized;
    }
}

/**
 * Equipment Data Access Layer with fallback to local storage
 */
export class EquipmentDAL {
    private store;
    private localCache: LocalEquipmentCache;
    private useLocalCache: boolean = false;

    constructor() {
        this.store = getStore({
            name: "equipment",
            siteID: "herowars-helper",
            token: "nfp_issmYycyeVFStWR9YVMPn5zYUjpyr47i43b8",
        });
        this.localCache = new LocalEquipmentCache();
    }

    /**
     * Tests if Netlify blob storage is accessible
     */
    private async isNetlifyStorageAccessible(): Promise<boolean> {
        try {
            await this.store.list();
            return true;
        } catch (error) {
            //console.warn("Netlify blob storage is not accessible:", error);
            return false;
        }
    }

    /**
     * Ensures storage is initialized and determines which storage to use
     */
    private async initializeStorage(): Promise<void> {
        if (!this.localCache.isInitialized()) {
            throw new Error("Local cache initialization failed");
        }

        this.useLocalCache = !(await this.isNetlifyStorageAccessible());

        if (this.useLocalCache) {
            console.warn(
                "Using local storage fallback. Changes will be temporary until Netlify storage is accessible."
            );
        }
    }

    /**
     * Attempts to sync local changes to Netlify when it becomes available
     */
    private async syncToNetlify(): Promise<void> {
        if (!this.useLocalCache || !(await this.isNetlifyStorageAccessible())) {
            return;
        }

        console.log(
            "Netlify storage is now accessible. Syncing local changes..."
        );

        try {
            const localData = await this.localCache.getAll();

            for (const equipment of localData) {
                await this.store.set(equipment.slug, JSON.stringify(equipment));
            }

            this.useLocalCache = false;
            console.log("Successfully synced local changes to Netlify storage");
        } catch (error) {
            console.error("Failed to sync to Netlify storage:", error);
            throw error;
        }
    }

    /**
     * Get all equipment items
     */
    async getAllEquipment(slugs?: string[]): Promise<EquipmentRecord[]> {
        await this.initializeStorage();

        try {
            if (this.useLocalCache) {
                return await this.localCache.getAll(slugs);
            }

            const storeList = await this.store.list();
            const equipmentPromises = storeList.blobs.map(async (blob) => {
                const data = await this.store.get(blob.key);
                if (!data) return null;
                return JSON.parse(data) as EquipmentRecord;
            });

            let equipment = (await Promise.all(equipmentPromises))
                .filter((item): item is EquipmentRecord => item !== null)
                .sort((a, b) =>
                    a.quality !== b.quality
                        ? EQUIPMENT_QUALITIES.indexOf(a.quality) -
                          EQUIPMENT_QUALITIES.indexOf(b.quality)
                        : a.name.localeCompare(b.name)
                );
            if (slugs) {
                equipment = equipment.filter((item) =>
                    slugs.some((s) => s === item.slug)
                );
            }

            return equipment;
        } catch (error) {
            console.error("Failed to get all equipment:", error);
            throw new Error("Failed to retrieve equipment list");
        }
    }

    /**
     * Get a single equipment item by slug
     */
    async getEquipmentBySlug(slug: string): Promise<EquipmentRecord | null> {
        await this.initializeStorage();

        try {
            if (this.useLocalCache) {
                return await this.localCache.get(slug);
            }

            const data = await this.store.get(slug);
            if (!data) return null;

            return JSON.parse(data) as EquipmentRecord;
        } catch (error) {
            console.error(`Failed to get equipment ${slug}:`, error);
            throw new Error(`Failed to retrieve equipment ${slug}`);
        }
    }

    /**
     * Create a new equipment item
     */
    async createEquipment(
        equipment: EquipmentMutation
    ): Promise<EquipmentRecord> {
        await this.initializeStorage();

        try {
            EquipmentMutationSchema.parse(equipment);
            const slug = generateSlug(equipment.name);

            const existing = await this.getEquipmentBySlug(slug);
            if (existing) {
                throw new Error(`Equipment with slug ${slug} already exists`);
            }

            const record: EquipmentRecord = {
                ...equipment,
                slug,
                created_at: new Date().toISOString(),
            };

            if (this.useLocalCache) {
                await this.localCache.set(slug, record);
            } else {
                await this.store.set(slug, JSON.stringify(record));
            }

            // Try to sync to Netlify if we're using local cache
            if (this.useLocalCache) {
                await this.syncToNetlify().catch((error) => {
                    console.warn(
                        "Failed to sync new equipment to Netlify:",
                        error
                    );
                });
            }

            return record;
        } catch (error) {
            console.error("Failed to create equipment:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to create equipment");
        }
    }

    /**
     * Update an existing equipment item
     */
    async updateEquipment(
        slug: string,
        equipment: EquipmentMutation
    ): Promise<EquipmentRecord> {
        await this.initializeStorage();

        try {
            EquipmentMutationSchema.parse(equipment);

            const existing = await this.getEquipmentBySlug(slug);
            if (!existing) {
                throw new Error(`Equipment with slug ${slug} not found`);
            }

            const record: EquipmentRecord = {
                ...equipment,
                slug: existing.slug,
                created_at: existing.created_at,
            };

            if (this.useLocalCache) {
                await this.localCache.set(slug, record);
            } else {
                await this.store.set(slug, JSON.stringify(record));
            }

            // Try to sync to Netlify if we're using local cache
            if (this.useLocalCache) {
                await this.syncToNetlify().catch((error) => {
                    console.warn(
                        "Failed to sync updated equipment to Netlify:",
                        error
                    );
                });
            }

            return record;
        } catch (error) {
            console.error(`Failed to update equipment ${slug}:`, error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Failed to update equipment ${slug}`);
        }
    }

    /**
     * Delete an equipment item
     */
    async deleteEquipment(slug: string): Promise<void> {
        await this.initializeStorage();

        try {
            const existing = await this.getEquipmentBySlug(slug);
            if (!existing) {
                throw new Error(`Equipment with slug ${slug} not found`);
            }

            if (this.useLocalCache) {
                await this.localCache.delete(slug);
            } else {
                await this.store.delete(slug);
            }

            // Try to sync to Netlify if we're using local cache
            if (this.useLocalCache) {
                await this.syncToNetlify().catch((error) => {
                    console.warn("Failed to sync deletion to Netlify:", error);
                });
            }
        } catch (error) {
            console.error(`Failed to delete equipment ${slug}:`, error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Failed to delete equipment ${slug}`);
        }
    }

    /**
     * Get equipment that requires a specific equipment for crafting
     */
    async getEquipmentThatRequires(slug: string): Promise<EquipmentRecord[]> {
        try {
            const allEquipment = await this.getAllEquipment();

            return allEquipment.filter((e) => {
                if ("crafting" in e && e.crafting !== undefined) {
                    return Object.keys(e.crafting.required_items).some(
                        (item_slug) => item_slug === slug
                    );
                } else {
                    return false;
                }
            });
        } catch (error) {
            console.error(`Failed to get equipment requiring ${slug}:`, error);
            throw new Error(`Failed to get equipment requiring ${slug}`);
        }
    }
}

// Export a singleton instance
export const equipmentDAL = new EquipmentDAL();
