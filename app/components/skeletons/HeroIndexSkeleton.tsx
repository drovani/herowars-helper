// ABOUTME: Skeleton placeholder for hero index page with cards and tiles view modes
// ABOUTME: Matches hero grid responsive layout and supports both display modes with proper dimensions

import { Skeleton } from "~/components/ui/skeleton";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface HeroIndexSkeletonProps {
  className?: string;
  mode?: "cards" | "tiles";
  itemCount?: number;
}

export function HeroIndexSkeleton({ 
  className,
  mode = "cards",
  itemCount = 15
}: HeroIndexSkeletonProps) {
  if (mode === "cards") {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Search and toggle controls */}
        <div className="flex justify-between gap-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="hidden md:flex gap-1">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        {/* Hero cards grid */}
        <div className="gap-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div key={index} className="relative group size-28">
              <Card className="size-28 relative bg-muted animate-pulse rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Tiles mode
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and toggle controls */}
      <div className="flex justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="hidden md:flex gap-1">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Tiles header */}
      <div className="grid grid-cols-5 text-center font-medium sticky">
        <div>Hero</div>
        <div className="bg-muted rounded-t-md">Equipment</div>
        <div>Skins</div>
        <div className="bg-muted rounded-t-md">Artifacts</div>
        <div>Glyphs</div>
      </div>

      {/* Hero tiles */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: Math.min(itemCount, 10) }).map((_, index) => (
          <Card key={index} className="w-full grid grid-cols-2 md:grid-cols-5">
            {/* Hero column */}
            <div className="flex flex-col items-start p-2">
              <Skeleton className="size-28 rounded-md" />
              <div className="flex flex-col items-start mt-2 space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>

            {/* Equipment column */}
            <div className="bg-muted p-2 space-y-2">
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="size-8 rounded" />
                ))}
              </div>
            </div>

            {/* Skins column */}
            <div className="p-2 space-y-2">
              <div className="grid grid-cols-2 gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="size-8 rounded" />
                ))}
              </div>
            </div>

            {/* Artifacts column */}
            <div className="bg-muted p-2 space-y-2">
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="size-8 rounded" />
                ))}
              </div>
            </div>

            {/* Glyphs column */}
            <div className="p-2 space-y-2">
              <div className="grid grid-cols-2 gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="size-6 rounded" />
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination controls for tiles mode */}
      <div className="flex justify-center gap-2 mt-6">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
  );
}