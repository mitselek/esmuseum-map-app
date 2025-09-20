import { test, expect } from '@playwright/test'

test.describe('Language Switching Debug', () => {
  test('debug language switching in real environment', async ({ page }) => {
    // Navigate to the actual running dev server
    await page.goto('https://localhost:3000/')
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'debug-initial.png' })
    
    // Check what's actually displayed initially
    const initialGreeting = await page.locator('[data-testid="greeting"]').textContent()
    console.log('Initial greeting:', initialGreeting)
    
    // Check what language buttons are available
    const languageButtons = await page.locator('[data-testid^="language-"]').all()
    console.log('Language buttons found:', languageButtons.length)
    
    for (const button of languageButtons) {
      const testId = await button.getAttribute('data-testid')
      const text = await button.textContent()
      console.log(`Button: ${testId} - Text: ${text}`)
    }
    
    // Try clicking Ukrainian button
    console.log('Clicking Ukrainian button...')
    await page.click('[data-testid="language-uk"]')
    
    // Wait a moment for any changes
    await page.waitForTimeout(1000)
    
    // Take screenshot after Ukrainian click
    await page.screenshot({ path: 'debug-ukrainian.png' })
    
    // Check what's displayed after Ukrainian click
    const ukrainianGreeting = await page.locator('[data-testid="greeting"]').textContent()
    console.log('Ukrainian greeting:', ukrainianGreeting)
    
    // Check the current URL
    const currentUrl = page.url()
    console.log('Current URL:', currentUrl)
    
    // Check localStorage
    const localStorage = await page.evaluate(() => {
      return {
        languagePreference: window.localStorage.getItem('esmuseum-language-preference'),
        allKeys: Object.keys(window.localStorage)
      }
    })
    console.log('localStorage:', localStorage)
    
    // Check if the greeting element has the right language attribute
    const greetingLang = await page.locator('[data-testid="greeting"]').getAttribute('lang')
    console.log('Greeting lang attribute:', greetingLang)
    
    // Try clicking English button
    console.log('Clicking English button...')
    await page.click('[data-testid="language-en-GB"]')
    await page.waitForTimeout(1000)
    
    const englishGreeting = await page.locator('[data-testid="greeting"]').textContent()
    console.log('English greeting:', englishGreeting)
    
    // Check URL after English
    console.log('URL after English:', page.url())
    
    // Try clicking Estonian button
    console.log('Clicking Estonian button...')
    await page.click('[data-testid="language-et"]')
    await page.waitForTimeout(1000)
    
    const estonianGreeting = await page.locator('[data-testid="greeting"]').textContent()
    console.log('Estonian greeting:', estonianGreeting)
    
    // Check URL after Estonian
    console.log('URL after Estonian:', page.url())
    
    // Final screenshot
    await page.screenshot({ path: 'debug-final.png' })
  })
})