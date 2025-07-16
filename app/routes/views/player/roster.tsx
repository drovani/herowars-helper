// ABOUTME: Player roster page displays user's hero collection with management capabilities
// ABOUTME: Allows viewing, filtering, and managing personal hero collection including stars and equipment levels
import { useAuth } from "~/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { formatTitle } from "~/config/site";
import type { Route } from "./+types/roster";

export const loader = async (_: Route.LoaderArgs) => {
  return {};
};

export const action = async (_: Route.ActionArgs) => {
  return {};
};

export const meta = (_: Route.MetaArgs) => {
  return [{ title: formatTitle('Hero Roster') }];
};

export default function PlayerRoster(_: Route.ComponentProps) {
  const { user, isLoading: authLoading } = useAuth();

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Loading your hero collection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You must be logged in to view your hero roster.
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
          <CardTitle>Hero Roster</CardTitle>
          <CardDescription>
            Manage your personal hero collection, track progress, and update hero development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your Hero Collection
            </h3>
            <p className="text-gray-500 mb-4">
              Start building your hero roster by adding heroes from the hero catalog.
            </p>
            <div className="text-sm text-gray-400">
              Collection management features coming soon...
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}