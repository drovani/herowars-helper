// ABOUTME: Unified authentication utilities that work in both server and client contexts
// ABOUTME: Provides simple interface for getting authenticated user regardless of context

import type { User } from "@supabase/supabase-js";

// Define the auth context user type based on the actual AuthContext
export interface AuthContextUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  roles: string[];
  fallback: string;
}

// Server-side auth result uses Supabase User
export interface ServerAuthResult {
  user: User | null;
  error: string | null;
}

// Client-side auth result uses AuthContext user
export interface ClientAuthResult {
  user: AuthContextUser | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Gets the authenticated user from server-side context (loaders/actions)
 * Pass the request object to indicate server-side usage
 */
export async function getAuthenticatedUser(
  request: Request
): Promise<ServerAuthResult> {
  try {
    const { createClient } = await import("~/lib/supabase/client");
    const { supabase } = createClient(request);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return {
        user: null,
        error: error.message,
      };
    }

    return {
      user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error:
        error instanceof Error ? error.message : "Unknown authentication error",
    };
  }
}

/**
 * Gets the authenticated user and throws if not authenticated (server-side)
 * Use this when authentication is required for the route
 */
export async function requireAuthenticatedUser(
  request: Request
): Promise<User> {
  const { user, error } = await getAuthenticatedUser(request);

  if (error) {
    throw new Response("Authentication failed", { status: 401 });
  }

  if (!user) {
    throw new Response("Authentication required", { status: 401 });
  }

  return user;
}

/**
 * Checks if a user is authenticated (server-side)
 * Returns true if authenticated, false otherwise
 */
export async function isAuthenticated(request: Request): Promise<boolean> {
  const { user } = await getAuthenticatedUser(request);
  return user !== null;
}

/**
 * React hook for getting authenticated user (client-side)
 * Use this in React components
 */
export function useAuthenticatedUser(): ClientAuthResult {
  const { useAuth } = require("~/contexts/AuthContext");
  const { user, isLoading } = useAuth();

  return {
    user,
    error: null,
    isLoading,
  };
}

/**
 * React hook for requiring authenticated user (client-side)
 * Throws if not authenticated
 */
export function useRequiredAuthenticatedUser(): AuthContextUser {
  const { user, error, isLoading } = useAuthenticatedUser();

  if (isLoading) {
    throw new Error("Authentication loading");
  }

  if (error) {
    throw new Error(`Authentication failed: ${error}`);
  }

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}
