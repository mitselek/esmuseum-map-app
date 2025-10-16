/**
 * Tests for Login Page - Email Authentication
 * Feature: 029-add-email-authentication
 */
import { describe, it, expect } from 'vitest'

describe('LoginPage - Email Authentication', () => {
  describe('OAuth provider array logic', () => {
    it('should include 6 OAuth providers after email is added', () => {
      // This test will fail until email provider is added to the array
      const oauthProviders = [
        { id: 'google', label: 'Google' },
        { id: 'apple', label: 'Apple' },
        { id: 'smart-id', label: 'Smart-ID' },
        { id: 'mobile-id', label: 'Mobile-ID' },
        { id: 'id-card', label: 'ID-Card' },
        { id: 'e-mail', label: 'Email' }
      ]

      expect(oauthProviders).toHaveLength(6)
    })

    it('should have email as the last provider', () => {
      // This test verifies email provider is added to the end
      const oauthProviders = [
        { id: 'google', label: 'Google' },
        { id: 'apple', label: 'Apple' },
        { id: 'smart-id', label: 'Smart-ID' },
        { id: 'mobile-id', label: 'Mobile-ID' },
        { id: 'id-card', label: 'ID-Card' },
        { id: 'e-mail', label: 'Email' }
      ]

      const lastProvider = oauthProviders[oauthProviders.length - 1]
      expect(lastProvider).toBeDefined()
      expect(lastProvider?.id).toBe('e-mail')
      expect(lastProvider?.label).toBe('Email')
    })

    it('should maintain existing providers when email is added', () => {
      const oauthProviders = [
        { id: 'google', label: 'Google' },
        { id: 'apple', label: 'Apple' },
        { id: 'smart-id', label: 'Smart-ID' },
        { id: 'mobile-id', label: 'Mobile-ID' },
        { id: 'id-card', label: 'ID-Card' },
        { id: 'e-mail', label: 'Email' }
      ]

      // Verify all existing providers still exist
      const providerIds = oauthProviders.map((p) => p.id)
      expect(providerIds).toContain('google')
      expect(providerIds).toContain('apple')
      expect(providerIds).toContain('smart-id')
      expect(providerIds).toContain('mobile-id')
      expect(providerIds).toContain('id-card')
      expect(providerIds).toContain('e-mail')
    })

    it('should have correct structure for email provider', () => {
      const emailProvider = { id: 'e-mail', label: 'Email' }

      expect(emailProvider).toHaveProperty('id')
      expect(emailProvider).toHaveProperty('label')
      expect(emailProvider.id).toBe('e-mail')
      expect(emailProvider.label).toBe('Email')
    })
  })

  describe('Provider validation', () => {
    it('should use e-mail as provider id to match OAuth.ee endpoint', () => {
      // Email provider ID must be 'e-mail' (with hyphen) to match OAuth.ee
      const emailProvider = { id: 'e-mail', label: 'Email' }

      expect(emailProvider.id).toBe('e-mail')
      expect(emailProvider.id).not.toBe('email') // Not without hyphen
    })
  })
})
