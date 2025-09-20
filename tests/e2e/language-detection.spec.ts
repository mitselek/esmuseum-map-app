import { test, expect } from '@playwright/test'

test.describe('Browser Language Auto-Detection', () => {
  test('auto-detects Ukrainian browser language', async ({ context, page }) => {
    // Clear any existing localStorage
    await context.clearCookies()
    
    // Set browser language to Ukrainian
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        value: 'uk',
        configurable: true
      })
    })
    
    await page.goto('/')
    
    // Should show Ukrainian greeting
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Ласкаво просимо до картографічного застосунку ESMuseum')
    
    // Should save auto-detected preference
    const preference = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('esmuseum-language-preference') || '{}')
    })
    
    expect(preference.preferredLanguage).toBe('uk')
    expect(preference.autoDetected).toBe(true)
  })

  test('auto-detects British English variants', async ({ context, page }) => {
    await context.clearCookies()
    
    // Test en-GB
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-GB',
        configurable: true
      })
    })
    
    await page.goto('/')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Welcome to the ESMuseum Map Application')
    
    // Clear and test en-US (should map to en-GB)
    await context.clearCookies()
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true
      })
    })
    
    await page.reload()
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Welcome to the ESMuseum Map Application')
  })

  test('falls back to Estonian for unsupported languages', async ({ context, page }) => {
    await context.clearCookies()
    
    // Set unsupported language
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        configurable: true
      })
    })
    
    await page.goto('/')
    
    // Should fall back to Estonian
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Tere tulemast ESMuseumi kaardirakenduse')
    
    // Should not save auto-detected preference for unsupported language
    const localStorage = await page.evaluate(() => window.localStorage.getItem('esmuseum-language-preference'))
    expect(localStorage).toBeNull()
  })

  test('manual selection overrides auto-detection', async ({ context, page }) => {
    await context.clearCookies()
    
    // Set browser language to Ukrainian (auto-detect)
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'language', {
        value: 'uk',
        configurable: true
      })
    })
    
    await page.goto('/')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Ласкаво просимо до картографічного застосунку ESMuseum')
    
    // Manually switch to Estonian
    await page.click('[data-testid="language-et"]')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Tere tulemast ESMuseumi kaardirakenduse')
    
    // Preference should now be manual (not auto-detected)
    const preference = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('esmuseum-language-preference') || '{}')
    })
    
    expect(preference.preferredLanguage).toBe('et')
    expect(preference.autoDetected).toBe(false)
    
    // Reload should maintain manual preference
    await page.reload()
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Tere tulemast ESMuseumi kaardirakenduse')
  })
})