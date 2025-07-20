// ABOUTME: Integration tests for player teams index page covering data loading and CRUD operations
// ABOUTME: Tests authentication flows and team management repository integration
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loader, action } from '../teams/index'
import { PlayerTeamRepository } from '~/repositories/PlayerTeamRepository'
import { createMockSupabaseClient } from '~//__tests__/mocks/supabase'
import { getAuthenticatedUser, requireAuthenticatedUser } from '~/lib/auth/utils'

// Mock the repositories
vi.mock('~/repositories/PlayerTeamRepository')

// Mock the Supabase client
vi.mock('~/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({ supabase: createMockSupabaseClient(), headers: undefined })),
}))

// Mock the auth utilities
vi.mock('~/lib/auth/utils', () => ({
  getAuthenticatedUser: vi.fn(),
  requireAuthenticatedUser: vi.fn(),
}))

describe('Player Teams Integration', () => {
  let mockRequest: Request
  let mockTeamRepo: any

  beforeEach(() => {
    mockRequest = new Request('http://localhost:3000/player/teams')
    
    mockTeamRepo = {
      findByUserId: vi.fn(),
      createTeam: vi.fn(),
      deleteTeam: vi.fn()
    }
    
    vi.mocked(PlayerTeamRepository).mockImplementation(() => mockTeamRepo)
    
    // Mock auth utilities
    vi.mocked(getAuthenticatedUser).mockResolvedValue({
      user: { 
        id: 'user1', 
        email: 'test@example.com',
        app_metadata: { roles: ['user'] },
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      error: null
    })
    
    vi.mocked(requireAuthenticatedUser).mockResolvedValue({
      id: 'user1',
      email: 'test@example.com',
      app_metadata: { roles: ['user'] },
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  })

  describe('loader', () => {
    it('should load user teams successfully', async () => {
      const mockTeams = [
        {
          id: 'team1',
          user_id: 'user1',
          name: 'Arena Team',
          description: 'Main arena team',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'team2',
          user_id: 'user1',
          name: 'Defense Team',
          description: 'Tower defense team',
          created_at: '2024-01-16T10:00:00Z',
          updated_at: '2024-01-16T10:00:00Z'
        }
      ]

      mockTeamRepo.findByUserId.mockResolvedValue({ data: mockTeams, error: null })

      const result = await loader({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.teams).toHaveLength(2)
      expect(result.teams[0].name).toBe('Arena Team')
      expect(result.teams[1].name).toBe('Defense Team')
      expect(mockTeamRepo.findByUserId).toHaveBeenCalledWith('user1')
    })

    it('should throw error when user is not authenticated', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        user: null,
        error: null
      })

      await expect(loader({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } }))
        .rejects
        .toThrow(Response)
    })

    it('should throw error when teams fail to load', async () => {
      mockTeamRepo.findByUserId.mockResolvedValue({ 
        data: null, 
        error: new Error('Database error') 
      })

      await expect(loader({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } }))
        .rejects
        .toThrow(Response)
    })

    it('should return empty teams array when no teams exist', async () => {
      mockTeamRepo.findByUserId.mockResolvedValue({ data: [], error: null })

      const result = await loader({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.teams).toHaveLength(0)
    })
  })

  describe('action - createTeam', () => {
    it('should create team successfully', async () => {
      const formData = new FormData()
      formData.append('action', 'createTeam')
      formData.append('name', 'New Team')
      formData.append('description', 'Test team description')

      const mockCreatedTeam = {
        id: 'new-team-id',
        user_id: 'user1',
        name: 'New Team',
        description: 'Test team description',
        created_at: '2024-01-17T10:00:00Z',
        updated_at: '2024-01-17T10:00:00Z'
      }

      mockTeamRepo.createTeam.mockResolvedValue({ data: mockCreatedTeam, error: null })

      const actionRequest = new Request('http://localhost:3000/player/teams', {
        method: 'POST',
        body: formData
      })

      const result = await action({ request: actionRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Team "New Team" created successfully')
      expect(result.teamId).toBe('new-team-id')
      expect(mockTeamRepo.createTeam).toHaveBeenCalledWith('user1', {
        name: 'New Team',
        description: 'Test team description'
      })
    })

    it('should create team with auto-generated name when name is empty', async () => {
      const formData = new FormData()
      formData.append('action', 'createTeam')
      formData.append('name', '')
      formData.append('description', '')

      const mockCreatedTeam = {
        id: 'new-team-id',
        user_id: 'user1',
        name: 'Team 1',
        description: null,
        created_at: '2024-01-17T10:00:00Z',
        updated_at: '2024-01-17T10:00:00Z'
      }

      mockTeamRepo.createTeam.mockResolvedValue({ data: mockCreatedTeam, error: null })

      const actionRequest = new Request('http://localhost:3000/player/teams', {
        method: 'POST',
        body: formData
      })

      const result = await action({ request: actionRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.success).toBe(true)
      expect(mockTeamRepo.createTeam).toHaveBeenCalledWith('user1', {
        name: '',
        description: undefined
      })
    })

    it('should return error when team creation fails', async () => {
      const formData = new FormData()
      formData.append('action', 'createTeam')
      formData.append('name', 'New Team')

      mockTeamRepo.createTeam.mockResolvedValue({ 
        data: null, 
        error: new Error('Team creation failed') 
      })

      const actionRequest = new Request('http://localhost:3000/player/teams', {
        method: 'POST',
        body: formData
      })

      const result = await action({ request: actionRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.error).toBe('Team creation failed')
    })
  })

  describe('action - deleteTeam', () => {
    it('should delete team successfully', async () => {
      const formData = new FormData()
      formData.append('action', 'deleteTeam')
      formData.append('teamId', 'team-to-delete')

      mockTeamRepo.deleteTeam.mockResolvedValue({ data: true, error: null })

      const actionRequest = new Request('http://localhost:3000/player/teams', {
        method: 'POST',
        body: formData
      })

      const result = await action({ request: actionRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Team deleted successfully')
      expect(mockTeamRepo.deleteTeam).toHaveBeenCalledWith('team-to-delete', 'user1')
    })

    it('should return error when team ID is missing', async () => {
      const formData = new FormData()
      formData.append('action', 'deleteTeam')

      const actionRequest = new Request('http://localhost:3000/player/teams', {
        method: 'POST',
        body: formData
      })

      const result = await action({ request: actionRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.error).toBe('Team ID is required')
    })

    it('should return error when team deletion fails', async () => {
      const formData = new FormData()
      formData.append('action', 'deleteTeam')
      formData.append('teamId', 'team-to-delete')

      mockTeamRepo.deleteTeam.mockResolvedValue({ 
        data: null, 
        error: new Error('Deletion failed') 
      })

      const actionRequest = new Request('http://localhost:3000/player/teams', {
        method: 'POST',
        body: formData
      })

      const result = await action({ request: actionRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.error).toBe('Deletion failed')
    })
  })

  describe('action - invalid action', () => {
    it('should return error for invalid action', async () => {
      const formData = new FormData()
      formData.append('action', 'invalidAction')

      const actionRequest = new Request('http://localhost:3000/player/teams', {
        method: 'POST',
        body: formData
      })

      const result = await action({ request: actionRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.error).toBe('Invalid action')
    })
  })
})