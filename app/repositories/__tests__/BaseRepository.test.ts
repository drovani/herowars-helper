import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { BaseRepository } from '../BaseRepository'
import type { CreateInput, UpdateInput } from '../types'

vi.mock('loglevel', () => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}))

const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn(),
}

vi.mock('~/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({ 
    supabase: mockSupabaseClient, 
    headers: undefined 
  })),
}))

const mockEquipmentSchema = z.object({
  name: z.string(),
  slug: z.string(),
  quality: z.enum(['gray', 'green', 'blue', 'violet', 'orange']),
  type: z.enum(['equipable', 'fragment', 'recipe']),
  sell_value: z.number(),
  guild_activity_points: z.number(),
  buy_value_coin: z.number().nullable().optional(),
  buy_value_gold: z.number().nullable().optional(),
  campaign_sources: z.array(z.string()).nullable().optional(),
  crafting_gold_cost: z.number().nullable().optional(),
  hero_level_required: z.number().nullable().optional(),
})

class TestEquipmentRepository extends BaseRepository<'equipment'> {
  constructor(request: Request | null = null) {
    super('equipment', mockEquipmentSchema, request, 'slug')
  }
}

describe('BaseRepository', () => {
  let repository: TestEquipmentRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new TestEquipmentRepository()
  })

  describe('findAll', () => {
    it('should find all records successfully', async () => {
      const mockData = [
        {
          name: 'Test Equipment 1',
          slug: 'test-equipment-1',
          quality: 'green',
          type: 'equipable',
          sell_value: 100,
          guild_activity_points: 5,
        },
      ]

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: mockData,
        error: null,
      })

      const result = await repository.findAll()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('equipment')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      const mockError = {
        message: 'Database connection failed',
        code: 'CONNECTION_ERROR',
        details: 'Connection timeout',
      }

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: null,
        error: mockError,
      })

      const result = await repository.findAll()

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        message: 'Database connection failed',
        code: 'CONNECTION_ERROR',
        details: 'Connection timeout',
      })
    })

    it('should apply where conditions', async () => {
      const mockData = [{ name: 'Test', slug: 'test', quality: 'green', type: 'equipable', sell_value: 100, guild_activity_points: 5 }]

      // Mock the final call in the chain to resolve the promise
      mockSupabaseClient.eq.mockResolvedValueOnce({ data: mockData, error: null })

      const result = await repository.findAll({ where: { quality: 'green' } })

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('equipment')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('quality', 'green')
      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    it('should apply ordering', async () => {
      const mockData = [{ name: 'Test', slug: 'test', quality: 'green', type: 'equipable', sell_value: 100, guild_activity_points: 5 }]

      mockSupabaseClient.order.mockResolvedValueOnce({ data: mockData, error: null })

      const result = await repository.findAll({ orderBy: { column: 'name', ascending: true } })

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('equipment')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('name', { ascending: true })
      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    it('should apply limit', async () => {
      const mockData = [{ name: 'Test', slug: 'test', quality: 'green', type: 'equipable', sell_value: 100, guild_activity_points: 5 }]

      mockSupabaseClient.limit.mockResolvedValueOnce({ data: mockData, error: null })

      const result = await repository.findAll({ limit: 10 })

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('equipment')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.limit).toHaveBeenCalledWith(10)
      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })
  })

  describe('findById', () => {
    it('should find record by id successfully', async () => {
      const mockData = {
        name: 'Test Equipment',
        slug: 'test-equipment',
        quality: 'green',
        type: 'equipable',
        sell_value: 100,
        guild_activity_points: 5,
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockData,
        error: null,
      })

      const result = await repository.findById('test-equipment')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('equipment')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('slug', 'test-equipment')
      expect(mockSupabaseClient.single).toHaveBeenCalled()
      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    it('should handle not found errors', async () => {
      const mockError = {
        message: 'Record not found',
        code: 'PGRST116',
        details: 'No rows found',
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: mockError,
      })

      const result = await repository.findById('nonexistent')

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        message: 'Record not found',
        code: 'PGRST116',
        details: 'No rows found',
      })
    })
  })

  describe('create', () => {
    it('should create record successfully', async () => {
      const inputData: CreateInput<'equipment'> = {
        name: 'New Equipment',
        slug: 'new-equipment',
        quality: 'green',
        type: 'equipable',
        sell_value: 100,
        guild_activity_points: 5,
      }

      const mockCreatedData = {
        ...inputData,
        buy_value_coin: null,
        buy_value_gold: null,
        campaign_sources: null,
        crafting_gold_cost: null,
        hero_level_required: null,
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockCreatedData,
        error: null,
      })

      const result = await repository.create(inputData)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('equipment')
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(inputData)
      expect(mockSupabaseClient.select).toHaveBeenCalled()
      expect(mockSupabaseClient.single).toHaveBeenCalled()
      expect(result.data).toEqual(mockCreatedData)
      expect(result.error).toBeNull()
    })

    it('should handle validation errors', async () => {
      const invalidData = {
        name: 'Invalid Equipment',
        slug: 'invalid-equipment',
        quality: 'invalid-quality',
        type: 'equipable',
        sell_value: 100,
        guild_activity_points: 5,
      } as unknown as CreateInput<'equipment'>

      const result = await repository.create(invalidData)

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Validation failed')
      expect(result.error?.code).toBe('VALIDATION_ERROR')
    })

    it('should handle database insert errors', async () => {
      const inputData: CreateInput<'equipment'> = {
        name: 'New Equipment',
        slug: 'new-equipment',
        quality: 'green',
        type: 'equipable',
        sell_value: 100,
        guild_activity_points: 5,
      }

      const mockError = {
        message: 'Unique constraint violation',
        code: '23505',
        details: 'Key (slug)=(new-equipment) already exists',
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: mockError,
      })

      const result = await repository.create(inputData)

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        message: 'Unique constraint violation',
        code: '23505',
        details: 'Key (slug)=(new-equipment) already exists',
      })
    })
  })

  describe('update', () => {
    it('should update record successfully', async () => {
      const updateData: UpdateInput<'equipment'> = {
        name: 'Updated Equipment',
        sell_value: 150,
      }

      const mockUpdatedData = {
        name: 'Updated Equipment',
        slug: 'test-equipment',
        quality: 'green',
        type: 'equipable',
        sell_value: 150,
        guild_activity_points: 5,
        buy_value_coin: null,
        buy_value_gold: null,
        campaign_sources: null,
        crafting_gold_cost: null,
        hero_level_required: null,
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockUpdatedData,
        error: null,
      })

      const result = await repository.update('test-equipment', updateData)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('equipment')
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateData)
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('slug', 'test-equipment')
      expect(mockSupabaseClient.select).toHaveBeenCalled()
      expect(mockSupabaseClient.single).toHaveBeenCalled()
      expect(result.data).toEqual(mockUpdatedData)
      expect(result.error).toBeNull()
    })

    it('should handle validation errors for updates', async () => {
      const invalidUpdateData = {
        quality: 'invalid-quality',
      } as unknown as UpdateInput<'equipment'>

      const result = await repository.update('test-equipment', invalidUpdateData)

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Validation failed')
      expect(result.error?.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('delete', () => {
    it('should delete record successfully', async () => {
      mockSupabaseClient.eq.mockResolvedValueOnce({
        error: null,
      })

      const result = await repository.delete('test-equipment')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('equipment')
      expect(mockSupabaseClient.delete).toHaveBeenCalled()
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('slug', 'test-equipment')
      expect(result.data).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should handle delete errors', async () => {
      const mockError = {
        message: 'Record not found',
        code: 'PGRST116',
        details: 'No rows found',
      }

      mockSupabaseClient.eq.mockResolvedValueOnce({
        error: mockError,
      })

      const result = await repository.delete('nonexistent')

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        message: 'Record not found',
        code: 'PGRST116',
        details: 'No rows found',
      })
    })
  })

  describe('bulkCreate', () => {
    it('should handle bulk create successfully', async () => {
      const inputData: CreateInput<'equipment'>[] = [
        {
          name: 'Equipment 1',
          slug: 'equipment-1',
          quality: 'green',
          type: 'equipable',
          sell_value: 100,
          guild_activity_points: 5,
        },
      ]

      const mockCreatedData = {
        ...inputData[0],
        buy_value_coin: null,
        buy_value_gold: null,
        campaign_sources: null,
        crafting_gold_cost: null,
        hero_level_required: null,
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockCreatedData,
        error: null,
      })

      const result = await repository.bulkCreate(inputData)

      expect(result.data).toEqual([mockCreatedData])
      expect(result.error).toBeNull()
    })

    it('should handle partial failures in bulk operations', async () => {
      const inputData: CreateInput<'equipment'>[] = [
        {
          name: 'Equipment 1',
          slug: 'equipment-1',
          quality: 'green',
          type: 'equipable',
          sell_value: 100,
          guild_activity_points: 5,
        },
        {
          name: 'Equipment 2',
          slug: 'equipment-2',
          quality: 'blue',
          type: 'fragment',
          sell_value: 200,
          guild_activity_points: 10,
        },
      ]

      const mockSuccessData = {
        ...inputData[0],
        buy_value_coin: null,
        buy_value_gold: null,
        campaign_sources: null,
        crafting_gold_cost: null,
        hero_level_required: null,
      }

      const mockError = {
        message: 'Constraint violation',
        code: '23505',
        details: 'Duplicate key',
      }

      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: mockSuccessData,
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: mockError,
        })

      const result = await repository.bulkCreate(inputData)

      expect(result.data).toEqual([mockSuccessData])
      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('1 errors')
      expect(result.error?.code).toBe('BULK_PARTIAL_FAILURE')
    })

    it('should call onProgress callback during bulk operations', async () => {
      const inputData: CreateInput<'equipment'>[] = [
        {
          name: 'Equipment 1',
          slug: 'equipment-1',
          quality: 'green',
          type: 'equipable',
          sell_value: 100,
          guild_activity_points: 5,
        },
      ]

      const mockCreatedData = {
        ...inputData[0],
        buy_value_coin: null,
        buy_value_gold: null,
        campaign_sources: null,
        crafting_gold_cost: null,
        hero_level_required: null,
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockCreatedData,
        error: null,
      })

      const progressCallback = vi.fn()
      const result = await repository.bulkCreate(inputData, {
        onProgress: progressCallback,
      })

      expect(progressCallback).toHaveBeenCalledWith(1, 1)
      expect(result.data).toEqual([mockCreatedData])
      expect(result.error).toBeNull()
    })
  })

  describe('protected methods', () => {
    it('should build basic select clause', () => {
      expect((repository as any).buildSelectClause()).toBe('*')
    })

    it('should build select clause with includes', () => {
      const include = {
        equipment_stats: true,
        required_items: true,
      }
      const result = (repository as any).buildSelectClause(include)
      expect(result).toContain('equipment_stats(*)')
      expect(result).toContain('required_items(*)')
    })
  })
})