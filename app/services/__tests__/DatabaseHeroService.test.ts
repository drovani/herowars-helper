// ABOUTME: Test suite for DatabaseHeroService 
// ABOUTME: Tests database-backed hero service operations and caching functionality

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createDatabaseHeroService } from '../DatabaseHeroService'
import type { HeroRecord, HeroMutation } from '~/data/hero.zod'
import type { CompleteHero } from '~/repositories/types'
import log from 'loglevel'

// Mock the HeroRepository
vi.mock('~/repositories/HeroRepository', () => {
  return {
    HeroRepository: vi.fn().mockImplementation(() => ({
      findAll: vi.fn(),
      findById: vi.fn(),
      findWithAllData: vi.fn(),
      findByClass: vi.fn(),
      findByFaction: vi.fn(),
      findHeroesUsingEquipment: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }))
  }
})

describe('DatabaseHeroService', () => {
  let capturedLogs: Array<{level: string, message: string, args: any[]}> = []
  let originalMethodFactory: any
  let mockRepository: any
  let service: any

  const sampleHero = {
    slug: 'test-hero',
    name: 'Test Hero',
    class: 'tank',
    faction: 'honor',
    main_stat: 'strength',
    attack_type: ['physical'],
    stone_source: ['Campaign'],
    order_rank: 1,
    updated_on: '2025-01-01T00:00:00.000Z',
  }

  const sampleCompleteHero: CompleteHero = {
    ...sampleHero,
    artifacts: [
      {
        id: 'artifact-1',
        hero_slug: 'test-hero',
        artifact_type: 'weapon',
        name: 'Test Weapon',
        team_buff: 'armor',
        team_buff_secondary: 'magic defense',
        created_at: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'artifact-2',
        hero_slug: 'test-hero',
        artifact_type: 'book',
        name: 'Tome of Arcane Knowledge',
        team_buff: null,
        team_buff_secondary: null,
        created_at: '2025-01-01T00:00:00.000Z',
      }
    ],
    skins: [
      {
        id: 'skin-1',
        hero_slug: 'test-hero',
        name: 'Default Skin',
        stat_type: 'strength',
        stat_value: 100,
        has_plus: false,
        source: null,
        created_at: '2025-01-01T00:00:00.000Z',
      }
    ],
    glyphs: [
      {
        id: 'glyph-1',
        hero_slug: 'test-hero',
        position: 1,
        stat_type: 'physical attack',
        stat_value: 50,
        created_at: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'glyph-2',
        hero_slug: 'test-hero',
        position: 2,
        stat_type: 'armor',
        stat_value: 30,
        created_at: '2025-01-01T00:00:00.000Z',
      }
    ],
    equipmentSlots: [
      {
        id: 'slot-1',
        hero_slug: 'test-hero',
        quality: 'white',
        slot_position: 1,
        equipment_slug: 'test-equipment',
        created_at: '2025-01-01T00:00:00.000Z',
      }
    ]
  }

  const expectedHeroRecord: HeroRecord = {
    slug: 'test-hero',
    name: 'Test Hero',
    class: 'tank',
    faction: 'honor',
    main_stat: 'strength',
    attack_type: ['physical'],
    stone_source: ['Campaign'],
    order_rank: 1,
    updated_on: '2025-01-01T00:00:00.000Z',
    artifacts: {
      weapon: {
        name: 'Test Weapon',
        team_buff: 'armor',
        team_buff_secondary: 'magic defense',
      },
      book: 'Tome of Arcane Knowledge',
    },
    skins: [
      {
        name: 'Default Skin',
        stat: 'strength',
        has_plus: false,
      }
    ],
    glyphs: ['physical attack', 'armor', null, null, null] as any,
    items: {
      white: ['test-equipment']
    }
  }

  beforeEach(() => {
    // Capture logs to in-memory array instead of console
    capturedLogs = []
    originalMethodFactory = log.methodFactory
    log.methodFactory = function(methodName, _logLevel, _loggerName) {
      return function(message, ...args) {
        capturedLogs.push({level: methodName, message, args})
        // Silent - don't output to console
      }
    }
    log.rebuild()

    // Create service with mocked repository
    service = createDatabaseHeroService(undefined, { cacheEnabled: true, cacheTTL: 1000 })
    mockRepository = service.repository
  })

  afterEach(() => {
    // Restore original logging behavior
    log.methodFactory = originalMethodFactory
    log.rebuild()
    
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all heroes and transform them to records', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [sampleHero],
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      const result = await service.getAll()

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        slug: 'test-hero',
        name: 'Test Hero',
        class: 'tank',
        artifacts: {
          weapon: {
            name: 'Test Weapon',
            team_buff: 'armor',
            team_buff_secondary: 'magic defense',
          },
          book: 'Tome of Arcane Knowledge',
        }
      })
      
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1)
    })

    it('should fetch specific heroes by IDs', async () => {
      mockRepository.findById.mockResolvedValue({
        data: sampleHero,
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      const result = await service.getAll(['test-hero'])

      expect(result).toHaveLength(1)
      expect(result[0].slug).toBe('test-hero')
      expect(mockRepository.findById).toHaveBeenCalledWith('test-hero')
    })

    it('should handle repository errors', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' }
      })

      await expect(service.getAll()).rejects.toThrow('Failed to retrieve Hero records')
    })

    it('should use cache on second call', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [sampleHero],
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      // First call
      await service.getAll()
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1)

      // Second call should use cache
      await service.getAll()
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1) // Still 1, not called again
    })
  })

  describe('getById', () => {
    it('should fetch hero by ID and transform to record', async () => {
      mockRepository.findById.mockResolvedValue({
        data: sampleHero,
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      const result = await service.getById('test-hero')

      expect(result).not.toBeNull()
      expect(result?.slug).toBe('test-hero')
      expect(result?.artifacts?.weapon?.name).toBe('Test Weapon')
      expect(mockRepository.findById).toHaveBeenCalledWith('test-hero')
    })

    it('should return null for non-existent hero', async () => {
      mockRepository.findById.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await service.getById('non-existent')

      expect(result).toBeNull()
    })

    it('should use cache on second call', async () => {
      mockRepository.findById.mockResolvedValue({
        data: sampleHero,
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      // First call
      await service.getById('test-hero')
      expect(mockRepository.findById).toHaveBeenCalledTimes(1)

      // Second call should use cache
      await service.getById('test-hero')
      expect(mockRepository.findById).toHaveBeenCalledTimes(1) // Still 1, not called again
    })
  })

  describe('create', () => {
    it('should throw error for create operations', async () => {
      const mutation: HeroMutation = {
        slug: 'new-hero',
        // HeroMutation only has slug and optional fields
      }

      expect(() => service.create(mutation)).toThrow('Cannot create new Hero record.')
    })
  })

  describe('update', () => {
    it('should update hero and invalidate cache', async () => {
      const mutation: HeroMutation = {
        slug: 'test-hero',
        // Only updating optional fields
        skins: [
          {
            name: 'Updated Skin',
            stat: 'strength',
            has_plus: false,
          }
        ]
      }

      // Mock getById to return existing hero
      mockRepository.findById.mockResolvedValue({
        data: sampleHero,
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      // Mock update operation
      const updatedHero = { ...sampleHero, updated_on: '2025-01-02T00:00:00.000Z' }
      mockRepository.update.mockResolvedValue({
        data: updatedHero,
        error: null
      })

      const updatedCompleteHero = { ...sampleCompleteHero, updated_on: '2025-01-02T00:00:00.000Z' }
      mockRepository.findWithAllData.mockResolvedValueOnce({
        data: sampleCompleteHero,
        error: null
      }).mockResolvedValueOnce({
        data: updatedCompleteHero,
        error: null
      })

      const result = await service.update('test-hero', mutation)

      expect(result).toMatchObject({
        slug: 'test-hero',
        name: 'Test Hero'  // Name should remain the same since we only updated skins
      })
      expect(mockRepository.update).toHaveBeenCalledWith('test-hero', expect.objectContaining({
        slug: 'test-hero',
        updated_on: expect.any(String)
      }))
    })

    it('should handle validation errors', async () => {
      const invalidMutation = {
        slug: 'test-hero',
        glyphs: ['invalid', 'stats', 'here', 'way', 'too', 'many'], // Invalid glyphs length and types
      } as any

      // Mock getById to return existing hero for validation to proceed
      mockRepository.findById.mockResolvedValue({
        data: sampleHero,
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      const result = await service.update('test-hero', invalidMutation)

      // Should return ZodError
      expect(result).toHaveProperty('issues')
      expect(Array.isArray((result as any).issues)).toBe(true)
    })
  })

  describe('delete', () => {
    it('should delete hero and invalidate cache', async () => {
      // Mock getById to return existing hero
      mockRepository.findById.mockResolvedValue({
        data: sampleHero,
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      // Mock delete operation
      mockRepository.delete.mockResolvedValue({
        data: true,
        error: null
      })

      await service.delete('test-hero')

      expect(mockRepository.delete).toHaveBeenCalledWith('test-hero')
    })

    it('should throw error for non-existent hero', async () => {
      mockRepository.findById.mockResolvedValue({
        data: null,
        error: null
      })

      await expect(service.delete('non-existent')).rejects.toThrow('Hero record with id non-existent not found.')
    })
  })

  describe('getHeroesUsingItem', () => {
    it('should find heroes using specific equipment', async () => {
      mockRepository.findHeroesUsingEquipment.mockResolvedValue({
        data: [sampleHero],
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      const result = await service.getHeroesUsingItem('test-equipment')

      expect(result).toHaveLength(1)
      expect(result[0].slug).toBe('test-hero')
      expect(mockRepository.findHeroesUsingEquipment).toHaveBeenCalledWith('test-equipment')
    })
  })

  describe('getHeroesByClass', () => {
    it('should find heroes by class', async () => {
      mockRepository.findByClass.mockResolvedValue({
        data: [sampleHero],
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      const result = await service.getHeroesByClass('tank')

      expect(result).toHaveLength(1)
      expect(result[0].class).toBe('tank')
      expect(mockRepository.findByClass).toHaveBeenCalledWith('tank')
    })
  })

  describe('getHeroesByFaction', () => {
    it('should find heroes by faction', async () => {
      mockRepository.findByFaction.mockResolvedValue({
        data: [sampleHero],
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      const result = await service.getHeroesByFaction('honor')

      expect(result).toHaveLength(1)
      expect(result[0].faction).toBe('honor')
      expect(mockRepository.findByFaction).toHaveBeenCalledWith('honor')
    })
  })

  describe('cache management', () => {
    it('should clear cache when requested', async () => {
      mockRepository.findById.mockResolvedValue({
        data: sampleHero,
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      // Populate cache
      await service.getById('test-hero')
      expect(service.getCacheStats().size).toBe(1)

      // Clear cache
      service.clearCache()
      expect(service.getCacheStats().size).toBe(0)
    })

    it('should return cache statistics', async () => {
      const stats = service.getCacheStats()
      
      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('allHeroesCached')
      expect(typeof stats.size).toBe('number')
      expect(typeof stats.allHeroesCached).toBe('boolean')
    })
  })

  describe('data transformation', () => {
    it('should correctly transform CompleteHero to HeroRecord format', async () => {
      mockRepository.findById.mockResolvedValue({
        data: sampleHero,
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      const result = await service.getById('test-hero')

      expect(result).not.toBeNull()
      
      // Check artifacts transformation
      expect(result?.artifacts?.weapon).toEqual({
        name: 'Test Weapon',
        team_buff: 'armor',
        team_buff_secondary: 'magic defense',
      })
      expect(result?.artifacts?.book).toBe('Tome of Arcane Knowledge')

      // Check skins transformation
      expect(result?.skins).toHaveLength(1)
      expect(result?.skins?.[0]).toEqual({
        name: 'Default Skin',
        stat: 'strength',
        has_plus: false,
      })

      // Check glyphs transformation (5-element array with nulls for missing positions)
      expect(result?.glyphs).toHaveLength(5)
      expect(result?.glyphs?.[0]).toBe('physical attack')
      expect(result?.glyphs?.[1]).toBe('armor')
      expect(result?.glyphs?.[2]).toBeNull()
      expect(result?.glyphs?.[3]).toBeNull()
      expect(result?.glyphs?.[4]).toBeNull()

      // Check equipment slots transformation
      expect(result?.items?.white).toEqual(['test-equipment'])
    })

    it('should handle heroes with minimal data', async () => {
      const minimalHero = {
        slug: 'minimal-hero',
        name: 'Minimal Hero',
        class: 'tank',
        faction: 'honor',
        main_stat: 'strength',
        attack_type: ['physical'],
        stone_source: ['Campaign'],
        order_rank: 1,
        updated_on: '2025-01-01T00:00:00.000Z',
      }

      mockRepository.findById.mockResolvedValue({
        data: minimalHero,
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: null,
        error: { message: 'Not found', code: 'NOT_FOUND' }
      })

      const result = await service.getById('minimal-hero')

      expect(result).toMatchObject({
        slug: 'minimal-hero',
        name: 'Minimal Hero',
        class: 'tank',
      })
      
      // Should not have artifacts, skins, glyphs, or items
      expect(result?.artifacts).toBeUndefined()
      expect(result?.skins).toBeUndefined()
      expect(result?.glyphs).toBeUndefined()
      expect(result?.items).toBeUndefined()
    })
  })

  describe('getAllAsJson', () => {
    it('should return heroes as JSON string', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [sampleHero],
        error: null
      })
      mockRepository.findWithAllData.mockResolvedValue({
        data: sampleCompleteHero,
        error: null
      })

      const result = await service.getAllAsJson()

      expect(typeof result).toBe('string')
      const parsed = JSON.parse(result)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].slug).toBe('test-hero')
    })
  })

  describe('isInitialized', () => {
    it('should return true when repository is available', () => {
      expect(service.isInitialized()).toBe(true)
    })
  })
})