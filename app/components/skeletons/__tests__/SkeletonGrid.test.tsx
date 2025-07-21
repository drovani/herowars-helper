// ABOUTME: Tests for SkeletonGrid component covering rendering, responsive behavior, and configuration options
// ABOUTME: Tests grid column mappings, item counts, and responsive layout functionality

import { describe, expect, it } from 'vitest'
import { render } from '~/__tests__/utils/test-utils'
import { SkeletonGrid } from '../SkeletonGrid'

describe('SkeletonGrid', () => {
  describe('rendering', () => {
    it('should render with default props', () => {
      const result = render(<SkeletonGrid />)
      
      // Check that container exists
      const container = result.container.firstChild as HTMLElement
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('space-y-4')
    })

    it('should render default number of items', () => {
      const result = render(<SkeletonGrid />)
      
      // Default is 12 items
      const gridElement = result.container.querySelector('.grid')
      expect(gridElement?.children).toHaveLength(12)
    })

    it('should render custom number of items', () => {
      const result = render(<SkeletonGrid items={6} />)
      
      const gridElement = result.container.querySelector('.grid')
      expect(gridElement?.children).toHaveLength(6)
    })
  })

  describe('grid columns', () => {
    it('should apply default column classes', () => {
      const result = render(<SkeletonGrid />)
      
      const gridElement = result.container.querySelector('.grid')
      expect(gridElement).toHaveClass('grid-cols-3') // default mobile
      expect(gridElement).toHaveClass('md:grid-cols-4') // default tablet  
      expect(gridElement).toHaveClass('lg:grid-cols-5') // default desktop
    })

    it('should apply custom column configuration', () => {
      const result = render(
        <SkeletonGrid 
          columns={{
            mobile: 2,
            tablet: 6, 
            desktop: 8
          }} 
        />
      )
      
      const gridElement = result.container.querySelector('.grid')
      expect(gridElement).toHaveClass('grid-cols-2')
      expect(gridElement).toHaveClass('md:grid-cols-6')
      expect(gridElement).toHaveClass('lg:grid-cols-8')
    })

    it('should handle invalid column numbers with fallbacks', () => {
      const result = render(
        <SkeletonGrid 
          columns={{
            mobile: 15, // Invalid, should fallback to 3
            tablet: 20, // Invalid, should fallback to 4
            desktop: 25 // Invalid, should fallback to 5
          }} 
        />
      )
      
      const gridElement = result.container.querySelector('.grid')
      expect(gridElement).toHaveClass('grid-cols-3')
      expect(gridElement).toHaveClass('md:grid-cols-4')
      expect(gridElement).toHaveClass('lg:grid-cols-5')
    })
  })

  describe('gap configuration', () => {
    it('should apply default gap', () => {
      const result = render(<SkeletonGrid />)
      
      const gridElement = result.container.querySelector('.grid')
      expect(gridElement).toHaveClass('gap-2') // default md
    })

    it('should apply small gap', () => {
      const result = render(<SkeletonGrid gap="sm" />)
      
      const gridElement = result.container.querySelector('.grid')
      expect(gridElement).toHaveClass('gap-1')
    })

    it('should apply large gap', () => {
      const result = render(<SkeletonGrid gap="lg" />)
      
      const gridElement = result.container.querySelector('.grid')
      expect(gridElement).toHaveClass('gap-4')
    })
  })

  describe('headers', () => {
    it('should not show headers by default', () => {
      const result = render(<SkeletonGrid />)
      
      const headerSkeletons = result.container.querySelectorAll('.h-8.w-48')
      expect(headerSkeletons).toHaveLength(0)
    })

    it('should show headers when enabled', () => {
      const result = render(<SkeletonGrid showHeaders={true} />)
      
      // Should render header skeleton elements
      const headerSkeletons = result.container.querySelectorAll('.h-8')
      expect(headerSkeletons.length).toBeGreaterThan(0)
    })
  })

  describe('custom styling', () => {
    it('should apply custom className', () => {
      const result = render(<SkeletonGrid className="custom-class" />)
      
      const gridElement = result.container.querySelector('.grid')
      expect(gridElement).toHaveClass('custom-class')
    })
  })

  describe('item configuration', () => {
    it('should pass item size to skeleton cards', () => {
      const result = render(<SkeletonGrid itemSize="lg" />)
      
      // This tests that the component renders without errors
      // SkeletonCard implementation details are tested separately
      const gridElement = result.container.querySelector('.grid')
      expect(gridElement?.children).toHaveLength(12)
    })
  })

  describe('responsive behavior', () => {
    it('should handle partial column configuration', () => {
      const result = render(
        <SkeletonGrid 
          columns={{
            mobile: 1
            // tablet and desktop undefined - should use defaults
          }} 
        />
      )
      
      const gridElement = result.container.querySelector('.grid')
      expect(gridElement).toHaveClass('grid-cols-1')
      expect(gridElement).toHaveClass('md:grid-cols-4') // default fallback
      expect(gridElement).toHaveClass('lg:grid-cols-5') // default fallback
    })
  })
})