// ABOUTME: Skeleton placeholder for equipment index page with equipment card grid layout
// ABOUTME: Matches equipment card dimensions and responsive grid behavior with quality color placeholders

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface EquipmentIndexSkeletonProps {
  className?: string;
  itemCount?: number;
  showAddButton?: boolean;
}

export function EquipmentIndexSkeleton({ 
  className,
  itemCount = 20,
  showAddButton = false
}: EquipmentIndexSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Add button section */}
      {showAddButton && (
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
      )}

      {/* Equipment grid */}
      <div className="gap-2 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: itemCount }).map((_, index) => (
          <Card
            key={index}
            className="bg-muted h-28 w-28 relative bg-center hover:scale-110 transition-all duration-500 animate-pulse"
          >
            <CardHeader className="p-1 bottom-0 absolute w-full text-center bg-white/80">
              <Skeleton className="h-4 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}