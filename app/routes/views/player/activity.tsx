// ABOUTME: Player activity page displays chronological event history for hero collection changes
// ABOUTME: Shows all user actions including hero additions, updates, and removals with timestamps
import { useAuth } from "~/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ActivityFeed } from "~/components/player/ActivityFeed";
import { formatTitle } from "~/config/site";
import { useState } from "react";
import type { Route } from "./+types/activity";

export const loader = async (_: Route.LoaderArgs) => {
  return {};
};

export const action = async (_: Route.ActionArgs) => {
  return {};
};

export const meta = (_: Route.MetaArgs) => {
  return [{ title: formatTitle('Activity Log') }];
};

export default function PlayerActivity(_: Route.ComponentProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock activity data - TODO: Replace with actual data from PlayerEventRepository
  const mockEvents = [
    {
      id: "1",
      user_id: "user1",
      event_type: "CLAIM_HERO" as const,
      hero_slug: "astaroth",
      event_data: {
        initial_stars: 1,
        initial_equipment_level: 1
      },
      created_at: "2024-01-15T10:00:00Z",
      created_by: "user1"
    },
    {
      id: "2",
      user_id: "user1", 
      event_type: "UPDATE_HERO_STARS" as const,
      hero_slug: "astaroth",
      event_data: {
        previous_stars: 1,
        new_stars: 5
      },
      created_at: "2024-01-15T11:30:00Z",
      created_by: "user1"
    },
    {
      id: "3",
      user_id: "user1",
      event_type: "UPDATE_HERO_EQUIPMENT" as const,
      hero_slug: "astaroth",
      event_data: {
        previous_equipment_level: 1,
        new_equipment_level: 12
      },
      created_at: "2024-01-15T12:00:00Z",
      created_by: "user1"
    },
    {
      id: "4",
      user_id: "user1",
      event_type: "CLAIM_HERO" as const,
      hero_slug: "aurora",
      event_data: {
        initial_stars: 3,
        initial_equipment_level: 8
      },
      created_at: "2024-01-16T14:30:00Z",
      created_by: "user1"
    }
  ];

  // Filter events based on selected filter
  const filteredEvents = selectedFilter === "all" 
    ? mockEvents 
    : mockEvents.filter(event => event.event_type === selectedFilter);

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Loading your activity history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="size-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You must be logged in to view your activity log.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({mockEvents.length})</CardTitle>
          <CardDescription>
            Track all changes to your hero collection including additions, updates, and removals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ActivityFeed
            events={filteredEvents}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            onLoadMore={() => {
              // TODO: Implement pagination
              console.log("Load more events");
            }}
            hasMore={false} // TODO: Implement pagination logic
            isLoading={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}