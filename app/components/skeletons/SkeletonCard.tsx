// ABOUTME: Skeleton placeholder for card-based content with configurable dimensions and layout options
// ABOUTME: Provides consistent skeleton loading experience that matches shadcn/ui Card component structure

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface SkeletonCardProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showHeader?: boolean;
  showContent?: boolean;
  headerHeight?: string;
  contentLines?: number;
}

export function SkeletonCard({ 
  className,
  size = "md",
  showHeader = true,
  showContent = true,
  headerHeight = "h-4",
  contentLines = 3
}: SkeletonCardProps) {
  const sizeClasses = {
    sm: "size-24",
    md: "size-28", 
    lg: "size-32"
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