// ABOUTME: Tests for PlayerHeroRepository covering CRUD operations and event integration
// ABOUTME: Uses mocked Supabase client with log capturing for clean test output
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import log from 'loglevel'
import { PlayerHeroRepository } from '../PlayerHeroRepository'
import { createMockSupabaseClient } from '../../__tests__/mocks/supabase'

describe('PlayerHeroRepository', () => {
  let capturedLogs: Array<{level: string, message: string, args: any[]}> = []
  let originalMethodFactory: any
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>
  let repository: PlayerHeroRepository

  beforeEach(() => {
    // Capture logs to in-memory array instead of console
    capturedLogs = []
    originalMethodFactory = log.methodFactory
    log.methodFactory = function(methodName, _logLevel, _loggerName) {
      return function(message, ...args) {
        capturedLogs.push({level: methodName, message, args})
      }
    }
    log.rebuild()

    mockSupabase = createMockSupabaseClient()
    repository = new PlayerHeroRepository(mockSupabase as any)
  })

  afterEach(() => {
    // Restore original logging behavior
    log.methodFactory = originalMethodFactory
    log.rebuild()
  })

  describe('findByUserId', () => {
    it('should return user\'s hero collection', async () => {
      const mockData = [
        {
          id: '1',
          user_id: 'user1',
          hero_slug: 'astaroth',
          stars: 5,
          equipment_level: 12,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      })

      const result = await repository.findByUserId('user1')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockData)
      expect(mockSupabase.from).toHaveBeenCalledWith('player_hero')
    })

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error', code: 'DB_ERROR' }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      })

      const result = await repository.findByUserId('user1')

      expect(result.error).toBeTruthy()
      expect(result.data).toBeNull()
    })
  })

  describe('findWithHeroDetails', () => {
    it('should return collection with hero details', async () => {
      const mockData = [
        {
          id: '1',
          user_id: 'user1',
          hero_slug: 'astaroth',
          stars: 5,
          equipment_level: 12,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          hero: {
            slug: 'astaroth',
            name: 'Astaroth',
            class: 'tank',
            faction: 'chaos',
            main_stat: 'strength',
            attack_type: 'physical'
          }
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      })

      const result = await repository.findWithHeroDetails('user1')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockData)
      expect(mockSupabase.from).toHaveBeenCalledWith('player_hero')
    })
  })

  describe('addHeroToCollection', () => {
    it('should add hero to collection and create event', async () => {
      const mockHeroData = {
        id: '1',
        user_id: 'user1',
        hero_slug: 'astaroth',
        stars: 1,
        equipment_level: 1,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }

      // Mock the base repository create method
      vi.spyOn(repository, 'create').mockResolvedValue({
        data: mockHeroData,
        error: null
      })

      // Mock the event repository
      const mockEventRepo = {
        createEvent: vi.fn().mockResolvedValue({ data: {}, error: null })
      }
      ;(repository as any).eventRepo = mockEventRepo

      const result = await repository.addHeroToCollection('user1', {
        hero_slug: 'astaroth',
        stars: 1,
        equipment_level: 1
      })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockHeroData)
      expect(mockEventRepo.createEvent).toHaveBeenCalledWith('user1', {
        event_type: 'CLAIM_HERO',
        hero_slug: 'astaroth',
        event_data: {
          initial_stars: 1,
          initial_equipment_level: 1
        }
      })
    })

    it('should handle create errors', async () => {
      const mockError = { message: 'Hero already exists', code: 'UNIQUE_VIOLATION' }

      vi.spyOn(repository, 'create').mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await repository.addHeroToCollection('user1', {
        hero_slug: 'astaroth'
      })

      expect(result.error).toEqual(mockError)
      expect(result.data).toBeNull()
    })
  })

  describe('updateHeroProgress', () => {
    it('should update hero stars and create event', async () => {
      const currentHero = {
        id: '1',
        user_id: 'user1',
        hero_slug: 'astaroth',
        stars: 3,
        equipment_level: 10,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }

      const updatedHero = { ...currentHero, stars: 5, updated_at: '2024-01-15T11:00:00Z' }

      // Mock findAll to return current hero
      vi.spyOn(repository, 'findAll').mockResolvedValue({
        data: [currentHero],
        error: null
      })

      // Mock update to return updated hero
      vi.spyOn(repository, 'update').mockResolvedValue({
        data: updatedHero,
        error: null
      })

      // Mock the event repository
      const mockEventRepo = {
        createEvent: vi.fn().mockResolvedValue({ data: {}, error: null })
      }
      ;(repository as any).eventRepo = mockEventRepo

      const result = await repository.updateHeroProgress('user1', 'astaroth', { stars: 5 })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(updatedHero)
      expect(mockEventRepo.createEvent).toHaveBeenCalledWith('user1', {
        event_type: 'UPDATE_HERO_STARS',
        hero_slug: 'astaroth',
        event_data: {
          previous_stars: 3,
          new_stars: 5
        }
      })
    })

    it('should update equipment level and create event', async () => {
      const currentHero = {
        id: '1',
        user_id: 'user1',
        hero_slug: 'astaroth',
        stars: 5,
        equipment_level: 10,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }

      const updatedHero = { ...currentHero, equipment_level: 15, updated_at: '2024-01-15T11:00:00Z' }

      vi.spyOn(repository, 'findAll').mockResolvedValue({
        data: [currentHero],
        error: null
      })

      vi.spyOn(repository, 'update').mockResolvedValue({
        data: updatedHero,
        error: null
      })

      const mockEventRepo = {
        createEvent: vi.fn().mockResolvedValue({ data: {}, error: null })
      }
      ;(repository as any).eventRepo = mockEventRepo

      const result = await repository.updateHeroProgress('user1', 'astaroth', { equipment_level: 15 })

      expect(result.error).toBeNull()
      expect(mockEventRepo.createEvent).toHaveBeenCalledWith('user1', {
        event_type: 'UPDATE_HERO_EQUIPMENT',
        hero_slug: 'astaroth',
        event_data: {
          previous_equipment_level: 10,
          new_equipment_level: 15
        }
      })
    })

    it('should handle hero not found', async () => {
      vi.spyOn(repository, 'findAll').mockResolvedValue({
        data: [],
        error: null
      })

      const result = await repository.updateHeroProgress('user1', 'nonexistent', { stars: 5 })

      expect(result.error).toBeTruthy()
      expect(result.error?.message).toBe('Hero not found in user collection')
      expect(result.error?.code).toBe('HERO_NOT_FOUND')
    })
  })

  describe('removeFromCollection', () => {
    it('should remove hero and create event', async () => {
      const currentHero = {
        id: '1',
        user_id: 'user1',
        hero_slug: 'astaroth',
        stars: 5,
        equipment_level: 12,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }

      vi.spyOn(repository, 'findAll').mockResolvedValue({
        data: [currentHero],
        error: null
      })

      vi.spyOn(repository, 'delete').mockResolvedValue({
        data: true,
        error: null
      })

      const mockEventRepo = {
        createEvent: vi.fn().mockResolvedValue({ data: {}, error: null })
      }
      ;(repository as any).eventRepo = mockEventRepo

      const result = await repository.removeFromCollection('user1', 'astaroth')

      expect(result.error).toBeNull()
      expect(result.data).toBe(true)
      expect(mockEventRepo.createEvent).toHaveBeenCalledWith('user1', {
        event_type: 'UNCLAIM_HERO',
        hero_slug: 'astaroth',
        event_data: {
          final_stars: 5,
          final_equipment_level: 12
        }
      })
    })
  })

  describe('isHeroInCollection', () => {
    it('should return true if hero is in collection', async () => {
      vi.spyOn(repository, 'findAll').mockResolvedValue({
        data: [{ 
          id: '1', 
          user_id: 'user1', 
          hero_slug: 'astaroth',
          stars: 1,
          equipment_level: 1,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        }],
        error: null
      })

      const result = await repository.isHeroInCollection('user1', 'astaroth')

      expect(result.error).toBeNull()
      expect(result.data).toBe(true)
    })

    it('should return false if hero is not in collection', async () => {
      vi.spyOn(repository, 'findAll').mockResolvedValue({
        data: [],
        error: null
      })

      const result = await repository.isHeroInCollection('user1', 'nonexistent')

      expect(result.error).toBeNull()
      expect(result.data).toBe(false)
    })
  })
})