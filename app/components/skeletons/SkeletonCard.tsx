// ABOUTME: Skeleton placeholder for card-based content with configurable dimensions and layout options
// ABOUTME: Provides consistent skeleton loading experience that matches shadcn/ui Card component structure

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface SkeletonCardProps {
  /** Additional CSS classes to apply to the card */
  className?: string;
  /** Card size - determines overall dimensions */
  size?: "sm" | "md" | "lg";
  /** Whether to show the header section with skeleton placeholder */
  showHeader?: boolean;
  /** Whether to show the content section with skeleton lines */
  showContent?: boolean;
  /** Height class for the header skeleton (e.g., "h-4", "h-6") */
  headerHeight?: string;
  /** Number of skeleton lines to show in content area */
  contentLines?: number;
}

/**
 * Skeleton placeholder for card-based content with configurable dimensions and layout options.
 * Provides consistent loading experience that matches shadcn/ui Card component structure.
 *
 * @param props - Configuration options for the skeleton card
 * @returns A skeleton card component matching the expected final content layout
 */
export function SkeletonCard({
  className,
  size = "md",
  showHeader = true,
  showContent = true,
  headerHeight = "h-4",
  contentLines = 3,
}: SkeletonCardProps) {
  const sizeClasses = {
    sm: "size-24",
    md: "size-28",
    lg: "size-32",
  };

  return (
    <Card className={cn(sizeClasses[size], "relative", className)}>
      {showHeader && (
        <CardHeader className="p-2">
          <Skeleton className={cn(headerHeight, "w-3/4")} />
        </CardHeader>
      )}
      {showContent && (
        <CardContent className="p-2 pt-0">
          <div className="space-y-2">
            {Array.from({ length: contentLines }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "h-3",
                  i === contentLines - 1 ? "w-2/3" : "w-full"
                )}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
