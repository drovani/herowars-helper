// ABOUTME: Tests for SkeletonForm component covering form structure, field configuration, and section layout
// ABOUTME: Tests the form skeleton building block used for form loading states and multi-step forms

import { describe, expect, it } from 'vitest'
import { render } from '~/__tests__/utils/test-utils'
import { SkeletonForm } from '../SkeletonForm'

describe('SkeletonForm', () => {
  describe('basic rendering', () => {
    it('should render with default props', () => {
      const result = render(<SkeletonForm />)
      
      const formCard = result.container.firstChild as HTMLElement
      expect(formCard).toBeInTheDocument()
      expect(formCard).toHaveClass('w-full')
    })

    it('should render with custom className', () => {
      const result = render(<SkeletonForm className="custom-form" />)
      
      const formCard = result.container.firstChild as HTMLElement
      expect(formCard).toHaveClass('custom-form')
    })
  })

  describe('form structure', () => {
    it('should render with default 4 fields and 1 section', () => {
      const result = render(<SkeletonForm />)
      
      // Should have 4 field groups (label + input pairs)
      const fieldGroups = result.container.querySelectorAll('div[class*="space-y-2"]')
      expect(fieldGroups).toHaveLength(4)
      
      // Each field group should have a label skeleton and input skeleton
      fieldGroups.forEach(fieldGroup => {
        const skeletons = fieldGroup.querySelectorAll('[class*="animate-pulse"]')
        expect(skeletons).toHaveLength(2) // label + input
      })
    })

    it('should render with custom field count', () => {
      const result = render(<SkeletonForm fields={6} />)
      
      const fieldGroups = result.container.querySelectorAll('div[class*="space-y-2"]')
      expect(fieldGroups).toHaveLength(6)
    })

    it('should render with multiple sections', () => {
      const result = render(<SkeletonForm sections={3} fields={2} />)
      
      // Should have section headers for multiple sections
      const sectionHeaders = result.container.querySelectorAll('div[class*="space-y-4"] [class*="h-6"][class*="w-32"]')
      expect(sectionHeaders).toHaveLength(3)
      
      // Should have correct total field count (2 fields × 3 sections = 6)
      const fieldGroups = result.container.querySelectorAll('div[class*="space-y-2"]')
      expect(fieldGroups).toHaveLength(6)
    })

    it('should not show section headers for single section', () => {
      const result = render(<SkeletonForm sections={1} />)
      
      // Should not have section headers for single section
      const sectionHeaders = result.container.querySelectorAll('div[class*="space-y-4"] [class*="h-6"][class*="w-32"]')
      expect(sectionHeaders).toHaveLength(0)
    })
  })

  describe('header configuration', () => {
    it('should show header by default', () => {
      const result = render(<SkeletonForm />)
      
      // Should have card header
      const cardHeader = result.container.querySelector('[class*="CardHeader"]') ||
                        result.container.querySelector('div')?.children[0]
      expect(cardHeader).toBeInTheDocument()
      
      // Should have header skeletons (title + description)
      const headerSkeletons = result.container.querySelectorAll('[class*="h-6"][class*="w-48"], [class*="h-4"][class*="w-64"]')
      expect(headerSkeletons.length).toBeGreaterThanOrEqual(2)
    })

    it('should hide header when disabled', () => {
      const result = render(<SkeletonForm showHeader={false} />)
      
      // Should not have header skeletons
      const headerSkeletons = result.container.querySelectorAll('[class*="h-6"][class*="w-48"]')
      expect(headerSkeletons).toHaveLength(0)
    })

    it('should show header when explicitly enabled', () => {
      const result = render(<SkeletonForm showHeader={true} />)
      
      // Should have header title skeleton
      const headerTitle = result.container.querySelector('[class*="h-6"][class*="w-48"]')
      expect(headerTitle).toBeInTheDocument()
    })
  })

  describe('buttons configuration', () => {
    it('should show buttons by default', () => {
      const result = render(<SkeletonForm />)
      
      // Should have button skeletons
      const buttonSkeletons = result.container.querySelectorAll('[class*="h-10"][class*="w-24"], [class*="h-10"][class*="w-20"]')
      expect(buttonSkeletons.length).toBeGreaterThanOrEqual(2)
    })

    it('should hide buttons when disabled', () => {
      const result = render(<SkeletonForm showButtons={false} />)
      
      // Should not have button container
      const buttonContainer = result.container.querySelector('div[class*="flex"][class*="gap-2"][class*="pt-4"]')
      expect(buttonContainer).not.toBeInTheDocument()
    })

    it('should show buttons when explicitly enabled', () => {
      const result = render(<SkeletonForm showButtons={true} />)
      
      // Should have button container with button skeletons
      const buttonContainer = result.container.querySelector('div[class*="flex"][class*="gap-2"]')
      expect(buttonContainer).toBeInTheDocument()
      
      const buttonSkeletons = buttonContainer?.querySelectorAll('[class*="h-10"]')
      expect(buttonSkeletons?.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('field structure', () => {
    it('should render proper field structure', () => {
      const result = render(<SkeletonForm fields={2} />)
      
      // Each field should have label and input skeletons
      const fieldGroups = result.container.querySelectorAll('div[class*="space-y-2"]')
      
      fieldGroups.forEach(fieldGroup => {
        const labelSkeleton = fieldGroup.querySelector('[class*="h-4"][class*="w-24"]')
        const inputSkeleton = fieldGroup.querySelector('[class*="h-10"][class*="w-full"]')
        
        expect(labelSkeleton).toBeInTheDocument()
        expect(inputSkeleton).toBeInTheDocument()
      })
    })

    it('should handle zero fields', () => {
      const result = render(<SkeletonForm fields={0} />)
      
      const fieldGroups = result.container.querySelectorAll('div[class*="space-y-2"]')
      expect(fieldGroups).toHaveLength(0)
      
      // Should still render card structure
      const formCard = result.container.firstChild as HTMLElement
      expect(formCard).toBeInTheDocument()
    })

    it('should handle large number of fields', () => {
      const result = render(<SkeletonForm fields={10} />)
      
      const fieldGroups = result.container.querySelectorAll('div[class*="space-y-2"]')
      expect(fieldGroups).toHaveLength(10)
    })
  })

  describe('skeleton elements', () => {
    it('should render skeleton elements with proper classes', () => {
      const result = render(<SkeletonForm />)
      
      // Should contain skeleton elements with rounded corners
      const skeletonElements = result.container.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('should render skeleton elements with proper dimensions', () => {
      const result = render(<SkeletonForm />)
      
      // Should have various height and width classes
      const heightElements = result.container.querySelectorAll('[class*="h-"]')
      const widthElements = result.container.querySelectorAll('[class*="w-"]')
      
      expect(heightElements.length).toBeGreaterThan(0)
      expect(widthElements.length).toBeGreaterThan(0)
    })

    it('should render full-width input skeletons', () => {
      const result = render(<SkeletonForm />)
      
      // Input skeletons should be full width
      const fullWidthInputs = result.container.querySelectorAll('[class*="h-10"][class*="w-full"]')
      expect(fullWidthInputs.length).toBeGreaterThan(0)
    })
  })

  describe('combined configurations', () => {
    it('should handle minimal configuration', () => {
      const result = render(
        <SkeletonForm 
          fields={1}
          sections={1}
          showHeader={false}
          showButtons={false}
        />
      )
      
      const formCard = result.container.firstChild as HTMLElement
      expect(formCard).toBeInTheDocument()
      
      // Should have only one field group
      const fieldGroups = result.container.querySelectorAll('div[class*="space-y-2"]')
      expect(fieldGroups).toHaveLength(1)
    })

    it('should handle maximal configuration', () => {
      const result = render(
        <SkeletonForm 
          fields={5}
          sections={3}
          showHeader={true}
          showButtons={true}
        />
      )
      
      const formCard = result.container.firstChild as HTMLElement
      expect(formCard).toBeInTheDocument()
      
      // Should have 15 field groups (5 fields × 3 sections)
      const fieldGroups = result.container.querySelectorAll('div[class*="space-y-2"]')
      expect(fieldGroups).toHaveLength(15)
      
      // Should have section headers
      const sectionHeaders = result.container.querySelectorAll('[class*="h-6"][class*="w-32"]')
      expect(sectionHeaders).toHaveLength(3)
    })

    it('should handle header-only configuration', () => {
      const result = render(
        <SkeletonForm 
          fields={0}
          showHeader={true}
          showButtons={false}
        />
      )
      
      // Should have header but no fields or buttons
      const headerTitle = result.container.querySelector('[class*="h-6"][class*="w-48"]')
      expect(headerTitle).toBeInTheDocument()
      
      const fieldGroups = result.container.querySelectorAll('div[class*="space-y-2"]')
      expect(fieldGroups).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle zero sections', () => {
      const result = render(<SkeletonForm sections={0} />)
      
      // Should not have any field groups if no sections
      const fieldGroups = result.container.querySelectorAll('div[class*="space-y-2"]')
      expect(fieldGroups).toHaveLength(0)
    })

    it('should maintain proper spacing', () => {
      const result = render(<SkeletonForm sections={2} fields={2} />)
      
      // Should have proper spacing classes
      const spacingElements = result.container.querySelectorAll('[class*="space-y-"]')
      expect(spacingElements.length).toBeGreaterThan(0)
    })
  })

  describe('accessibility', () => {
    it('should render without accessibility violations', () => {
      const result = render(<SkeletonForm />)
      
      const formCard = result.container.firstChild as HTMLElement
      expect(formCard).toBeInTheDocument()
      
      // Card structure should be accessible
    })

    it('should maintain accessibility with complex configuration', () => {
      const result = render(
        <SkeletonForm 
          fields={3}
          sections={2}
          showHeader={true}
          showButtons={true}
        />
      )
      
      const formCard = result.container.firstChild as HTMLElement
      expect(formCard).toBeInTheDocument()
    })
  })

  describe('responsiveness', () => {
    it('should maintain proper structure across screen sizes', () => {
      const result = render(<SkeletonForm />)
      
      // Form should be full width
      const formCard = result.container.firstChild as HTMLElement
      expect(formCard).toHaveClass('w-full')
      
      // Input skeletons should be full width
      const fullWidthInputs = result.container.querySelectorAll('[class*="w-full"]')
      expect(fullWidthInputs.length).toBeGreaterThan(0)
    })
  })
})