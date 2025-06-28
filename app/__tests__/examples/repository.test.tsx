import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockSupabaseClient } from '~/__tests__/mocks/supabase'

// Example repository class for testing patterns
class UserRepository {
  constructor(private supabase: any) {}

  async getUser(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async updateUserRole(userId: string, roles: string[]) {
    const { data, error } = await this.supabase
      .from('users')
      .update({ roles })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

describe('UserRepository', () => {
  let repository: UserRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new UserRepository(mockSupabaseClient)
  })

  describe('getUser', () => {
    it('should fetch user by id successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        roles: ['user']
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockUser,
        error: null
      })

      const result = await repository.getUser('user-123')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'user-123')
      expect(mockSupabaseClient.single).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('should throw error when user not found', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'User not found' }
      })

      await expect(repository.getUser('nonexistent'))
        .rejects
        .toEqual({ message: 'User not found' })
    })
  })

  describe('updateUserRole', () => {
    it('should update user roles successfully', async () => {
      const updatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        roles: ['admin', 'editor']
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: updatedUser,
        error: null
      })

      const result = await repository.updateUserRole('user-123', ['admin', 'editor'])

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users')
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ roles: ['admin', 'editor'] })
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'user-123')
      expect(mockSupabaseClient.select).toHaveBeenCalled()
      expect(mockSupabaseClient.single).toHaveBeenCalled()
      expect(result).toEqual(updatedUser)
    })

    it('should handle update errors', async () => {
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' }
      })

      await expect(repository.updateUserRole('user-123', ['admin']))
        .rejects
        .toEqual({ message: 'Update failed' })
    })
  })
})