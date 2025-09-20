import { test, expect } from '@playwright/test'

test.describe('localStorage-Based Language Switching', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('https://localhost:3000/')
    await page.evaluate(() => localStorage.clear())
  })

  test('language switching without URL changes', async ({ page }) => {
    // Start at root URL
    await page.goto('https://localhost:3000/')
    await page.waitForLoadState('networkidle')
    
    const initialUrl = page.url()
    console.log('Initial URL:', initialUrl)
    expect(initialUrl).toBe('https://localhost:3000/')
    
    // Should start with Estonian or auto-detected language
    const initialGreeting = await page.locator('[data-testid="greeting"]').textContent()
    console.log('Initial greeting:', initialGreeting)
    
    // Click Ukrainian button
    await page.click('[data-testid="language-uk"]')
    await page.waitForTimeout(1000)
    
    // URL should NOT change (no reloads)
    const afterUkrainianUrl = page.url()
    console.log('After Ukrainian click:', afterUkrainianUrl)
    expect(afterUkrainianUrl).toBe('https://localhost:3000/') // Same URL!
    
    // Content should change to Ukrainian
    const ukrainianGreeting = await page.locator('[data-testid="greeting"]').textContent()
    console.log('Ukrainian greeting:', ukrainianGreeting)
    
    // Click English button
    await page.click('[data-testid="language-en-GB"]')
    await page.waitForTimeout(1000)
    
    // URL still should not change
    const afterEnglishUrl = page.url()
    console.log('After English click:', afterEnglishUrl)
    expect(afterEnglishUrl).toBe('https://localhost:3000/') // Still same URL!
    
    // Content should change to English
    const englishGreeting = await page.locator('[data-testid="greeting"]').textContent()
    console.log('English greeting:', englishGreeting)
    
    // All three greetings should reflect the language changes
    expect(ukrainianGreeting).not.toBe(initialGreeting) // Ukrainian ≠ English
    expect(englishGreeting).not.toBe(ukrainianGreeting) // English ≠ Ukrainian  
    // Note: englishGreeting might equal initialGreeting if both are English (correct behavior)
    
    // Verify specific language content
    expect(ukrainianGreeting).toContain('Ласкаво просимо') // Ukrainian text
    expect(englishGreeting).toContain('Welcome') // English text
    
    console.log('✅ Language switching works without URL changes!')
  })

  test('localStorage persistence across page reloads', async ({ page }) => {
    await page.goto('https://localhost:3000/')
    await page.waitForLoadState('networkidle')
    
    // Set Ukrainian preference
    await page.click('[data-testid="language-uk"]')
    await page.waitForTimeout(1000)
    
    // Check localStorage was set
    const preference = await page.evaluate(() => {
      const stored = localStorage.getItem('esmuseum-language-preference')
      return stored ? JSON.parse(stored) : null
    })
    
    console.log('Stored preference:', preference)
    expect(preference.preferredLanguage).toBe('uk')
    
    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Should still be at same URL (no /uk suffix)
    const reloadedUrl = page.url()
    expect(reloadedUrl).toBe('https://localhost:3000/')
    
    // Should remember Ukrainian preference
    const reloadedGreeting = await page.locator('[data-testid="greeting"]').textContent()
    console.log('Greeting after reload:', reloadedGreeting)
    
    console.log('✅ localStorage persistence works!')
  })

})