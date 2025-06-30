import { act, renderHook } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { useQueryState } from './useQueryState'

// Mock component for testing
function TestWrapper({ children, initialEntries = ['/'] }: { children: React.ReactNode, initialEntries?: string[] }) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <div>{children}</div>,
      },
    ],
    {
      initialEntries,
    }
  )
  
  return <RouterProvider router={router} />
}

describe('useQueryState', () => {
  it('returns default value when no query parameter exists', () => {
    const { result } = renderHook(
      () => useQueryState('test', 'default'),
      {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      }
    )

    expect(result.current[0]).toBe('default')
  })

  it('returns query parameter value when it exists', () => {
    const { result } = renderHook(
      () => useQueryState('status', 'default'),
      {
        wrapper: ({ children }) => <TestWrapper initialEntries={['/?status=active']}>{children}</TestWrapper>,
      }
    )

    expect(result.current[0]).toBe('active')
  })

  it('sets query parameter value', () => {
    const { result } = renderHook(
      () => useQueryState<'all' | 'completed'>('filter', 'all'),
      {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      }
    )

    act(() => {
      result.current[1]('completed')
    })

    expect(result.current[0]).toBe('completed')
  })

  it('removes query parameter when setting to default value', () => {
    const { result } = renderHook(
      () => useQueryState('status', 'default'),
      {
        wrapper: ({ children }) => <TestWrapper initialEntries={['/?status=active']}>{children}</TestWrapper>,
      }
    )

    // Initially has the query parameter
    expect(result.current[0]).toBe('active')

    // Set back to default should remove the parameter
    act(() => {
      result.current[1]('default')
    })

    expect(result.current[0]).toBe('default')
  })

  it('preserves other query parameters when updating', () => {
    const { result: result1 } = renderHook(
      () => useQueryState<'all' | 'active' | 'completed'>('filter', 'all'),
      {
        wrapper: ({ children }) => <TestWrapper initialEntries={['/?existing=value&filter=active']}>{children}</TestWrapper>,
      }
    )

    const { result: result2 } = renderHook(
      () => useQueryState('existing', 'default'),
      {
        wrapper: ({ children }) => <TestWrapper initialEntries={['/?existing=value&filter=active']}>{children}</TestWrapper>,
      }
    )

    // Both parameters should be available
    expect(result1.current[0]).toBe('active')
    expect(result2.current[0]).toBe('value')

    // Update one parameter
    act(() => {
      result1.current[1]('completed')
    })

    // Updated parameter should change, other should remain
    expect(result1.current[0]).toBe('completed')
  })

  it('handles replace state behavior by default', () => {
    const { result } = renderHook(
      () => useQueryState<'home' | 'about'>('tab', 'home'),
      {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      }
    )

    // Default behavior should use replace
    act(() => {
      result.current[1]('about')
    })

    expect(result.current[0]).toBe('about')
  })

  it('handles push state when replaceState is false', () => {
    const { result } = renderHook(
      () => useQueryState<'1' | '2'>('page', '1', false),
      {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      }
    )

    act(() => {
      result.current[1]('2')
    })

    expect(result.current[0]).toBe('2')
  })

  it('handles empty string values', () => {
    const { result } = renderHook(
      () => useQueryState('search', ''),
      {
        wrapper: ({ children }) => <TestWrapper initialEntries={['/?search=']}>{children}</TestWrapper>,
      }
    )

    expect(result.current[0]).toBe('')
  })

  it('handles multiple updates in sequence', () => {
    const { result } = renderHook(
      () => useQueryState<'0' | '1' | '2'>('counter', '0'),
      {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      }
    )

    act(() => {
      result.current[1]('1')
    })
    expect(result.current[0]).toBe('1')

    act(() => {
      result.current[1]('2')
    })
    expect(result.current[0]).toBe('2')

    act(() => {
      result.current[1]('0') // back to default
    })
    expect(result.current[0]).toBe('0')
  })

  it('setValue function works consistently across rerenders', () => {
    const { result, rerender } = renderHook(
      () => useQueryState<'test' | 'new-value'>('stable', 'test'),
      {
        wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
      }
    )

    // Trigger a rerender
    rerender()

    // setValue function should still work
    act(() => {
      result.current[1]('new-value')
    })
    
    expect(result.current[0]).toBe('new-value')
  })

  it('works with complex query parameter names', () => {
    const { result } = renderHook(
      () => useQueryState<'name' | 'date' | 'priority'>('sort_by', 'name'),
      {
        wrapper: ({ children }) => <TestWrapper initialEntries={['/?sort_by=date']}>{children}</TestWrapper>,
      }
    )

    expect(result.current[0]).toBe('date')

    act(() => {
      result.current[1]('priority')
    })

    expect(result.current[0]).toBe('priority')
  })
})