import { data } from "react-router";
import { initializeEquipmentBlobs } from "~/lib/initialize-equipment-blobs";
import { initializeHeroBlobs } from "~/lib/initialize-hero-blobs";
import { initializeMissionBlobs } from "~/lib/initialize-mission-blobs";
import type { Route } from "./+types/admin.setup";

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

    const resultE = !data || data === "equipment" ? await initializeEquipmentBlobs(options) : { status: "not loaded" };
    const resultM = !data || data === "missions" ? await initializeMissionBlobs(options) : { status: "not loaded" };
    const resultH = !data || data === "heroes" ? await initializeHeroBlobs(options) : { status: "not loaded" };

    return {
      message: "Equipment blob initialization complete",
      mode,
      results: { equipment: { ...resultE }, mission: { ...resultM }, hero: { ...resultH } },
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
        status: error instanceof Error && error.message.includes("Existing equipment") ? 409 : 500,
      }
    );
  }
}

import { AccordionContent } from "@radix-ui/react-accordion";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { ScrollArea } from "~/components/ui/scroll-area";

export default function AdminSetup({ loaderData }: Route.ComponentProps) {
  const data = loaderData;

  return (
    <>
      {"error" in data ? (
        <div>{data.error}</div>
      ) : (
        <div className="min-w-full">
          <h2>Initialization Results</h2>
          <p>Mode: {data.mode}</p>
          <div className="space-y-8">
            {Object.entries(data.results).map(([type, result]) => (
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
      )}
    </>
  );
}

function StatsCard({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
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
