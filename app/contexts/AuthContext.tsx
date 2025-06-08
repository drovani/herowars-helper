import { AuthError, type User } from '@supabase/supabase-js';
import log from "loglevel";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "~/lib/supabase/client";
interface AuthContextType {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string;
    roles: string[];
    fallback: string;
  } | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children, request }: { children: React.ReactNode, request: Request }) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { supabase } = createClient(request);

  // Set up Supabase Auth event listeners
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSupabaseUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Transform Supabase user data into our simplified user object
  const transformedUser = useMemo(() => {
    log.debug("Supabase user:", supabaseUser);
    if (!supabaseUser) return null;

    // Extract user metadata - handle null cases
    const userMetadata = supabaseUser.user_metadata || {};
    const appMetadata = supabaseUser.app_metadata || {};

    // Get name from metadata or use fallback
    const fullName = String(userMetadata.full_name ||
      userMetadata.name ||
      "Anonymous Shroom");

    // Create fallback initials from name
    const fallback = fullName
      .split(" ")
      .map((n) => n[0])
      .join("") || "AS";

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "anonymousshroom@example.com",
      name: fullName,
      roles: appMetadata.roles || ['admin'],
      fallback: fallback,
      avatar: userMetadata.avatar_url || "/images/heroes/mushy-and-shroom.png",
    };
  }, [supabaseUser]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign out error:', authError.message);
    }
  }, []);

  const value = useMemo(
    () => ({
      user: transformedUser,
      isAuthenticated: !!supabaseUser,
      signOut,
    }),
    [transformedUser, supabaseUser, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}