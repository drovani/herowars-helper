import log from "loglevel";
import { AlertCircle, AlertTriangle, CheckCircle, ChevronDown, RefreshCwIcon, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { data, useFetcher, useNavigate } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { formatTitle } from "~/config/site";
import type { EquipmentRecord } from "~/data/equipment.zod";
import type { HeroRecord } from "~/data/hero.zod";
import equipmentsData from "~/data/equipments.json";
import chaptersAndMissionsData from "~/data/missions.json";
import heroesData from "~/data/heroes.json";
import { createAdminClient } from "~/lib/supabase/admin-client";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import { MissionRepository } from "~/repositories/MissionRepository";
import { HeroRepository } from "~/repositories/HeroRepository";
import { createDatabaseHeroService } from "~/services/DatabaseHeroService";
import type { Route } from "./+types/setup";

// Helper function to extract chapters from missions data
function extractChapters(data: typeof chaptersAndMissionsData) {
  return data.chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
  }));
}

// Helper function to transform missions to database format
function transformMissions(data: typeof chaptersAndMissionsData) {
  return data.missions.map((mission) => {
    // Parse chapter_id and level from slug (e.g., "1-2" → chapter_id = 1, level = 2)
    const [chapterIdStr, levelStr] = mission.slug.split('-');
    const chapter_id = parseInt(chapterIdStr, 10);
    const level = parseInt(levelStr, 10);

    return {
      slug: mission.slug,
      name: mission.name,
      chapter_id,
      hero_slug: mission.hero_slug || null,
      energy_cost: mission.energy_cost,
      level,
    };
  });
}

// Helper function to transform equipment data to expected format
function transformEquipments(data: typeof equipmentsData): EquipmentRecord[] {
  return data as EquipmentRecord[];
}

// Helper function to get a subset of equipment for testing
function getEquipmentSubset(data: typeof equipmentsData, limit: number = 10): EquipmentRecord[] {
  return data.slice(0, limit) as EquipmentRecord[];
}

