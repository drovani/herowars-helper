// ABOUTME: Detects whether the app is running in static mode (no Supabase).
// ABOUTME: Returns true when required Supabase environment variables are missing or empty.

export function isStaticMode(): boolean {
  // Server-side uses non-prefixed env vars; browser uses VITE-prefixed (only VITE_ vars are exposed to the client bundle)
  if (typeof process !== "undefined" && process.env) {
    return !process.env.SUPABASE_DATABASE_URL || !process.env.SUPABASE_ANON_KEY;
  }
  return (
    !import.meta.env.VITE_SUPABASE_DATABASE_URL ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}
