// ABOUTME: Skeleton placeholder for table-based content with configurable rows and columns
// ABOUTME: Supports table headers, data cells, and action columns for comprehensive table loading states

import { Skeleton } from "~/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";

interface SkeletonTableProps {
  className?: string;
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  headerTitles?: string[];
  actionColumn?: boolean;
}

export function SkeletonTable({ 
  className,
  rows = 5,
  columns = 4,
  showHeader = true,
  headerTitles,
  actionColumn = false
}: SkeletonTableProps) {
  const totalColumns = actionColumn ? columns + 1 : columns;

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        {showHeader && (
          <TableHeader>
            <TableRow>
              {Array.from({ length: totalColumns }).map((_, i) => (
                <TableHead key={i}>
                  {headerTitles?.[i] ? (
                    headerTitles[i]
                  ) : (
                    <Skeleton className="h-4 w-20" />
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className={cn(
                    "h-4",
                    colIndex === 0 ? "w-24" : 
                    colIndex === 1 ? "w-32" :
                    "w-16"
                  )} />
                </TableCell>
              ))}
              {actionColumn && (
                <TableCell>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}