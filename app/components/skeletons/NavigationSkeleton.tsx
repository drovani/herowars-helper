// ABOUTME: Skeleton placeholder for navigation elements including sidebar and header components
// ABOUTME: Supports menu item placeholders, user menu areas, and breadcrumb navigation sections

import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface NavigationSkeletonProps {
  className?: string;
  type?: "sidebar" | "header" | "breadcrumbs";
  itemCount?: number;
}

export function NavigationSkeleton({
  className,
  type = "sidebar",
  itemCount = 6,
}: NavigationSkeletonProps) {
  if (type === "breadcrumbs") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Skeleton className="h-4 w-12" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-16" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  if (type === "header") {
    return (
      <div className={cn("flex justify-between items-center p-4", className)}>
        <div className="flex items-center gap-4">
          <Skeleton className="size-8" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
    );
  }

  // Sidebar (default)
  return (
    <div className={cn("space-y-2 p-4", className)}>
      {/* User section */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Menu sections */}
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, sectionIndex) => (
          <div key={sectionIndex} className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-1 ml-2">
              {Array.from({ length: Math.ceil(itemCount / 2) }).map(
                (_, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2 p-2">
                    <Skeleton className="size-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="pt-4 border-t space-y-2">
        <div className="flex items-center gap-2 p-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
