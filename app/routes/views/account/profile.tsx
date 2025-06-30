import { useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { formatTitle } from "~/config/site";
import type { Route } from "./+types/profile";

export const loader = async (_: Route.LoaderArgs) => {
  return {};
};

export const action = async (_: Route.ActionArgs) => {
  return {};
};

export const meta = (_: Route.MetaArgs) => {
  return [{ title: formatTitle('Account') }];
};

export default function AccountIndex(_: Route.ComponentProps) {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      await updateProfile({ full_name: displayName });
      setMessage("Display name updated successfully!");
    } catch (error) {
      setMessage("Failed to update display name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Display Name"}
            </Button>
            
            {message && (
              <p className={`text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
