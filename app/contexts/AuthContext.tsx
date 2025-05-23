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
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children, request }: { children: React.ReactNode, request: Request }) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = createClient(request);

  // Fetch user roles from database
  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('roles')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return data?.roles || [];
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  }, [supabase]);

  // Set up Supabase Auth event listeners
  useEffect(() => {
    const setupAuth = async () => {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        const roles = await fetchUserRoles(session.user.id);
        setUserRoles(roles);
      }

      setLoading(false);
    };

    setupAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        const roles = await fetchUserRoles(session.user.id);
        setUserRoles(roles);
      } else {
        setUserRoles([]);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchUserRoles]);

  // Transform Supabase user data into our simplified user object
  const transformedUser = useMemo(() => {
    log.debug("Supabase user:", supabaseUser);
    if (!supabaseUser) return null;

    // Extract user metadata - handle null cases
    const userMetadata = supabaseUser.user_metadata || {};

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
      roles: userRoles, // Use the fetched roles
      fallback: fallback,
      avatar: userMetadata.avatar_url || "/images/heroes/mushy-and-shroom.png",
    };
  }, [supabaseUser, userRoles]);

  const hasRole = useCallback((role: string | string[]) => {
    if (!transformedUser) return false;

    const rolesToCheck = Array.isArray(role) ? role : [role];
    return rolesToCheck.some(r => transformedUser.roles.includes(r));
  }, [transformedUser]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign out error:', authError.message);
    }
  }, [supabase.auth]);

  const value = useMemo(
    () => ({
      user: transformedUser,
      isAuthenticated: !!supabaseUser,
      signOut,
      hasRole,
    }),
    [transformedUser, supabaseUser, signOut, hasRole]
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