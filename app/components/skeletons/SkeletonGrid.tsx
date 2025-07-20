// ABOUTME: Skeleton placeholder for responsive grid layouts with configurable item count and spacing
// ABOUTME: Matches existing grid layouts used in heroes/equipment pages with proper responsive behavior

import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { SkeletonCard } from "./SkeletonCard";

interface SkeletonGridProps {
  className?: string;
  items?: number;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  itemSize?: "sm" | "md" | "lg";
  showHeaders?: boolean;
  gap?: "sm" | "md" | "lg";
}

export function SkeletonGrid({ 
  className,
  items = 12,
  columns = {
    mobile: 3,
    tablet: 4,
    desktop: 5
  },
  itemSize = "md",
  showHeaders = false,
  gap = "md"
}: SkeletonGridProps) {
  const gapClasses = {
    sm: "gap-1",
    md: "gap-2", 
    lg: "gap-4"
  };

  const gridClasses = cn(
    "grid",
    gapClasses[gap],
    `grid-cols-${columns.mobile}`,
    `md:grid-cols-${columns.tablet}`,
    `lg:grid-cols-${columns.desktop}`,
    className
  );

  return (
    <div className="space-y-4">
      {showHeaders && (
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      )}
      <div className={gridClasses}>
        {Array.from({ length: items }).map((_, index) => (
          <SkeletonCard 
            key={index} 
            size={itemSize}
            showHeader={false}
            showContent={false}
          />
        ))}
      </div>
    </div>
  );
}