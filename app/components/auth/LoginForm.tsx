import React from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
  action?: string;
}

export function LoginForm({
  onSuccess,
  redirectTo,
  className,
  action,
}: LoginFormProps) {
  const fetcher = useFetcher();

  const error = fetcher.data?.error;
  const loading = fetcher.state === "submitting";
  const success = fetcher.data?.success;

  // Handle successful login with useEffect to avoid infinite loops
  React.useEffect(() => {
    if (success && onSuccess) {
      onSuccess();
    }
  }, [success, onSuccess]);

  return (
    <div className={className}>
      <fetcher.Form method="post" action={action}>
        {redirectTo && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" name="password" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}
