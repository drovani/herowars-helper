import log from "loglevel";
import { AlertCircle, RefreshCwIcon, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { useMemo } from "react";
import { data, useFetcher } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Badge } from "~/components/ui/badge";
import { formatTitle } from "~/config/site";
import { MissionRepository } from "~/repositories/MissionRepository";
import missionsData from "~/data/missions.json";
import type { Route } from "./+types/setup";

// Helper function to extract unique chapters from missions data
function extractChapters(missions: typeof missionsData) {
  const chaptersMap = new Map<number, string>();
  
  missions.forEach((mission) => {
    if (!chaptersMap.has(mission.chapter)) {
      chaptersMap.set(mission.chapter, mission.chapter_title);
    }
  });
  
  return Array.from(chaptersMap.entries()).map(([id, title]) => ({
    id,
    title,
  }));
}

// Helper function to transform missions to database format
function transformMissions(missions: typeof missionsData) {
  return missions.map((mission) => ({
    slug: mission.id,
    name: mission.name,
    chapter_id: mission.chapter,
    hero_slug: mission.boss || null,
    energy_cost: null, // Not in JSON data
    level: null, // Not in JSON data
  }));
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
      chapters: { created: 0, errors: 0, total: 0, errorDetails: [] },
      missions: { created: 0, errors: 0, total: 0, errorDetails: [] },
      purged: { missions: 0, chapters: 0, errors: 0, errorDetails: [] },
      processingTime: 0,
      mode,
      dataset: dataset || "all",
      purgeRequested: purge,
    };

    // Initialize mission repository
    const missionRepo = new MissionRepository(request);

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
      
      // Future: Add other domain purging here when heroes/equipment datasets are added
    }

    // Load missions data if dataset is empty (all) or "missions"
    if (!dataset || dataset === "missions") {
      log.info("Loading mission data...");
      
      // Extract and create chapters first (foreign key dependency)
      const chaptersToCreate = extractChapters(missionsData);
      results.chapters.total = chaptersToCreate.length;
      log.info(`Creating ${chaptersToCreate.length} chapters...`);
      
      const chapterResult = await missionRepo.bulkCreateChapters(chaptersToCreate);
      if (chapterResult.error && chapterResult.error.code !== "BULK_PARTIAL_FAILURE") {
        throw new Error(`Chapter creation failed: ${chapterResult.error.message}`);
      }
      
      results.chapters.created = chapterResult.data?.length || 0;
      if (chapterResult.error?.code === "BULK_PARTIAL_FAILURE") {
        results.chapters.errors = (chapterResult.error.details as any[])?.length || 0;
        results.chapters.errorDetails = chapterResult.error.details || [];
      }
      
      // Transform and create missions
      const missionsToCreate = transformMissions(missionsData);
      results.missions.total = missionsToCreate.length;
      log.info(`Creating ${missionsToCreate.length} missions...`);
      
      const missionResult = await missionRepo.bulkCreateMissions(missionsToCreate);
      if (missionResult.error && missionResult.error.code !== "BULK_PARTIAL_FAILURE") {
        throw new Error(`Mission creation failed: ${missionResult.error.message}`);
      }
      
      results.missions.created = missionResult.data?.length || 0;
      if (missionResult.error?.code === "BULK_PARTIAL_FAILURE") {
        results.missions.errors = (missionResult.error.details as any[])?.length || 0;
        results.missions.errorDetails = missionResult.error.details || [];
      }
      
      log.info("Mission data loading completed", results);
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

export default function AdminSetup({ actionData }: Route.ComponentProps) {
  const fetcher = useFetcher();
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

  const getStatusIcon = (created: number, errors: number, total: number) => {
    if (errors > 0) {
      return <AlertTriangle className="size-4 text-yellow-500" />;
    }
    if (created === total && total > 0) {
      return <CheckCircle className="size-4 text-green-500" />;
    }
    if (created === 0 && total > 0) {
      return <XCircle className="size-4 text-red-500" />;
    }
    return <CheckCircle className="size-4 text-green-500" />;
  };

  const getStatusBadge = (created: number, errors: number, total: number) => {
    if (errors > 0) {
      return <Badge variant="destructive">Partial Success</Badge>;
    }
    if (created === total && total > 0) {
      return <Badge variant="default">Success</Badge>;
    }
    if (created === 0 && total > 0) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="secondary">No Data</Badge>;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            // Reset fetcher state to show form again
            fetcher.load(window.location.pathname);
          }} 
          variant="secondary"
          className="flex items-center gap-2"
        >
          Back to Setup
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
                  ` | Purged: ${initdata.results.purged.missions} missions, ${initdata.results.purged.chapters} chapters`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Purge Summary */}
                {initdata.results.purgeRequested && initdata.results.purged && 
                  (initdata.results.purged.missions > 0 || initdata.results.purged.chapters > 0) && (
                  <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="size-4 text-orange-500" />
                        Purged Data
                      </h3>
                      <Badge variant="secondary">Domain Purged</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-orange-700">Missions: {initdata.results.purged.missions}</p>
                      <p className="text-orange-700">Chapters: {initdata.results.purged.chapters}</p>
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
                          initdata.results.chapters.total
                        )}
                        Chapters
                      </h3>
                      {getStatusBadge(
                        initdata.results.chapters.created,
                        initdata.results.chapters.errors,
                        initdata.results.chapters.total
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Total: {initdata.results.chapters.total}</p>
                      <p className="text-green-600">Created: {initdata.results.chapters.created}</p>
                      {initdata.results.chapters.errors > 0 && (
                        <p className="text-red-600">Errors: {initdata.results.chapters.errors}</p>
                      )}
                    </div>
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
                          initdata.results.missions.total
                        )}
                        Missions
                      </h3>
                      {getStatusBadge(
                        initdata.results.missions.created,
                        initdata.results.missions.errors,
                        initdata.results.missions.total
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Total: {initdata.results.missions.total}</p>
                      <p className="text-green-600">Created: {initdata.results.missions.created}</p>
                      {initdata.results.missions.errors > 0 && (
                        <p className="text-red-600">Errors: {initdata.results.missions.errors}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error Details */}
          {((initdata.results.chapters?.errors > 0) || (initdata.results.missions?.errors > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-yellow-500" />
                  Error Details
                </CardTitle>
                <CardDescription>
                  Some items failed to process. Review the errors below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {initdata.results.chapters?.errorDetails?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Chapter Errors</h4>
                      <div className="bg-muted rounded-lg p-3">
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {JSON.stringify(initdata.results.chapters.errorDetails, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {initdata.results.missions?.errorDetails?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Mission Errors</h4>
                      <div className="bg-muted rounded-lg p-3">
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {JSON.stringify(initdata.results.missions.errorDetails, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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
