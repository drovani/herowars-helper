// ABOUTME: Detects whether the app is running in static mode (no Supabase).
// ABOUTME: Returns true when the Supabase database URL environment variable is not set.

export function isStaticMode(): boolean {
  if (typeof process !== "undefined" && process.env) {
    // Server-side uses non-prefixed env vars; browser uses VITE-prefixed (only VITE_ vars are exposed to the client bundle)
    return !process.env.SUPABASE_DATABASE_URL;
  }
  return !import.meta.env.VITE_SUPABASE_DATABASE_URL;
}
