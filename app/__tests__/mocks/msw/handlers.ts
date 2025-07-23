// ABOUTME: MSW request handlers for intercepting Supabase REST API calls during tests
// ABOUTME: Provides realistic HTTP responses for database operations without hitting real Supabase

import { http, HttpResponse } from 'msw'
import { createMockEquipment, createMockMission, createMockChapter, SUPABASE_ERRORS, createMockEquipmentList } from './factories'
import type { Database } from '~/types/supabase'

type Equipment = Database['public']['Tables']['equipment']['Row']
type Mission = Database['public']['Tables']['mission']['Row']
type Chapter = Database['public']['Tables']['chapter']['Row']

// In-memory store for handling stateful operations during tests
let equipmentStore: Equipment[] = []
let missionStore: Mission[] = []
let chapterStore: Chapter[] = []

/**
 * Helper to extract table name from URL path
 */
const getTableFromPath = (url: URL): string => {
  const pathMatch = url.pathname.match(/\/rest\/v1\/([^/?]+)/)
  return pathMatch?.[1] || ''
}

/**
 * Helper to validate Supabase request headers
 */
const validateSupabaseHeaders = (request: Request) => {
  const apiKey = request.headers.get('apikey')
  const authorization = request.headers.get('Authorization')
  
  if (!apiKey || !authorization) {
    return HttpResponse.json(
      SUPABASE_ERRORS.PERMISSION_DENIED.error,
      { status: 401 }
    )
  }
  return null
}

/**
 * Equipment table handlers
 */
const equipmentHandlers = [
  // GET /rest/v1/equipment - Select operations
  http.get('*/rest/v1/equipment', ({ request }) => {
    const headerValidation = validateSupabaseHeaders(request)
    if (headerValidation) return headerValidation

    const url = new URL(request.url)
    const select = url.searchParams.get('select')
    const filter = url.searchParams.get('slug')
    const limit = url.searchParams.get('limit')
    const order = url.searchParams.get('order')

    // Handle single record fetch (with .single() modifier)
    if (filter && filter.startsWith('eq.')) {
      const slug = filter.replace('eq.', '')
      const equipment = equipmentStore.find(e => e.slug === slug) || createMockEquipment({ slug })
      
      // Check for .single() in select parameter or accept header
      const acceptHeader = request.headers.get('Accept')
      if (acceptHeader?.includes('application/vnd.pgrst.object+json')) {
        return HttpResponse.json(equipment)
      }
      
      return HttpResponse.json([equipment])
    }

    // Handle list operations
    let data = equipmentStore.length > 0 ? equipmentStore : createMockEquipmentList(3)

    // Apply ordering if specified
    if (order) {
      // Handle comma-separated multiple order clauses
      const orderClauses = order.split(',')
      data = [...data].sort((a, b) => {
        for (const orderClause of orderClauses) {
          const [column, direction] = orderClause.trim().split('.')
          const ascending = direction === 'asc'
          const aVal = (a as any)[column]
          const bVal = (b as any)[column]
          
          if (aVal < bVal) return ascending ? -1 : 1
          if (aVal > bVal) return ascending ? 1 : -1
        }
        return 0
      })
    }

    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit, 10)
      data = data.slice(0, limitNum)
    }

    return HttpResponse.json(data)
  }),

  // POST /rest/v1/equipment - Insert operations
  http.post('*/rest/v1/equipment', async ({ request }) => {
    const headerValidation = validateSupabaseHeaders(request)
    if (headerValidation) return headerValidation

    const body = await request.json() as Partial<Equipment>
    const newEquipment = createMockEquipment(body)
    
    // Check if item already exists (simulate unique constraint)
    const existing = equipmentStore.find(e => e.slug === newEquipment.slug)
    if (existing) {
      return HttpResponse.json(
        SUPABASE_ERRORS.UNIQUE_CONSTRAINT.error,
        { status: 409 }
      )
    }

    equipmentStore.push(newEquipment)
    
    // Handle .single() response format
    const acceptHeader = request.headers.get('Accept')
    if (acceptHeader?.includes('application/vnd.pgrst.object+json')) {
      return HttpResponse.json(newEquipment, { status: 201 })
    }
    
    return HttpResponse.json([newEquipment], { status: 201 })
  }),

  // PATCH /rest/v1/equipment - Update operations
  http.patch('*/rest/v1/equipment', async ({ request }) => {
    const headerValidation = validateSupabaseHeaders(request)
    if (headerValidation) return headerValidation

    const url = new URL(request.url)
    const filter = url.searchParams.get('slug')
    
    if (!filter || !filter.startsWith('eq.')) {
      return HttpResponse.json(
        SUPABASE_ERRORS.VALIDATION_ERROR.error,
        { status: 400 }
      )
    }

    const slug = filter.replace('eq.', '')
    const body = await request.json() as Partial<Equipment>
    
    const equipmentIndex = equipmentStore.findIndex(e => e.slug === slug)
    if (equipmentIndex === -1) {
      return HttpResponse.json(
        SUPABASE_ERRORS.NOT_FOUND.error,
        { status: 404 }
      )
    }

    const updatedEquipment = { ...equipmentStore[equipmentIndex], ...body }
    equipmentStore[equipmentIndex] = updatedEquipment

    // Handle .single() response format
    const acceptHeader = request.headers.get('Accept')
    if (acceptHeader?.includes('application/vnd.pgrst.object+json')) {
      return HttpResponse.json(updatedEquipment)
    }
    
    return HttpResponse.json([updatedEquipment])
  }),

  // DELETE /rest/v1/equipment - Delete operations
  http.delete('*/rest/v1/equipment', ({ request }) => {
    const headerValidation = validateSupabaseHeaders(request)
    if (headerValidation) return headerValidation

    const url = new URL(request.url)
    const filter = url.searchParams.get('slug')
    
    if (!filter || !filter.startsWith('eq.')) {
      return HttpResponse.json(
        SUPABASE_ERRORS.VALIDATION_ERROR.error,
        { status: 400 }
      )
    }

    const slug = filter.replace('eq.', '')
    const equipmentIndex = equipmentStore.findIndex(e => e.slug === slug)
    
    if (equipmentIndex === -1) {
      return HttpResponse.json(
        SUPABASE_ERRORS.NOT_FOUND.error,
        { status: 404 }
      )
    }

    equipmentStore.splice(equipmentIndex, 1)
    return HttpResponse.json(null, { status: 204 })
  }),
]

