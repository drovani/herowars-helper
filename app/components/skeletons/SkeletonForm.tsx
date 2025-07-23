// ABOUTME: Skeleton placeholder for form sections with configurable fields and layout
// ABOUTME: Supports input fields, labels, buttons, and section headers for complex form loading states

import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface SkeletonFormProps {
  className?: string;
  fields?: number;
  showHeader?: boolean;
  showButtons?: boolean;
  sections?: number;
}

export function SkeletonForm({
  className,
  fields = 4,
  showHeader = true,
  showButtons = true,
  sections = 1,
}: SkeletonFormProps) {
  const renderFormSection = (sectionIndex: number) => (
    <div key={sectionIndex} className="space-y-4">
      {sections > 1 && <Skeleton className="h-6 w-32" />}
      {Array.from({ length: fields }).map((_, fieldIndex) => (
        <div key={fieldIndex} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <Card className={cn("w-full", className)}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {Array.from({ length: sections }).map((_, sectionIndex) =>
          renderFormSection(sectionIndex)
        )}
        {showButtons && (
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
