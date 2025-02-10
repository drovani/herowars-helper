import { MapIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, type UIMatch } from "react-router";
import EquipmentImage from "~/components/EquipmentImage";
import { buttonVariants } from "~/components/ui/button";
import { type EquipmentRecord } from "~/data/equipment.zod";
import { generateSlug } from "~/lib/utils";
import EquipmentRepository from "~/services/EquipmentRepository";
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
  const equipmentInMission = await EquipmentRepository.getAllForMission(mission.slug);

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
            navigate(`/missions/${prevMission}`);
          }
          break;
        case "ArrowRight":
          if (nextMission) {
            navigate(`/missions/${nextMission}`);
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
              {mission.chapter_id}-{mission.level}: {mission.name}
            </h2>
          </div>
          <div className="text-lg text-muted-foreground mt-1">
            Chapter {mission.chapter_id}: {mission.chapter_title}
          </div>
          <div className="flex" title={`${mission.energy_cost || "Unknown"} energy per battle/raid`}>
            <img src="/images/energy.png" alt="" role="presentation" className="size-6" />
            {mission.energy_cost || "!!"}
          </div>
        </div>

        {mission.hero_slug && (
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto">
              <Link to={`/heroes/${mission.hero_slug}`} viewTransition>
                <img
                  src={getBossImageUrl(mission.hero_slug)}
                  alt={mission.hero_slug}
                  className="w-full h-full object-cover rounded-lg"
                />
              </Link>
            </div>
            <p className="mt-1 text-sm font-medium">Boss: {mission.hero_slug}</p>
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

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        {prevMission ? (
          <Link to={`/missions/${prevMission.slug}`} className={buttonVariants({ variant: "outline" })} viewTransition>
            ← {prevMission.chapter_id}-{prevMission.level}
          </Link>
        ) : (
          <div />
        )}

        <Link to="/missions" className={buttonVariants({ variant: "secondary" })} viewTransition>
          All Missions
        </Link>

        {nextMission ? (
          <Link to={`/missions/${nextMission.slug}`} className={buttonVariants({ variant: "outline" })} viewTransition>
            {nextMission.chapter_id}-{nextMission.level} →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
