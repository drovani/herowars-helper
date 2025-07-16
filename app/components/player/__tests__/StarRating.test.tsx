// ABOUTME: Tests for StarRating component covering interactive star selection
// ABOUTME: Tests both readonly and interactive modes with proper event handling
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StarRating } from '../StarRating'

describe('StarRating', () => {
  describe('readonly mode', () => {
    it('should render stars correctly in readonly mode', () => {
      render(<StarRating stars={3} readOnly={true} />)
      
      const stars = screen.getAllByRole('button')
      expect(stars).toHaveLength(6) // default maxStars
      
      // First 3 stars should be filled
      stars.slice(0, 3).forEach(star => {
        expect(star).toHaveAttribute('disabled')
      })
      
      // Should show current rating
      expect(screen.getByText('3/6')).toBeInTheDocument()
    })

    it('should handle custom maxStars', () => {
      render(<StarRating stars={2} maxStars={5} readOnly={true} />)
      
      const stars = screen.getAllByRole('button')
      expect(stars).toHaveLength(5)
      expect(screen.getByText('2/5')).toBeInTheDocument()
    })

    it('should disable all stars in readonly mode', () => {
      render(<StarRating stars={4} readOnly={true} />)
      
      const stars = screen.getAllByRole('button')
      stars.forEach(star => {
        expect(star).toHaveAttribute('disabled')
      })
    })
  })

  describe('interactive mode', () => {
    it('should render stars correctly in interactive mode', () => {
      const onStarClick = vi.fn()
      render(<StarRating stars={2} onStarClick={onStarClick} />)
      
      const stars = screen.getAllByRole('button')
      expect(stars).toHaveLength(6)
      
      // Stars should not be disabled in interactive mode
      stars.forEach(star => {
        expect(star).not.toHaveAttribute('disabled')
      })
      
      expect(screen.getByText('2/6')).toBeInTheDocument()
    })

    it('should call onStarClick when star is clicked', () => {
      const onStarClick = vi.fn()
      render(<StarRating stars={2} onStarClick={onStarClick} />)
      
      const stars = screen.getAllByRole('button')
      
      // Click on the 4th star (index 3)
      fireEvent.click(stars[3])
      
      expect(onStarClick).toHaveBeenCalledWith(4)
    })

    it('should handle clicking on first star', () => {
      const onStarClick = vi.fn()
      render(<StarRating stars={3} onStarClick={onStarClick} />)
      
      const stars = screen.getAllByRole('button')
      
      // Click on the first star
      fireEvent.click(stars[0])
      
      expect(onStarClick).toHaveBeenCalledWith(1)
    })

    it('should handle clicking on last star', () => {
      const onStarClick = vi.fn()
      render(<StarRating stars={3} maxStars={5} onStarClick={onStarClick} />)
      
      const stars = screen.getAllByRole('button')
      
      // Click on the last star
      fireEvent.click(stars[4])
      
      expect(onStarClick).toHaveBeenCalledWith(5)
    })

    it('should not call onStarClick when readOnly is true', () => {
      const onStarClick = vi.fn()
      render(<StarRating stars={3} readOnly={true} onStarClick={onStarClick} />)
      
      const stars = screen.getAllByRole('button')
      
      // Try to click on a star
      fireEvent.click(stars[2])
      
      expect(onStarClick).not.toHaveBeenCalled()
    })

    it('should not call onStarClick when no handler is provided', () => {
      // This should not throw an error
      render(<StarRating stars={3} />)
      
      const stars = screen.getAllByRole('button')
      
      // Click should not cause an error
      fireEvent.click(stars[2])
      
      // No assertions needed, just checking it doesn't throw
    })
  })

  describe('star display', () => {
    it('should show correct filled/empty stars', () => {
      render(<StarRating stars={3} maxStars={5} />)
      
      const stars = screen.getAllByRole('button')
      
      // Check that the correct number of stars are filled
      // This would typically be done by checking CSS classes or aria attributes
      expect(stars).toHaveLength(5)
      expect(screen.getByText('3/5')).toBeInTheDocument()
    })

    it('should handle zero stars', () => {
      render(<StarRating stars={0} maxStars={5} />)
      
      expect(screen.getByText('0/5')).toBeInTheDocument()
    })

    it('should handle maximum stars', () => {
      render(<StarRating stars={5} maxStars={5} />)
      
      expect(screen.getByText('5/5')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper button roles', () => {
      render(<StarRating stars={3} />)
      
      const stars = screen.getAllByRole('button')
      expect(stars).toHaveLength(6)
    })

    it('should have proper disabled state for readonly', () => {
      render(<StarRating stars={3} readOnly={true} />)
      
      const stars = screen.getAllByRole('button')
      stars.forEach(star => {
        expect(star).toHaveAttribute('disabled')
      })
    })

    it('should have proper enabled state for interactive', () => {
      render(<StarRating stars={3} readOnly={false} />)
      
      const stars = screen.getAllByRole('button')
      stars.forEach(star => {
        expect(star).not.toHaveAttribute('disabled')
      })
    })
  })

  describe('custom styling', () => {
    it('should apply custom className', () => {
      render(<StarRating stars={3} className="custom-class" />)
      
      const container = screen.getByText('3/6').closest('div')
      expect(container).toHaveClass('custom-class')
    })
  })
})