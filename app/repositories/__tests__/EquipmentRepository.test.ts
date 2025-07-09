// ABOUTME: Tests for EquipmentRepository class with mocked Supabase client
// ABOUTME: Tests CRUD operations, relationships, bulk operations, and data transformation

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EquipmentRepository } from '../EquipmentRepository'
import { createMockSupabaseClient } from '../../__tests__/mocks/supabase'
import type { Database } from '~/types/supabase'
import type { EquipmentRecord } from '~/data/equipment.zod'

describe('EquipmentRepository', () => {
  let repository: EquipmentRepository
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    repository = EquipmentRepository.withSupabaseClient(mockSupabase as any)
  })

  describe('constructor', () => {
    it('should create repository with correct table name and primary key', () => {
      const repo = new EquipmentRepository()
      expect(repo).toBeInstanceOf(EquipmentRepository)
    })

    it('should create repository with Supabase client', () => {
      const repo = EquipmentRepository.withSupabaseClient(mockSupabase as any)
      expect(repo).toBeInstanceOf(EquipmentRepository)
    })
  })

  describe('findByQuality', () => {
    it('should find equipment by quality successfully', async () => {
      const mockEquipment: Database['public']['Tables']['equipment']['Row'] = {
        slug: 'test-equipment',
        name: 'Test Equipment',
        quality: 'blue',
        type: 'equipable',
        buy_value_gold: 1000,
        buy_value_coin: 0,
        sell_value: 200,
        guild_activity_points: 5,
        hero_level_required: 10,
        campaign_sources: ['1-1', '1-2'],
        crafting_gold_cost: null,
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockEquipment],
              error: null,
            }),
          }),
        }),
      })

      const result = await repository.findByQuality('blue')

      expect(result.data).toEqual([mockEquipment])
      expect(result.error).toBeNull()
      expect(mockSupabase.from).toHaveBeenCalledWith('equipment')
    })

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error', code: 'DB_ERROR' }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      })

      const result = await repository.findByQuality('blue')

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        message: mockError.message,
        code: mockError.code,
        details: mockError.message,
      })
    })
  })

  describe('findByType', () => {
    it('should find equipment by type successfully', async () => {
      const mockEquipment: Database['public']['Tables']['equipment']['Row'] = {
        slug: 'test-fragment',
        name: 'Test Fragment',
        quality: 'green',
        type: 'fragment',
        buy_value_gold: 500,
        buy_value_coin: 0,
        sell_value: 100,
        guild_activity_points: 2,
        hero_level_required: null,
        campaign_sources: ['2-1'],
        crafting_gold_cost: null,
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockEquipment],
              error: null,
            }),
          }),
        }),
      })

      const result = await repository.findByType('fragment')

      expect(result.data).toEqual([mockEquipment])
      expect(result.error).toBeNull()
    })
  })

  describe('findByCampaignSource', () => {
    it('should find equipment by campaign source successfully', async () => {
      const mockEquipment: Database['public']['Tables']['equipment']['Row'] = {
        slug: 'test-equipment',
        name: 'Test Equipment',
        quality: 'blue',
        type: 'equipable',
        buy_value_gold: 1000,
        buy_value_coin: 0,
        sell_value: 200,
        guild_activity_points: 5,
        hero_level_required: 10,
        campaign_sources: ['1-1', '1-2'],
        crafting_gold_cost: null,
      }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          contains: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [mockEquipment],
              error: null,
            }),
          }),
        }),
      })

      const result = await repository.findByCampaignSource('1-1')

      expect(result.data).toEqual([mockEquipment])
      expect(result.error).toBeNull()
    })
  })

  describe('findWithStats', () => {
    it('should find equipment with stats successfully', async () => {
      const mockEquipment: Database['public']['Tables']['equipment']['Row'] = {
        slug: 'test-equipment',
        name: 'Test Equipment',
        quality: 'blue',
        type: 'equipable',
        buy_value_gold: 1000,
        buy_value_coin: 0,
        sell_value: 200,
        guild_activity_points: 5,
        hero_level_required: 10,
        campaign_sources: ['1-1'],
        crafting_gold_cost: null,
      }

      const mockStats = [
        { equipment_slug: 'test-equipment', stat: 'strength', value: 100 },
        { equipment_slug: 'test-equipment', stat: 'agility', value: 50 },
      ]

      // Mock findById
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEquipment,
              error: null,
            }),
          }),
        }),
      })

      // Mock findStatsByEquipmentSlug
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockStats,
              error: null,
            }),
          }),
        }),
      })

      const result = await repository.findWithStats('test-equipment')

      expect(result.data).toEqual({
        equipment: mockEquipment,
        stats: mockStats,
      })
      expect(result.error).toBeNull()
    })

    it('should handle equipment not found', async () => {
      const mockError = { message: 'Not found', code: 'PGRST116', details: undefined }

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      })

      const result = await repository.findWithStats('non-existent')

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        message: mockError.message,
        code: mockError.code,
        details: mockError.details,
      })
    })
  })

  describe('findWithRequiredItems', () => {
    it('should find equipment with required items successfully', async () => {
      const mockEquipment: Database['public']['Tables']['equipment']['Row'] = {
        slug: 'test-equipment',
        name: 'Test Equipment',
        quality: 'blue',
        type: 'equipable',
        buy_value_gold: 1000,
        buy_value_coin: 0,
        sell_value: 200,
        guild_activity_points: 5,
        hero_level_required: 10,
        campaign_sources: null,
        crafting_gold_cost: 500,
      }

      const mockRequiredItems = [
        { base_slug: 'test-equipment', required_slug: 'component-1', quantity: 2 },
        { base_slug: 'test-equipment', required_slug: 'component-2', quantity: 1 },
      ]

      // Mock findById
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEquipment,
              error: null,
            }),
          }),
        }),
      })

      // Mock findRequiredItemsByEquipmentSlug
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockRequiredItems,
              error: null,
            }),
          }),
        }),
      })

      const result = await repository.findWithRequiredItems('test-equipment')

      expect(result.data).toEqual({
        equipment: mockEquipment,
        required_items: mockRequiredItems,
      })
      expect(result.error).toBeNull()
    })
  })

  describe('findWithFullDetails', () => {
    it('should find equipment with full details successfully', async () => {
      const mockEquipment: Database['public']['Tables']['equipment']['Row'] = {
        slug: 'test-equipment',
        name: 'Test Equipment',
        quality: 'blue',
        type: 'equipable',
        buy_value_gold: 1000,
        buy_value_coin: 0,
        sell_value: 200,
        guild_activity_points: 5,
        hero_level_required: 10,
        campaign_sources: ['1-1'],
        crafting_gold_cost: 500,
      }

      const mockStats = [
        { equipment_slug: 'test-equipment', stat: 'strength', value: 100 },
      ]

      const mockRequiredItems = [
        { base_slug: 'test-equipment', required_slug: 'component-1', quantity: 2 },
      ]

      // Mock findById
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockEquipment,
              error: null,
            }),
          }),
        }),
      })

      // Mock findStatsByEquipmentSlug
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockStats,
              error: null,
            }),
          }),
        }),
      })

      // Mock findRequiredItemsByEquipmentSlug
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockRequiredItems,
              error: null,
            }),
          }),
        }),
      })

      const result = await repository.findWithFullDetails('test-equipment')

      expect(result.data).toEqual({
        equipment: mockEquipment,
        stats: mockStats,
        required_items: mockRequiredItems,
      })
      expect(result.error).toBeNull()
    })
  })

  describe('bulkCreateStats', () => {
    it('should bulk create equipment stats successfully', async () => {
      const mockStatsData = [
        { equipment_slug: 'test-equipment', stat: 'strength', value: 100 },
        { equipment_slug: 'test-equipment', stat: 'agility', value: 50 },
      ]

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: mockStatsData,
            error: null,
          }),
        }),
      })

      const result = await repository.bulkCreateStats(mockStatsData)

      expect(result.data).toEqual(mockStatsData)
      expect(result.error).toBeNull()
      expect(mockSupabase.from).toHaveBeenCalledWith('equipment_stat')
    })

    it('should handle bulk create stats errors', async () => {
      const mockError = { message: 'Bulk insert failed', code: 'BULK_ERROR' }

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      })

      const result = await repository.bulkCreateStats([])

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        message: mockError.message,
        code: mockError.code,
        details: mockError.message,
      })
    })
  })

  describe('bulkCreateRequiredItems', () => {
    it('should bulk create required items successfully', async () => {
      const mockRequiredItemsData = [
        { base_slug: 'test-equipment', required_slug: 'component-1', quantity: 2 },
        { base_slug: 'test-equipment', required_slug: 'component-2', quantity: 1 },
      ]

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({
            data: mockRequiredItemsData,
            error: null,
          }),
        }),
      })

      const result = await repository.bulkCreateRequiredItems(mockRequiredItemsData)

      expect(result.data).toEqual(mockRequiredItemsData)
      expect(result.error).toBeNull()
      expect(mockSupabase.from).toHaveBeenCalledWith('equipment_required_item')
    })
  })

  describe('Data transformation methods', () => {
    const mockJsonEquipment: EquipmentRecord = {
      slug: 'test-equipment',
      name: 'Test Equipment',
      quality: 'blue',
      type: 'equipable',
      buy_value_gold: 1000,
      buy_value_coin: 0,
      sell_value: 200,
      guild_activity_points: 5,
      hero_level_required: 10,
      campaign_sources: ['1-1', '1-2'],
      stats: { strength: 100, agility: 50 },
      crafting: {
        gold_cost: 500,
        required_items: { 'component-1': 2, 'component-2': 1 },
      },
      updated_on: '2024-01-01T00:00:00Z',
    }

    describe('transformEquipmentFromJSON', () => {
      it('should transform JSON equipment to database format', () => {
        const result = EquipmentRepository.transformEquipmentFromJSON(mockJsonEquipment)

        expect(result).toEqual({
          slug: 'test-equipment',
          name: 'Test Equipment',
          quality: 'blue',
          type: 'equipable',
          buy_value_gold: 1000,
          buy_value_coin: 0,
          sell_value: 200,
          guild_activity_points: 5,
          hero_level_required: 10,
          campaign_sources: ['1-1', '1-2'],
          crafting_gold_cost: 500,
        })
      })

      it('should handle missing optional fields', () => {
        const minimalEquipment: EquipmentRecord = {
          slug: 'minimal-equipment',
          name: 'Minimal Equipment (Fragment)',
          quality: 'gray',
          type: 'fragment',
          buy_value_gold: 100,
          buy_value_coin: 0,
          sell_value: 20,
          guild_activity_points: 1,
          updated_on: '2024-01-01T00:00:00Z',
        } as EquipmentRecord

        const result = EquipmentRepository.transformEquipmentFromJSON(minimalEquipment)

        expect(result).toEqual({
          slug: 'minimal-equipment',
          name: 'Minimal Equipment (Fragment)',
          quality: 'gray',
          type: 'fragment',
          buy_value_gold: 100,
          buy_value_coin: 0,
          sell_value: 20,
          guild_activity_points: 1,
          hero_level_required: null,
          campaign_sources: null,
          crafting_gold_cost: null,
        })
      })
    })

    describe('transformStatsFromJSON', () => {
      it('should transform JSON stats to database format', () => {
        const result = EquipmentRepository.transformStatsFromJSON(mockJsonEquipment)

        expect(result).toEqual([
          { equipment_slug: 'test-equipment', stat: 'strength', value: 100 },
          { equipment_slug: 'test-equipment', stat: 'agility', value: 50 },
        ])
      })

      it('should handle missing stats', () => {
        const equipmentWithoutStats: EquipmentRecord = {
          slug: 'test-fragment',
          name: 'Test Fragment (Fragment)',
          quality: 'gray',
          type: 'fragment',
          buy_value_gold: 100,
          buy_value_coin: 0,
          sell_value: 20,
          guild_activity_points: 1,
          updated_on: '2024-01-01T00:00:00Z',
        } as EquipmentRecord

        const result = EquipmentRepository.transformStatsFromJSON(equipmentWithoutStats)

        expect(result).toEqual([])
      })
    })

    describe('transformRequiredItemsFromJSON', () => {
      it('should transform JSON required items to database format', () => {
        const result = EquipmentRepository.transformRequiredItemsFromJSON(mockJsonEquipment)

        expect(result).toEqual([
          { base_slug: 'test-equipment', required_slug: 'component-1', quantity: 2 },
          { base_slug: 'test-equipment', required_slug: 'component-2', quantity: 1 },
        ])
      })

      it('should handle missing crafting info', () => {
        const equipmentWithoutCrafting: EquipmentRecord = {
          slug: 'test-fragment',
          name: 'Test Fragment (Fragment)',
          quality: 'gray',
          type: 'fragment',
          buy_value_gold: 100,
          buy_value_coin: 0,
          sell_value: 20,
          guild_activity_points: 1,
          updated_on: '2024-01-01T00:00:00Z',
        } as EquipmentRecord

        const result = EquipmentRepository.transformRequiredItemsFromJSON(equipmentWithoutCrafting)

        expect(result).toEqual([])
      })
    })
  })

  describe('initializeFromJSON', () => {
    it('should initialize all equipment data from JSON successfully', async () => {
      const mockJsonData: EquipmentRecord[] = [
        {
          slug: 'test-equipment',
          name: 'Test Equipment',
          quality: 'blue',
          type: 'equipable',
          buy_value_gold: 1000,
          buy_value_coin: 0,
          sell_value: 200,
          guild_activity_points: 5,
          hero_level_required: 10,
          campaign_sources: ['1-1'],
          stats: { strength: 100 },
          crafting: {
            gold_cost: 500,
            required_items: { 'component-1': 2 },
          },
          updated_on: '2024-01-01T00:00:00Z',
        },
      ]

      const mockEquipment = [{ slug: 'test-equipment', name: 'Test Equipment' }]
      const mockStats = [{ equipment_slug: 'test-equipment', stat: 'strength', value: 100 }]
      const mockRequiredItems = [{ base_slug: 'test-equipment', required_slug: 'component-1', quantity: 2 }]

      // Mock equipment bulk creation
      vi.spyOn(repository, 'bulkCreate').mockResolvedValue({
        data: mockEquipment as any,
        error: null,
      })

      // Mock stats bulk creation
      vi.spyOn(repository, 'bulkCreateStats').mockResolvedValue({
        data: mockStats,
        error: null,
      })

      // Mock required items bulk creation
      vi.spyOn(repository, 'bulkCreateRequiredItems').mockResolvedValue({
        data: mockRequiredItems,
        error: null,
      })

      const result = await repository.initializeFromJSON(mockJsonData)

      expect(result.data).toEqual({
        equipment: mockEquipment,
        stats: mockStats,
        required_items: mockRequiredItems,
      })
      expect(result.error).toBeNull()
    })

    it('should handle equipment creation failure', async () => {
      const mockError = { message: 'Equipment creation failed', code: 'CREATE_ERROR' }

      vi.spyOn(repository, 'bulkCreate').mockResolvedValue({
        data: null,
        error: mockError,
      })

      const result = await repository.initializeFromJSON([])

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })
})