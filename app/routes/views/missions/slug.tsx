import { MapIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, type UIMatch } from "react-router";
import { RequireEditor } from "~/components/auth/RequireRole";
import EquipmentImage from "~/components/EquipmentImage";
import { buttonVariants } from "~/components/ui/button";
import { type EquipmentRecord } from "~/data/equipment.zod";
import { generateSlug, getHeroImageUrl } from "~/lib/utils";
import { MissionRepository } from "~/repositories/MissionRepository";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import type { Route } from "./+types/slug";

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
      title: `Chapter ${match.data.mission.chapter_id}: ${match.data.chapterTitle}`,
    },
    {
      href: match.pathname,
      title: `Mission ${match.data.mission.slug}: ${match.data.mission.name}`,
    },
  ],
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const slug = params.slug;

  if (!slug) {
    throw new Response("Missing slug parameter", { status: 400 });
  }

  const missionRepo = new MissionRepository(request);

  // Find the mission
  const [missionsResult, missionResult] = await Promise.all([
    missionRepo.findAll({ orderBy: { column: "slug", ascending: true } }),
    missionRepo.findById(slug),
  ]);

  if (missionsResult.error) {
    throw new Response("Failed to load missions", { status: 500 });
  }

  if (missionResult.error) {
    throw new Response("Failed to load mission", { status: 500 });
  }

  const missions = missionsResult.data || [];
  const mission = missionResult.data;

  if (!mission) {
    throw new Response(`Mission ${slug} not found`, { status: 404 });
  }

  // Get chapter title
  const chapterResult = await missionRepo.findChapterById(mission.chapter_id);
  const chapterTitle =
    chapterResult.data?.title || `Chapter ${mission.chapter_id}`;

  // Get equipment that can be found in this mission
  const equipmentRepo = new EquipmentRepository(request);
  const allEquipmentResult = await equipmentRepo.getAllAsJson();

  if (allEquipmentResult.error) {
    throw new Response("Failed to load equipment for mission", { status: 500 });
  }

  const equipmentInMission =
    allEquipmentResult.data?.filter((eq) =>
      eq.campaign_sources?.includes(slug)
    ) || [];

  // Get previous and next missions for navigation
  const missionIndex = missions.findIndex((m) => m.slug === slug);
  const prevMission = missionIndex > 0 ? missions[missionIndex - 1] : null;
  const nextMission =
    missionIndex < missions.length - 1 ? missions[missionIndex + 1] : null;

  return {
    mission,
    chapterTitle,
    equipmentInMission,
    prevMission,
    nextMission,
  };
};

export default function MissionDetails({ loaderData }: Route.ComponentProps) {
  const {
    mission,
    chapterTitle,
    equipmentInMission,
    prevMission,
    nextMission,
  } = loaderData;
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Skip if user is typing in an input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          if (prevMission) {
            navigate(`/missions/${prevMission.slug}`);
          }
          break;
        case "ArrowRight":
          if (nextMission) {
            navigate(`/missions/${nextMission.slug}`);
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, prevMission, nextMission]);

  return (
    <div className="space-y-6">
      {/* Mission Header */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <MapIcon className="h-6 w-6" />
            <h2 className="text-2xl font-bold">
              {mission.slug}: {mission.name}
            </h2>
          </div>
          <p className="text-lg text-muted-foreground mt-1">
            Chapter {mission.chapter_id}: {chapterTitle}
          </p>
        </div>

        {mission.hero_slug && (
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto">
              <Link
                to={`/heroes/${generateSlug(mission.hero_slug)}`}
                viewTransition
              >
                <img
                  src={getHeroImageUrl(mission.hero_slug)}
                  alt={mission.hero_slug}
                  className="w-full h-full object-cover rounded-lg"
                />
              </Link>
            </div>
            <p className="mt-1 text-sm font-medium capitalize">
              Boss: {mission.hero_slug}
            </p>
          </div>
        )}
      </div>

      {/* Equipment Found Here */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          Equipment Found in This Mission
        </h3>
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
          <p className="text-muted-foreground">
            No equipment found in this mission.
          </p>
        )}
      </div>

      <RequireEditor>
        <div className="flex gap-4">
          <Link
            to={`/missions/${mission.slug}/edit`}
            className={buttonVariants({ variant: "default" })}
            viewTransition
          >
            Edit
          </Link>
        </div>
      </RequireEditor>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        {prevMission ? (
          <Link
            to={`/missions/${prevMission.slug}`}
            className={buttonVariants({ variant: "outline" })}
            viewTransition
          >
            ← {prevMission.slug}
          </Link>
        ) : (
          <div />
        )}

        <Link
          to="/missions"
          className={buttonVariants({ variant: "secondary" })}
          viewTransition
        >
          All Missions
        </Link>

        {nextMission ? (
          <Link
            to={`/missions/${nextMission.slug}`}
            className={buttonVariants({ variant: "outline" })}
            viewTransition
          >
            {nextMission.slug} →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
