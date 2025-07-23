// ABOUTME: Player activity page displays chronological event history for hero collection changes
// ABOUTME: Shows all user actions including hero additions, updates, and removals with timestamps
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatTitle } from "~/config/site";
import { useAuth } from "~/contexts/AuthContext";
import { getAuthenticatedUser } from "~/lib/auth/utils";
import { PlayerEventRepository } from "~/repositories/PlayerEventRepository";
import type { PlayerEvent } from "~/repositories/types";
import type { Route } from "./+types/activity";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const playerEventRepo = new PlayerEventRepository(request);

  // Get authenticated user using centralized utility
  const { user } = await getAuthenticatedUser(request);

  // Parse pagination parameters from URL
  const url = new URL(request.url);
  const pageParam = url.searchParams.get("page");
  const limitParam = url.searchParams.get("limit");
  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const limit = limitParam ? parseInt(limitParam, 10) : 10;
  const offset = (page - 1) * limit;

  let events: PlayerEvent[] = [];
  let totalCount = 0;

  if (user) {
    const eventsResult = await playerEventRepo.findRecentEvents(
      user.id,
      limit,
      offset
    );
    if (!eventsResult.error && eventsResult.data) {
      events = eventsResult.data;
    }

    // Get total count for pagination
    const countResult = await playerEventRepo.findEventsByUser(user.id);
    if (!countResult.error && countResult.data) {
      totalCount = countResult.data.length;
    }
  }

  return {
    events,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};

export const action = async (_: Route.ActionArgs) => {
  return {};
};

export const meta = (_: Route.MetaArgs) => {
  return [{ title: formatTitle("Activity Log") }];
};

export default function PlayerActivity({ loaderData }: Route.ComponentProps) {
  const { events, pagination } = loaderData;
  const { user, isLoading: authLoading } = useAuth();

  const formatEventType = (eventType: string) => {
    switch (eventType) {
      case "CLAIM_HERO":
        return "Claimed Hero";
      case "UNCLAIM_HERO":
        return "Unclaimed Hero";
      case "UPDATE_HERO_STARS":
        return "Updated Stars";
      case "UPDATE_HERO_EQUIPMENT":
        return "Updated Equipment";
      default:
        return eventType;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "CLAIM_HERO":
        return "bg-green-100 text-green-800";
      case "UNCLAIM_HERO":
        return "bg-red-100 text-red-800";
      case "UPDATE_HERO_STARS":
        return "bg-yellow-100 text-yellow-800";
      case "UPDATE_HERO_EQUIPMENT":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Loading your activity history.</CardDescription>
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
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({pagination.totalCount})</CardTitle>
          <CardDescription>
            Track all changes to your hero collection including additions,
            updates, and removals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Hero</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    {event.created_at
                      ? new Date(event.created_at).toLocaleDateString()
                      : "Unknown"}
                    <div className="text-sm text-muted-foreground">
                      {event.created_at
                        ? new Date(event.created_at).toLocaleTimeString()
                        : "Unknown"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getEventTypeColor(event.event_type)}>
                      {formatEventType(event.event_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.hero_slug}</TableCell>
                  <TableCell>
                    {event.event_data &&
                    Object.keys(event.event_data).length > 0 ? (
                      <div className="text-sm text-muted-foreground">
                        {JSON.stringify(event.event_data)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No details</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  {pagination.page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={`?page=${pagination.page - 1}&limit=${
                          pagination.limit
                        }`}
                      />
                    </PaginationItem>
                  )}

                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href={`?page=${pageNum}&limit=${pagination.limit}`}
                            isActive={pageNum === pagination.page}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}

                  {pagination.page < pagination.totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href={`?page=${pagination.page + 1}&limit=${
                          pagination.limit
                        }`}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
