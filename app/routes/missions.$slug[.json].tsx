import { type UIMatch } from "react-router";
import EquipmentDataService from "~/services/EquipmentDataService";
import MissionRepository from "~/services/MissionRepository";
import type { Route } from "./+types/missions.$slug";

export const meta = ({ data }: Route.MetaArgs) => {
  if (!data) {
    return [{ title: "Mission not found" }];
  }
  return [{ title: `${data.mission.slug}: ${data.mission.name}` }];
};

export const handle = {
  breadcrumb: (match: UIMatch<Route.ComponentProps["loaderData"], unknown>) => [
    {
      href: `/missions#chapter-${match.data.mission.chapter_id}`,
      title: `Chapter ${match.data.mission.chapter_id}: ${match.data.mission.chapter_title}`,
    },
    {
      href: match.pathname,
      title: `Mission ${match.data.mission.level}: ${match.data.mission.name}`,
    },
  ],
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const missionSlug = params.slug;

  if (!missionSlug) {
    throw new Response("Missing mission slug parameter", { status: 400 });
  }

  // Find the mission
  const mission = await MissionRepository.getById(missionSlug);

  if (!mission) {
    throw new Response(`Mission ${missionSlug} not found`, { status: 404 });
  }

  // Get equipment that can be found in this mission
  const allEquipment = await EquipmentDataService.getAll();
  const equipmentInMission = allEquipment.filter((equipment) => equipment.campaign_sources?.includes(missionSlug));

  const [prevMission, nextMission] = await MissionRepository.getPrevNextMission(mission);

  return {
    mission,
    equipmentInMission,
    prevMission,
    nextMission,
  };
};

export default function MissionDetails({ loaderData }: Route.ComponentProps) {
  const { mission, equipmentInMission, prevMission, nextMission } = loaderData;

  return <pre>{JSON.stringify({ mission, equipmentInMission, prevMission, nextMission }, null, 2)}</pre>;
}
