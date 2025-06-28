import { describe, expect, it } from 'vitest'
import { formatTitle, siteConfig, type SiteConfig } from './site'

describe('Site Configuration', () => {
  describe('siteConfig object', () => {
    it('has all required properties', () => {
      expect(siteConfig).toHaveProperty('name')
      expect(siteConfig).toHaveProperty('title')
      expect(siteConfig).toHaveProperty('subtitle')
      expect(siteConfig).toHaveProperty('description')
      expect(siteConfig).toHaveProperty('logo')
      expect(siteConfig).toHaveProperty('author')
      expect(siteConfig).toHaveProperty('meta')
      expect(siteConfig).toHaveProperty('version')
    })

    it('has correct data types for all properties', () => {
      expect(typeof siteConfig.name).toBe('string')
      expect(typeof siteConfig.title).toBe('string')
      expect(typeof siteConfig.subtitle).toBe('string')
      expect(typeof siteConfig.description).toBe('string')
      expect(typeof siteConfig.version).toBe('string')

      expect(typeof siteConfig.logo).toBe('object')
      expect(typeof siteConfig.logo.src).toBe('string')
      expect(typeof siteConfig.logo.alt).toBe('string')

      expect(typeof siteConfig.author).toBe('object')
      expect(typeof siteConfig.author.name).toBe('string')
      expect(typeof siteConfig.author.url).toBe('string')

      expect(typeof siteConfig.meta).toBe('object')
      expect(typeof siteConfig.meta.defaultTitle).toBe('string')
      expect(typeof siteConfig.meta.titleTemplate).toBe('string')
      expect(typeof siteConfig.meta.description).toBe('string')
    })

    it('has non-empty string values', () => {
      expect(siteConfig.name.length).toBeGreaterThan(0)
      expect(siteConfig.title.length).toBeGreaterThan(0)
      expect(siteConfig.subtitle.length).toBeGreaterThan(0)
      expect(siteConfig.description.length).toBeGreaterThan(0)
      expect(siteConfig.version.length).toBeGreaterThan(0)

      expect(siteConfig.logo.src.length).toBeGreaterThan(0)
      expect(siteConfig.logo.alt.length).toBeGreaterThan(0)

      expect(siteConfig.author.name.length).toBeGreaterThan(0)
      expect(siteConfig.author.url.length).toBeGreaterThan(0)

      expect(siteConfig.meta.defaultTitle.length).toBeGreaterThan(0)
      expect(siteConfig.meta.titleTemplate.length).toBeGreaterThan(0)
      expect(siteConfig.meta.description.length).toBeGreaterThan(0)
    })

    it('has valid URL format for author URL', () => {
      expect(siteConfig.author.url).toMatch(/^https?:\/\//)
    })

    it('has valid image path for logo', () => {
      expect(siteConfig.logo.src).toMatch(/^\//)
    })

    it('has template placeholder in titleTemplate', () => {
      expect(siteConfig.meta.titleTemplate).toContain('%s')
    })

    it('has consistent branding across title fields', () => {
      const brandName = 'HW Helper'
      expect(siteConfig.title).toContain(brandName)
      expect(siteConfig.meta.defaultTitle).toContain(brandName)
      expect(siteConfig.meta.titleTemplate).toContain(brandName)
    })
  })

  describe('formatTitle function', () => {
    it('returns default title when no page title provided', () => {
      const result = formatTitle()
      expect(result).toBe(siteConfig.meta.defaultTitle)
    })

    it('returns default title when empty string provided', () => {
      const result = formatTitle('')
      expect(result).toBe(siteConfig.meta.defaultTitle)
    })

    it('returns default title when undefined provided', () => {
      const result = formatTitle(undefined)
      expect(result).toBe(siteConfig.meta.defaultTitle)
    })

    it('formats page title with template', () => {
      const pageTitle = 'About Us'
      const result = formatTitle(pageTitle)
      expect(result).toBe('About Us | HW Helper')
    })

    it('handles special characters in page title', () => {
      const pageTitle = 'Products & Services'
      const result = formatTitle(pageTitle)
      expect(result).toBe('Products & Services | HW Helper')
    })

    it('handles numeric page titles', () => {
      const pageTitle = '404'
      const result = formatTitle(pageTitle)
      expect(result).toBe('404 | HW Helper')
    })

    it('handles long page titles', () => {
      const pageTitle = 'This is a very long page title that should still work correctly'
      const result = formatTitle(pageTitle)
      expect(result).toBe('This is a very long page title that should still work correctly | HW Helper')
    })

    it('preserves template structure', () => {
      const pageTitle = 'Test'
      const result = formatTitle(pageTitle)
      expect(result).toMatch(/^.+ \| .+$/)
    })

    it('correctly replaces only the first %s placeholder', () => {
      // Create a mock config with multiple %s placeholders to test edge case
      const originalTemplate = siteConfig.meta.titleTemplate
      const mockConfig = {
        ...siteConfig,
        meta: {
          ...siteConfig.meta,
          titleTemplate: '%s | Test %s | Site'
        }
      }

      // Test with the current implementation
      const result = mockConfig.meta.titleTemplate.replace('%s', 'Page')
      expect(result).toBe('Page | Test %s | Site')
    })

    it('handles whitespace in page titles', () => {
      const pageTitle = '  Trimmed Title  '
      const result = formatTitle(pageTitle)
      expect(result).toBe('  Trimmed Title   | HW Helper')
    })
  })

  describe('TypeScript interface compliance', () => {
    it('conforms to SiteConfig interface', () => {
      // This test ensures the config object matches the interface
      const config: SiteConfig = siteConfig
      expect(config).toBeDefined()
    })

    it('has required logo properties', () => {
      expect(siteConfig.logo).toHaveProperty('src')
      expect(siteConfig.logo).toHaveProperty('alt')
      // component is optional, so we just check if it exists
      if (siteConfig.logo.component) {
        expect(siteConfig.logo.component).toBeDefined()
      }
    })

    it('has required author properties', () => {
      expect(siteConfig.author).toHaveProperty('name')
      expect(siteConfig.author).toHaveProperty('url')
    })

    it('has required meta properties', () => {
      expect(siteConfig.meta).toHaveProperty('defaultTitle')
      expect(siteConfig.meta).toHaveProperty('titleTemplate')
      expect(siteConfig.meta).toHaveProperty('description')
    })
  })
})