// ABOUTME: Skeleton placeholder for mission index page with chapter sections and mission cards
// ABOUTME: Supports chapter organization with search filters and mission grid layouts including boss placeholders

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface MissionIndexSkeletonProps {
  className?: string;
  chapterCount?: number;
  missionsPerChapter?: number;
}

export function MissionIndexSkeleton({
  className,
  chapterCount = 3,
  missionsPerChapter = 12,
}: MissionIndexSkeletonProps) {
  const renderChapterSection = (chapterIndex: number) => (
    <div key={chapterIndex} className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="size-6" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="gap-2 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: missionsPerChapter }).map((_, missionIndex) => (
          <Card
            key={missionIndex}
            className="h-28 w-28 relative hover:scale-110 transition-all duration-500 overflow-hidden animate-pulse"
          >
            {/* Boss background placeholder - first and last missions */}
            {(missionIndex === 0 ||
              missionIndex === missionsPerChapter - 1) && (
              <div className="absolute inset-0 bg-muted opacity-50" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-6 w-12" />
            </div>
            <CardHeader
              className={cn(
                "p-1 bottom-0 absolute w-full text-center",
                missionIndex === 0 || missionIndex === missionsPerChapter - 1
                  ? "bg-orange-300/80"
                  : "bg-white/80"
              )}
            >
              <CardTitle className="text-sm">
                <Skeleton className="h-3 w-full" />
                {(missionIndex === 0 ||
                  missionIndex === missionsPerChapter - 1) && (
                  <Skeleton className="h-2 w-3/4 mt-1" />
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-8", className)}>
      {/* Search Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Skeleton className="absolute left-2.5 top-2.5 h-4 w-4" />
            <Skeleton className="h-10 w-full pl-8" />
          </div>
        </div>
        <div className="w-full sm:w-[200px]">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Chapter sections */}
      <div className="space-y-8">
        {Array.from({ length: chapterCount }).map((_, chapterIndex) =>
          renderChapterSection(chapterIndex)
        )}
      </div>
    </div>
  );
}
