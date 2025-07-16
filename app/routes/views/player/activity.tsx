// ABOUTME: Player activity page displays chronological event history for hero collection changes
// ABOUTME: Shows all user actions including hero additions, updates, and removals with timestamps
import { useAuth } from "~/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { formatTitle } from "~/config/site";
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
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Track all changes to your hero collection including additions, updates, and removals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Activity Yet
            </h3>
            <p className="text-gray-500 mb-4">
              Your hero collection activity will appear here as you add and update heroes.
            </p>
            <div className="text-sm text-gray-400">
              Activity tracking features coming soon...
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}