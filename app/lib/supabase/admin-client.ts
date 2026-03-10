// ABOUTME: Creates a Supabase client with service role authentication for admin operations
// ABOUTME: This client bypasses RLS policies and should only be used for trusted admin operations

import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

import type { Database } from "~/types/supabase";

export function createAdminClient(request: Request | null = null) {
  const supabaseUrl = process.env.VITE_SUPABASE_DATABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "VITE_SUPABASE_DATABASE_URL environment variable is required for admin operations",
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations",
    );
  }

  if (request !== null && typeof process !== "undefined") {
    const headers = new Headers();

    const supabase = createServerClient<Database>(supabaseUrl, serviceRoleKey, {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "") as {
            name: string;
            value: string;
          }[];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options),
            ),
          );
        },
      },
    });

    return { supabase, headers };
  } else {
    // For browser context, we should not use service role key
    throw new Error("Admin client should only be used in server-side contexts");
  }
}
