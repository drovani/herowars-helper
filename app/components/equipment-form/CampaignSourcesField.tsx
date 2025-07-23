import { useEffect, useRef, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import ChapterMissions from "~/components/equipment-form/ChapterMissions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Input } from "~/components/ui/input";
import type { EquipmentMutation } from "~/data/equipment.zod";
import { type MissionRecord, groupMissionsByChapter } from "~/data/mission.zod";

interface CampaignSourcesFieldProps {
  form: UseFormReturn<EquipmentMutation>;
  missions: MissionRecord[];
}

export default function CampaignSourcesField({
  form,
  missions,
}: CampaignSourcesFieldProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedMissions = form.watch("campaign_sources") || [];

  // Focus input when accordion opens
  useEffect(() => {
    if (isAccordionOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isAccordionOpen]);

  function pluralize(count: number, singular: string, plural: string) {
    return count === 1 ? singular : plural;
  }

  const selectionDescription =
    selectedMissions.length === 0
      ? "No missions selected"
      : `${selectedMissions.length} ${pluralize(
          selectedMissions.length,
          "mission",
          "missions"
        )} selected`;

  // Filter missions based on search query (both id and name)
  const filteredMissions = missions.filter((mission) => {
    const query = searchQuery.toLowerCase();
    return (
      mission.id.toLowerCase().includes(query) ||
      mission.name.toLowerCase().includes(query)
    );
  });

  // Group filtered missions by chapter
  const missionsByChapter = groupMissionsByChapter(filteredMissions);

  const handleMissionToggle = (missionId: string, checked: boolean) => {
    const currentValue = form.watch("campaign_sources") || [];
    const newValue = checked
      ? [...currentValue, missionId]
      : currentValue.filter((v) => v !== missionId);
    form.setValue("campaign_sources", newValue);
  };

  return (
    <div className="pt-6">
      <Accordion
        type="single"
        collapsible
        onValueChange={(value) =>
          setIsAccordionOpen(value === "campaign-sources")
        }
      >
        <AccordionItem
          value="campaign-sources"
          className="border rounded-md px-4"
        >
          <AccordionTrigger>
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-2 text-base">
                  Campaign Sources
                  <Badge
                    variant="secondary"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {selectionDescription}
                  </Badge>
                </div>
              </HoverCardTrigger>
              <HoverCardContent align="start" className="w-fit" role="tooltip">
                {selectedMissions.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Selected missions:</p>
                    <div className="flex flex-wrap gap-1" role="list">
                      {selectedMissions.map((missionId) => (
                        <Badge
                          key={`selected-${missionId}`}
                          variant="secondary"
                          role="listitem"
                        >
                          {missionId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No missions selected
                  </p>
                )}
              </HoverCardContent>
            </HoverCard>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-0">
            <FormField
              control={form.control}
              name="campaign_sources"
              render={() => (
                <FormItem role="group" aria-label="Campaign mission selection">
                  <FormControl>
                    <div className="space-y-6">
                      <div className="relative">
                        <Input
                          ref={searchInputRef}
                          type="search"
                          placeholder="Search missions by name or ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full"
                          aria-label="Search missions"
                        />
                      </div>
                      {Object.entries(missionsByChapter)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([chapter, chapterMissions]) => (
                          <ChapterMissions
                            key={`chapter-${chapter}`}
                            chapter={chapter}
                            missions={chapterMissions}
                            selectedMissions={selectedMissions}
                            onMissionToggle={handleMissionToggle}
                          />
                        ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
