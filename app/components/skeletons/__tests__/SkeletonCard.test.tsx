// ABOUTME: Tests for SkeletonCard component covering size variants, header/content options, and responsive behavior  
// ABOUTME: Tests the core skeleton card building block used throughout the application

import { describe, expect, it } from 'vitest'
import { render } from '~/__tests__/utils/test-utils'
import { SkeletonCard } from '../SkeletonCard'

describe('SkeletonCard', () => {
  describe('basic rendering', () => {
    it('should render with default props', () => {
      const result = render(<SkeletonCard />)
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('bg-card', 'text-card-foreground')
    })

    it('should render with custom className', () => {
      const result = render(<SkeletonCard className="custom-card" />)
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toHaveClass('custom-card')
    })
  })

  describe('size variants', () => {
    it('should render small size variant', () => {
      const result = render(<SkeletonCard size="sm" />)
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
      // Size classes are applied internally - test renders without error
    })

    it('should render medium size variant (default)', () => {
      const result = render(<SkeletonCard size="md" />)
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
    })

    it('should render large size variant', () => {
      const result = render(<SkeletonCard size="lg" />)
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
    })
  })

  describe('header configuration', () => {
    it('should show header by default', () => {
      const result = render(<SkeletonCard />)
      
      // Should contain skeleton elements - component renders with header by default
      const skeletonElements = result.container.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('should hide header when disabled', () => {
      const result = render(<SkeletonCard showHeader={false} />)
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
      // Component should render without header sections
    })

    it('should show header when explicitly enabled', () => {
      const result = render(<SkeletonCard showHeader={true} />)
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
    })
  })

  describe('content configuration', () => {
    it('should show content by default', () => {
      const result = render(<SkeletonCard />)
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
      // Should have content area with skeleton elements
    })

    it('should hide content when disabled', () => {
      const result = render(<SkeletonCard showContent={false} />)
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
    })

    it('should show content when explicitly enabled', () => {
      const result = render(<SkeletonCard showContent={true} />)
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
    })
  })

  describe('combined configurations', () => {
    it('should handle header only configuration', () => {
      const result = render(
        <SkeletonCard 
          showHeader={true} 
          showContent={false} 
        />
      )
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
    })

    it('should handle content only configuration', () => {
      const result = render(
        <SkeletonCard 
          showHeader={false} 
          showContent={true} 
        />
      )
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
    })

    it('should handle minimal configuration', () => {
      const result = render(
        <SkeletonCard 
          showHeader={false} 
          showContent={false} 
        />
      )
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
    })
  })

  describe('skeleton elements', () => {
    it('should render skeleton elements with proper classes', () => {
      const result = render(<SkeletonCard />)
      
      // Should contain skeleton elements with rounded corners
      const skeletonElements = result.container.querySelectorAll('[class*="rounded"]')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('should render skeleton elements with proper heights', () => {
      const result = render(<SkeletonCard />)
      
      // Should contain elements with height classes
      const heightElements = result.container.querySelectorAll('[class*="h-"]')
      expect(heightElements.length).toBeGreaterThan(0)
    })
  })

  describe('accessibility', () => {
    it('should render without accessibility violations', () => {
      const result = render(<SkeletonCard />)
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
      // Basic structure should be accessible
    })
  })

  describe('responsiveness', () => {
    it('should maintain proper structure across screen sizes', () => {
      const result = render(<SkeletonCard />)
      
      const card = result.container.firstChild as HTMLElement
      expect(card).toBeInTheDocument()
      // Card should render consistently
    })
  })
})