// ABOUTME: Tests for PlayerEventRepository covering event sourcing operations
// ABOUTME: Uses mocked Supabase client with log capturing for clean test output
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import log from 'loglevel'
import { PlayerEventRepository } from '../PlayerEventRepository'
import { createMockSupabaseClient } from '../../__tests__/mocks/supabase'

describe('PlayerEventRepository', () => {
  let capturedLogs: Array<{level: string, message: string, args: any[]}> = []
  let originalMethodFactory: any
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>
  let repository: PlayerEventRepository

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
    repository = new PlayerEventRepository(mockSupabase as any)
  })

  afterEach(() => {
    // Restore original logging behavior
    log.methodFactory = originalMethodFactory
    log.rebuild()
  })

  describe('createEvent', () => {
    it('should create a new event with user data', async () => {
      const mockEventData = {
        id: '1',
        user_id: 'user1',
        event_type: 'CLAIM_HERO',
        hero_slug: 'astaroth',
        event_data: { initial_stars: 1, initial_equipment_level: 1 },
        created_at: '2024-01-15T10:00:00Z',
        created_by: 'user1'
      }

      vi.spyOn(repository, 'create').mockResolvedValue({
        data: mockEventData,
        error: null
      })

      const result = await repository.createEvent('user1', {
        event_type: 'CLAIM_HERO',
        hero_slug: 'astaroth',
        event_data: { initial_stars: 1, initial_equipment_level: 1 }
      })

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockEventData)
      expect(repository.create).toHaveBeenCalledWith({
        user_id: 'user1',
        created_by: 'user1',
        event_type: 'CLAIM_HERO',
        hero_slug: 'astaroth',
        event_data: { initial_stars: 1, initial_equipment_level: 1 }
      })
    })

    it('should handle create errors', async () => {
      const mockError = { message: 'Database error', code: 'DB_ERROR' }

      vi.spyOn(repository, 'create').mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await repository.createEvent('user1', {
        event_type: 'CLAIM_HERO',
        hero_slug: 'astaroth'
      })

      expect(result.error).toEqual(mockError)
      expect(result.data).toBeNull()
    })
  })

  describe('findEventsByUser', () => {
    it('should return user\'s events in chronological order', async () => {
      const mockEvents = [
        {
          id: '2',
          user_id: 'user1',
          event_type: 'UPDATE_HERO_STARS',
          hero_slug: 'astaroth',
          event_data: { previous_stars: 1, new_stars: 5 },
          created_at: '2024-01-15T11:00:00Z',
          created_by: 'user1'
        },
        {
          id: '1',
          user_id: 'user1',
          event_type: 'CLAIM_HERO',
          hero_slug: 'astaroth',
          event_data: { initial_stars: 1, initial_equipment_level: 1 },
          created_at: '2024-01-15T10:00:00Z',
          created_by: 'user1'
        }
      ]

      vi.spyOn(repository, 'findAll').mockResolvedValue({
        data: mockEvents,
        error: null
      })

      const result = await repository.findEventsByUser('user1')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockEvents)
      expect(repository.findAll).toHaveBeenCalledWith({
        where: { user_id: 'user1' },
        orderBy: { column: 'created_at', ascending: false }
      })
    })
  })

  describe('findEventsByHero', () => {
    it('should return events for specific hero', async () => {
      const mockEvents = [
        {
          id: '1',
          user_id: 'user1',
          event_type: 'CLAIM_HERO',
          hero_slug: 'astaroth',
          event_data: { initial_stars: 1, initial_equipment_level: 1 },
          created_at: '2024-01-15T10:00:00Z',
          created_by: 'user1'
        }
      ]

      vi.spyOn(repository, 'findAll').mockResolvedValue({
        data: mockEvents,
        error: null
      })

      const result = await repository.findEventsByHero('user1', 'astaroth')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockEvents)
      expect(repository.findAll).toHaveBeenCalledWith({
        where: { 
          user_id: 'user1',
          hero_slug: 'astaroth'
        },
        orderBy: { column: 'created_at', ascending: false }
      })
    })
  })

  describe('findEventsByType', () => {
    it('should return events filtered by type', async () => {
      const mockEvents = [
        {
          id: '1',
          user_id: 'user1',
          event_type: 'CLAIM_HERO',
          hero_slug: 'astaroth',
          event_data: { initial_stars: 1, initial_equipment_level: 1 },
          created_at: '2024-01-15T10:00:00Z',
          created_by: 'user1'
        },
        {
          id: '2',
          user_id: 'user1',
          event_type: 'CLAIM_HERO',
          hero_slug: 'aurora',
          event_data: { initial_stars: 3, initial_equipment_level: 8 },
          created_at: '2024-01-16T14:30:00Z',
          created_by: 'user1'
        }
      ]

      vi.spyOn(repository, 'findAll').mockResolvedValue({
        data: mockEvents,
        error: null
      })

      const result = await repository.findEventsByType('user1', 'CLAIM_HERO')

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockEvents)
      expect(repository.findAll).toHaveBeenCalledWith({
        where: { 
          user_id: 'user1',
          event_type: 'CLAIM_HERO'
        },
        orderBy: { column: 'created_at', ascending: false }
      })
    })
  })

  describe('findRecentEvents', () => {
    it('should return recent events with pagination', async () => {
      const mockEvents = [
        {
          id: '3',
          user_id: 'user1',
          event_type: 'UPDATE_HERO_EQUIPMENT',
          hero_slug: 'astaroth',
          event_data: { previous_equipment_level: 1, new_equipment_level: 12 },
          created_at: '2024-01-15T12:00:00Z',
          created_by: 'user1'
        },
        {
          id: '2',
          user_id: 'user1',
          event_type: 'UPDATE_HERO_STARS',
          hero_slug: 'astaroth',
          event_data: { previous_stars: 1, new_stars: 5 },
          created_at: '2024-01-15T11:00:00Z',
          created_by: 'user1'
        }
      ]

      vi.spyOn(repository, 'findAll').mockResolvedValue({
        data: mockEvents,
        error: null
      })

      const result = await repository.findRecentEvents('user1', 2, 0)

      expect(result.error).toBeNull()
      expect(result.data).toEqual(mockEvents)
      expect(repository.findAll).toHaveBeenCalledWith({
        where: { user_id: 'user1' },
        orderBy: { column: 'created_at', ascending: false },
        limit: 2,
        offset: 0
      })
    })

    it('should use default pagination values', async () => {
      vi.spyOn(repository, 'findAll').mockResolvedValue({
        data: [],
        error: null
      })

      await repository.findRecentEvents('user1')

      expect(repository.findAll).toHaveBeenCalledWith({
        where: { user_id: 'user1' },
        orderBy: { column: 'created_at', ascending: false },
        limit: 50,
        offset: 0
      })
    })
  })

  describe('event data handling', () => {
    it('should handle empty event data', async () => {
      vi.spyOn(repository, 'create').mockResolvedValue({
        data: {
          id: '1',
          user_id: 'user1',
          event_type: 'CLAIM_HERO',
          hero_slug: 'astaroth',
          event_data: {},
          created_at: '2024-01-15T10:00:00Z',
          created_by: 'user1'
        },
        error: null
      })

      const result = await repository.createEvent('user1', {
        event_type: 'CLAIM_HERO',
        hero_slug: 'astaroth'
      })

      expect(result.error).toBeNull()
      expect(repository.create).toHaveBeenCalledWith({
        user_id: 'user1',
        created_by: 'user1',
        event_type: 'CLAIM_HERO',
        hero_slug: 'astaroth',
        event_data: {}
      })
    })

    it('should handle complex event data', async () => {
      const complexEventData = {
        previous_stars: 3,
        new_stars: 6,
        metadata: {
          source: 'manual_update',
          timestamp: '2024-01-15T11:00:00Z'
        }
      }

      vi.spyOn(repository, 'create').mockResolvedValue({
        data: {
          id: '1',
          user_id: 'user1',
          event_type: 'UPDATE_HERO_STARS',
          hero_slug: 'astaroth',
          event_data: complexEventData,
          created_at: '2024-01-15T10:00:00Z',
          created_by: 'user1'
        },
        error: null
      })

      const result = await repository.createEvent('user1', {
        event_type: 'UPDATE_HERO_STARS',
        hero_slug: 'astaroth',
        event_data: complexEventData
      })

      expect(result.error).toBeNull()
      expect(repository.create).toHaveBeenCalledWith({
        user_id: 'user1',
        created_by: 'user1',
        event_type: 'UPDATE_HERO_STARS',
        hero_slug: 'astaroth',
        event_data: complexEventData
      })
    })
  })
})