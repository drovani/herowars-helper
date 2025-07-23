import { cva } from "class-variance-authority";
import { MapIcon, SearchIcon } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { Await, Link } from "react-router";
import { MissionIndexSkeleton } from "~/components/skeletons/MissionIndexSkeleton";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn, getHeroImageUrl } from "~/lib/utils";
import {
  MissionRepository,
  type Mission,
} from "~/repositories/MissionRepository";
import type { Route } from "./+types/index";

async function loadMissionsData(request: Request) {
  const missionRepo = new MissionRepository(request);
  const missionsResult = await missionRepo.findAll({
    orderBy: [
      { column: "chapter_id", ascending: true },
      { column: "level", ascending: true },
    ],
  });

  if (missionsResult.error) {
    throw new Response("Failed to load missions", { status: 500 });
  }

  const missions = missionsResult.data || [];

  // Get chapters to map chapter_id to title
  const chaptersResult = await missionRepo.findAllChapters();
  if (chaptersResult.error) {
    throw new Response("Failed to load chapters", { status: 500 });
  }

  const chapters = chaptersResult.data || [];
  const chapterMap = new Map(chapters.map((c) => [c.id, c.title]));

  // Get unique boss names for the select dropdown
  const uniqueBosses = Array.from(
    new Set(
      missions
        .filter(
          (m): m is Mission & Required<Pick<Mission, "hero_slug">> =>
            !!m.hero_slug
        )
        .map((m) => m.hero_slug!)
    )
  ).sort();

  // Group missions by chapter for organized display
  const missionsByChapter = missions.reduce((acc, mission) => {
    if (!acc[mission.chapter_id]) {
      acc[mission.chapter_id] = {
        title:
          chapterMap.get(mission.chapter_id) || `Chapter ${mission.chapter_id}`,
        missions: [],
      };
    }
    acc[mission.chapter_id].missions.push(mission);
    return acc;
  }, {} as Record<number, { title: string; missions: Mission[] }>);

  return { missionsByChapter, uniqueBosses };
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  return {
    missionsData: loadMissionsData(request),
  };
};

const cardVariants = cva("p-1 bottom-0 absolute w-full text-center", {
  variants: {
    variant: {
      default: "bg-white/80",
      boss: "bg-orange-300/80",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function MissionsContent({
  missionsByChapter,
  uniqueBosses,
}: {
  missionsByChapter: Record<number, { title: string; missions: Mission[] }>;
  uniqueBosses: string[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBoss, setSelectedBoss] = useState<string | null>(null);

  // Filter missions based on search criteria
  const filteredMissionsByChapter = useMemo(() => {
    const lowercaseQuery = searchQuery.toLowerCase();

    return Object.entries(missionsByChapter).reduce((acc, [chapter, data]) => {
      const chapterNum = Number(chapter);
      const filteredMissions = data.missions.filter((mission) => {
        const matchesSearch =
          mission.slug.toLowerCase().includes(lowercaseQuery) ||
          mission.name.toLowerCase().includes(lowercaseQuery);

        const matchesBoss = !selectedBoss || mission.hero_slug === selectedBoss;

        return matchesSearch && matchesBoss;
      });

      if (filteredMissions.length > 0) {
        acc[chapterNum] = {
          title: data.title,
          missions: filteredMissions,
        };
      }

      return acc;
    }, {} as Record<number, { title: string; missions: Mission[] }>);
  }, [missionsByChapter, searchQuery, selectedBoss]);

  return (
    <div className="space-y-8">
      {/* Search Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by mission number or name..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full sm:w-[200px]">
          <Select
            value={selectedBoss || "all"}
            onValueChange={(value) =>
              setSelectedBoss(value === "all" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Hero skin" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Heroes</SelectItem>
                {uniqueBosses.map((boss) => (
                  <SelectItem key={boss} value={boss} className="capitalize">
                    {boss}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {Object.entries(filteredMissionsByChapter).length > 0 ? (
        Object.entries(filteredMissionsByChapter).map(
          ([chapter, { title, missions }]) => (
            <div key={chapter} className="space-y-4" id={`chapter-${chapter}`}>
              <div className="flex items-center gap-2">
                <MapIcon className="h-6 w-6" />
                <h2 className="text-2xl font-bold">
                  Chapter {chapter}: {title}
                </h2>
              </div>
              <div className="gap-2 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {missions.map((mission) => (
                  <Link
                    to={`/missions/${mission.slug}`}
                    key={mission.slug}
                    viewTransition
                  >
                    <Card className="h-28 w-28 relative hover:scale-110 transition-all duration-500 overflow-hidden">
                      {mission.hero_slug && (
                        <div className="absolute inset-0">
                          <img
                            src={getHeroImageUrl(mission.hero_slug)}
                            alt={mission.hero_slug}
                            className="object-cover w-full h-full opacity-50"
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={cn(
                            "text-2xl font-bold",
                            mission.hero_slug
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {mission.slug}
                        </span>
                      </div>
                      <CardHeader
                        className={cn(
                          cardVariants({
                            variant: mission.hero_slug ? "boss" : "default",
                          })
                        )}
                      >
                        <CardTitle className="text-sm truncate">
                          {mission.name}
                          {mission.hero_slug && (
                            <span className="block text-xs opacity-75 capitalize">
                              {mission.hero_slug}
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )
        )
      ) : (
        <div className="text-center text-muted-foreground py-8">
          No missions found matching your search criteria
        </div>
      )}
    </div>
  );
}

export default function MissionsIndex({ loaderData }: Route.ComponentProps) {
  return (
    <Suspense fallback={<MissionIndexSkeleton />}>
      <Await resolve={loaderData?.missionsData}>
        {(data: {
          missionsByChapter: Record<
            number,
            { title: string; missions: Mission[] }
          >;
          uniqueBosses: string[];
        }) => (
          <MissionsContent
            missionsByChapter={data.missionsByChapter}
            uniqueBosses={data.uniqueBosses}
          />
        )}
      </Await>
    </Suspense>
  );
}
