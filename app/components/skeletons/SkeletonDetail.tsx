// ABOUTME: Skeleton placeholder for detail page layouts with header and multiple content sections
// ABOUTME: Supports breadcrumbs, title sections, and configurable content areas for hero/equipment detail pages

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface SkeletonDetailProps {
  className?: string;
  showBreadcrumbs?: boolean;
  showImage?: boolean;
  contentSections?: number;
  sectionTitles?: string[];
  layout?: "single" | "two-column";
}

export function SkeletonDetail({
  className,
  showBreadcrumbs = true,
  showImage = true,
  contentSections = 3,
  sectionTitles,
  layout = "single",
}: SkeletonDetailProps) {
  const renderContentSection = (index: number) => (
    <Card key={index} className="w-full">
      <CardHeader>
        {sectionTitles?.[index] ? (
          <h3 className="text-lg font-medium">{sectionTitles[index]}</h3>
        ) : (
          <Skeleton className="h-6 w-32" />
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {showBreadcrumbs && (
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-12" />
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-16" />
          <span className="text-muted-foreground">/</span>
          <Skeleton className="h-4 w-20" />
        </div>
      )}

      <div
        className={cn(
          "gap-6",
          layout === "two-column"
            ? "grid grid-cols-1 lg:grid-cols-2"
            : "space-y-6"
        )}
      >
        {/* Header Section */}
        <Card className="w-full">
          <CardContent className="p-6">
            <div
              className={cn(
                "gap-4",
                showImage
                  ? "flex flex-col sm:flex-row items-start"
                  : "space-y-4"
              )}
            >
              {showImage && (
                <Skeleton className="size-32 rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="space-y-6">
          {Array.from({ length: contentSections }).map((_, index) =>
            renderContentSection(index)
          )}
        </div>
      </div>
    </div>
  );
}
