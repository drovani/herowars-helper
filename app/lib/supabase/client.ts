// ABOUTME: Supabase client factory for server-side and browser contexts.
// ABOUTME: Throws a descriptive error when called in static mode (no Supabase configured).

import {
  createBrowserClient,
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

import { isStaticMode } from "~/lib/static-mode";
import type { Database } from "~/types/supabase";

export function createClient(request: Request | null = null) {
  if (request !== null && typeof process !== "undefined") {
    const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      if (isStaticMode()) {
        throw new Error(
          "Supabase client unavailable: application is running in static mode",
        );
      }
      throw new Error(
        "SUPABASE_DATABASE_URL and SUPABASE_ANON_KEY environment variables are required",
      );
    }

    const headers = new Headers();

    const supabase = createServerClient<Database>(supabaseUrl, anonKey, {
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
    const supabaseUrl = import.meta.env.VITE_SUPABASE_DATABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      if (isStaticMode()) {
        throw new Error(
          "Supabase client unavailable: application is running in static mode",
        );
      }
      throw new Error(
        "VITE_SUPABASE_DATABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required",
      );
    }

    const supabase = createBrowserClient<Database>(supabaseUrl, anonKey);
    return { supabase, headers: undefined };
  }
}
