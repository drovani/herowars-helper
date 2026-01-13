import {
  createBrowserClient,
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

import type { Database } from "~/types/supabase";

export function createClient(request: Request | null = null) {
  if (request !== null && typeof process !== "undefined") {
    const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error(
        "SUPABASE_DATABASE_URL and SUPABASE_ANON_KEY environment variables are required"
      );
    }

    const headers = new Headers();

    const supabase = createServerClient<Database>(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return parseCookieHeader(request?.headers?.get("Cookie") ?? "") as {
            name: string;
            value: string;
          }[];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            )
          );
        },
      },
    });

    return { supabase, headers };
  } else {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_DATABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error(
        "VITE_SUPABASE_DATABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required"
      );
    }

    const supabase = createBrowserClient<Database>(supabaseUrl, anonKey);
    return { supabase, headers: undefined };
  }
}
