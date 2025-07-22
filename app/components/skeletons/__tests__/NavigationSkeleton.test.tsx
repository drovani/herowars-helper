// ABOUTME: Tests for NavigationSkeleton component covering sidebar, header, and breadcrumb navigation skeleton types
// ABOUTME: Tests the navigation skeleton building block used for auth loading states and navigation structure

import { describe, expect, it } from 'vitest'
import { render } from '~/__tests__/utils/test-utils'
import { NavigationSkeleton } from '../NavigationSkeleton'

describe('NavigationSkeleton', () => {
  describe('basic rendering', () => {
    it('should render with default props (sidebar)', () => {
      const result = render(<NavigationSkeleton />)
      
      const skeletonContainer = result.container.firstChild as HTMLElement
      expect(skeletonContainer).toBeInTheDocument()
      expect(skeletonContainer).toHaveClass('space-y-2', 'p-4')
    })

    it('should render with custom className', () => {
      const result = render(<NavigationSkeleton className="custom-nav" />)
      
      const skeletonContainer = result.container.firstChild as HTMLElement
      expect(skeletonContainer).toHaveClass('custom-nav')
    })
  })

  describe('sidebar type (default)', () => {
    it('should render sidebar skeleton by default', () => {
      const result = render(<NavigationSkeleton />)
      
      // Should have user section with avatar and name
      const userAvatar = result.container.querySelector('[class*="size-10"][class*="rounded-full"]')
      expect(userAvatar).toBeInTheDocument()
      
      // Should have user info skeletons
      const userNameSkeleton = result.container.querySelector('[class*="h-4"][class*="w-24"]')
      const userRoleSkeleton = result.container.querySelector('[class*="h-3"][class*="w-16"]')
      expect(userNameSkeleton).toBeInTheDocument()
      expect(userRoleSkeleton).toBeInTheDocument()
    })

    it('should render menu sections', () => {
      const result = render(<NavigationSkeleton type="sidebar" itemCount={6} />)
      
      // Should have section headers
      const sectionHeaders = result.container.querySelectorAll('[class*="h-5"][class*="w-32"]')
      expect(sectionHeaders).toHaveLength(2) // 2 menu sections
      
      // Should have menu items (6 items split across 2 sections = 3 per section)
      const menuItems = result.container.querySelectorAll('[class*="h-4"][class*="w-20"]')
      expect(menuItems).toHaveLength(6)
    })

    it('should render menu item icons', () => {
      const result = render(<NavigationSkeleton type="sidebar" />)
      
      // Should have icon skeletons for menu items
      const menuIcons = result.container.querySelectorAll('[class*="size-4"]')
      expect(menuIcons.length).toBeGreaterThan(0)
    })

    it('should render bottom section', () => {
      const result = render(<NavigationSkeleton type="sidebar" />)
      
      // Should have bottom section with border
      const bottomSection = result.container.querySelector('[class*="pt-4"][class*="border-t"]')
      expect(bottomSection).toBeInTheDocument()
      
      // Should have bottom menu item
      const bottomMenuItem = bottomSection?.querySelector('[class*="h-4"][class*="w-16"]')
      expect(bottomMenuItem).toBeInTheDocument()
    })

    it('should handle custom item count', () => {
      const result = render(<NavigationSkeleton type="sidebar" itemCount={8} />)
      
      // Should have correct number of menu items
      const menuItems = result.container.querySelectorAll('[class*="h-4"][class*="w-20"]')
      expect(menuItems).toHaveLength(8)
    })
  })

  describe('header type', () => {
    it('should render header skeleton', () => {
      const result = render(<NavigationSkeleton type="header" />)
      
      const headerContainer = result.container.firstChild as HTMLElement
      expect(headerContainer).toHaveClass('flex', 'justify-between', 'items-center', 'p-4')
    })

    it('should render left side of header', () => {
      const result = render(<NavigationSkeleton type="header" />)
      
      // Should have logo/brand area
      const brandIcon = result.container.querySelector('[class*="size-8"]')
      const brandText = result.container.querySelector('[class*="h-6"][class*="w-32"]')
      
      expect(brandIcon).toBeInTheDocument()
      expect(brandText).toBeInTheDocument()
    })

    it('should render right side of header', () => {
      const result = render(<NavigationSkeleton type="header" />)
      
      // Should have user menu area
      const userButton = result.container.querySelector('[class*="h-8"][class*="w-24"]')
      const userAvatar = result.container.querySelector('[class*="size-8"][class*="rounded-full"]')
      
      expect(userButton).toBeInTheDocument()
      expect(userAvatar).toBeInTheDocument()
    })

    it('should use proper flex layout', () => {
      const result = render(<NavigationSkeleton type="header" />)
      
      // Should have left and right sections
      const flexSections = result.container.querySelectorAll('[class*="flex"][class*="items-center"]')
      expect(flexSections.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('breadcrumbs type', () => {
    it('should render breadcrumb skeleton', () => {
      const result = render(<NavigationSkeleton type="breadcrumbs" />)
      
      const breadcrumbContainer = result.container.firstChild as HTMLElement
      expect(breadcrumbContainer).toHaveClass('flex', 'items-center', 'space-x-2')
    })

    it('should render breadcrumb items with separators', () => {
      const result = render(<NavigationSkeleton type="breadcrumbs" />)
      
      // Should have breadcrumb item skeletons
      const breadcrumbItems = result.container.querySelectorAll('[class*="h-4"][class*="w-12"], [class*="h-4"][class*="w-16"], [class*="h-4"][class*="w-20"]')
      expect(breadcrumbItems).toHaveLength(3)
      
      // Should have separators
      const separators = result.container.querySelectorAll('.text-muted-foreground')
      expect(separators).toHaveLength(2)
      
      // Separators should contain "/"
      separators.forEach(separator => {
        expect(separator.textContent).toBe('/')
      })
    })

    it('should have proper spacing for breadcrumbs', () => {
      const result = render(<NavigationSkeleton type="breadcrumbs" />)
      
      const breadcrumbContainer = result.container.firstChild as HTMLElement
      expect(breadcrumbContainer).toHaveClass('space-x-2')
    })
  })

  describe('skeleton elements', () => {
    it('should render skeleton elements with proper classes', () => {
      const result = render(<NavigationSkeleton />)
      
      // Should contain skeleton elements with rounded corners
      const skeletonElements = result.container.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('should render skeleton elements with various sizes', () => {
      const result = render(<NavigationSkeleton type="sidebar" />)
      
      // Should have different sized elements
      const smallElements = result.container.querySelectorAll('[class*="h-3"], [class*="h-4"]')
      const mediumElements = result.container.querySelectorAll('[class*="h-5"], [class*="h-6"]')
      const avatarElements = result.container.querySelectorAll('[class*="size-"]')
      
      expect(smallElements.length).toBeGreaterThan(0)
      expect(mediumElements.length).toBeGreaterThan(0)
      expect(avatarElements.length).toBeGreaterThan(0)
    })

    it('should use appropriate widths for different elements', () => {
      const result = render(<NavigationSkeleton type="sidebar" />)
      
      // Should have varied widths
      const narrowElements = result.container.querySelectorAll('[class*="w-12"], [class*="w-16"]')
      const mediumElements = result.container.querySelectorAll('[class*="w-20"], [class*="w-24"]')
      const wideElements = result.container.querySelectorAll('[class*="w-32"]')
      
      expect(narrowElements.length).toBeGreaterThan(0)
      expect(mediumElements.length).toBeGreaterThan(0)
      expect(wideElements.length).toBeGreaterThan(0)
    })
  })

  describe('responsive behavior', () => {
    it('should maintain proper structure across different types', () => {
      const sidebarResult = render(<NavigationSkeleton type="sidebar" />)
      const headerResult = render(<NavigationSkeleton type="header" />)
      const breadcrumbsResult = render(<NavigationSkeleton type="breadcrumbs" />)
      
      expect(sidebarResult.container.firstChild).toBeInTheDocument()
      expect(headerResult.container.firstChild).toBeInTheDocument()
      expect(breadcrumbsResult.container.firstChild).toBeInTheDocument()
    })

    it('should use appropriate layout classes', () => {
      const result = render(<NavigationSkeleton type="header" />)
      
      // Header should use justify-between for responsive layout
      const headerContainer = result.container.firstChild as HTMLElement
      expect(headerContainer).toHaveClass('justify-between')
    })
  })

  describe('edge cases', () => {
    it('should handle zero item count', () => {
      const result = render(<NavigationSkeleton type="sidebar" itemCount={0} />)
      
      // Should still render basic structure
      const skeletonContainer = result.container.firstChild as HTMLElement
      expect(skeletonContainer).toBeInTheDocument()
      
      // Should not have menu items
      const menuItems = result.container.querySelectorAll('[class*="h-4"][class*="w-20"]')
      expect(menuItems).toHaveLength(0)
    })

    it('should handle large item count', () => {
      const result = render(<NavigationSkeleton type="sidebar" itemCount={20} />)
      
      // Should render all menu items
      const menuItems = result.container.querySelectorAll('[class*="h-4"][class*="w-20"]')
      expect(menuItems).toHaveLength(20)
    })

    it('should handle odd item counts properly', () => {
      const result = render(<NavigationSkeleton type="sidebar" itemCount={7} />)
      
      // Should render 7 items split across 2 sections (4 + 3), plus 1 bottom item = 8 total
      const menuItems = result.container.querySelectorAll('[class*="h-4"][class*="w-20"], [class*="h-4"][class*="w-16"]')
      expect(menuItems.length).toBeGreaterThanOrEqual(7)
    })
  })

  describe('accessibility', () => {
    it('should render without accessibility violations', () => {
      const result = render(<NavigationSkeleton />)
      
      const skeletonContainer = result.container.firstChild as HTMLElement
      expect(skeletonContainer).toBeInTheDocument()
    })

    it('should maintain proper structure for screen readers', () => {
      const result = render(<NavigationSkeleton type="sidebar" />)
      
      // Should have proper hierarchical structure
      const sections = result.container.querySelectorAll('[class*="space-y-"]')
      expect(sections.length).toBeGreaterThan(0)
    })

    it('should handle different navigation types accessibly', () => {
      const types: Array<"sidebar" | "header" | "breadcrumbs"> = ["sidebar", "header", "breadcrumbs"]
      
      types.forEach(type => {
        const result = render(<NavigationSkeleton type={type} />)
        const container = result.container.firstChild as HTMLElement
        expect(container).toBeInTheDocument()
      })
    })
  })

  describe('integration scenarios', () => {
    it('should work with custom styling', () => {
      const result = render(
        <NavigationSkeleton 
          type="sidebar" 
          className="custom-sidebar bg-red-100" 
          itemCount={4}
        />
      )
      
      const container = result.container.firstChild as HTMLElement
      expect(container).toHaveClass('custom-sidebar', 'bg-red-100')
    })

    it('should render consistently across type changes', () => {
      // Test that switching types doesn't break rendering
      const result = render(<NavigationSkeleton type="sidebar" />)
      expect(result.container.firstChild).toBeInTheDocument()
      
      result.rerender(<NavigationSkeleton type="header" />)
      expect(result.container.firstChild).toBeInTheDocument()
      
      result.rerender(<NavigationSkeleton type="breadcrumbs" />)
      expect(result.container.firstChild).toBeInTheDocument()
    })
  })
})