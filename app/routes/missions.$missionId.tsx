import { MapIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, type UIMatch } from "react-router";
import { RequireEditor } from "~/components/auth/RequireRole";
import EquipmentImage from "~/components/EquipmentImage";
import { buttonVariants } from "~/components/ui/button";
import { type EquipmentRecord } from "~/data/equipment.zod";
import { generateSlug } from "~/lib/utils";
import EquipmentDataService from "~/services/EquipmentDataService";
import MissionDataService from "~/services/MissionDataService";
import type { Route } from "./+types/missions.$missionId";

export const meta = ({ data }: Route.MetaArgs) => {
  if (!data) {
    return [{ title: "Mission not found" }];
  }
  return [{ title: `${data.mission.id}: ${data.mission.name}` }];
};

export const handle = {
  breadcrumb: (match: UIMatch<Route.ComponentProps["loaderData"], unknown>) => [
    {
      href: `/missions#chapter-${match.data.mission.chapter}`,
      title: `Chapter ${match.data.mission.chapter}: ${match.data.mission.chapter_title}`,
    },
    {
      href: match.pathname,
      title: `Mission ${match.data.mission.mission_number}: ${match.data.mission.name}`,
    },
  ],
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  const missionId = params.missionId;

  if (!missionId) {
    throw new Response("Missing missionId parameter", { status: 400 });
  }

  // Find the mission
  const [missions, mission] = await Promise.all([MissionDataService.getAll(), MissionDataService.getById(missionId)]);

  if (!mission) {
    throw new Response(`Mission ${missionId} not found`, { status: 404 });
  }

  // Get equipment that can be found in this mission
  const allEquipment = await EquipmentDataService.getAll();
  const equipmentInMission = allEquipment.filter((equipment) => equipment.campaign_sources?.includes(missionId));

  // Get previous and next missions for navigation
  const missionIndex = missions.findIndex((m) => m.id === missionId);
  const prevMission = missionIndex > 0 ? missions[missionIndex - 1] : null;
  const nextMission = missionIndex < missions.length - 1 ? missions[missionIndex + 1] : null;

  return {
    mission,
    equipmentInMission,
    prevMission,
    nextMission,
  };
};

export default function MissionDetails({ loaderData }: Route.ComponentProps) {
  const { mission, equipmentInMission, prevMission, nextMission } = loaderData;
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Skip if user is typing in an input or textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          if (prevMission) {
            navigate(`/missions/${prevMission.id}`);
          }
          break;
        case "ArrowRight":
          if (nextMission) {
            navigate(`/missions/${nextMission.id}`);
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, prevMission, nextMission]);
  const getBossImageUrl = (bossName: string) => {
    return `/images/heroes/${generateSlug(bossName)}.png`;
  };

  return (
    <div className="space-y-6">
      {/* Mission Header */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <MapIcon className="h-6 w-6" />
            <h2 className="text-2xl font-bold">
              {mission.chapter}-{mission.mission_number}: {mission.name}
            </h2>
          </div>
          <p className="text-lg text-muted-foreground mt-1">
            Chapter {mission.chapter}: {mission.chapter_title}
          </p>
        </div>

        {mission.boss && (
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto">
              <Link to={`/heroes/${generateSlug(mission.boss)}`} viewTransition>
                <img
                  src={getBossImageUrl(mission.boss)}
                  alt={mission.boss}
                  className="w-full h-full object-cover rounded-lg"
                />
              </Link>
            </div>
            <p className="mt-1 text-sm font-medium">Boss: {mission.boss}</p>
          </div>
        )}
      </div>

      {/* Equipment Found Here */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Equipment Found in This Mission</h3>
        {equipmentInMission.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {equipmentInMission.map((equipment: EquipmentRecord) => (
              <Link
                key={equipment.slug}
                to={`/equipment/${equipment.slug}`}
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
                viewTransition
              >
                <EquipmentImage equipment={equipment} size="md" />
                <span className="text-sm text-center">{equipment.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No equipment found in this mission.</p>
        )}
      </div>

      <RequireEditor>
        <div className="flex gap-4">
          <Link to={`/missions/${mission.id}/edit`} className={buttonVariants({ variant: "default" })} viewTransition>
            Edit
          </Link>
        </div>
      </RequireEditor>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        {prevMission ? (
          <Link to={`/missions/${prevMission.id}`} className={buttonVariants({ variant: "outline" })} viewTransition>
            ← {prevMission.chapter}-{prevMission.mission_number}
          </Link>
        ) : (
          <div />
        )}

        <Link to="/missions" className={buttonVariants({ variant: "secondary" })} viewTransition>
          All Missions
        </Link>

        {nextMission ? (
          <Link to={`/missions/${nextMission.id}`} className={buttonVariants({ variant: "outline" })} viewTransition>
            {nextMission.chapter}-{nextMission.mission_number} →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
