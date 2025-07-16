// ABOUTME: Player activity page displays chronological event history for hero collection changes
// ABOUTME: Shows all user actions including hero additions, updates, and removals with timestamps
import { useAuth } from "~/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ActivityFeed } from "~/components/player/ActivityFeed";
import { formatTitle } from "~/config/site";
import { PlayerEventRepository } from "~/repositories/PlayerEventRepository";
import { useState } from "react";
import type { Route } from "./+types/activity";
import type { PlayerEvent } from "~/repositories/types";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const playerEventRepo = new PlayerEventRepository(request);
  
  // Get user from request (this would be set by authentication middleware)
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId'); // This would come from auth context
  
  let events: PlayerEvent[] = [];
  if (userId) {
    const eventsResult = await playerEventRepo.findRecentEvents(userId, 50);
    if (!eventsResult.error && eventsResult.data) {
      events = eventsResult.data;
    }
  }
  
  return { events };
};

export const action = async (_: Route.ActionArgs) => {
  return {};
};

export const meta = (_: Route.MetaArgs) => {
  return [{ title: formatTitle('Activity Log') }];
};

export default function PlayerActivity({ loaderData }: Route.ComponentProps) {
  const { events } = loaderData;
  const { user, isLoading: authLoading } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Filter events based on selected filter
  const filteredEvents = selectedFilter === "all" 
    ? events 
    : events.filter(event => event.event_type === selectedFilter);

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
          <CardTitle>Activity Log ({events.length})</CardTitle>
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