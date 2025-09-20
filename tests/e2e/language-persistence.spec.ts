import { test, expect } from '@playwright/test'

test.describe('Language Preference Persistence', () => {
  test('saves language preference to localStorage', async ({ page }) => {
    await page.goto('/')
    
    // Switch to Ukrainian
    await page.click('[data-testid="language-uk"]')
    
    // Check localStorage contains preference
    const preference = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('esmuseum-language-preference') || '{}')
    })
    
    expect(preference.preferredLanguage).toBe('uk')
    expect(preference.autoDetected).toBe(false)
    expect(preference.timestamp).toBeGreaterThan(0)
  })

  test('restores language preference on page reload', async ({ page }) => {
    await page.goto('/')
    
    // Switch to Ukrainian
    await page.click('[data-testid="language-uk"]')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Ласкаво просимо до картографічного застосунку ESMuseum')
    
    // Reload page
    await page.reload()
    
    // Should still show Ukrainian
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Ласкаво просимо до картографічного застосунку ESMuseum')
    await expect(page.locator('[data-testid="language-uk"]')).toHaveClass(/active/)
  })

  test('preference persists across browser sessions', async ({ context, page }) => {
    await page.goto('/')
    
    // Switch to British English
    await page.click('[data-testid="language-en-GB"]')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Welcome to the ESMuseum Map Application')
    
    // Close and create new page (simulating new session)
    await page.close()
    const newPage = await context.newPage()
    await newPage.goto('/')
    
    // Should still show British English
    await expect(newPage.locator('[data-testid="greeting"]')).toContainText('Welcome to the ESMuseum Map Application')
    await expect(newPage.locator('[data-testid="language-en-GB"]')).toHaveClass(/active/)
  })

  test('handles localStorage corruption gracefully', async ({ page }) => {
    // Set corrupted localStorage data
    await page.addInitScript(() => {
      localStorage.setItem('esmuseum-language-preference', 'invalid-json')
    })
    
    await page.goto('/')
    
    // Should fall back to Estonian default
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Tere tulemast ESMuseumi kaardirakenduse')
    
    // Should be able to switch languages normally
    await page.click('[data-testid="language-uk"]')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Ласкаво просимо до картографічного застосунку ESMuseum')
  })
})