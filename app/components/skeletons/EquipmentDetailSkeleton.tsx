// ABOUTME: Skeleton placeholder for equipment detail page with stats and relationship sections
// ABOUTME: Matches equipment detail page layout with header, stats, crafting recipe, and hero relationship sections

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface EquipmentDetailSkeletonProps {
  className?: string;
  showEditButton?: boolean;
}

export function EquipmentDetailSkeleton({ 
  className,
  showEditButton = false
}: EquipmentDetailSkeletonProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Equipment Header Section */}
      <div className="flex items-start gap-6">
        {/* Equipment Image */}
        <div className="size-32 bg-muted rounded">
          <Skeleton className="size-32 rounded" />
        </div>

        {/* Equipment Info */}
        <div className="space-y-4 flex-1">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <Card className="w-full">
        <CardHeader>
          <h3 className="text-lg font-medium">Stats</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crafting Recipe Section */}
      <Card className="w-full">
        <CardHeader>
          <h3 className="text-lg font-medium">Crafting Recipe</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center space-y-1">
                  <Skeleton className="size-16 rounded mx-auto" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                  <Skeleton className="h-4 w-8 mx-auto" />
                </div>
              ))}
            </div>
            <div className="text-2xl text-muted-foreground">=</div>
            <div className="text-center space-y-1">
              <Skeleton className="size-20 rounded mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hero Relationships Section */}
      <Card className="w-full">
        <CardHeader>
          <h3 className="text-lg font-medium">Used by Heroes</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="size-16 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Sources Section */}
      <Card className="w-full">
        <CardHeader>
          <h3 className="text-lg font-medium">Campaign Sources</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded" />
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
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="flex justify-end w-full sm:w-auto">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}