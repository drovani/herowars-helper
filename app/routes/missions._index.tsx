import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Mission } from "@/data/mission.zod";
import { missionDAL } from "@/lib/mission-dal";
import { cn, generateSlug } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { MapIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Route } from "./+types/missions._index";

export const loader = async () => {
    const missions = await missionDAL.getAllMissions();

    // Get unique boss names for the select dropdown
    const uniqueBosses = Array.from(
        new Set(
            missions
                .filter(
                    (m): m is Mission & Required<Pick<Mission, "boss">> =>
                        !!m.boss
                )
                .map((m) => m.boss)
        )
    ).sort();

    // Group missions by chapter for organized display
    const missionsByChapter = missions.reduce((acc, mission) => {
        if (!acc[mission.chapter]) {
            acc[mission.chapter] = {
                title: mission.chapter_title,
                missions: [],
            };
        }
        acc[mission.chapter].missions.push(mission);
        return acc;
    }, {} as Record<number, { title: string; missions: Mission[] }>);

    return { missionsByChapter, uniqueBosses };
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

export default function MissionsIndex({ loaderData }: Route.ComponentProps) {
    const { missionsByChapter, uniqueBosses } = loaderData;
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBoss, setSelectedBoss] = useState<string | null>(null);

    const getBossImageUrl = (bossName: string) => {
        return `/images/heroes/${generateSlug(bossName)}.webp`;
    };

    // Filter missions based on search criteria
    const filteredMissionsByChapter = useMemo(() => {
        const lowercaseQuery = searchQuery.toLowerCase();

        return Object.entries(missionsByChapter).reduce(
            (acc, [chapter, data]) => {
                const chapterNum = Number(chapter);
                const filteredMissions = data.missions.filter((mission) => {
                    const missionNumber = `${mission.chapter}-${mission.mission_number}`;
                    const matchesSearch =
                        missionNumber.toLowerCase().includes(lowercaseQuery) ||
                        mission.name.toLowerCase().includes(lowercaseQuery);

                    const matchesBoss =
                        !selectedBoss || mission.boss === selectedBoss;

                    return matchesSearch && matchesBoss;
                });

                if (filteredMissions.length > 0) {
                    acc[chapterNum] = {
                        title: data.title,
                        missions: filteredMissions,
                    };
                }

                return acc;
            },
            {} as Record<number, { title: string; missions: Mission[] }>
        );
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
                                    <SelectItem key={boss} value={boss}>
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
                        <div key={chapter} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <MapIcon className="h-6 w-6" />
                                <h2 className="text-2xl font-bold">
                                    Chapter {chapter}: {title}
                                </h2>
                            </div>
                            <div className="gap-2 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {missions.map((mission) => (
                                    <Link
                                        to={`/missions/${mission.id}`}
                                        key={mission.id}
                                    >
                                        <Card className="h-28 w-28 relative hover:scale-110 transition-all duration-500 overflow-hidden">
                                            {mission.boss && (
                                                <div className="absolute inset-0">
                                                    <img
                                                        src={getBossImageUrl(
                                                            mission.boss
                                                        )}
                                                        alt={mission.boss}
                                                        className="object-cover w-full h-full opacity-50"
                                                    />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span
                                                    className={cn(
                                                        "text-2xl font-bold",
                                                        mission.boss
                                                            ? "text-foreground"
                                                            : "text-muted-foreground"
                                                    )}
                                                >
                                                    {mission.chapter}-
                                                    {mission.mission_number}
                                                </span>
                                            </div>
                                            <CardHeader
                                                className={cn(
                                                    cardVariants({
                                                        variant: mission.boss
                                                            ? "boss"
                                                            : "default",
                                                    })
                                                )}
                                            >
                                                <CardTitle className="text-sm truncate">
                                                    {mission.name}
                                                    {mission.boss && (
                                                        <span className="block text-xs opacity-75">
                                                            {mission.boss}
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