export async function action({ request }: Route.ActionArgs) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const mode = formData.get("mode")?.toString() || "basic";
    const dataset = formData.get("dataset")?.toString();
    const purge = formData.get("purge") === "true";

    // Set initialization options based on mode
    const options = {
      skipExisting: mode !== "force",
      failIfExists: mode === "safe",
      forceUpdate: mode === "force",
      purgeFirst: purge,
    };

    const results: any = {
      chapters: { created: 0, errors: 0, skipped: 0, total: 0, errorDetails: [], skippedDetails: [] },
      missions: { created: 0, errors: 0, skipped: 0, total: 0, errorDetails: [], skippedDetails: [] },
      equipment: { created: 0, errors: 0, skipped: 0, total: 0, errorDetails: [], skippedDetails: [] },
      heroes: { created: 0, errors: 0, skipped: 0, total: 0, errorDetails: [], skippedDetails: [] },
      purged: { missions: 0, chapters: 0, equipment: 0, heroes: 0, stats: 0, required_items: 0, errors: 0, errorDetails: [] },
      processingTime: 0,
      mode,
      dataset: dataset || "all",
      purgeRequested: purge,
    };

    // Initialize repositories with appropriate client
    const missionRepo = mode === 'force'
      ? new MissionRepository(createAdminClient(request).supabase as any)
      : new MissionRepository(request);

    const equipmentRepo = mode === 'force'
      ? new EquipmentRepository(createAdminClient(request).supabase as any)
      : new EquipmentRepository(request);

    const heroRepo = mode === 'force'
      ? new HeroRepository(createAdminClient(request).supabase as any)
      : new HeroRepository(request);

    // Execute purge if requested
    if (purge) {
      log.info("Purging existing data...");

      // Determine what to purge based on dataset
      if (!dataset || dataset === "missions" || dataset === "all") {
        // Purge mission domain (both missions and chapters)
        const purgeResult = await missionRepo.purgeMissionDomain();
        if (purgeResult.error) {
          throw new Error(`Domain purge failed: ${purgeResult.error.message}`);
        }

        if (purgeResult.data) {
          results.purged.missions = purgeResult.data.missions;
          results.purged.chapters = purgeResult.data.chapters;
        }

        log.info(`Purged mission domain: ${results.purged.missions} missions, ${results.purged.chapters} chapters`);
      }

      if (!dataset || dataset === "equipment" || dataset === "all") {
        // Purge equipment domain (equipment, stats, and required items)
        const equipmentPurgeResult = await equipmentRepo.purgeEquipmentDomain();
        if (equipmentPurgeResult.error) {
          throw new Error(`Equipment domain purge failed: ${equipmentPurgeResult.error.message}`);
        }

        if (equipmentPurgeResult.data) {
          results.purged.equipment = equipmentPurgeResult.data.equipment;
          results.purged.stats = equipmentPurgeResult.data.stats;
          results.purged.required_items = equipmentPurgeResult.data.required_items;
        }

        log.info(`Purged equipment domain: ${results.purged.equipment} equipment, ${results.purged.stats} stats, ${results.purged.required_items} required items`);
      }

      if (!dataset || dataset === "heroes" || dataset === "all") {
        // Purge hero domain (heroes and all related data)
        const heroPurgeResult = await heroRepo.purgeHeroDomain();
        if (heroPurgeResult.error) {
          throw new Error(`Hero domain purge failed: ${heroPurgeResult.error.message}`);
        }

        if (heroPurgeResult.data) {
          results.purged.heroes = heroPurgeResult.data.heroes || 0;
        }

        log.info(`Purged hero domain: ${results.purged.heroes} heroes`);
      }
    }

    // Load missions data if dataset is empty (all) or "missions"
    if (!dataset || dataset === "missions") {
      log.info("Loading mission data...");

      // Prepare data for initialization
      const chaptersToCreate = extractChapters(chaptersAndMissionsData);
      const missionsToCreate = transformMissions(chaptersAndMissionsData);

      results.chapters.total = chaptersToCreate.length;
      results.missions.total = missionsToCreate.length;

      log.info(`Initializing ${chaptersToCreate.length} chapters and ${missionsToCreate.length} missions...`);

      // Use the new initializeMissionData method
      const initResult = await missionRepo.initializeMissionData(
        {
          chapters: chaptersToCreate,
          missions: missionsToCreate
        },
        options
      );

      // Handle both successful and partial failure cases
      if (initResult.error && !['BULK_PARTIAL_FAILURE', 'BULK_PARTIAL_SUCCESS'].includes(initResult.error.code || '')) {
        throw new Error(`Mission data initialization failed: ${initResult.error.message}`);
      }

      // Update results with detailed information
      if (initResult.data) {
        results.chapters.created = initResult.data.chapters?.length || 0;
        results.missions.created = initResult.data.missions?.length || 0;
      }

      // Capture error and skip details from partial failures
      if (initResult.error?.details) {
        const details = initResult.error.details as any;

        // Handle chapter-specific details
        if (details.chapters) {
          const chapterDetails = details.chapters;

          // Handle chapter errors
          if (chapterDetails.errors && Array.isArray(chapterDetails.errors)) {
            chapterDetails.errors.forEach((errorItem: any) => {
              results.chapters.errors++;
              results.chapters.errorDetails.push({
                record: errorItem.data,
                error: errorItem.error
              });
            });
          }

          // Handle skipped chapters
          if (chapterDetails.skipped && Array.isArray(chapterDetails.skipped)) {
            chapterDetails.skipped.forEach((skippedItem: any) => {
              results.chapters.skipped++;
              results.chapters.skippedDetails.push(skippedItem);
            });
          }
        }

        // Handle mission-specific details
        if (details.missions) {
          const missionDetails = details.missions;

          // Handle mission errors
          if (missionDetails.errors && Array.isArray(missionDetails.errors)) {
            missionDetails.errors.forEach((errorItem: any) => {
              results.missions.errors++;
              results.missions.errorDetails.push({
                record: errorItem.data,
                error: errorItem.error
              });
            });
          }

          // Handle skipped missions
          if (missionDetails.skipped && Array.isArray(missionDetails.skipped)) {
            missionDetails.skipped.forEach((skippedItem: any) => {
              results.missions.skipped++;
              results.missions.skippedDetails.push(skippedItem);
            });
          }
        }

        // Legacy support: Handle flat structure for backward compatibility
        if (details.errors && Array.isArray(details.errors)) {
          details.errors.forEach((errorItem: any) => {
            // Determine if this is a chapter or mission error based on the data structure
            if (errorItem.data && 'title' in errorItem.data) {
              // Chapter error
              results.chapters.errors++;
              results.chapters.errorDetails.push({
                record: errorItem.data,
                error: errorItem.error
              });
            } else if (errorItem.data && ('name' in errorItem.data || 'slug' in errorItem.data)) {
              // Mission error
              results.missions.errors++;
              results.missions.errorDetails.push({
                record: errorItem.data,
                error: errorItem.error
              });
            }
          });
        }

        // Legacy support: Handle flat skipped structure
        if (details.skipped && Array.isArray(details.skipped)) {
          details.skipped.forEach((skippedItem: any) => {
            if (skippedItem && 'title' in skippedItem) {
              // Skipped chapter
              results.chapters.skipped++;
              results.chapters.skippedDetails.push(skippedItem);
            } else if (skippedItem && ('name' in skippedItem || 'slug' in skippedItem)) {
              // Skipped mission
              results.missions.skipped++;
              results.missions.skippedDetails.push(skippedItem);
            }
          });
        }
      }

      log.info("Mission data loading completed", results);
    }

    // Load equipment data if dataset is empty (all) or "equipment"
    if (!dataset || dataset === "equipment") {
      log.info("Loading equipment data...");

      try {
        // Prepare data for initialization
        const equipmentsToCreate = transformEquipments(equipmentsData);
        results.equipment.total = equipmentsToCreate.length;

        // Use the initializeFromJSON method
        const equipmentInitResult = await equipmentRepo.initializeFromJSON(equipmentsToCreate);

        // Handle both successful and partial failure cases
        if (equipmentInitResult.error && !['BULK_PARTIAL_FAILURE', 'BULK_PARTIAL_SUCCESS'].includes(equipmentInitResult.error.code || '')) {
          throw new Error(`Equipment data initialization failed: ${equipmentInitResult.error.message}`);
        }

        // Update results with detailed information
        if (equipmentInitResult.data) {
          results.equipment.created = equipmentInitResult.data.equipment?.length || 0;
        }

        // Handle partial failures/success for equipment
        if (equipmentInitResult.error?.details) {
          const details = equipmentInitResult.error.details as any;

          if (Array.isArray(details.errors)) {
            details.errors.forEach((errorItem: any) => {
              results.equipment.errors++;
              results.equipment.errorDetails.push({
                record: errorItem.inputData || errorItem.data || null,
                error: {
                  message: errorItem.message,
                  code: errorItem.code,
                  details: errorItem.details,
                  inputData: errorItem.inputData,
                  batchIndex: errorItem.batchIndex
                }
              });
            });
          }

          if (Array.isArray(details.skipped)) {
            details.skipped.forEach((skippedItem: any) => {
              results.equipment.skipped++;
              results.equipment.skippedDetails.push(skippedItem);
            });
          }
        }

      } catch (error) {
        log.error("Equipment data loading failed:", error);
        throw error;
      }
    }

    // Load hero data if dataset is empty (all) or "heroes"
    if (!dataset || dataset === "heroes") {
      log.info("Loading hero data...");

      try {
        // Get hero data from JSON file
        const heroesFromJson = heroesData as any[];
        results.heroes.total = heroesFromJson.length;

        log.info(`Initializing ${heroesFromJson.length} heroes...`);

        // Use the repository's bulk import capabilities
        const heroInitResult = await heroRepo.initializeFromJSON(heroesFromJson);

        // Handle both successful and partial failure cases
        if (heroInitResult.error && !['BULK_PARTIAL_FAILURE', 'BULK_PARTIAL_SUCCESS'].includes(heroInitResult.error.code || '')) {
          throw new Error(`Hero data initialization failed: ${heroInitResult.error.message}`);
        }

        // Update results with detailed information
        if (heroInitResult.data) {
          results.heroes.created = heroInitResult.data.heroes?.length || 0;
        }

        // Handle partial failures/success for heroes
        if (heroInitResult.error?.details) {
          const details = heroInitResult.error.details as any;

          if (Array.isArray(details.errors)) {
            details.errors.forEach((errorItem: any) => {
              results.heroes.errors++;
              results.heroes.errorDetails.push({
                record: errorItem.inputData || errorItem.data || null,
                error: {
                  message: errorItem.message,
                  code: errorItem.code,
                  details: errorItem.details,
                  inputData: errorItem.inputData,
                  batchIndex: errorItem.batchIndex
                }
              });
            });
          }

          if (Array.isArray(details.skipped)) {
            details.skipped.forEach((skippedItem: any) => {
              results.heroes.skipped++;
              results.heroes.skippedDetails.push(skippedItem);
            });
          }
        }

      } catch (error) {
        log.error("Hero data loading failed:", error);
        throw error;
      }
    }

    results.processingTime = Date.now() - startTime;

    return data({
      message: "Data initialization completed",
      results,
      success: true,
      processingTime: results.processingTime,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    log.error("Setup failed:", message);

    return data(
      {
        message: "Data initialization failed",
        error: message,
        success: false,
        processingTime: Date.now() - startTime,
      },
      {
        status: error instanceof Error && error.message.includes("Existing data conflict.") ? 409 : 500,
      }
    );
  }
}

