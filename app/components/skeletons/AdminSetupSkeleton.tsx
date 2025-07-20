// ABOUTME: Skeleton placeholder for admin setup page with multi-step progress loading visualization
// ABOUTME: Matches admin setup layout with form sections, progress indicators, and results display areas

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface AdminSetupSkeletonProps {
  className?: string;
  mode?: "form" | "processing" | "results";
}

export function AdminSetupSkeleton({ 
  className,
  mode = "form"
}: AdminSetupSkeletonProps) {
  if (mode === "processing") {
    return (
      <div className={cn("space-y-6 max-w-2xl mx-auto", className)}>
        <Card>
          <CardHeader>
            <CardTitle>Initializing Data</CardTitle>
            <CardDescription>Processing your request...</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Skeleton className="size-6 rounded-full animate-pulse" />
              <span className="text-lg">Initializing...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "results") {
    return (
      <div className={cn("space-y-6 max-w-6xl mx-auto", className)}>
        {/* Alert Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-32 mt-2" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Results Grid */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {/* Summary sections */}
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="size-4 rounded" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Form mode (default)
  return (
    <div className={cn("space-y-6 max-w-2xl mx-auto", className)}>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selection */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid gap-4 pt-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Dataset Selection */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-20" />
            <div className="grid gap-4 pt-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}