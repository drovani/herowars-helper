import { describe, expect, it, beforeEach, vi } from 'vitest'
import { mockAdminUser, mockUser } from '~/__tests__/utils/test-utils'
import { createMockRequest, createFormData } from '~/__tests__/utils/http-utils'
import { mockAdminUserOperations } from '~/__tests__/mocks/admin'
import { mockSupabaseClient } from '~/__tests__/mocks/supabase'

// Mock the auth module
vi.mock('~/lib/supabase/client', () => ({
  createClient: vi.fn()
}))

// Mock loglevel
vi.mock('loglevel', () => ({
  default: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn()
  }
}))

// Import after mocks are set up
import '~/__tests__/mocks/admin'
import { loader, action } from './users'
import { createClient } from '~/lib/supabase/client'

describe('API Admin Users Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loader (GET requests)', () => {
    it('should return users for authenticated admin', async () => {
      // Mock authenticated admin user
      const adminSupabaseClient = {
        ...mockSupabaseClient,
        auth: {
          ...mockSupabaseClient.auth,
          getUser: vi.fn().mockResolvedValue({ data: { user: mockAdminUser } })
        }
      }
      vi.mocked(createClient).mockReturnValue({ supabase: adminSupabaseClient as any, headers: new Headers() })

      const request = createMockRequest('/api/admin/users')
      const response = await loader({ request })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.users).toBeDefined()
      expect(Array.isArray(data.users)).toBe(true)
      expect(mockAdminUserOperations.getAllUsers).toHaveBeenCalled()
    })

    it('should return 401 for unauthenticated user', async () => {
      // Mock no user
      const noUserSupabaseClient = {
        ...mockSupabaseClient,
        auth: {
          ...mockSupabaseClient.auth,
          getUser: vi.fn().mockResolvedValue({ data: { user: null } })
        }
      }
      vi.mocked(createClient).mockReturnValue({ supabase: noUserSupabaseClient as any, headers: new Headers() })

      const request = createMockRequest('/api/admin/users')
      const response = await loader({ request })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 for non-admin user', async () => {
      // Mock regular user (no admin role)
      const regularUserSupabaseClient = {
        ...mockSupabaseClient,
        auth: {
          ...mockSupabaseClient.auth,
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } })
        }
      }
      vi.mocked(createClient).mockReturnValue({ supabase: regularUserSupabaseClient as any, headers: new Headers() })

      const request = createMockRequest('/api/admin/users')
      const response = await loader({ request })

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toBe('Forbidden - Admin access required')
    })

    it('should handle database errors gracefully', async () => {
      // Mock authenticated admin user
      const adminSupabaseClient = {
        ...mockSupabaseClient,
        auth: {
          ...mockSupabaseClient.auth,
          getUser: vi.fn().mockResolvedValue({ data: { user: mockAdminUser } })
        }
      }
      vi.mocked(createClient).mockReturnValue({ supabase: adminSupabaseClient as any, headers: new Headers() })

      // Mock database error
      mockAdminUserOperations.getAllUsers.mockRejectedValueOnce(new Error('Database connection failed'))

      const request = createMockRequest('/api/admin/users')
      const response = await loader({ request })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Database connection failed')
    })
  })

  describe('action (POST requests)', () => {
    beforeEach(() => {
      // Default admin auth setup
      const adminSupabaseClient = {
        ...mockSupabaseClient,
        auth: {
          ...mockSupabaseClient.auth,
          getUser: vi.fn().mockResolvedValue({ data: { user: mockAdminUser } })
        }
      }
      vi.mocked(createClient).mockReturnValue({ supabase: adminSupabaseClient as any, headers: new Headers() })
    })

    describe('updateRoles action', () => {
      it('should update user roles successfully', async () => {
        const formData = createFormData({
          action: 'updateRoles',
          userId: 'user-1',
          roles: JSON.stringify(['admin'])
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.message).toBe('User roles updated successfully')
        expect(mockAdminUserOperations.updateUserRoles).toHaveBeenCalledWith('user-1', ['admin'])
      })

      it('should reject invalid roles', async () => {
        mockAdminUserOperations.updateUserRoles.mockRejectedValueOnce(
          new Error('Invalid roles: invalid_role')
        )

        const formData = createFormData({
          action: 'updateRoles',
          userId: 'user-1',
          roles: JSON.stringify(['invalid_role'])
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(500)
        const data = await response.json()
        expect(data.error).toBe('Invalid roles: invalid_role')
      })

      it('should require roles parameter', async () => {
        const formData = createFormData({
          action: 'updateRoles',
          userId: 'user-1'
          // Missing roles
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toBe('Missing roles parameter')
      })

      it('should validate roles is an array', async () => {
        const formData = createFormData({
          action: 'updateRoles',
          userId: 'user-1',
          roles: '"not-an-array"' // Valid JSON but not an array
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toBe('Roles must be an array')
      })
    })

    describe('deleteUser action', () => {
      it('should delete user successfully', async () => {
        const formData = createFormData({
          action: 'deleteUser',
          userId: 'disabled-user'
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.message).toBe('User deleted successfully')
        expect(mockAdminUserOperations.deleteUser).toHaveBeenCalledWith('disabled-user')
      })

      it('should prevent admin from deleting themselves', async () => {
        const formData = createFormData({
          action: 'deleteUser',
          userId: mockAdminUser.id // Same as authenticated user
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toBe('You cannot delete your own account')
      })

      it('should only delete disabled users', async () => {
        mockAdminUserOperations.deleteUser.mockRejectedValueOnce(
          new Error('Can only delete disabled users. Please disable the user first.')
        )

        const formData = createFormData({
          action: 'deleteUser',
          userId: 'user-1' // Not disabled
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(500)
        const data = await response.json()
        expect(data.error).toBe('Can only delete disabled users. Please disable the user first.')
      })
    })

    describe('disableUser action', () => {
      it('should disable user successfully', async () => {
        const formData = createFormData({
          action: 'disableUser',
          userId: 'user-1'
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.message).toBe('User disabled successfully')
        expect(mockAdminUserOperations.disableUser).toHaveBeenCalledWith('user-1')
      })

      it('should prevent admin from disabling themselves', async () => {
        const formData = createFormData({
          action: 'disableUser',
          userId: mockAdminUser.id
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toBe('You cannot disable your own account')
      })
    })

    describe('enableUser action', () => {
      it('should enable user successfully', async () => {
        const formData = createFormData({
          action: 'enableUser',
          userId: 'disabled-user'
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.message).toBe('User enabled successfully')
        expect(mockAdminUserOperations.enableUser).toHaveBeenCalledWith('disabled-user')
      })
    })

    describe('createUser action', () => {
      it('should create user successfully', async () => {
        const formData = createFormData({
          action: 'createUser',
          email: 'newuser@example.com',
          password: 'password123',
          fullName: 'New User',
          roles: JSON.stringify(['editor'])
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(200)
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.message).toBe('User created successfully')
        expect(mockAdminUserOperations.createUser).toHaveBeenCalledWith(
          'newuser@example.com',
          'password123',
          {
            full_name: 'New User',
            roles: ['user', 'editor']
          }
        )
      })

      it('should require email and password', async () => {
        const formData = createFormData({
          action: 'createUser'
          // Missing email and password
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toBe('Email and password are required')
      })

      it('should handle existing user error', async () => {
        mockAdminUserOperations.createUser.mockRejectedValueOnce(
          new Error('A user with email existing@example.com already exists')
        )

        const formData = createFormData({
          action: 'createUser',
          email: 'existing@example.com',
          password: 'password123'
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(500)
        const data = await response.json()
        expect(data.error).toBe('A user with email existing@example.com already exists')
      })

      it('should default to user role when no roles provided', async () => {
        const formData = createFormData({
          action: 'createUser',
          email: 'newuser@example.com',
          password: 'password123'
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        await action({ request })

        expect(mockAdminUserOperations.createUser).toHaveBeenCalledWith(
          'newuser@example.com',
          'password123',
          {
            full_name: null,
            roles: ['user']
          }
        )
      })

      it('should ensure user role is always included', async () => {
        const formData = createFormData({
          action: 'createUser',
          email: 'newuser@example.com',
          password: 'password123',
          roles: JSON.stringify(['admin'])
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        await action({ request })

        expect(mockAdminUserOperations.createUser).toHaveBeenCalledWith(
          'newuser@example.com',
          'password123',
          {
            full_name: null,
            roles: ['user', 'admin']
          }
        )
      })
    })

    describe('authorization checks', () => {
      it('should return 401 for unauthenticated requests', async () => {
        const noUserSupabaseClient = {
          ...mockSupabaseClient,
          auth: {
            ...mockSupabaseClient.auth,
            getUser: vi.fn().mockResolvedValue({ data: { user: null } })
          }
        }
        vi.mocked(createClient).mockReturnValue({ supabase: noUserSupabaseClient as any, headers: new Headers() })

        const formData = createFormData({
          action: 'updateRoles',
          userId: 'user-1',
          roles: JSON.stringify(['admin'])
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(401)
        const data = await response.json()
        expect(data.error).toBe('Unauthorized')
      })

      it('should return 403 for non-admin users', async () => {
        const regularUserSupabaseClient = {
          ...mockSupabaseClient,
          auth: {
            ...mockSupabaseClient.auth,
            getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } })
          }
        }
        vi.mocked(createClient).mockReturnValue({ supabase: regularUserSupabaseClient as any, headers: new Headers() })

        const formData = createFormData({
          action: 'updateRoles',
          userId: 'user-1',
          roles: JSON.stringify(['admin'])
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(403)
        const data = await response.json()
        expect(data.error).toBe('Forbidden - Admin access required')
      })
    })

    describe('input validation', () => {
      it('should require action parameter', async () => {
        const formData = createFormData({
          userId: 'user-1'
          // Missing action
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toBe('Missing action parameter')
      })

      it('should require userId for most actions', async () => {
        const formData = createFormData({
          action: 'updateRoles'
          // Missing userId
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toBe('Missing userId parameter')
      })

      it('should reject invalid actions', async () => {
        const formData = createFormData({
          action: 'invalidAction',
          userId: 'user-1'
        })

        const request = createMockRequest('/api/admin/users', {
          method: 'POST',
          body: formData
        })

        const response = await action({ request })

        expect(response.status).toBe(400)
        const data = await response.json()
        expect(data.error).toBe('Invalid action')
      })
    })
  })
})