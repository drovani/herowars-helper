import type { User } from '@supabase/supabase-js'
import { vi } from 'vitest'

const baseUser = {
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-01-01T00:00:00Z'
}

export const mockUsers: User[] = [
  { ...baseUser, id: 'user-1', email: 'user@example.com', app_metadata: { roles: ['user'] }, user_metadata: { full_name: 'Regular User' } },
  { ...baseUser, id: 'user-2', email: 'editor@example.com', app_metadata: { roles: ['user', 'editor'] }, user_metadata: { full_name: 'Editor User' } },
  { ...baseUser, id: 'user-3', email: 'admin@example.com', app_metadata: { roles: ['user', 'admin'] }, user_metadata: { full_name: 'Admin User' } },
  { ...baseUser, id: 'disabled-user', email: 'disabled@example.com', app_metadata: { roles: ['user'] }, user_metadata: { full_name: 'Disabled User' }, banned_until: '2034-01-01T00:00:00Z' } as User & { banned_until: string }
]

export const mockAdminUserOperations = {
  getAllUsers: vi.fn().mockResolvedValue(mockUsers),
  
  updateUserRoles: vi.fn().mockImplementation(async (userId: string, roles: string[]) => {
    const user = mockUsers.find(u => u.id === userId)
    if (!user) throw new Error('User not found')
    
    const validRoles = ['admin', 'editor', 'user']
    const invalidRoles = roles.filter(role => !validRoles.includes(role))
    if (invalidRoles.length > 0) throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`)
    
    const finalRoles = ['user', ...roles.filter(role => role !== 'user')]
    return { ...user, app_metadata: { ...user.app_metadata, roles: finalRoles } }
  }),
  
  deleteUser: vi.fn().mockImplementation(async (userId: string) => {
    const user = mockUsers.find(u => u.id === userId)
    if (!user) throw new Error('User not found')
    
    const isDisabled = (user as any).banned_until && new Date((user as any).banned_until) > new Date()
    if (!isDisabled) throw new Error('Can only delete disabled users. Please disable the user first.')
    
    return { success: true }
  }),
  
  disableUser: vi.fn().mockImplementation(async (userId: string) => {
    const user = mockUsers.find(u => u.id === userId)
    if (!user) throw new Error('User not found')
    return { ...user, banned_until: '2034-01-01T00:00:00Z' }
  }),
  
  enableUser: vi.fn().mockImplementation(async (userId: string) => {
    const user = mockUsers.find(u => u.id === userId)
    if (!user) throw new Error('User not found')
    const updatedUser = { ...user }
    delete (updatedUser as any).banned_until
    return updatedUser
  }),
  
  createUser: vi.fn().mockImplementation(async (email: string, password: string, userData?: { full_name?: string; roles?: string[] }) => {
    const existingUser = mockUsers.find(u => u.email === email)
    if (existingUser) throw new Error(`A user with email ${email} already exists`)
    
    const newUser: User = {
      ...baseUser,
      id: `new-user-${Date.now()}`,
      email,
      app_metadata: { roles: userData?.roles || ['user'] },
      user_metadata: { full_name: userData?.full_name || '' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString()
    }
    
    mockUsers.push(newUser)
    return newUser
  })
}

// Mock the admin module
vi.mock('~/lib/supabase/admin', () => ({
  adminUserOperations: mockAdminUserOperations,
  ASSIGNABLE_ROLES: ['admin', 'editor']
}))