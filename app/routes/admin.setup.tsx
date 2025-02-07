import { AlertCircle, ArrowRight, CheckCircle2, RefreshCwIcon } from "lucide-react";
import { useMemo } from "react";
import { data, useFetcher } from "react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { EquipmentRecord } from "~/data/equipment.zod";
import equipmentData from "~/data/equipments.json";
import missionData from "~/data/missions.json";
import type { Stats } from "~/data/ReadonlyArrays";
import { initializeHeroBlobs } from "~/lib/initialize-hero-blobs";
import EquipmentRepository, {
  type Equipable,
  type Equipment,
  type Fragment,
  type Recipe,
} from "~/services/EquipmentRepository";
import type { HydrateDataResult } from "~/services/IDataService";
import MissionRepository, { type Mission } from "~/services/MissionRepository";
import type { Route } from "./+types/admin.setup";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const mode = formData.get("mode")?.toString() || "basic";
    const dataset = formData.get("dataset")?.toString();

    // Set initialization options based on mode
    const options = {
      skipExisting: mode !== "force",
      failIfExists: mode === "safe",
      forceUpdate: mode === "force",
    };

    const results: {
      equipment?: HydrateDataResult | { status: string };
      mission?: HydrateDataResult | { status: string };
      hero?: HydrateDataResult | { status: string };
    } = {};

    if (!dataset || dataset === "equipment") {
      const transformedEquipment: Equipment[] = (equipmentData as EquipmentRecord[]).map((item) => {
        if (item.type === "equipable") {
          return {
            slug: item.slug,
            name: item.name,
            quality: item.quality,
            type: item.type,
            buy_value_gold: item.buy_value_gold || undefined,
            buy_value_coin: item.buy_value_coin || undefined,
            sell_value: item.sell_value,
            guild_activity_points: item.guild_activity_points,
            hero_level_required: item.hero_level_required,
            stats: item.stats as {
              [stat in (typeof Stats)[number]]: number;
            },
            campaign_sources: item.campaign_sources,
            crafting_gold_cost: item.crafting?.gold_cost,
            required_items:
              item.crafting?.required_items &&
              Object.entries(item.crafting.required_items).map(([required_slug, quantity]) => ({
                required_slug,
                quantity,
              })),
          } satisfies Equipable;
        } else if (item.type === "recipe") {
          return {
            slug: item.slug,
            name: item.name,
            quality: item.quality,
            type: item.type,
            buy_value_gold: item.buy_value_gold || undefined,
            buy_value_coin: item.buy_value_coin || undefined,
            sell_value: item.sell_value,
            guild_activity_points: item.guild_activity_points,
            crafting_gold_cost: item.crafting?.gold_cost,
            required_items:
              item.crafting?.required_items &&
              Object.entries(item.crafting.required_items).map(([required_slug, quantity]) => ({
                required_slug,
                quantity,
              })),
          } satisfies Recipe;
        } else if (item.type === "fragment") {
          return {
            slug: item.slug,
            name: item.name,
            quality: item.quality,
            type: item.type,
            buy_value_gold: item.buy_value_gold || undefined,
            buy_value_coin: item.buy_value_coin || undefined,
            sell_value: item.sell_value,
            campaign_sources: item.campaign_sources,
            guild_activity_points: item.guild_activity_points,
          } satisfies Fragment;
        } else {
          const _: never = item;
          throw new Error(`Unknown equipment type during admin setup.`);
        }
      });

      results.equipment = await EquipmentRepository.hydrateTableData(transformedEquipment, options);
    } else {
      results.equipment = { status: "Equipment not loaded" };
    }

    if (!dataset || dataset === "missions") {
      missionData satisfies Mission[];

      results.mission = await MissionRepository.hydrateTableData(missionData, options);
    } else {
      results.mission = { status: "not loaded" };
    }

    if (!dataset || dataset === "heroes") {
      results.hero = await initializeHeroBlobs(options);
    } else {
      results.hero = { status: "not loaded" };
    }

    return {
      message: "Equipment blob initialization complete",
      mode,
      results,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Setup failed:", message);

    return data(
      {
        message: "Blob initialization failed",
        error: message,
      },
      {
        status: error instanceof Error && error.message.includes("Existing data conflict.") ? 409 : 500,
      }
    );
  }
}

export default function AdminSetup({ actionData }: Route.ComponentProps) {
  const initdata = useMemo(() => actionData, [actionData]);
  const fetcher = useFetcher();

  if (initdata === undefined) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Initialize Data</CardTitle>
            <CardDescription>Configure initialization settings for equipment, missions, and hero data.</CardDescription>
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
                      <RadioGroupItem value="equipment" id="equipment" />
                      <Label htmlFor="equipment" className="font-normal">
                        Equipment only
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="missions" id="missions" />
                      <Label htmlFor="missions" className="font-normal">
                        Missions only
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
                    <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
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
    return <div>{initdata.error}</div>;
  }

  return (
    <div className="min-w-full">
      <h2>Initialization Results</h2>
      <p>Mode: {initdata.mode}</p>
      <div className="space-y-8">
        {Object.entries(initdata.results).map(([type, result]) => (
          <div key={type} className="space-y-4">
            <h3 className="text-lg font-semibold capitalize">{type} Initialization</h3>
            {"status" in result && result.status === "not loaded" ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Not processed in this run</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatsCard
                    title="Success"
                    value={"success" in result ? result.success : 0}
                    icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
                  />
                  <StatsCard
                    title="Skipped"
                    value={"skipped" in result ? result.skipped : 0}
                    icon={<ArrowRight className="h-4 w-4 text-blue-500" />}
                  />
                  <StatsCard
                    title="Errors"
                    value={"errors" in result ? result.errors : 0}
                    icon={<AlertCircle className="h-4 w-4 text-red-500" />}
                  />
                  <StatsCard title="Total" value={"total" in result ? result.total : 0} />
                </div>
                <Accordion type="single" collapsible className="border rounded-md">
                  <AccordionItem value={`details-${type}`}>
                    <AccordionTrigger className="px-4">Details:</AccordionTrigger>
                    <AccordionContent>
                      <ScrollArea className="h-96 p-4 w-full">
                        {"details" in result &&
                          result.details.map((detail, index) => (
                            <div
                              key={index}
                              className={`${
                                detail.includes("✓")
                                  ? "text-green-600"
                                  : detail.includes("✗")
                                  ? "text-red-600"
                                  : detail.includes("⤍")
                                  ? "text-blue-600"
                                  : "text-slate-600"
                              }`}
                            >
                              {detail}
                            </div>
                          ))}
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-xs border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

export function ErrorBoundary(props: Route.ErrorBoundaryProps) {
  return (
    <div className="space-y-4">
      <Alert variant={"destructive"}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error in this route</AlertTitle>
        <AlertDescription>
          For some reason, after the form is posted and the data is processed, React Router throws an AbortError. I
          can't figure out why, but the data is consistently there and the results are good. I'll try to fix this soon.
        </AlertDescription>
        <AlertDescription>
          <pre>{JSON.stringify(props, null, 2)}</pre>
        </AlertDescription>
      </Alert>
    </div>
  );
}
