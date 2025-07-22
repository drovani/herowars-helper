import {
  createBrowserClient,
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import type { Database } from "~/types/supabase";

export function createClient(request: Request | null = null) {
  if (request != null && typeof process !== "undefined") {
    const headers = new Headers();

    const supabase = createServerClient<Database>(
      process.env.SUPABASE_DATABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
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
      }
    );

    return { supabase, headers };
  } else {
    const supabase = createBrowserClient<Database>(
      import.meta.env.VITE_SUPABASE_DATABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!
    );
    return { supabase, headers: undefined };
  }
}
