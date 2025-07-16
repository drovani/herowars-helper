// ABOUTME: ActivityFeed component displays chronological list of user events
// ABOUTME: Shows paginated event history with filtering and loading states
import { EventCard } from "./EventCard";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { LoaderIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import type { PlayerEvent } from "~/repositories/types";

interface ActivityFeedProps {
  events: PlayerEvent[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onFilterChange?: (eventType: string) => void;
  selectedFilter?: string;
  className?: string;
}

export function ActivityFeed({
  events,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onFilterChange,
  selectedFilter = "all",
  className
}: ActivityFeedProps) {
  const eventTypeOptions = [
    { value: "all", label: "All Events" },
    { value: "CLAIM_HERO", label: "Hero Added" },
    { value: "UNCLAIM_HERO", label: "Hero Removed" },
    { value: "UPDATE_HERO_STARS", label: "Stars Updated" },
    { value: "UPDATE_HERO_EQUIPMENT", label: "Equipment Updated" }
  ];

  const handleFilterChange = (value: string) => {
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  if (isLoading && events.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="flex items-center gap-2 text-gray-500">
          <LoaderIcon className="size-5 animate-spin" />
          Loading activity...
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="event-filter" className="text-sm font-medium">
            Filter by:
          </Label>
          <Select value={selectedFilter} onValueChange={handleFilterChange}>
            <SelectTrigger id="event-filter" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventTypeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {selectedFilter === "all" 
              ? "No activity yet. Start by adding heroes to your collection!"
              : `No ${eventTypeOptions.find(opt => opt.value === selectedFilter)?.label.toLowerCase()} events found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <EventCard
              key={`${event.id}-${index}`}
              event={event}
              heroName={event.hero_slug} // TODO: Replace with actual hero name lookup
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <LoaderIcon className="size-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}