// ABOUTME: Skeleton placeholder for admin user management table with user rows and action buttons
// ABOUTME: Supports user data placeholders including email, roles, and action button sections

import { Skeleton } from "~/components/ui/skeleton";
import { SkeletonTable } from "./SkeletonTable";
import { cn } from "~/lib/utils";

interface AdminUserTableSkeletonProps {
  className?: string;
  userCount?: number;
}

export function AdminUserTableSkeleton({ 
  className,
  userCount = 8
}: AdminUserTableSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Search/Filter section */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* User table */}
      <SkeletonTable
        rows={userCount}
        columns={3}
        showHeader={true}
        headerTitles={["User", "Roles", "Actions"]}
        actionColumn={true}
        className="w-full"
      />

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
  );
}