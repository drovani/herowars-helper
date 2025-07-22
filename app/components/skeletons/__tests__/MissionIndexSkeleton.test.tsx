// ABOUTME: Tests for MissionIndexSkeleton component covering chapter organization and mission tiles
// ABOUTME: Tests the mission index page skeleton used for mission catalog loading states

import { describe, expect, it } from 'vitest'
import { render } from '~/__tests__/utils/test-utils'
import { MissionIndexSkeleton } from '../MissionIndexSkeleton'

describe('MissionIndexSkeleton', () => {
  describe('basic rendering', () => {
    it('should render with default props', () => {
      const result = render(<MissionIndexSkeleton />)
      
      const container = result.container.firstChild as HTMLElement
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('space-y-8')
    })

    it('should render with custom className', () => {
      const result = render(<MissionIndexSkeleton className="custom-missions" />)
      
      const container = result.container.firstChild as HTMLElement
      expect(container).toHaveClass('custom-missions')
    })
  })

  describe('chapter organization', () => {
    it('should render default number of chapters', () => {
      const result = render(<MissionIndexSkeleton />)
      
      // Check for chapter title skeletons
      const titleSkeletons = result.container.querySelectorAll('.h-8')
      expect(titleSkeletons.length).toBeGreaterThanOrEqual(3)
    })

    it('should render custom number of chapters', () => {
      const result = render(<MissionIndexSkeleton chapterCount={1} />)
      
      // Should have at least one chapter section
      const grids = result.container.querySelectorAll('.grid')
      expect(grids).toHaveLength(1)
    })
  })

  describe('mission tiles', () => {
    it('should render mission tiles within chapters', () => {
      const result = render(<MissionIndexSkeleton chapterCount={1} missionsPerChapter={6} />)
      
      const missionCards = result.container.querySelectorAll('.h-28.w-28')
      expect(missionCards).toHaveLength(6)
    })

    it('should have proper grid layout', () => {
      const result = render(<MissionIndexSkeleton chapterCount={1} />)
      
      const grid = result.container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('grid-cols-3', 'md:grid-cols-4', 'lg:grid-cols-5')
    })
  })

  describe('boss hero placeholders', () => {
    it('should show boss styling on first and last mission tiles', () => {
      const result = render(<MissionIndexSkeleton chapterCount={1} missionsPerChapter={5} />)
      
      const bossBackgrounds = result.container.querySelectorAll('.bg-orange-300\\/80')
      expect(bossBackgrounds).toHaveLength(2) // First and last tiles
    })
  })

  describe('structure', () => {
    it('should have skeleton placeholders', () => {
      const result = render(<MissionIndexSkeleton />)
      
      const skeletonElements = result.container.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('should have search controls', () => {
      const result = render(<MissionIndexSkeleton />)
      
      const searchSkeletons = result.container.querySelectorAll('.h-10')
      expect(searchSkeletons.length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle zero chapters gracefully', () => {
      const result = render(<MissionIndexSkeleton chapterCount={0} />)
      
      const container = result.container.firstChild as HTMLElement
      expect(container).toBeInTheDocument()
    })

    it('should handle zero missions per chapter', () => {
      const result = render(<MissionIndexSkeleton chapterCount={1} missionsPerChapter={0} />)
      
      const missionCards = result.container.querySelectorAll('.h-28.w-28')
      expect(missionCards).toHaveLength(0)
    })
  })
})