/**
 * Mission table handlers with enhanced filtering and relationship support
 */
const missionHandlers = [
  // GET /rest/v1/mission - Enhanced with filtering and relationships
  http.get('*/rest/v1/mission', ({ request }) => {
    const headerValidation = validateSupabaseHeaders(request)
    if (headerValidation) return headerValidation

    const url = new URL(request.url)
    const select = url.searchParams.get('select')
    const slugFilter = url.searchParams.get('slug')
    const chapterIdFilter = url.searchParams.get('chapter_id')
    const heroSlugFilter = url.searchParams.get('hero_slug')
    const order = url.searchParams.getAll('order')
    
    let data: Mission[] = missionStore.length > 0 ? missionStore : [createMockMission()]

    // Handle single record fetch by slug
    if (slugFilter && slugFilter.startsWith('eq.')) {
      const slug = slugFilter.replace('eq.', '')
      let mission = data.find(m => m.slug === slug) || createMockMission({ slug })
      
      // Handle select with relationships (e.g., "*, chapter(*)")
      if (select?.includes('chapter(')) {
        const chapter = chapterStore.find(c => c.id === mission.chapter_id) || createMockChapter({ id: mission.chapter_id })
        mission = { ...mission, chapter } as any
      }
      
      const acceptHeader = request.headers.get('Accept')
      if (acceptHeader?.includes('application/vnd.pgrst.object+json')) {
        return HttpResponse.json(mission)
      }
      
      return HttpResponse.json([mission])
    }
    
    // Handle IN filter for slug (e.g., slug=in.(1-1,1-2,2-3))
    if (slugFilter && slugFilter.startsWith('in.(')) {
      const slugs = slugFilter.replace('in.(', '').replace(')', '').split(',')
      data = data.filter(m => slugs.includes(m.slug))
    }

    // Handle chapter_id filter
    if (chapterIdFilter && chapterIdFilter.startsWith('eq.')) {
      const chapterId = parseInt(chapterIdFilter.replace('eq.', ''), 10)
      data = data.filter(m => m.chapter_id === chapterId)
    }
    
    // Handle hero_slug filter
    if (heroSlugFilter && heroSlugFilter.startsWith('eq.')) {
      const heroSlug = heroSlugFilter.replace('eq.', '')
      data = data.filter(m => m.hero_slug === heroSlug)
    }

    // Apply ordering
    if (order.length > 0) {
      data = [...data].sort((a, b) => {
        for (const orderParam of order) {
          // Handle comma-separated order clauses (like BaseRepository)
          const orderClauses = orderParam.split(',')
          for (const orderClause of orderClauses) {
            const [column, direction] = orderClause.trim().split('.')
            const ascending = direction === 'asc'
            const aVal = (a as any)[column]
            const bVal = (b as any)[column]
            
            if (aVal < bVal) return ascending ? -1 : 1
            if (aVal > bVal) return ascending ? 1 : -1
          }
        }
        return 0
      })
    }

    return HttpResponse.json(data)
  }),

  // POST /rest/v1/mission - Enhanced with proper response handling
  http.post('*/rest/v1/mission', async ({ request }) => {
    const headerValidation = validateSupabaseHeaders(request)
    if (headerValidation) return headerValidation

    const body = await request.json() as Partial<Mission>
    const newMission = createMockMission(body)
    
    const existing = missionStore.find(m => m.slug === newMission.slug)
    if (existing) {
      return HttpResponse.json(
        SUPABASE_ERRORS.UNIQUE_CONSTRAINT.error,
        { status: 409 }
      )
    }

    missionStore.push(newMission)
    
    const acceptHeader = request.headers.get('Accept')
    if (acceptHeader?.includes('application/vnd.pgrst.object+json')) {
      return HttpResponse.json(newMission, { status: 201 })
    }
    
    return HttpResponse.json([newMission], { status: 201 })
  }),

  // DELETE /rest/v1/mission - Enhanced with count support
  http.delete('*/rest/v1/mission', ({ request }) => {
    const headerValidation = validateSupabaseHeaders(request)
    if (headerValidation) return headerValidation

    const url = new URL(request.url)
    const filter = url.searchParams.get('slug')
    
    if (filter && filter.startsWith('eq.')) {
      const slug = filter.replace('eq.', '')
      const missionIndex = missionStore.findIndex(m => m.slug === slug)
      
      if (missionIndex === -1) {
        return HttpResponse.json(
          SUPABASE_ERRORS.NOT_FOUND.error,
          { status: 404 }
        )
      }

      missionStore.splice(missionIndex, 1)
      return HttpResponse.json(null, { status: 204 })
    }
    
    // Handle bulk delete with gte for slug (e.g., for purgeMissionDomain)
    if (filter && filter.startsWith('gte.')) {
      const minSlug = filter.replace('gte.', '')
      const initialCount = missionStore.length
      // For gte("slug", "") - delete all missions with slug >= empty string (all missions)
      if (minSlug === '') {
        missionStore = []
      } else {
        missionStore = missionStore.filter(m => m.slug < minSlug)
      }
      const deletedCount = initialCount - missionStore.length
      
      return HttpResponse.json(null, { 
        status: 204,
        headers: { 'Content-Range': `*/${deletedCount}` }
      })
    }
    
    // General delete all (for purge operations)
    const deletedCount = missionStore.length
    missionStore = []
    
    return HttpResponse.json(null, { 
      status: 204,
      headers: { 'Content-Range': `*/${deletedCount}` }
    })
  }),
]

