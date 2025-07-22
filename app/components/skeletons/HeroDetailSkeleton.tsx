// ABOUTME: Skeleton placeholder for hero detail page with comprehensive layout including profile and sections
// ABOUTME: Matches hero detail page structure with image, stats, artifacts, equipment, skills, and navigation sections

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { useMemo } from "react";

interface HeroDetailSkeletonProps {
  className?: string;
  showAddButton?: boolean;
  showEditButton?: boolean;
}

export function HeroDetailSkeleton({ 
  className,
  showAddButton = false,
  showEditButton = false
}: HeroDetailSkeletonProps) {
  // Static grid column mapping to ensure Tailwind CSS classes exist
  const getGridColsClass = (cols: number) => {
    const colsMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
      7: "grid-cols-7",
      8: "grid-cols-8"
    };
    return colsMap[cols] || "grid-cols-6";
  };

  // Memoize arrays for different section sizes to avoid recreation
  const sectionArrays = useMemo(() => ({
    3: Array.from({ length: 3 }, (_, i) => i),
    4: Array.from({ length: 4 }, (_, i) => i), 
    5: Array.from({ length: 5 }, (_, i) => i),
    6: Array.from({ length: 6 }, (_, i) => i)
  }), []);

  const renderSection = (title: string, gridCols: number = 6) => {
    const indices = sectionArrays[gridCols as keyof typeof sectionArrays] || sectionArrays[6];
    
    return (
      <Card className="w-full">
        <CardHeader>
          <h3 className="text-lg font-medium">{title}</h3>
        </CardHeader>
        <CardContent>
          <div className={cn("grid gap-2", getGridColsClass(gridCols))}>
            {indices.map((i) => (
              <Skeleton key={i} className="size-16 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Hero Header Section */}
      <div className="flex items-start gap-6">
        {/* Hero Image */}
        <div className="size-32 bg-muted rounded">
          <Skeleton className="size-32 rounded" />
        </div>

        {/* Hero Info */}
        <div className="space-y-4 flex-1">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <div className="flex gap-2">
              <div className="capitalize flex gap-1 items-center">
                <Skeleton className="size-6 rounded" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-sm space-y-2">
              <Skeleton className="h-4 w-16" />
              <div className="font-semibold capitalize flex gap-1 items-center">
                <Skeleton className="size-6 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="text-sm space-y-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Add to Collection Button */}
        {showAddButton && (
          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        )}
      </div>

      {/* Equipment Section */}
      {renderSection("Equipment", 6)}

      {/* Skins Section */}
      {renderSection("Skins", 4)}

      {/* Artifacts Section */}
      {renderSection("Artifacts", 3)}

      {/* Glyphs Section */}
      {renderSection("Glyphs", 5)}

      {/* Stone Sources Section */}
      <Card className="w-full">
        <CardHeader>
          <h3 className="text-lg font-medium">Stone Sources</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {sectionArrays[6].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Button Section */}
      {showEditButton && (
        <div className="flex gap-4">
          <Skeleton className="h-10 w-16" />
        </div>
      )}

      {/* Navigation Section */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 w-full">
        <div className="flex justify-start w-full sm:w-auto">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex justify-center w-full sm:w-auto">
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex justify-end w-full sm:w-auto">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}