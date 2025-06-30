import { describe, expect, it } from 'vitest'
import { generateSlug, parseSlugGetImageUrl, cn } from './utils'

describe('Utility Functions', () => {
  describe('generateSlug', () => {
    it('converts text to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
      expect(generateSlug('Test Title')).toBe('test-title')
    })

    it('handles special characters and spaces', () => {
      expect(generateSlug('Hello, World!')).toBe('hello-world')
      expect(generateSlug('Test & Development')).toBe('test-and-development')
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces')
    })

    it('strips suffix when provided', () => {
      expect(generateSlug('test-item-suffix', '-suffix')).toBe('test-item')
      expect(generateSlug('hello-world-end', '-end')).toBe('hello-world')
    })

    it('handles suffix that does not exist', () => {
      expect(generateSlug('test-item', '-nonexistent')).toBe('test-item')
      expect(generateSlug('hello-world', '-missing')).toBe('hello-world')
    })

    it('handles empty and undefined input', () => {
      expect(generateSlug('')).toBe('')
      expect(generateSlug(undefined)).toBe('')
    })

    it('handles edge cases with suffix', () => {
      expect(generateSlug('suffix', 'suffix')).toBe('')
      expect(generateSlug('test-suffix-suffix', '-suffix')).toBe('test-suffix')
    })

    it('handles unicode characters', () => {
      expect(generateSlug('Café & Restaurant')).toBe('cafe-and-restaurant')
      expect(generateSlug('Naïve résumé')).toBe('naive-resume')
    })

    it('trims leading and trailing spaces', () => {
      expect(generateSlug('  hello world  ')).toBe('hello-world')
      expect(generateSlug('\t\ntest\t\n')).toBe('test')
    })
  })

  describe('parseSlugGetImageUrl', () => {
    it('generates basic image URL with default extension', () => {
      expect(parseSlugGetImageUrl('test-item')).toBe('/images/equipment/test-item.png')
      expect(parseSlugGetImageUrl('another-slug')).toBe('/images/equipment/another-slug.png')
    })

    it('uses custom extension when provided', () => {
      expect(parseSlugGetImageUrl('test-item', 'jpg')).toBe('/images/equipment/test-item.jpg')
      expect(parseSlugGetImageUrl('test-item', 'svg')).toBe('/images/equipment/test-item.svg')
    })

    it('removes fragment suffix from slug', () => {
      expect(parseSlugGetImageUrl('test-item-fragment')).toBe('/images/equipment/test-item.png')
      expect(parseSlugGetImageUrl('complex-slug-fragment', 'jpg')).toBe('/images/equipment/complex-slug.jpg')
    })

    it('handles slug without fragment', () => {
      expect(parseSlugGetImageUrl('normal-slug')).toBe('/images/equipment/normal-slug.png')
      expect(parseSlugGetImageUrl('regular-item', 'gif')).toBe('/images/equipment/regular-item.gif')
    })

    it('handles empty slug', () => {
      expect(parseSlugGetImageUrl('')).toBe('/images/equipment/.png')
      expect(parseSlugGetImageUrl('', 'jpg')).toBe('/images/equipment/.jpg')
    })

    it('handles slug that is only fragment', () => {
      expect(parseSlugGetImageUrl('-fragment')).toBe('/images/equipment/.png')
      expect(parseSlugGetImageUrl('-fragment', 'svg')).toBe('/images/equipment/.svg')
    })
  })

  describe('cn', () => {
    it('merges class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
      expect(cn('btn', 'btn-primary')).toBe('btn btn-primary')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'active')).toBe('base active')
      expect(cn('base', false && 'hidden')).toBe('base')
    })

    it('handles overlapping Tailwind classes', () => {
      // tailwind-merge should handle conflicting utilities
      expect(cn('p-4', 'p-8')).toBe('p-8')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('handles arrays and objects', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2')
      expect(cn({ active: true, disabled: false })).toBe('active')
    })

    it('handles undefined and null values', () => {
      expect(cn('base', undefined, null, 'extra')).toBe('base extra')
      expect(cn()).toBe('')
    })

    it('handles complex combinations', () => {
      const result = cn(
        'base-class',
        ['array-class1', 'array-class2'],
        { conditional: true, hidden: false },
        undefined,
        'final-class'
      )
      expect(result).toBe('base-class array-class1 array-class2 conditional final-class')
    })
  })
})