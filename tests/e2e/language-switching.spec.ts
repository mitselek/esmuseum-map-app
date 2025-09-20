import { test, expect } from '@playwright/test'

test.describe('Language Switching Flow', () => {
  test('can switch between all three languages', async ({ page }) => {
    await page.goto('/')
    
    // Default: Estonian
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Tere tulemast ESMuseumi kaardirakenduse')
    
    // Switch to Ukrainian
    await page.click('[data-testid="language-uk"]')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Ласкаво просимо до картографічного застосунку ESMuseum')
    
    // Switch to British English
    await page.click('[data-testid="language-en-GB"]')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Welcome to the ESMuseum Map Application')
    
    // Switch back to Estonian
    await page.click('[data-testid="language-et"]')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Tere tulemast ESMuseumi kaardirakenduse')
  })

  test('language switching happens instantly', async ({ page }) => {
    await page.goto('/')
    
    // Record time before switching
    const startTime = Date.now()
    
    // Switch language
    await page.click('[data-testid="language-uk"]')
    
    // Check that text changed immediately
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Ласкаво просимо до картографічного застосунку ESMuseum')
    
    const endTime = Date.now()
    const switchTime = endTime - startTime
    
    // Should be faster than 100ms
    expect(switchTime).toBeLessThan(100)
  })

  test('highlights current language in switcher', async ({ page }) => {
    await page.goto('/')
    
    // Estonian should be highlighted initially
    await expect(page.locator('[data-testid="language-et"]')).toHaveClass(/active/)
    
    // Switch to Ukrainian
    await page.click('[data-testid="language-uk"]')
    await expect(page.locator('[data-testid="language-uk"]')).toHaveClass(/active/)
    await expect(page.locator('[data-testid="language-et"]')).not.toHaveClass(/active/)
  })

  test('language switcher is keyboard accessible', async ({ page }) => {
    await page.goto('/')
    
    // Tab to first language button
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="language-et"]')).toBeFocused()
    
    // Press Enter to select (should stay on current language)
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Tere tulemast ESMuseumi kaardirakenduse')
    
    // Tab to next language
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="language-uk"]')).toBeFocused()
    
    // Press Enter to switch
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Ласкаво просимо до картографічного застосунку ESMuseum')
  })
})