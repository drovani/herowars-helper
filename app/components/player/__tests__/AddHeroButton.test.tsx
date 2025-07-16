// ABOUTME: Tests for AddHeroButton component covering different states and interactions
// ABOUTME: Tests button behavior for collection status and loading states
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddHeroButton } from '../AddHeroButton'

describe('AddHeroButton', () => {
  const defaultProps = {
    heroSlug: 'astaroth',
    heroName: 'Astaroth'
  }

  describe('button states', () => {
    it('should render add button when hero is not in collection', () => {
      render(<AddHeroButton {...defaultProps} isInCollection={false} />)
      
      expect(screen.getByRole('button', { name: /add to collection/i })).toBeInTheDocument()
      expect(screen.getByText('Add to Collection')).toBeInTheDocument()
    })

    it('should render collection status when hero is in collection', () => {
      render(<AddHeroButton {...defaultProps} isInCollection={true} />)
      
      expect(screen.getByRole('button', { name: /in collection/i })).toBeInTheDocument()
      expect(screen.getByText('In Collection')).toBeInTheDocument()
    })

    it('should render loading state when isLoading is true', () => {
      render(<AddHeroButton {...defaultProps} isLoading={true} />)
      
      expect(screen.getByText('Adding...')).toBeInTheDocument()
    })

    it('should be disabled when hero is in collection', () => {
      render(<AddHeroButton {...defaultProps} isInCollection={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })

    it('should be disabled when loading', () => {
      render(<AddHeroButton {...defaultProps} isLoading={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })
  })

  describe('button interactions', () => {
    it('should call onAddHero when clicked', () => {
      const onAddHero = vi.fn()
      render(<AddHeroButton {...defaultProps} onAddHero={onAddHero} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(onAddHero).toHaveBeenCalledWith('astaroth')
    })

    it('should not call onAddHero when hero is in collection', () => {
      const onAddHero = vi.fn()
      render(<AddHeroButton {...defaultProps} isInCollection={true} onAddHero={onAddHero} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(onAddHero).not.toHaveBeenCalled()
    })

    it('should not call onAddHero when loading', () => {
      const onAddHero = vi.fn()
      render(<AddHeroButton {...defaultProps} isLoading={true} onAddHero={onAddHero} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(onAddHero).not.toHaveBeenCalled()
    })

    it('should not call onAddHero when no handler is provided', () => {
      // This should not throw an error
      render(<AddHeroButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      // No assertions needed, just checking it doesn't throw
    })
  })

  describe('button variants and sizes', () => {
    it('should apply default variant', () => {
      render(<AddHeroButton {...defaultProps} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border-input') // outline variant
    })

    it('should apply default variant for collection status', () => {
      render(<AddHeroButton {...defaultProps} isInCollection={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-green-600') // green background when in collection
    })

    it('should apply custom variant', () => {
      render(<AddHeroButton {...defaultProps} variant="ghost" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent') // ghost variant
    })

    it('should apply custom size', () => {
      render(<AddHeroButton {...defaultProps} size="lg" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11') // large size
    })

    it('should apply small size', () => {
      render(<AddHeroButton {...defaultProps} size="sm" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9') // small size
    })
  })

  describe('icons', () => {
    it('should show plus icon when not in collection', () => {
      render(<AddHeroButton {...defaultProps} isInCollection={false} />)
      
      const button = screen.getByRole('button')
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should show check icon when in collection', () => {
      render(<AddHeroButton {...defaultProps} isInCollection={true} />)
      
      const button = screen.getByRole('button')
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should not show icon when loading', () => {
      render(<AddHeroButton {...defaultProps} isLoading={true} />)
      
      const button = screen.getByRole('button')
      const icon = button.querySelector('svg')
      expect(icon).toBeNull()
    })
  })

  describe('accessibility', () => {
    it('should have proper button role', () => {
      render(<AddHeroButton {...defaultProps} />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should have proper disabled state', () => {
      render(<AddHeroButton {...defaultProps} isInCollection={true} />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('disabled')
    })

    it('should have proper enabled state', () => {
      render(<AddHeroButton {...defaultProps} isInCollection={false} />)
      
      const button = screen.getByRole('button')
      expect(button).not.toHaveAttribute('disabled')
    })
  })

  describe('custom styling', () => {
    it('should apply custom className', () => {
      render(<AddHeroButton {...defaultProps} className="custom-class" />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('text content', () => {
    it('should show correct text for different states', () => {
      const { rerender } = render(<AddHeroButton {...defaultProps} />)
      expect(screen.getByText('Add to Collection')).toBeInTheDocument()
      
      rerender(<AddHeroButton {...defaultProps} isInCollection={true} />)
      expect(screen.getByText('In Collection')).toBeInTheDocument()
      
      rerender(<AddHeroButton {...defaultProps} isLoading={true} />)
      expect(screen.getByText('Adding...')).toBeInTheDocument()
    })
  })
})