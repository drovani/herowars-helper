// ABOUTME: Detects whether the app is running in static mode (no Supabase).
// ABOUTME: Returns true when Supabase environment variables are not set.

export function isStaticMode(): boolean {
  if (typeof process !== "undefined" && process.env) {
    return !process.env.SUPABASE_DATABASE_URL;
  }
  return !import.meta.env.VITE_SUPABASE_DATABASE_URL;
}
