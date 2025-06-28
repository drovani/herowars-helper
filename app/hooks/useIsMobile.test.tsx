import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useIsMobile } from './useIsMobile'

describe('useIsMobile', () => {
  let mockMediaQuery: any

  beforeEach(() => {
    // Reset window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    // Create a proper mock for matchMedia
    mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => {
        // Determine if the query should match based on current window width
        const width = window.innerWidth
        const isMaxWidth767 = query.includes('max-width: 767px')
        mockMediaQuery.matches = isMaxWidth767 && width < 768
        return mockMediaQuery
      }),
    })
  })

  it('returns false for desktop width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true for mobile width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('responds to window resize events', () => {
    const { result } = renderHook(() => useIsMobile())

    // Initially desktop
    expect(result.current).toBe(false)

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      })

      // Call the change listener that was registered
      const changeListener = mockMediaQuery.addEventListener.mock.calls[0][1]
      changeListener()
    })

    expect(result.current).toBe(true)
  })

  it('handles edge case at breakpoint boundary', () => {
    // Exactly at 768px should be desktop (>=768)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // 767px should be mobile (<768)
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      })

      // Call the change listener that was registered
      const changeListener = mockMediaQuery.addEventListener.mock.calls[0][1]
      changeListener()
    })

    expect(result.current).toBe(true)
  })
})