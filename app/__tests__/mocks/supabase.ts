import type { Session } from '@supabase/supabase-js'
import { vi } from 'vitest'

// Mock session
export const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: { roles: ['user'] },
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// Mock admin user operations
export const mockAdminAuth = {
  listUsers: vi.fn().mockResolvedValue({ 
    data: { users: [mockSession.user] }, 
    error: null 
  }),
  getUserById: vi.fn().mockResolvedValue({ 
    data: { user: mockSession.user }, 
    error: null 
  }),
  updateUserById: vi.fn().mockResolvedValue({ 
    data: { user: mockSession.user }, 
    error: null 
  }),
  createUser: vi.fn().mockResolvedValue({ 
    data: { user: mockSession.user }, 
    error: null 
  }),
  deleteUser: vi.fn().mockResolvedValue({ 
    error: null 
  }),
}

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: mockSession.user }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session: mockSession, user: mockSession.user }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { session: mockSession, user: mockSession.user }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    }),
    admin: mockAdminAuth,
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
}

// Mock the createClient function
vi.mock('~/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))