export const meta = () => {
  return [{ title: formatTitle('Data Setup - Admin') }];
};

// Component for displaying expandable error and skipped details
function DetailsSection({
  skippedDetails,
  errorDetails,
  type
}: {
  skippedDetails?: any[],
  errorDetails?: any[],
  type: string
}) {
  const [showSkipped, setShowSkipped] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  return (
    <div className="space-y-2">
      {/* Skipped Details */}
      {skippedDetails && skippedDetails.length > 0 && (
        <Collapsible open={showSkipped} onOpenChange={setShowSkipped}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto">
              <span className="text-blue-600 text-xs">View {skippedDetails.length} skipped {type}</span>
              <ChevronDown className={`size-3 transition-transform ${showSkipped ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            <div className="bg-blue-50 border border-blue-200 rounded p-2 max-h-32 overflow-y-auto">
              <div className="text-xs space-y-1">
                {skippedDetails.map((item, index) => (
                  <div key={index} className="text-blue-700">
                    <span className="font-medium">
                      {type === 'chapters' ? item.title : (item.name || item.slug)}
                    </span>
                    {type === 'chapters' && item.id && <span className="text-blue-500 ml-1">(ID: {item.id})</span>}
                    {type === 'missions' && item.slug && <span className="text-blue-500 ml-1">({item.slug})</span>}
                    {type === 'equipment' && item.slug && <span className="text-blue-500 ml-1">({item.slug})</span>}
                    {type === 'heroes' && item.slug && <span className="text-blue-500 ml-1">({item.slug})</span>}
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Error Details */}
      {errorDetails && errorDetails.length > 0 && (
        <Collapsible open={showErrors} onOpenChange={setShowErrors}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto">
              <span className="text-red-600 text-xs">View {errorDetails.length} error{errorDetails.length !== 1 ? 's' : ''}</span>
              <ChevronDown className={`size-3 transition-transform ${showErrors ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            <div className="bg-red-50 border border-red-200 rounded p-2 max-h-64 overflow-y-auto">
              <div className="text-xs space-y-3">
                {errorDetails.map((item, index) => (
                  <div key={index} className="border-b border-red-200 pb-2 last:border-b-0">
                    {/* Item identifier */}
                    <div className="font-medium text-red-800 mb-1">
                      {type === 'chapters' ? item.record?.title : (item.record?.name || item.record?.slug || 'Unknown item')}
                      {item.record?.slug && item.record?.name && (
                        <span className="text-red-600 font-normal ml-1">({item.record.slug})</span>
                      )}
                    </div>

                    {/* Error message */}
                    <div className="text-red-600 text-xs mb-1">
                      <strong>Error:</strong> {item.error?.message || 'Unknown error'}
                    </div>

                    {/* Error code */}
                    {item.error?.code && (
                      <div className="text-red-500 text-xs mb-1">
                        <strong>Code:</strong> {item.error.code}
                      </div>
                    )}

                    {/* Batch index for debugging */}
                    {item.error?.batchIndex !== undefined && (
                      <div className="text-red-500 text-xs mb-1">
                        <strong>Item #:</strong> {item.error.batchIndex + 1}
                      </div>
                    )}

                    {/* Equipment-specific details */}
                    {type === 'equipment' && item.record && (
                      <div className="text-red-700 text-xs space-y-1">
                        {item.record.type && (
                          <div><strong>Type:</strong> {item.record.type}</div>
                        )}
                        {item.record.quality && (
                          <div><strong>Quality:</strong> {item.record.quality}</div>
                        )}
                        {item.record.buy_value_gold !== undefined && (
                          <div><strong>Gold Value:</strong> {item.record.buy_value_gold}</div>
                        )}
                        {item.record.sell_value !== undefined && (
                          <div><strong>Sell Value:</strong> {item.record.sell_value}</div>
                        )}
                        {item.record.guild_activity_points !== undefined && (
                          <div><strong>Guild Points:</strong> {item.record.guild_activity_points}</div>
                        )}
                        {item.record.hero_level_required !== undefined && (
                          <div><strong>Hero Level:</strong> {item.record.hero_level_required}</div>
                        )}
                      </div>
                    )}

                    {/* Hero-specific details */}
                    {type === 'heroes' && item.record && (
                      <div className="text-red-700 text-xs space-y-1">
                        {item.record.class && (
                          <div><strong>Class:</strong> {item.record.class}</div>
                        )}
                        {item.record.faction && (
                          <div><strong>Faction:</strong> {item.record.faction}</div>
                        )}
                        {item.record.main_stat && (
                          <div><strong>Main Stat:</strong> {item.record.main_stat}</div>
                        )}
                        {item.record.attack_type && (
                          <div><strong>Attack Type:</strong> {Array.isArray(item.record.attack_type) ? item.record.attack_type.join(', ') : item.record.attack_type}</div>
                        )}
                        {item.record.order_rank !== undefined && (
                          <div><strong>Order Rank:</strong> {item.record.order_rank}</div>
                        )}
                      </div>
                    )}

                    {/* Raw error details for debugging */}
                    {item.error?.details && (
                      <details className="mt-2">
                        <summary className="text-red-500 text-xs cursor-pointer hover:text-red-700">
                          Show Raw Error Details
                        </summary>
                        <pre className="text-xs text-red-600 mt-1 p-1 bg-red-100 rounded overflow-x-auto">
                          {JSON.stringify(item.error.details, null, 2)}
                        </pre>
                      </details>
                    )}

                    {/* Input data that caused the error */}
                    {item.error?.inputData && (
                      <details className="mt-2">
                        <summary className="text-red-500 text-xs cursor-pointer hover:text-red-700">
                          Show Input Data
                        </summary>
                        <pre className="text-xs text-red-600 mt-1 p-1 bg-red-100 rounded overflow-x-auto">
                          {JSON.stringify(item.error.inputData, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

export default function AdminSetup({ actionData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const initdata = useMemo(() => fetcher.data, [fetcher.data]);

  // Handle fetcher loading states
  if (fetcher.state === "submitting" || fetcher.state === "loading") {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Initializing Data</CardTitle>
            <CardDescription>Processing your request...</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <RefreshCwIcon className="size-6 animate-spin" />
              <span className="text-lg">Initializing...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show form when idle with no data
  if (fetcher.state === "idle" && !fetcher.data) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Initialize Data</CardTitle>
            <CardDescription>Configure initialization settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <fetcher.Form method="post" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Initialization Mode</Label>
                  <RadioGroup defaultValue="basic" name="mode" className="grid gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="basic" id="basic" />
                      <Label htmlFor="basic" className="font-normal">
                        Basic - Only add new items
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="safe" id="safe" />
                      <Label htmlFor="safe" className="font-normal">
                        Safe - Fail if items already exist
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="force" id="force" />
                      <Label htmlFor="force" className="font-normal">
                        Force - Update all items
                      </Label>
                    </div>
                  </RadioGroup>
                  <div className="flex items-center space-x-2">
                    <Checkbox name="purge" className="mt-4" value="true" />
                    <Label htmlFor="purge" className="font-normal pt-4">
                      Purge existing data
                    </Label>
                  </div>
                </div>

                <div>
                  <Label>Dataset</Label>
                  <RadioGroup defaultValue="" name="dataset" className="grid gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="all" />
                      <Label htmlFor="all" className="font-normal">
                        All datasets
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="missions" id="missions" />
                      <Label htmlFor="missions" className="font-normal">
                        Missions only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="equipment" id="equipment" />
                      <Label htmlFor="equipment" className="font-normal">
                        Equipment only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="heroes" id="heroes" />
                      <Label htmlFor="heroes" className="font-normal">
                        Heroes only
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={fetcher.state !== "idle"}>
                {fetcher.state === "idle" ? (
                  "Initialize"
                ) : (
                  <>
                    <RefreshCwIcon className="mr-2 size-4 animate-spin" />
                    Initializing...
                  </>
                )}
              </Button>
            </fetcher.Form>
          </CardContent>
        </Card>
      </div>
    );
  } else if ("error" in initdata) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Alert variant="destructive">
          <XCircle className="size-4" />
          <AlertTitle>Initialization Failed</AlertTitle>
          <AlertDescription>
            {initdata.error}
            {initdata.processingTime && (
              <span className="ml-2 text-sm text-muted-foreground">
                (Processing time: {initdata.processingTime}ms)
              </span>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusIcon = (created: number, errors: number, skipped: number, total: number) => {
    if (errors > 0) {
      return <AlertTriangle className="size-4 text-yellow-500" />;
    }
    if (created + skipped === total && total > 0) {
      return <CheckCircle className="size-4 text-green-500" />;
    }
    if (created === 0 && skipped === 0 && total > 0) {
      return <XCircle className="size-4 text-red-500" />;
    }
    return <CheckCircle className="size-4 text-green-500" />;
  };

  const getStatusBadge = (created: number, errors: number, skipped: number, total: number) => {
    if (errors > 0) {
      return <Badge variant="destructive">Partial Success</Badge>;
    }
    if (created + skipped === total && total > 0) {
      return <Badge variant="default">Success</Badge>;
    }
    if (created === 0 && skipped === 0 && total > 0) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="secondary">No Data</Badge>;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Alert variant={initdata.success ? "default" : "destructive"}>
        {initdata.success ? (
          <CheckCircle className="size-4" />
        ) : (
          <XCircle className="size-4" />
        )}
        <AlertTitle>
          {initdata.success ? "Initialization Completed" : "Initialization Failed"}
        </AlertTitle>
        <AlertDescription>
          {initdata.message}
          {initdata.processingTime && (
            <span className="ml-2 text-sm text-muted-foreground">
              (Processing time: {initdata.processingTime}ms)
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Action buttons for next steps */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => {
            // Reset fetcher state to show form again
            fetcher.load(window.location.pathname);
          }}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCwIcon className="size-4" />
          Run Another Initialization
        </Button>
        <Button
          onClick={() => {
            navigate("/admin");
          }}
          variant="secondary"
          className="flex items-center gap-2"
        >
          Back to Admin Dashboard
        </Button>
      </div>

      {initdata.results && (
        <div className="grid gap-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Summary</CardTitle>
              <CardDescription>
                Mode: {initdata.results.mode} | Dataset: {initdata.results.dataset}
                {initdata.results.purgeRequested && initdata.results.purged &&
                  ` | Purged: ${initdata.results.purged.missions} missions, ${initdata.results.purged.chapters} chapters, ${initdata.results.purged.equipment} equipment, ${initdata.results.purged.heroes} heroes`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {/* Purge Summary */}
                {initdata.results.purgeRequested && initdata.results.purged &&
                  (initdata.results.purged.missions > 0 || initdata.results.purged.chapters > 0 || initdata.results.purged.equipment > 0 || initdata.results.purged.heroes > 0) && (
                  <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="size-4 text-orange-500" />
                        Purged Data
                      </h3>
                      <Badge variant="secondary">Domain Purged</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      {initdata.results.purged.missions > 0 && <p className="text-orange-700">Missions: {initdata.results.purged.missions}</p>}
                      {initdata.results.purged.chapters > 0 && <p className="text-orange-700">Chapters: {initdata.results.purged.chapters}</p>}
                      {initdata.results.purged.equipment > 0 && <p className="text-orange-700">Equipment: {initdata.results.purged.equipment}</p>}
                      {initdata.results.purged.heroes > 0 && <p className="text-orange-700">Heroes: {initdata.results.purged.heroes}</p>}
                      {initdata.results.purged.stats > 0 && <p className="text-orange-700">Equipment Stats: {initdata.results.purged.stats}</p>}
                      {initdata.results.purged.required_items > 0 && <p className="text-orange-700">Required Items: {initdata.results.purged.required_items}</p>}
                    </div>
                  </div>
                )}

                {/* Chapters Summary */}
                {initdata.results.chapters && initdata.results.chapters.total > 0 && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        {getStatusIcon(
                          initdata.results.chapters.created,
                          initdata.results.chapters.errors,
                          initdata.results.chapters.skipped,
                          initdata.results.chapters.total
                        )}
                        Chapters
                      </h3>
                      {getStatusBadge(
                        initdata.results.chapters.created,
                        initdata.results.chapters.errors,
                        initdata.results.chapters.skipped,
                        initdata.results.chapters.total
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Total: {initdata.results.chapters.total}</p>
                      <p className="text-green-600">Created: {initdata.results.chapters.created}</p>
                      {initdata.results.chapters.skipped > 0 && (
                        <p className="text-blue-600">Skipped: {initdata.results.chapters.skipped}</p>
                      )}
                      {initdata.results.chapters.errors > 0 && (
                        <p className="text-red-600">Errors: {initdata.results.chapters.errors}</p>
                      )}
                    </div>

                    {/* Expandable details for chapters */}
                    {(initdata.results.chapters.skippedDetails?.length > 0 || initdata.results.chapters.errorDetails?.length > 0) && (
                      <div className="mt-3 pt-3 border-t">
                        <DetailsSection
                          skippedDetails={initdata.results.chapters.skippedDetails}
                          errorDetails={initdata.results.chapters.errorDetails}
                          type="chapters"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Missions Summary */}
                {initdata.results.missions && initdata.results.missions.total > 0 && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        {getStatusIcon(
                          initdata.results.missions.created,
                          initdata.results.missions.errors,
                          initdata.results.missions.skipped,
                          initdata.results.missions.total
                        )}
                        Missions
                      </h3>
                      {getStatusBadge(
                        initdata.results.missions.created,
                        initdata.results.missions.errors,
                        initdata.results.missions.skipped,
                        initdata.results.missions.total
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Total: {initdata.results.missions.total}</p>
                      <p className="text-green-600">Created: {initdata.results.missions.created}</p>
                      {initdata.results.missions.skipped > 0 && (
                        <p className="text-blue-600">Skipped: {initdata.results.missions.skipped}</p>
                      )}
                      {initdata.results.missions.errors > 0 && (
                        <p className="text-red-600">Errors: {initdata.results.missions.errors}</p>
                      )}
                    </div>

                    {/* Expandable details for missions */}
                    {(initdata.results.missions.skippedDetails?.length > 0 || initdata.results.missions.errorDetails?.length > 0) && (
                      <div className="mt-3 pt-3 border-t">
                        <DetailsSection
                          skippedDetails={initdata.results.missions.skippedDetails}
                          errorDetails={initdata.results.missions.errorDetails}
                          type="missions"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Equipment Summary */}
                {initdata.results.equipment && initdata.results.equipment.total > 0 && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        {getStatusIcon(
                          initdata.results.equipment.created,
                          initdata.results.equipment.errors,
                          initdata.results.equipment.skipped,
                          initdata.results.equipment.total
                        )}
                        Equipment
                      </h3>
                      {getStatusBadge(
                        initdata.results.equipment.created,
                        initdata.results.equipment.errors,
                        initdata.results.equipment.skipped,
                        initdata.results.equipment.total
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Total: {initdata.results.equipment.total}</p>
                      <p className="text-green-600">Created: {initdata.results.equipment.created}</p>
                      {initdata.results.equipment.skipped > 0 && (
                        <p className="text-blue-600">Skipped: {initdata.results.equipment.skipped}</p>
                      )}
                      {initdata.results.equipment.errors > 0 && (
                        <p className="text-red-600">Errors: {initdata.results.equipment.errors}</p>
                      )}
                    </div>

                    {/* Expandable details for equipment */}
                    {(initdata.results.equipment.skippedDetails?.length > 0 || initdata.results.equipment.errorDetails?.length > 0) && (
                      <div className="mt-3 pt-3 border-t">
                        <DetailsSection
                          skippedDetails={initdata.results.equipment.skippedDetails}
                          errorDetails={initdata.results.equipment.errorDetails}
                          type="equipment"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Heroes Summary */}
                {initdata.results.heroes && initdata.results.heroes.total > 0 && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        {getStatusIcon(
                          initdata.results.heroes.created,
                          initdata.results.heroes.errors,
                          initdata.results.heroes.skipped,
                          initdata.results.heroes.total
                        )}
                        Heroes
                      </h3>
                      {getStatusBadge(
                        initdata.results.heroes.created,
                        initdata.results.heroes.errors,
                        initdata.results.heroes.skipped,
                        initdata.results.heroes.total
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Total: {initdata.results.heroes.total}</p>
                      <p className="text-green-600">Created: {initdata.results.heroes.created}</p>
                      {initdata.results.heroes.skipped > 0 && (
                        <p className="text-blue-600">Skipped: {initdata.results.heroes.skipped}</p>
                      )}
                      {initdata.results.heroes.errors > 0 && (
                        <p className="text-red-600">Errors: {initdata.results.heroes.errors}</p>
                      )}
                    </div>

                    {/* Expandable details for heroes */}
                    {(initdata.results.heroes.skippedDetails?.length > 0 || initdata.results.heroes.errorDetails?.length > 0) && (
                      <div className="mt-3 pt-3 border-t">
                        <DetailsSection
                          skippedDetails={initdata.results.heroes.skippedDetails}
                          errorDetails={initdata.results.heroes.errorDetails}
                          type="heroes"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}


export function ErrorBoundary(props: Route.ErrorBoundaryProps) {
  return (
    <div className="space-y-4">
      <Alert variant={"destructive"}>
        <AlertCircle className="size-4" />
        <AlertTitle>Error in this route</AlertTitle>
        <AlertDescription>
          For some reason, after the form is posted and the data is processed, React Router throws an AbortError. I
          can't figure out why, but I know the data is there and the results are good. I'll try to fix this soon.
        </AlertDescription>
        <AlertDescription>
          <pre>{JSON.stringify(props, null, 2)}</pre>
        </AlertDescription>
      </Alert>
    </div>
  );
}
