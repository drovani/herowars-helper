import { describe, expect, it } from 'vitest'

// Example API function testing pattern
async function validateUserInput(email: string, password: string) {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email format')
  }

  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }

  return { email, password }
}

async function calculateUserPermissions(userRoles: string[]) {
  const permissions = new Set<string>()

  if (userRoles.includes('admin')) {
    permissions.add('read')
    permissions.add('write')
    permissions.add('delete')
    permissions.add('manage_users')
  } else if (userRoles.includes('editor')) {
    permissions.add('read')
    permissions.add('write')
  } else {
    permissions.add('read')
  }

  return Array.from(permissions)
}

describe('API Business Logic', () => {
  describe('validateUserInput', () => {
    it('should validate correct email and password', async () => {
      const result = await validateUserInput('test@example.com', 'password123')

      expect(result).toEqual({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should reject invalid email', async () => {
      await expect(validateUserInput('invalid-email', 'password123'))
        .rejects
        .toThrow('Invalid email format')
    })

    it('should reject short password', async () => {
      await expect(validateUserInput('test@example.com', '123'))
        .rejects
        .toThrow('Password must be at least 8 characters')
    })

    it('should reject empty inputs', async () => {
      await expect(validateUserInput('', ''))
        .rejects
        .toThrow('Invalid email format')
    })
  })

  describe('calculateUserPermissions', () => {
    it('should give admin full permissions', async () => {
      const permissions = await calculateUserPermissions(['admin'])

      expect(permissions).toContain('read')
      expect(permissions).toContain('write')
      expect(permissions).toContain('delete')
      expect(permissions).toContain('manage_users')
    })

    it('should give editor read/write permissions', async () => {
      const permissions = await calculateUserPermissions(['editor'])

      expect(permissions).toContain('read')
      expect(permissions).toContain('write')
      expect(permissions).not.toContain('delete')
      expect(permissions).not.toContain('manage_users')
    })

    it('should give regular user read-only permissions', async () => {
      const permissions = await calculateUserPermissions(['user'])

      expect(permissions).toEqual(['read'])
    })

    it('should handle multiple roles (admin takes precedence)', async () => {
      const permissions = await calculateUserPermissions(['admin', 'editor', 'user'])

      expect(permissions).toContain('manage_users')
    })

    it('should handle empty roles', async () => {
      const permissions = await calculateUserPermissions([])

      expect(permissions).toEqual(['read'])
    })
  })
})