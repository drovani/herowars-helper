import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { type MissionRecord } from "~/data/mission.zod";

interface ChapterMissionsProps {
  chapter: string;
  missions: MissionRecord[];
  selectedMissions: string[];
  onMissionToggle: (missionId: string, checked: boolean) => void;
}

export default function ChapterMissions({
  chapter,
  missions,
  selectedMissions,
  onMissionToggle,
}: ChapterMissionsProps) {
  const chapterNumber = parseInt(chapter);

  return (
    <div
      key={`chapter-${chapterNumber}`}
      className="space-y-2"
      role="group"
      aria-label={`Chapter ${chapter} missions`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h4 id={`chapter-${chapter}-heading`} className="font-medium text-base">
          Chapter {chapter}: {missions[0]?.chapter_title || ""}
        </h4>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
        role="group"
        aria-labelledby={`chapter-${chapter}-heading`}
      >
        {missions
          .sort((a, b) => a.mission_number - b.mission_number)
          .map((mission) => {
            const missionKey = `${mission.chapter}-${mission.mission_number}`;
            return (
              <div
                key={missionKey}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent"
              >
                <Checkbox
                  id={`mission-${missionKey}`}
                  checked={selectedMissions.includes(mission.id)}
                  onCheckedChange={(checked) =>
                    onMissionToggle(mission.id, !!checked)
                  }
                  aria-describedby={`mission-desc-${missionKey}`}
                />
                <Label
                  htmlFor={`mission-${missionKey}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  <span className="font-medium">{mission.id}</span>
                  <span
                    id={`mission-desc-${missionKey}`}
                    className="ml-2 text-muted-foreground"
                  >
                    {mission.name}
                    {mission.boss && ` (${mission.boss})`}
                  </span>
                </Label>
              </div>
            );
          })}
      </div>
    </div>
  );
}
