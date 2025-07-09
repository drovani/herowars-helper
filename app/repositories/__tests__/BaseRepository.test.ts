import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { z } from 'zod'
import log from 'loglevel'
import { BaseRepository } from '../BaseRepository'
import type { CreateInput, UpdateInput } from '../types'

const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
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
  let capturedLogs: Array<{level: string, message: string, args: any[]}> = []
  let originalMethodFactory: any

  beforeEach(() => {
    vi.clearAllMocks()
    
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
    
    repository = new TestEquipmentRepository()
  })

  afterEach(() => {
    // Restore original logging behavior
    log.methodFactory = originalMethodFactory
    log.rebuild()
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

    it('should apply multiple ordering criteria', async () => {
      const mockData = [{ name: 'Test', slug: 'test', quality: 'green', type: 'equipable', sell_value: 100, guild_activity_points: 5 }]

      // Mock the chain to return mockData on the final call
      mockSupabaseClient.order.mockReturnValueOnce(mockSupabaseClient)
      mockSupabaseClient.order.mockResolvedValueOnce({ data: mockData, error: null })

      const result = await repository.findAll({ 
        orderBy: [
          { column: 'quality', ascending: true },
          { column: 'name', ascending: false }
        ]
      })

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('equipment')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('quality', { ascending: true })
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('name', { ascending: false })
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
        code: 'CONSTRAINT_VIOLATION',
        details: 'Unique constraint violation',
      })
    })
  })

  describe('create with skipExisting', () => {
    it('should skip existing record when skipExisting is true', async () => {
      const inputData: CreateInput<'equipment'> = {
        name: 'Existing Equipment',
        slug: 'existing-equipment',
        quality: 'green',
        type: 'equipable',
        sell_value: 100,
        guild_activity_points: 5,
      }

      const existingData = {
        ...inputData,
        buy_value_coin: null,
        buy_value_gold: null,
        campaign_sources: null,
        crafting_gold_cost: null,
        hero_level_required: null,
      }

      // Mock findById to return existing record
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: existingData,
        error: null,
      })

      const result = await repository.create(inputData, { skipExisting: true })

      expect(result.data).toEqual(existingData)
      expect(result.error).toBeNull()
      expect(result.skipped).toBe(true)
      expect(mockSupabaseClient.insert).not.toHaveBeenCalled()
    })

    it('should create new record when skipExisting is true but record does not exist', async () => {
      const inputData: CreateInput<'equipment'> = {
        name: 'New Equipment',
        slug: 'new-equipment',
        quality: 'green',
        type: 'equipable',
        sell_value: 100,
        guild_activity_points: 5,
      }

      const createdData = {
        ...inputData,
        buy_value_coin: null,
        buy_value_gold: null,
        campaign_sources: null,
        crafting_gold_cost: null,
        hero_level_required: null,
      }

      // Mock findById to return no record
      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'Not found', code: 'PGRST116' }
        })
        .mockResolvedValueOnce({
          data: createdData,
          error: null,
        })

      const result = await repository.create(inputData, { skipExisting: true })

      expect(result.data).toEqual(createdData)
      expect(result.error).toBeNull()
      expect(result.skipped).toBe(false)
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(inputData)
    })

    it('should return error when skipExisting is false and record exists', async () => {
      const inputData: CreateInput<'equipment'> = {
        name: 'Existing Equipment',
        slug: 'existing-equipment',
        quality: 'green',
        type: 'equipable',
        sell_value: 100,
        guild_activity_points: 5,
      }

      const mockError = {
        message: 'Unique constraint violation',
        code: '23505',
        details: 'Key (slug)=(existing-equipment) already exists',
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: mockError,
      })

      const result = await repository.create(inputData, { skipExisting: false })

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        message: 'Unique constraint violation',
        code: 'CONSTRAINT_VIOLATION',
        details: 'Unique constraint violation',
      })
      expect(result.skipped).toBeUndefined()
    })
  })

  describe('bulkCreate with skipExisting', () => {
    it('should handle mixed creation and skipping', async () => {
      const inputData: CreateInput<'equipment'>[] = [
        {
          name: 'New Equipment',
          slug: 'new-equipment',
          quality: 'green',
          type: 'equipable',
          sell_value: 100,
          guild_activity_points: 5,
        },
        {
          name: 'Existing Equipment',
          slug: 'existing-equipment',
          quality: 'blue',
          type: 'fragment',
          sell_value: 200,
          guild_activity_points: 10,
        },
      ]

      const newEquipmentData = { ...inputData[0], buy_value_coin: null, buy_value_gold: null, campaign_sources: null, crafting_gold_cost: null, hero_level_required: null }
      const existingEquipmentData = { ...inputData[1], buy_value_coin: null, buy_value_gold: null, campaign_sources: null, crafting_gold_cost: null, hero_level_required: null }

      // Mock responses for create calls
      mockSupabaseClient.single
        // First item - findById returns null (doesn't exist), then insert succeeds  
        .mockResolvedValueOnce({ data: null, error: { message: 'Not found', code: 'PGRST116' } })
        .mockResolvedValueOnce({ data: newEquipmentData, error: null })
        // Second item - findById returns existing record (no insert call)
        .mockResolvedValueOnce({ data: existingEquipmentData, error: null })

      const result = await repository.bulkCreate(inputData, { skipExisting: true })

      // Should have exactly 1 created item and 1 skipped item
      expect(result.data).toHaveLength(1)
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('BULK_PARTIAL_SUCCESS')
      expect((result.error?.details as any)?.skipped).toHaveLength(1)
      
      // The created item should have the properties we expect
      expect(result.data?.[0]).toBeDefined()
      expect((result.error?.details as any)?.skipped[0]).toBeDefined()
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
        message: 'Not found',
        code: 'NOT_FOUND',
        details: 'Record not found',
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

  describe('upsert', () => {
    it('should upsert record successfully', async () => {
      const inputData: CreateInput<'equipment'> = {
        name: 'Test Equipment',
        slug: 'test-equipment',
        quality: 'green',
        type: 'equipable',
        sell_value: 100,
        guild_activity_points: 5,
      }

      const mockUpsertedData = {
        ...inputData,
        buy_value_coin: null,
        buy_value_gold: null,
        campaign_sources: null,
        crafting_gold_cost: null,
        hero_level_required: null,
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockUpsertedData,
        error: null,
      })

      const result = await repository.upsert(inputData)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('equipment')
      expect(mockSupabaseClient.upsert).toHaveBeenCalledWith(inputData, {
        onConflict: 'slug',
        ignoreDuplicates: false,
      })
      expect(mockSupabaseClient.select).toHaveBeenCalled()
      expect(mockSupabaseClient.single).toHaveBeenCalled()
      expect(result.data).toEqual(mockUpsertedData)
      expect(result.error).toBeNull()
    })

    it('should handle upsert validation errors', async () => {
      const invalidData = {
        name: 'Test Equipment',
        slug: 'test-equipment',
        quality: 'invalid-quality',
        type: 'equipable',
        sell_value: 100,
        guild_activity_points: 5,
      } as unknown as CreateInput<'equipment'>

      const result = await repository.upsert(invalidData)

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error?.message).toBe('Validation failed')
      expect(result.error?.code).toBe('VALIDATION_ERROR')
    })

    it('should handle upsert database errors', async () => {
      const inputData: CreateInput<'equipment'> = {
        name: 'Test Equipment',
        slug: 'test-equipment',
        quality: 'green',
        type: 'equipable',
        sell_value: 100,
        guild_activity_points: 5,
      }

      const mockError = {
        message: 'Constraint violation',
        code: '23505',
        details: 'Duplicate key',
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: mockError,
      })

      const result = await repository.upsert(inputData)

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        message: 'Unique constraint violation',
        code: 'CONSTRAINT_VIOLATION',
        details: 'Constraint violation',
      })
    })
  })

  describe('bulkUpsert', () => {
    it('should handle bulk upsert successfully', async () => {
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

      const mockUpsertedData = inputData.map(item => ({
        ...item,
        buy_value_coin: null,
        buy_value_gold: null,
        campaign_sources: null,
        crafting_gold_cost: null,
        hero_level_required: null,
      }))

      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: mockUpsertedData[0],
          error: null,
        })
        .mockResolvedValueOnce({
          data: mockUpsertedData[1],
          error: null,
        })

      const result = await repository.bulkUpsert(inputData)

      expect(result.data).toEqual(mockUpsertedData)
      expect(result.error).toBeNull()
    })

    it('should handle partial failures in bulk upsert operations', async () => {
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
        message: 'Permission denied',
        code: '42501',
        details: 'RLS violation',
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

      const result = await repository.bulkUpsert(inputData)

      expect(result.data).toEqual([mockSuccessData])
      expect(result.error).toBeDefined()
      expect(result.error?.message).toContain('1 errors')
      expect(result.error?.code).toBe('BULK_PARTIAL_FAILURE')
    })
  })

  describe('protected methods', () => {
    it('should build basic select clause', () => {
      expect((repository as any).buildSelectClause()).toBe('*')
    })

    it('should build select clause with includes', () => {
      // Override getTableRelationships for this test
      ;(repository as any).getTableRelationships = vi.fn().mockReturnValue({
        equipment_stats: true,
        required_items: true,
      })
      
      const include = {
        equipment_stats: true,
        required_items: true,
      }
      const result = (repository as any).buildSelectClause(include)
      expect(result).toContain('equipment_stats(*)')
      expect(result).toContain('required_items(*)')
    })
  })

  describe('log capturing', () => {
    it('should capture error logs instead of outputting to console', async () => {
      // Simulate a database error that would trigger log.error
      const mockError = {
        message: 'Database connection failed',
        code: 'CONNECTION_ERROR',
        details: 'Connection timeout',
      }

      mockSupabaseClient.select.mockResolvedValueOnce({
        data: null,
        error: mockError,
      })

      await repository.findAll()

      // Verify that the error was captured in our log array
      expect(capturedLogs).toHaveLength(1)
      expect(capturedLogs[0].level).toBe('error')
      expect(capturedLogs[0].message).toContain('Error finding all equipment')
      expect(capturedLogs[0].args).toEqual([mockError])
    })
  })
})