import { test, expect } from '@playwright/test'

test.describe('Default Language Display', () => {
  test('shows Estonian greeting by default on first visit', async ({ context, page }) => {
    // Clear any existing localStorage
    await context.clearCookies()
    
    await page.goto('/')
    
    // Check that Estonian greeting is displayed
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Tere tulemast ESMuseumi kaardirakenduse')
    
    // Check that no language preference is stored
    const localStorage = await page.evaluate(() => window.localStorage.getItem('esmuseum-language-preference'))
    expect(localStorage).toBeNull()
    
    // Check page lang attribute
    await expect(page.locator('html')).toHaveAttribute('lang', 'et')
  })

  test('shows Estonian when localStorage is unavailable', async ({ page }) => {
    // Mock localStorage to throw errors
    await page.addInitScript(() => {
      const originalSetItem = window.localStorage.setItem
      window.localStorage.setItem = () => {
        throw new Error('Storage quota exceeded')
      }
    })

    await page.goto('/')
    
    // Should still show Estonian default
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Tere tulemast ESMuseumi kaardirakenduse')
  })
})