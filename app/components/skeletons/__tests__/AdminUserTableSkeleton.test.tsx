// ABOUTME: Tests for AdminUserTableSkeleton component covering table structure and accessibility
// ABOUTME: Tests the admin user management table skeleton for loading states

import { describe, expect, it } from 'vitest'
import { render } from '~/__tests__/utils/test-utils'
import { AdminUserTableSkeleton } from '../AdminUserTableSkeleton'

describe('AdminUserTableSkeleton', () => {
  describe('basic rendering', () => {
    it('should render with default props', () => {
      const result = render(<AdminUserTableSkeleton />)
      
      const container = result.container.firstChild as HTMLElement
      expect(container).toBeInTheDocument()
      expect(container).toHaveClass('space-y-4')
    })

    it('should render with custom className', () => {
      const result = render(<AdminUserTableSkeleton className="custom-admin-table" />)
      
      const container = result.container.firstChild as HTMLElement
      expect(container).toHaveClass('custom-admin-table')
    })
  })

  describe('table structure', () => {
    it('should render table with proper structure', () => {
      const result = render(<AdminUserTableSkeleton />)
      
      const table = result.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('should have table header with proper columns', () => {
      const result = render(<AdminUserTableSkeleton />)
      
      const headers = result.getAllByRole('columnheader')
      expect(headers).toHaveLength(4) // User, Roles, Actions + action column
      
      expect(headers[0]).toHaveTextContent('User')
      expect(headers[1]).toHaveTextContent('Roles')  
      expect(headers[2]).toHaveTextContent('Actions')
    })

    it('should render default number of user rows', () => {
      const result = render(<AdminUserTableSkeleton />)
      
      const rows = result.getAllByRole('row')
      // 1 header row + 8 data rows by default
      expect(rows).toHaveLength(9)
    })

    it('should render custom number of user rows', () => {
      const result = render(<AdminUserTableSkeleton userCount={3} />)
      
      const rows = result.getAllByRole('row')
      // 1 header row + 3 data rows
      expect(rows).toHaveLength(4)
    })
  })

  describe('user row content', () => {
    it('should have skeleton cells in each data row', () => {
      const result = render(<AdminUserTableSkeleton userCount={2} />)
      
      const cells = result.getAllByRole('cell')
      // 2 rows * 4 columns = 8 cells
      expect(cells.length).toBeGreaterThanOrEqual(8)
    })

    it('should have skeleton placeholders in table cells', () => {
      const result = render(<AdminUserTableSkeleton userCount={1} />)
      
      const skeletonElements = result.container.querySelectorAll('.animate-pulse')
      expect(skeletonElements.length).toBeGreaterThan(0)
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels for loading state', () => {
      const result = render(<AdminUserTableSkeleton />)
      
      const statusElement = result.getByRole('status')
      expect(statusElement).toHaveAttribute('aria-live', 'polite')
      expect(statusElement).toHaveAttribute('aria-label', 'Loading user management')
    })

    it('should have table structure for accessibility', () => {
      const result = render(<AdminUserTableSkeleton />)
      
      const table = result.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })

  describe('pagination controls', () => {
    it('should render pagination skeleton', () => {
      const result = render(<AdminUserTableSkeleton />)
      
      const paginationElements = result.container.querySelectorAll('.h-9')
      expect(paginationElements.length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle zero row count gracefully', () => {
      const result = render(<AdminUserTableSkeleton userCount={0} />)
      
      const rows = result.getAllByRole('row')
      // Should still have header row
      expect(rows).toHaveLength(1)
    })
  })
})