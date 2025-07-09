import { z } from "zod";

// Schema for the missions.json structure
export const ChapterSchema = z.object({
  id: z.number().int("Chapter id must be an integer").positive("Chapter id must be positive"),
  title: z.string().min(1, "Chapter title cannot be empty"),
});

export const MissionDataSchema = z.object({
  slug: z.string().regex(/^[0-9]+-[0-9]+$/, "Mission slug must be in format 'chapter-level'"),
  name: z.string().min(1, "Mission name cannot be empty"),
  hero_slug: z.string().min(1, "Hero slug cannot be empty").optional(),
  energy_cost: z.number().int("Energy cost must be an integer").positive("Energy cost must be positive"),
});

export const ChaptersMissionsDataSchema = z.object({
  chapters: z.array(ChapterSchema).min(1, "Must have at least one chapter"),
  missions: z.array(MissionDataSchema).min(1, "Must have at least one mission"),
});

export type Chapter = z.infer<typeof ChapterSchema>;
export type MissionData = z.infer<typeof MissionDataSchema>;
export type ChaptersMissionsData = z.infer<typeof ChaptersMissionsDataSchema>;

export const MissionMutationSchema = z
  .object({
    chapter: z.number().int("Chapter must be an integer").positive("Chapter must be positive"),
    chapter_title: z.string().min(1, "Chapter title cannot be empty"),
    mission_number: z.number().int("Mission number must be an integer").positive("Mission number must be positive"),
    name: z.string().min(1, "Mission name cannot be empty"),
    boss: z.string().optional().transform((val) => val === "" ? undefined : val),
  })
  .transform((mutation) => {
    return {
      ...mutation,
      // Explicitly include boss field even if undefined to ensure it gets copied
      boss: mutation.boss,
      id: `${mutation.chapter}-${mutation.mission_number}`,
      updated_on: new Date().toISOString(),
    };
  });

export type MissionMutation = z.input<typeof MissionMutationSchema>;
export type MissionRecord = z.infer<typeof MissionMutationSchema>;

export function getChapterFromMission(missionId: string): number {
  const [chapter] = missionId.split("-").map(Number);
  return chapter;
}

export function groupMissionsByChapter(missions: MissionRecord[]) {
  return missions.reduce((acc, mission) => {
    const chapter = mission.chapter;
    if (!acc[chapter]) {
      acc[chapter] = [];
    }
    acc[chapter].push(mission);
    return acc;
  }, {} as Record<number, MissionRecord[]>);
}
