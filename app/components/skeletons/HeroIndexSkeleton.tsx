// ABOUTME: Skeleton placeholder for hero index page with cards and tiles view modes
// ABOUTME: Matches hero grid responsive layout and supports both display modes with proper dimensions

import { Skeleton } from "~/components/ui/skeleton";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { useMemo, memo } from "react";

interface HeroIndexSkeletonProps {
  /** Additional CSS classes to apply to the skeleton container */
  className?: string;
  /** Display mode: "cards" for grid view, "tiles" for detailed table view */
  mode?: "cards" | "tiles";
  /** Number of hero skeletons to display (capped for performance) */
  itemCount?: number;
}

/**
 * Skeleton placeholder for hero index page with cards and tiles view modes.
 * Matches hero grid responsive layout and supports both display modes with proper dimensions.
 *
 * @param props - Configuration options for the hero index skeleton
 * @returns A skeleton layout matching the hero index page structure with accessibility support
 */
export const HeroIndexSkeleton = memo(function HeroIndexSkeleton({
  className,
  mode = "cards",
  itemCount = 15,
}: HeroIndexSkeletonProps) {
  // Cap the item count to prevent performance issues with excessive skeletons
  const cappedItemCount = Math.min(itemCount, 50);
  const tileItemCount = Math.min(cappedItemCount, 10);

  // Memoize the array indices to avoid recreating arrays on each render
  const cardIndices = useMemo(
    () => Array.from({ length: cappedItemCount }, (_, i) => i),
    [cappedItemCount]
  );
  const tileIndices = useMemo(
    () => Array.from({ length: tileItemCount }, (_, i) => i),
    [tileItemCount]
  );
  if (mode === "cards") {
    return (
      <div
        className={cn("space-y-4", className)}
        role="status"
        aria-live="polite"
        aria-label="Loading hero list"
      >
        {/* Search and toggle controls */}
        <div
          className="flex justify-between gap-4"
          aria-label="Loading hero search controls"
        >
          <Skeleton
            className="h-10 w-full max-w-sm"
            aria-label="Loading search input"
          />
          <div
            className="hidden md:flex gap-1"
            aria-label="Loading view mode toggles"
          >
            <Skeleton
              className="h-10 w-10"
              aria-label="Loading cards view toggle"
            />
            <Skeleton
              className="h-10 w-10"
              aria-label="Loading tiles view toggle"
            />
          </div>
        </div>

        {/* Hero cards grid */}
        <div
          className="gap-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          role="grid"
          aria-label={`Loading ${cappedItemCount} heroes`}
        >
          {cardIndices.map((index) => (
            <div
              key={index}
              className="relative group size-28"
              role="gridcell"
              aria-label={`Loading hero ${index + 1}`}
            >
              <Card className="size-28 relative bg-muted animate-pulse rounded-md" />
            </div>
          ))}
        </div>
        <span className="sr-only">Hero list is loading, please wait.</span>
      </div>
    );
  }

  // Tiles mode
  return (
    <div
      className={cn("space-y-4", className)}
      role="status"
      aria-live="polite"
      aria-label="Loading hero tiles"
    >
      {/* Search and toggle controls */}
      <div
        className="flex justify-between gap-4"
        aria-label="Loading hero search controls"
      >
        <Skeleton
          className="h-10 w-full max-w-sm"
          aria-label="Loading search input"
        />
        <div
          className="hidden md:flex gap-1"
          aria-label="Loading view mode toggles"
        >
          <Skeleton
            className="h-10 w-10"
            aria-label="Loading cards view toggle"
          />
          <Skeleton
            className="h-10 w-10"
            aria-label="Loading tiles view toggle"
          />
        </div>
      </div>

      {/* Tiles header */}
      <div
        className="grid grid-cols-5 text-center font-medium sticky"
        role="rowgroup"
        aria-label="Loading table headers"
      >
        <div>Hero</div>
        <div className="bg-muted rounded-t-md">Equipment</div>
        <div>Skins</div>
        <div className="bg-muted rounded-t-md">Artifacts</div>
        <div>Glyphs</div>
      </div>

      {/* Hero tiles */}
      <div
        className="flex flex-col gap-4"
        role="table"
        aria-label={`Loading ${tileItemCount} hero details`}
      >
        {tileIndices.map((index) => (
          <Card
            key={index}
            className="w-full grid grid-cols-2 md:grid-cols-5"
            role="row"
            aria-label={`Loading hero details ${index + 1}`}
          >
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
      <div
        className="flex justify-center gap-2 mt-6"
        aria-label="Loading pagination controls"
      >
        <Skeleton
          className="h-9 w-20"
          aria-label="Loading previous page button"
        />
        <Skeleton className="h-9 w-16" aria-label="Loading page number" />
        <Skeleton className="h-9 w-16" aria-label="Loading next page button" />
      </div>
      <span className="sr-only">Hero tiles are loading, please wait.</span>
    </div>
  );
});
