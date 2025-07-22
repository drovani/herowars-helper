// ABOUTME: Tests for EquipmentIndexSkeleton component covering rendering, item count, and structure
// ABOUTME: Tests the equipment index page skeleton used for equipment catalog loading states

import { describe, expect, it } from 'vitest'
import { render } from '~/__tests__/utils/test-utils'
import { EquipmentIndexSkeleton } from '../EquipmentIndexSkeleton'

describe('EquipmentIndexSkeleton', () => {
  describe('basic rendering', () => {
    it('should render with default props', () => {
      const result = render(<EquipmentIndexSkeleton />)
      
      const container = result.container.firstChild as HTMLElement
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('space-y-6')
    })

    it('should render with custom className', () => {
      const result = render(<EquipmentIndexSkeleton className="custom-equipment" />)
      
      const container = result.container.firstChild as HTMLElement
      expect(container).toHaveClass('custom-equipment')
    })
  })

  describe('item count configuration', () => {
    it('should render default number of equipment cards', () => {
      const result = render(<EquipmentIndexSkeleton />)
      
      const equipmentCards = result.container.querySelectorAll('.h-28.w-28')
      expect(equipmentCards).toHaveLength(20)
    })

    it('should render custom number of equipment cards', () => {
      const result = render(<EquipmentIndexSkeleton itemCount={10} />)
      
      const equipmentCards = result.container.querySelectorAll('.h-28.w-28')
      expect(equipmentCards).toHaveLength(10)
    })

    it('should handle zero items gracefully', () => {
      const result = render(<EquipmentIndexSkeleton itemCount={0} />)
      
      const equipmentCards = result.container.querySelectorAll('.h-28.w-28')
      expect(equipmentCards).toHaveLength(0)
    })
  })

  describe('add button visibility', () => {
    it('should not show add button by default', () => {
      const result = render(<EquipmentIndexSkeleton />)
      
      const addButton = result.container.querySelector('.h-10.w-40')
      expect(addButton).not.toBeInTheDocument()
    })

    it('should show add button when enabled', () => {
      const result = render(<EquipmentIndexSkeleton showAddButton={true} />)
      
      const addButton = result.container.querySelector('.h-10.w-40')
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('grid layout', () => {
    it('should render equipment grid with proper structure', () => {
      const result = render(<EquipmentIndexSkeleton itemCount={6} />)
      
      const grid = result.container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('grid-cols-3', 'md:grid-cols-4', 'lg:grid-cols-5')
    })

    it('should have proper spacing between cards', () => {
      const result = render(<EquipmentIndexSkeleton itemCount={4} />)
      
      const grid = result.container.querySelector('.grid')
      expect(grid).toHaveClass('gap-2')
    })
  })

  describe('structure', () => {
    it('should have skeleton placeholders', () => {
      const result = render(<EquipmentIndexSkeleton itemCount={3} />)
      
      const skeletonElements = result.container.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('should have equipment name placeholders', () => {
      const result = render(<EquipmentIndexSkeleton itemCount={2} />)
      
      const namePlaceholders = result.container.querySelectorAll('.h-4.w-full')
      expect(namePlaceholders).toHaveLength(2)
    })
  })

  describe('responsive behavior', () => {
    it('should have responsive grid classes', () => {
      const result = render(<EquipmentIndexSkeleton itemCount={1} />)
      
      const grid = result.container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-3') // Mobile
      expect(grid).toHaveClass('md:grid-cols-4') // Tablet  
      expect(grid).toHaveClass('lg:grid-cols-5') // Desktop
    })
  })

  describe('edge cases', () => {
    it('should handle large item counts', () => {
      const result = render(<EquipmentIndexSkeleton itemCount={50} />)
      
      const equipmentCards = result.container.querySelectorAll('.h-28.w-28')
      expect(equipmentCards).toHaveLength(50)
    })
  })
})