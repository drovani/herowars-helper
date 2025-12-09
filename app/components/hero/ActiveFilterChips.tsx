// ABOUTME: Display active filters as removable chips/badges for hero filtering
// ABOUTME: Shows current filter state and allows individual filter removal

import { XIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { HeroFilters } from "~/lib/hero-filtering";
import { getActiveFilterLabels, removeFilter } from "~/lib/hero-filtering";

interface ActiveFilterChipsProps {
  filters: HeroFilters;
  onFiltersChange: (filters: HeroFilters) => void;
}

export function ActiveFilterChips({
  filters,
  onFiltersChange,
}: ActiveFilterChipsProps) {
  const activeFilters = getActiveFilterLabels(filters);

  if (activeFilters.length === 0) {
    return null;
  }

  const handleRemoveFilter = (key: string, value?: string) => {
    const newFilters = removeFilter(filters, key, value);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.key}-${filter.value}-${index}`}
          variant="secondary"
          className="gap-1 pr-1"
        >
          <span className="capitalize">
            {filter.label}: {filter.value}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="size-4 p-0 hover:bg-muted"
            onClick={() => handleRemoveFilter(filter.key, filter.value)}
            aria-label={`Remove ${filter.label}: ${filter.value} filter`}
          >
            <XIcon className="size-3" />
          </Button>
        </Badge>
      ))}
      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-6 text-xs"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
