// ABOUTME: Integration tests for player roster page covering data loading and actions
// ABOUTME: Tests authentication flows and repository integration
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loader, action } from '../roster'
import { PlayerHeroRepository } from '~/repositories/PlayerHeroRepository'
import { HeroRepository } from '~/repositories/HeroRepository'

// Mock the repositories
vi.mock('~/repositories/PlayerHeroRepository')
vi.mock('~/repositories/HeroRepository')

describe('Player Roster Integration', () => {
  let mockRequest: Request
  let mockHeroRepo: any
  let mockPlayerHeroRepo: any

  beforeEach(() => {
    mockRequest = new Request('http://localhost:3000/player?userId=user1')
    
    mockHeroRepo = {
      findAll: vi.fn()
    }
    
    mockPlayerHeroRepo = {
      findWithHeroDetails: vi.fn(),
      addHeroToCollection: vi.fn(),
      updateHeroProgress: vi.fn(),
      removeFromCollection: vi.fn()
    }
    
    vi.mocked(HeroRepository).mockImplementation(() => mockHeroRepo)
    vi.mocked(PlayerHeroRepository).mockImplementation(() => mockPlayerHeroRepo)
  })

  describe('loader', () => {
    it('should load heroes and user collection', async () => {
      const mockHeroes = [
        { slug: 'astaroth', name: 'Astaroth', class: 'tank', faction: 'chaos', main_stat: 'strength', attack_type: ['physical'] },
        { slug: 'aurora', name: 'Aurora', class: 'tank', faction: 'chaos', main_stat: 'intelligence', attack_type: ['magic'] }
      ]
      
      const mockCollection = [
        {
          id: '1',
          user_id: 'user1',
          hero_slug: 'astaroth',
          stars: 5,
          equipment_level: 12,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          hero: mockHeroes[0]
        }
      ]

      mockHeroRepo.findAll.mockResolvedValue({ data: mockHeroes, error: null })
      mockPlayerHeroRepo.findWithHeroDetails.mockResolvedValue({ data: mockCollection, error: null })

      const result = await loader({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.heroes).toHaveLength(2)
      expect(result.playerCollection).toHaveLength(1)
      expect(result.playerCollection[0].hero_slug).toBe('astaroth')
    })

    it('should handle empty collection for unauthenticated user', async () => {
      const mockRequest = new Request('http://localhost:3000/player')
      const mockHeroes = [
        { slug: 'astaroth', name: 'Astaroth', class: 'tank', faction: 'chaos', main_stat: 'strength', attack_type: ['physical'] }
      ]

      mockHeroRepo.findAll.mockResolvedValue({ data: mockHeroes, error: null })

      const result = await loader({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.heroes).toHaveLength(1)
      expect(result.playerCollection).toHaveLength(0)
      expect(mockPlayerHeroRepo.findWithHeroDetails).not.toHaveBeenCalled()
    })

    it('should handle hero loading errors', async () => {
      mockHeroRepo.findAll.mockResolvedValue({ data: null, error: { message: 'DB Error' } })

      await expect(loader({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })).rejects.toThrow(Response)
    })

    it('should handle collection loading errors gracefully', async () => {
      const mockHeroes = [
        { slug: 'astaroth', name: 'Astaroth', class: 'tank', faction: 'chaos', main_stat: 'strength', attack_type: ['physical'] }
      ]

      mockHeroRepo.findAll.mockResolvedValue({ data: mockHeroes, error: null })
      mockPlayerHeroRepo.findWithHeroDetails.mockResolvedValue({ data: null, error: { message: 'Collection error' } })

      const result = await loader({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.heroes).toHaveLength(1)
      expect(result.playerCollection).toHaveLength(0) // Should default to empty array
    })
  })

  describe('action - addHero', () => {
    it('should add hero to collection', async () => {
      const formData = new FormData()
      formData.append('action', 'addHero')
      formData.append('userId', 'user1')
      formData.append('heroSlug', 'astaroth')
      formData.append('stars', '1')
      formData.append('equipmentLevel', '1')

      const mockRequest = new Request('http://localhost:3000/player', {
        method: 'POST',
        body: formData
      })

      const mockResult = {
        data: {
          id: '1',
          user_id: 'user1',
          hero_slug: 'astaroth',
          stars: 1,
          equipment_level: 1
        },
        error: null
      }

      mockPlayerHeroRepo.addHeroToCollection.mockResolvedValue(mockResult)

      const result = await action({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Hero added to collection')
      expect(mockPlayerHeroRepo.addHeroToCollection).toHaveBeenCalledWith('user1', {
        hero_slug: 'astaroth',
        stars: 1,
        equipment_level: 1
      })
    })

    it('should handle add hero errors', async () => {
      const formData = new FormData()
      formData.append('action', 'addHero')
      formData.append('userId', 'user1')
      formData.append('heroSlug', 'astaroth')

      const mockRequest = new Request('http://localhost:3000/player', {
        method: 'POST',
        body: formData
      })

      mockPlayerHeroRepo.addHeroToCollection.mockResolvedValue({
        data: null,
        error: { message: 'Hero already exists' }
      })

      const result = await action({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.error).toBe('Hero already exists')
    })
  })

  describe('action - updateStars', () => {
    it('should update hero stars', async () => {
      const formData = new FormData()
      formData.append('action', 'updateStars')
      formData.append('userId', 'user1')
      formData.append('heroSlug', 'astaroth')
      formData.append('stars', '5')

      const mockRequest = new Request('http://localhost:3000/player', {
        method: 'POST',
        body: formData
      })

      mockPlayerHeroRepo.updateHeroProgress.mockResolvedValue({
        data: { id: '1', stars: 5 },
        error: null
      })

      const result = await action({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Hero stars updated')
      expect(mockPlayerHeroRepo.updateHeroProgress).toHaveBeenCalledWith('user1', 'astaroth', { stars: 5 })
    })
  })

  describe('action - updateEquipment', () => {
    it('should update hero equipment level', async () => {
      const formData = new FormData()
      formData.append('action', 'updateEquipment')
      formData.append('userId', 'user1')
      formData.append('heroSlug', 'astaroth')
      formData.append('equipmentLevel', '15')

      const mockRequest = new Request('http://localhost:3000/player', {
        method: 'POST',
        body: formData
      })

      mockPlayerHeroRepo.updateHeroProgress.mockResolvedValue({
        data: { id: '1', equipment_level: 15 },
        error: null
      })

      const result = await action({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Hero equipment updated')
      expect(mockPlayerHeroRepo.updateHeroProgress).toHaveBeenCalledWith('user1', 'astaroth', { equipment_level: 15 })
    })
  })

  describe('action - removeHero', () => {
    it('should remove hero from collection', async () => {
      const formData = new FormData()
      formData.append('action', 'removeHero')
      formData.append('userId', 'user1')
      formData.append('heroSlug', 'astaroth')

      const mockRequest = new Request('http://localhost:3000/player', {
        method: 'POST',
        body: formData
      })

      mockPlayerHeroRepo.removeFromCollection.mockResolvedValue({
        data: true,
        error: null
      })

      const result = await action({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.success).toBe(true)
      expect(result.message).toBe('Hero removed from collection')
      expect(mockPlayerHeroRepo.removeFromCollection).toHaveBeenCalledWith('user1', 'astaroth')
    })
  })

  describe('action - authentication', () => {
    it('should return error for unauthenticated user', async () => {
      const formData = new FormData()
      formData.append('action', 'addHero')
      formData.append('heroSlug', 'astaroth')

      const mockRequest = new Request('http://localhost:3000/player', {
        method: 'POST',
        body: formData
      })

      const result = await action({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.error).toBe('User not authenticated')
    })

    it('should return error for invalid action', async () => {
      const formData = new FormData()
      formData.append('action', 'invalidAction')
      formData.append('userId', 'user1')

      const mockRequest = new Request('http://localhost:3000/player', {
        method: 'POST',
        body: formData
      })

      const result = await action({ request: mockRequest, params: {}, context: { VALUE_FROM_NETLIFY: 'test' } })

      expect(result.error).toBe('Invalid action')
    })
  })
})