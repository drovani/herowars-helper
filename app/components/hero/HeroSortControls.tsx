// ABOUTME: Sort controls for hero list with ascending/descending toggle
// ABOUTME: Provides UI for selecting sort field and direction

import { ArrowDownAZIcon, ArrowUpAZIcon, ArrowUpDownIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { SortField, SortOptions } from "~/lib/hero-sorting";

interface HeroSortControlsProps {
  sortOptions: SortOptions;
  onSortChange: (options: SortOptions) => void;
}

export function HeroSortControls({
  sortOptions,
  onSortChange,
}: HeroSortControlsProps) {
  const handleFieldChange = (field: string) => {
    onSortChange({
      field: field as SortField,
      direction: sortOptions.direction,
    });
  };

  const handleDirectionToggle = () => {
    onSortChange({
      field: sortOptions.field,
      direction: sortOptions.direction === "asc" ? "desc" : "asc",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
      <Select value={sortOptions.field} onValueChange={handleFieldChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="order_rank">Order Rank</SelectItem>
          <SelectItem value="name">Name</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={handleDirectionToggle}
        aria-label={`Sort ${sortOptions.field === "name" ? "name" : "order rank"} ${sortOptions.direction === "asc" ? "descending" : "ascending"}`}
      >
        {sortOptions.direction === "asc" ? (
          sortOptions.field === "name" ? (
            <ArrowDownAZIcon className="size-4" />
          ) : (
            <ArrowUpDownIcon className="size-4" />
          )
        ) : sortOptions.field === "name" ? (
          <ArrowUpAZIcon className="size-4" />
        ) : (
          <ArrowUpDownIcon className="size-4" />
        )}
      </Button>
    </div>
  );
}
