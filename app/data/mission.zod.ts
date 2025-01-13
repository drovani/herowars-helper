import { z } from "zod";

export const MissionMutationSchema = z
  .object({
    chapter: z.number().int("Chapter must be an integer").positive("Chapter must be positive"),
    chapter_title: z.string().min(1, "Chapter title cannot be empty"),
    mission_number: z.number().int("Mission number must be an integer").positive("Mission number must be positive"),
    name: z.string().min(1, "Mission name cannot be empty"),
    boss: z.string().min(1, "Boss name cannot be empty").optional(),
  })
  .transform((mutation) => {
    return {
      ...mutation,
      id: `${mutation.chapter}-${mutation.mission_number}`,
      updatedOn: new Date().toISOString(),
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