/**
 * Chapter table handlers for chapter-related operations
 */
const chapterHandlers = [
  // GET /rest/v1/chapter - Find chapters with optional missions relationship
  http.get('*/rest/v1/chapter', ({ request }) => {
    const headerValidation = validateSupabaseHeaders(request)
    if (headerValidation) return headerValidation

    const url = new URL(request.url)
    const select = url.searchParams.get('select')
    const idFilter = url.searchParams.get('id')
    const order = url.searchParams.get('order')
    
    let data: Chapter[] = chapterStore.length > 0 ? chapterStore : [createMockChapter()]

    // Handle single record fetch by id
    if (idFilter && idFilter.startsWith('eq.')) {
      const id = parseInt(idFilter.replace('eq.', ''), 10)
      let chapter = data.find(c => c.id === id) || createMockChapter({ id })
      
      // Handle select with relationships (e.g., "*, mission(*)")
      if (select?.includes('mission(')) {
        const missions = missionStore.filter(m => m.chapter_id === id)
        chapter = { ...chapter, missions } as any
      }
      
      const acceptHeader = request.headers.get('Accept')
      if (acceptHeader?.includes('application/vnd.pgrst.object+json')) {
        return HttpResponse.json(chapter)
      }
      
      return HttpResponse.json([chapter])
    }

    // Apply ordering
    if (order) {
      // Handle comma-separated multiple order clauses
      const orderClauses = order.split(',')
      data = [...data].sort((a, b) => {
        for (const orderClause of orderClauses) {
          const [column, direction] = orderClause.trim().split('.')
          const ascending = direction === 'asc'
          const aVal = (a as any)[column]
          const bVal = (b as any)[column]
          
          if (aVal < bVal) return ascending ? -1 : 1
          if (aVal > bVal) return ascending ? 1 : -1
        }
        return 0
      })
    }

    return HttpResponse.json(data)
  }),

  // POST /rest/v1/chapter - Create chapter
  http.post('*/rest/v1/chapter', async ({ request }) => {
    const headerValidation = validateSupabaseHeaders(request)
    if (headerValidation) return headerValidation

    const body = await request.json() as Partial<Chapter>
    const newChapter = createMockChapter(body)
    
    const existing = chapterStore.find(c => c.id === newChapter.id)
    if (existing) {
      return HttpResponse.json(
        SUPABASE_ERRORS.UNIQUE_CONSTRAINT.error,
        { status: 409 }
      )
    }

    chapterStore.push(newChapter)
    
    const acceptHeader = request.headers.get('Accept')
    if (acceptHeader?.includes('application/vnd.pgrst.object+json')) {
      return HttpResponse.json(newChapter, { status: 201 })
    }
    
    return HttpResponse.json([newChapter], { status: 201 })
  }),

  // DELETE /rest/v1/chapter - Delete chapters
  http.delete('*/rest/v1/chapter', ({ request }) => {
    const headerValidation = validateSupabaseHeaders(request)
    if (headerValidation) return headerValidation

    const url = new URL(request.url)
    const filter = url.searchParams.get('id')
    const gteFilter = url.searchParams.get('id') // Handle gte for bulk delete
    
    if (filter && filter.startsWith('eq.')) {
      const id = parseInt(filter.replace('eq.', ''), 10)
      const chapterIndex = chapterStore.findIndex(c => c.id === id)
      
      if (chapterIndex === -1) {
        return HttpResponse.json(
          SUPABASE_ERRORS.NOT_FOUND.error,
          { status: 404 }
        )
      }

      chapterStore.splice(chapterIndex, 1)
      return HttpResponse.json(null, { status: 204 })
    }
    
    // Handle bulk delete with gte (e.g., for purgeMissionDomain)
    if (gteFilter && gteFilter.startsWith('gte.')) {
      const minId = parseInt(gteFilter.replace('gte.', ''), 10)
      const initialCount = chapterStore.length
      chapterStore = chapterStore.filter(c => c.id < minId)
      const deletedCount = initialCount - chapterStore.length
      
      return HttpResponse.json(null, { 
        status: 204,
        headers: { 'Content-Range': `*/${deletedCount}` }
      })
    }
    
    // General delete all (for purge operations)
    const deletedCount = chapterStore.length
    chapterStore = []
    
    return HttpResponse.json(null, { 
      status: 204,
      headers: { 'Content-Range': `*/${deletedCount}` }
    })
  }),
]

/**
 * Error scenario handlers for testing edge cases
 */
const errorHandlers = [
  // Simulate network errors
  http.get('*/rest/v1/network-error', () => {
    return HttpResponse.json(
      SUPABASE_ERRORS.NETWORK_ERROR.error,
      { status: 500 }
    )
  }),

  // Simulate authentication errors
  http.get('*/rest/v1/auth-error', () => {
    return HttpResponse.json(
      SUPABASE_ERRORS.PERMISSION_DENIED.error,
      { status: 401 }
    )
  }),
]

// Export all handlers
export const handlers = [
  ...equipmentHandlers,
  ...missionHandlers,
  ...chapterHandlers,
  ...errorHandlers,
]

// Export helper functions for test setup
export const resetStores = () => {
  equipmentStore = []
  missionStore = []
  chapterStore = []
}

export const setEquipmentStore = (data: Equipment[]) => {
  equipmentStore = [...data]
}

export const setMissionStore = (data: Mission[]) => {
  missionStore = [...data]
}

export const setChapterStore = (data: Chapter[]) => {
  chapterStore = [...data]
}

export const getEquipmentStore = () => [...equipmentStore]
export const getMissionStore = () => [...missionStore]
export const getChapterStore = () => [...chapterStore]