// ABOUTME: Skeleton placeholder for responsive grid layouts with configurable item count and spacing
// ABOUTME: Matches existing grid layouts used in heroes/equipment pages with proper responsive behavior

import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { SkeletonCard } from "./SkeletonCard";
import { useMemo, memo } from "react";

interface SkeletonGridProps {
  /** Additional CSS classes to apply to the grid container */
  className?: string;
  /** Number of skeleton items to display (capped at 100 for performance) */
  items?: number;
  /** Responsive column configuration for different screen sizes */
  columns?: {
    /** Number of columns on mobile devices */
    mobile?: number;
    /** Number of columns on tablet devices */
    tablet?: number;
    /** Number of columns on desktop devices */
    desktop?: number;
  };
  /** Size of individual skeleton items */
  itemSize?: "sm" | "md" | "lg";
  /** Whether to show header controls (search, buttons) above the grid */
  showHeaders?: boolean;
  /** Gap size between grid items */
  gap?: "sm" | "md" | "lg";
}

/**
 * Skeleton placeholder for responsive grid layouts with configurable item count and spacing.
 * Matches existing grid layouts used in heroes/equipment pages with proper responsive behavior.
 *
 * @param props - Configuration options for the skeleton grid
 * @returns A responsive skeleton grid with proper accessibility and loading announcements
 */
export const SkeletonGrid = memo(function SkeletonGrid({
  className,
  items = 12,
  columns = {
    mobile: 3,
    tablet: 4,
    desktop: 5,
  },
  itemSize = "md",
  showHeaders = false,
  gap = "md",
}: SkeletonGridProps) {
  // Cap items to prevent performance issues and memoize the indices
  const cappedItems = Math.min(items, 100);
  const itemIndices = useMemo(
    () => Array.from({ length: cappedItems }, (_, i) => i),
    [cappedItems]
  );
  const gapClasses = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-4",
  };

  // Static grid column mappings to ensure Tailwind CSS classes exist
  const getGridCols = (cols: number) => {
    const colsMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      7: "grid-cols-7",
      8: "grid-cols-8",
    };
    return colsMap[cols] || "grid-cols-3";
  };

  const getMdGridCols = (cols: number) => {
    const colsMap: Record<number, string> = {
      1: "md:grid-cols-1",
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
      5: "md:grid-cols-5",
      6: "md:grid-cols-6",
      7: "md:grid-cols-7",
      8: "md:grid-cols-8",
    };
    return colsMap[cols] || "md:grid-cols-4";
  };

  const getLgGridCols = (cols: number) => {
    const colsMap: Record<number, string> = {
      1: "lg:grid-cols-1",
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
      6: "lg:grid-cols-6",
      7: "lg:grid-cols-7",
      8: "lg:grid-cols-8",
    };
    return colsMap[cols] || "lg:grid-cols-5";
  };

  const gridClasses = cn(
    "grid",
    gapClasses[gap],
    getGridCols(columns.mobile || 3),
    getMdGridCols(columns.tablet || 4),
    getLgGridCols(columns.desktop || 5),
    className
  );

  return (
    <div
      className="space-y-4"
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      {showHeaders && (
        <div
          className="flex justify-between items-center"
          aria-label="Loading search controls"
        >
          <Skeleton className="h-8 w-48" aria-label="Loading search input" />
          <div className="flex gap-2" aria-label="Loading action buttons">
            <Skeleton className="h-10 w-32" aria-label="Loading button" />
            <Skeleton className="h-10 w-24" aria-label="Loading button" />
          </div>
        </div>
      )}
      <div
        className={gridClasses}
        role="grid"
        aria-label={`Loading ${cappedItems} items`}
      >
        {itemIndices.map((index) => (
          <SkeletonCard
            key={index}
            size={itemSize}
            showHeader={false}
            showContent={false}
          />
        ))}
      </div>
      <span className="sr-only">Content is loading, please wait.</span>
    </div>
  );
});
