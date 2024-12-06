import { MissionSchema, type Mission } from "@/data/mission.zod";
import missionData from "@/data/missions.json";
import { getStore } from "@netlify/blobs";

/**
 * In-memory cache for missions when Netlify blob storage is unavailable
 */
class LocalMissionCache {
    private missions: Map<string, Mission> = new Map();
    private initialized: boolean = false;

    constructor() {
        this.initializeFromJson();
    }

    private initializeFromJson() {
        const records = missionData as Mission[];
        records.forEach((record) => {
            this.missions.set(record.id, record);
        });
        this.initialized = true;
    }

    async getAll(): Promise<Mission[]> {
        return Array.from(this.missions.values()).sort((a, b) => {
            const [aChapter, aMission] = a.id.split("-").map(Number);
            const [bChapter, bMission] = b.id.split("-").map(Number);
            return aChapter === bChapter
                ? aMission - bMission
                : aChapter - bChapter;
        });
    }

    async get(id: string): Promise<Mission | null> {
        return this.missions.get(id) || null;
    }

    async set(id: string, record: Mission): Promise<void> {
        this.missions.set(id, record);
    }

    async delete(id: string): Promise<void> {
        this.missions.delete(id);
    }

    isInitialized(): boolean {
        return this.initialized;
    }
}

/**
 * Mission Data Access Layer with fallback to local storage
 */
export class MissionDAL {
    private store;
    private localCache: LocalMissionCache;
    private useLocalCache: boolean = false;

    constructor() {
        this.store = getStore({
            name: "missions",
            siteID: "herowars-helper",
            token: "nfp_issmYycyeVFStWR9YVMPn5zYUjpyr47i43b8",
        });
        this.localCache = new LocalMissionCache();
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

            for (const mission of localData) {
                await this.store.set(mission.id, JSON.stringify(mission));
            }

            this.useLocalCache = false;
            console.log("Successfully synced local changes to Netlify storage");
        } catch (error) {
            console.error("Failed to sync to Netlify storage:", error);
            throw error;
        }
    }

    /**
     * Get all missions
     */
    async getAllMissions(): Promise<Mission[]> {
        await this.initializeStorage();

        try {
            if (this.useLocalCache) {
                return await this.localCache.getAll();
            }

            const storeList = await this.store.list();
            const missionPromises = storeList.blobs.map(async (blob) => {
                const data = await this.store.get(blob.key);
                if (!data) return null;
                return JSON.parse(data) as Mission;
            });

            const missions = (await Promise.all(missionPromises))
                .filter((item): item is Mission => item !== null)
                .sort((a, b) => {
                    const [aChapter, aMission] = a.id.split("-").map(Number);
                    const [bChapter, bMission] = b.id.split("-").map(Number);
                    return aChapter === bChapter
                        ? aMission - bMission
                        : aChapter - bChapter;
                });

            return missions;
        } catch (error) {
            console.error("Failed to get all missions:", error);
            throw new Error("Failed to retrieve mission list");
        }
    }

    /**
     * Get a single mission by ID
     */
    async getMission(id: string): Promise<Mission | null> {
        await this.initializeStorage();

        try {
            if (this.useLocalCache) {
                return await this.localCache.get(id);
            }

            const data = await this.store.get(id);
            if (!data) return null;

            return JSON.parse(data) as Mission;
        } catch (error) {
            console.error(`Failed to get mission ${id}:`, error);
            throw new Error(`Failed to retrieve mission ${id}`);
        }
    }

    /**
     * Create a new mission
     */
    async createMission(mission: Mission): Promise<Mission> {
        await this.initializeStorage();

        try {
            // Validate with Zod schema
            const validated = MissionSchema.parse(mission);

            const existing = await this.getMission(validated.id);
            if (existing) {
                throw new Error(
                    `Mission with id ${validated.id} already exists`
                );
            }

            if (this.useLocalCache) {
                await this.localCache.set(validated.id, validated);
            } else {
                await this.store.set(validated.id, JSON.stringify(validated));
            }

            // Try to sync to Netlify if we're using local cache
            if (this.useLocalCache) {
                await this.syncToNetlify().catch((error) => {
                    console.warn(
                        "Failed to sync new mission to Netlify:",
                        error
                    );
                });
            }

            return validated;
        } catch (error) {
            console.error("Failed to create mission:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to create mission");
        }
    }

    /**
     * Update an existing mission
     */
    async updateMission(id: string, mission: Mission): Promise<Mission> {
        await this.initializeStorage();

        try {
            // Validate with Zod schema
            const validated = MissionSchema.parse(mission);

            const existing = await this.getMission(id);
            if (!existing) {
                throw new Error(`Mission with id ${id} not found`);
            }

            if (validated.id !== id) {
                throw new Error(
                    `Cannot change mission ID from ${id} to ${validated.id}`
                );
            }

            if (this.useLocalCache) {
                await this.localCache.set(id, validated);
            } else {
                await this.store.set(id, JSON.stringify(validated));
            }

            // Try to sync to Netlify if we're using local cache
            if (this.useLocalCache) {
                await this.syncToNetlify().catch((error) => {
                    console.warn(
                        "Failed to sync updated mission to Netlify:",
                        error
                    );
                });
            }

            return validated;
        } catch (error) {
            console.error(`Failed to update mission ${id}:`, error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Failed to update mission ${id}`);
        }
    }

    /**
     * Delete a mission
     */
    async deleteMission(id: string): Promise<void> {
        await this.initializeStorage();

        try {
            const existing = await this.getMission(id);
            if (!existing) {
                throw new Error(`Mission with id ${id} not found`);
            }

            if (this.useLocalCache) {
                await this.localCache.delete(id);
            } else {
                await this.store.delete(id);
            }

            // Try to sync to Netlify if we're using local cache
            if (this.useLocalCache) {
                await this.syncToNetlify().catch((error) => {
                    console.warn("Failed to sync deletion to Netlify:", error);
                });
            }
        } catch (error) {
            console.error(`Failed to delete mission ${id}:`, error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Failed to delete mission ${id}`);
        }
    }

    /**
     * Get missions by chapter number
     */
    async getMissionsByChapter(chapter: number): Promise<Mission[]> {
        try {
            const allMissions = await this.getAllMissions();
            return allMissions.filter((mission) => mission.chapter === chapter);
        } catch (error) {
            console.error(
                `Failed to get missions for chapter ${chapter}:`,
                error
            );
            throw new Error(`Failed to get missions for chapter ${chapter}`);
        }
    }

    /**
     * Get missions by boss name
     */
    async getMissionsByBoss(bossName: string): Promise<Mission[]> {
        try {
            const allMissions = await this.getAllMissions();
            return allMissions.filter((mission) => mission.boss === bossName);
        } catch (error) {
            console.error(
                `Failed to get missions for boss ${bossName}:`,
                error
            );
            throw new Error(`Failed to get missions for boss ${bossName}`);
        }
    }
}

// Export a singleton instance
export const missionDAL = new MissionDAL();
