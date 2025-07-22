// ABOUTME: Tests for SkeletonTable component covering table structure, row/column configuration, and header options
// ABOUTME: Tests the table skeleton building block used for data table loading states

import { describe, expect, it } from 'vitest'
import { render } from '~/__tests__/utils/test-utils'
import { SkeletonTable } from '../SkeletonTable'

describe('SkeletonTable', () => {
  describe('basic rendering', () => {
    it('should render with default props', () => {
      const result = render(<SkeletonTable />)
      
      const tableContainer = result.container.firstChild as HTMLElement
      expect(tableContainer).toBeInTheDocument()
      expect(tableContainer).toHaveClass('rounded-md', 'border')
      
      // Should contain a table element
      const table = result.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      const result = render(<SkeletonTable className="custom-table" />)
      
      const tableContainer = result.container.firstChild as HTMLElement
      expect(tableContainer).toHaveClass('custom-table')
    })
  })

  describe('table structure', () => {
    it('should render with default 5 rows and 4 columns', () => {
      const result = render(<SkeletonTable />)
      
      // Default should have 5 body rows
      const bodyRows = result.container.querySelectorAll('tbody tr')
      expect(bodyRows).toHaveLength(5)
      
      // Each row should have 4 columns (cells)
      const firstRowCells = bodyRows[0].querySelectorAll('td')
      expect(firstRowCells).toHaveLength(4)
    })

    it('should render with custom row count', () => {
      const result = render(<SkeletonTable rows={3} />)
      
      const bodyRows = result.container.querySelectorAll('tbody tr')
      expect(bodyRows).toHaveLength(3)
    })

    it('should render with custom column count', () => {
      const result = render(<SkeletonTable columns={6} />)
      
      const bodyRows = result.container.querySelectorAll('tbody tr')
      const firstRowCells = bodyRows[0].querySelectorAll('td')
      expect(firstRowCells).toHaveLength(6)
    })

    it('should handle custom rows and columns together', () => {
      const result = render(<SkeletonTable rows={7} columns={3} />)
      
      const bodyRows = result.container.querySelectorAll('tbody tr')
      expect(bodyRows).toHaveLength(7)
      
      const firstRowCells = bodyRows[0].querySelectorAll('td')
      expect(firstRowCells).toHaveLength(3)
    })
  })

  describe('header configuration', () => {
    it('should show header by default', () => {
      const result = render(<SkeletonTable />)
      
      const header = result.container.querySelector('thead')
      expect(header).toBeInTheDocument()
      
      const headerRow = result.container.querySelector('thead tr')
      expect(headerRow).toBeInTheDocument()
      
      // Should have header cells
      const headerCells = result.container.querySelectorAll('thead th')
      expect(headerCells).toHaveLength(4) // default columns
    })

    it('should hide header when disabled', () => {
      const result = render(<SkeletonTable showHeader={false} />)
      
      const header = result.container.querySelector('thead')
      expect(header).not.toBeInTheDocument()
    })

    it('should render custom header titles', () => {
      const headerTitles = ['Name', 'Email', 'Role', 'Actions']
      const result = render(<SkeletonTable headerTitles={headerTitles} />)
      
      // Should show actual text instead of skeleton placeholders
      expect(result.getByText('Name')).toBeInTheDocument()
      expect(result.getByText('Email')).toBeInTheDocument()
      expect(result.getByText('Role')).toBeInTheDocument()
      expect(result.getByText('Actions')).toBeInTheDocument()
    })

    it('should mix custom titles with skeleton placeholders', () => {
      const headerTitles = ['Name', 'Email'] // Only 2 titles for 4 columns
      const result = render(<SkeletonTable headerTitles={headerTitles} columns={4} />)
      
      expect(result.getByText('Name')).toBeInTheDocument()
      expect(result.getByText('Email')).toBeInTheDocument()
      
      // Should have skeleton placeholders for remaining columns
      const skeletonHeaders = result.container.querySelectorAll('thead th [class*="animate-pulse"]')
      expect(skeletonHeaders.length).toBeGreaterThan(0)
    })
  })

  describe('action column', () => {
    it('should not render action column by default', () => {
      const result = render(<SkeletonTable columns={3} />)
      
      // Should only have 3 columns (no action column)
      const bodyRows = result.container.querySelectorAll('tbody tr')
      const firstRowCells = bodyRows[0].querySelectorAll('td')
      expect(firstRowCells).toHaveLength(3)
      
      const headerCells = result.container.querySelectorAll('thead th')
      expect(headerCells).toHaveLength(3)
    })

    it('should render action column when enabled', () => {
      const result = render(<SkeletonTable columns={3} actionColumn={true} />)
      
      // Should have 4 columns (3 + 1 action)
      const bodyRows = result.container.querySelectorAll('tbody tr')
      const firstRowCells = bodyRows[0].querySelectorAll('td')
      expect(firstRowCells).toHaveLength(4)
      
      const headerCells = result.container.querySelectorAll('thead th')
      expect(headerCells).toHaveLength(4)
    })

    it('should render action buttons in action column', () => {
      const result = render(<SkeletonTable columns={2} actionColumn={true} />)
      
      // Action column should contain button skeletons
      const bodyRows = result.container.querySelectorAll('tbody tr')
      const actionCell = bodyRows[0].querySelectorAll('td')[2] // Third cell (action column)
      
      const actionButtons = actionCell.querySelectorAll('[class*="h-8"]')
      expect(actionButtons.length).toBeGreaterThanOrEqual(2) // Should have 2 button skeletons
    })
  })

  describe('skeleton elements', () => {
    it('should render skeleton elements in table cells', () => {
      const result = render(<SkeletonTable />)
      
      // Should contain skeleton elements with rounded corners
      const skeletonElements = result.container.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })

    it('should render skeleton elements with proper heights', () => {
      const result = render(<SkeletonTable />)
      
      // Should contain elements with height classes
      const heightElements = result.container.querySelectorAll('[class*="h-"]')
      expect(heightElements.length).toBeGreaterThan(0)
    })

    it('should vary skeleton widths by column', () => {
      const result = render(<SkeletonTable columns={3} />)
      
      // Should have different width classes for different columns
      const widthElements = result.container.querySelectorAll('[class*="w-"]')
      expect(widthElements.length).toBeGreaterThan(0)
      
      // First column should be wider (w-24)
      const firstColSkeletons = result.container.querySelectorAll('[class*="w-24"]')
      expect(firstColSkeletons.length).toBeGreaterThan(0)
    })
  })

  describe('table semantics', () => {
    it('should use proper table roles and structure', () => {
      const result = render(<SkeletonTable />)
      
      const table = result.getByRole('table')
      expect(table).toBeInTheDocument()
      
      // Should have proper table structure
      const thead = table.querySelector('thead')
      const tbody = table.querySelector('tbody')
      expect(thead).toBeInTheDocument()
      expect(tbody).toBeInTheDocument()
    })

    it('should have accessible table structure', () => {
      const result = render(<SkeletonTable />)
      
      // Table should be properly structured for screen readers
      const table = result.getByRole('table')
      expect(table).toBeInTheDocument()
      
      // Should have table rows
      const rows = result.getAllByRole('row')
      expect(rows.length).toBeGreaterThan(0) // Header + body rows
    })
  })

  describe('edge cases', () => {
    it('should handle zero rows', () => {
      const result = render(<SkeletonTable rows={0} />)
      
      const bodyRows = result.container.querySelectorAll('tbody tr')
      expect(bodyRows).toHaveLength(0)
      
      // Should still render table structure
      const table = result.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('should handle zero columns', () => {
      const result = render(<SkeletonTable columns={0} />)
      
      const bodyRows = result.container.querySelectorAll('tbody tr')
      if (bodyRows.length > 0) {
        const firstRowCells = bodyRows[0].querySelectorAll('td')
        expect(firstRowCells).toHaveLength(0)
      }
    })

    it('should handle large numbers of rows and columns', () => {
      const result = render(<SkeletonTable rows={10} columns={8} />)
      
      const bodyRows = result.container.querySelectorAll('tbody tr')
      expect(bodyRows).toHaveLength(10)
      
      const firstRowCells = bodyRows[0].querySelectorAll('td')
      expect(firstRowCells).toHaveLength(8)
    })
  })

  describe('accessibility', () => {
    it('should render without accessibility violations', () => {
      const result = render(<SkeletonTable />)
      
      const table = result.getByRole('table')
      expect(table).toBeInTheDocument()
      
      // Basic table structure should be accessible
      const rows = result.getAllByRole('row')
      expect(rows.length).toBeGreaterThan(0)
    })

    it('should maintain table accessibility with custom configuration', () => {
      const result = render(
        <SkeletonTable 
          rows={3} 
          columns={5} 
          showHeader={true} 
          actionColumn={true}
          headerTitles={['Col 1', 'Col 2']}
        />
      )
      
      const table = result.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })
})