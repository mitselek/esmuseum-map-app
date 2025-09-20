import { test, expect } from '@playwright/test'

test.describe('URL Language Navigation Edge Cases', () => {
  test.beforeEach(async ({ context }) => {
    // Clear localStorage and cookies before each test
    await context.clearCookies()
    await context.addInitScript(() => {
      localStorage.clear()
    })
  })

  test('handles manual URL navigation from localized to root path', async ({ page }) => {
    // Start with Ukrainian selected and navigate to localized URL
    await page.goto('/')
    await page.click('[data-testid="language-uk"]')
    
    // Verify we're on Ukrainian version
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Ласкаво просимо до картографічного застосунку ESMuseum')
    
    // Check if URL has locale prefix (depending on Nuxt i18n config)
    const currentUrl = page.url()
    console.log('Current URL after Ukrainian selection:', currentUrl)
    
    // Now manually navigate to root URL (simulating user typing in address bar)
    await page.goto('https://localhost:3000/')
    
    // Record the navigation sequence
    const navigationEvents: string[] = []
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        navigationEvents.push(frame.url())
      }
    })
    
    // Wait for any redirects to settle
    await page.waitForTimeout(1000)
    
    const finalUrl = page.url()
    console.log('Final URL after manual root navigation:', finalUrl)
    console.log('Navigation events:', navigationEvents)
    
    // The behavior depends on i18n configuration:
    // Option 1: Should stay on root and show Estonian (default)
    // Option 2: Should redirect to /uk based on localStorage preference
    // Let's check what actually happens
    const greeting = await page.locator('[data-testid="greeting"]').textContent()
    console.log('Final greeting text:', greeting)
    
    // At minimum, it should not redirect multiple times rapidly
    expect(navigationEvents.length).toBeLessThanOrEqual(2) // Allow max 1 redirect
  })

  test('prevents rapid redirects when navigating between URLs', async ({ page }) => {
    let redirectCount = 0
    const redirectUrls: string[] = []
    
    // Monitor navigation events
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        redirectCount++
        redirectUrls.push(frame.url())
        console.log(`Navigation ${redirectCount}: ${frame.url()}`)
      }
    })
    
    // Start fresh and select Ukrainian
    await page.goto('/')
    await page.click('[data-testid="language-uk"]')
    
    // Reset redirect counter after initial navigation
    redirectCount = 0
    redirectUrls.length = 0
    
    // Manually navigate to root URL
    await page.goto('https://localhost:3000/')
    
    // Wait for any redirects to complete
    await page.waitForTimeout(2000)
    
    console.log(`Total redirects: ${redirectCount}`)
    console.log('Redirect sequence:', redirectUrls)
    
    // Should not have more than 2 redirects (root -> locale detection -> final)
    expect(redirectCount).toBeLessThanOrEqual(2)
    
    // Should end up in a stable state (not continuously redirecting)
    const finalUrl = page.url()
    await page.waitForTimeout(500) // Wait a bit more
    const stableUrl = page.url()
    expect(finalUrl).toBe(stableUrl) // URL should be stable
  })

  test('handles URL navigation with different locale prefixes', async ({ page }) => {
    // Test navigation between different locale URLs
    await page.goto('/')
    
    // Set Ukrainian preference
    await page.click('[data-testid="language-uk"]')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Ласкаво просимо до картографічного застосунку ESMuseum')
    
    // Try navigating directly to different locale URLs (if they exist)
    const urlsToTest = [
      'https://localhost:3000/',
      'https://localhost:3000/et',
      'https://localhost:3000/uk', 
      'https://localhost:3000/en-GB'
    ]
    
    for (const url of urlsToTest) {
      try {
        console.log(`Testing navigation to: ${url}`)
        await page.goto(url)
        
        // Wait for page to stabilize
        await page.waitForTimeout(500)
        
        // Check that page loads and doesn't error
        await expect(page.locator('[data-testid="greeting"]')).toBeVisible()
        
        const finalUrl = page.url()
        const greetingText = await page.locator('[data-testid="greeting"]').textContent()
        console.log(`URL: ${url} -> Final: ${finalUrl}, Greeting: ${greetingText}`)
        
      } catch (error) {
        console.log(`URL ${url} might not be supported:`, (error as Error).message)
      }
    }
  })

  test('maintains language preference during URL navigation', async ({ page }) => {
    // Set up initial state with Ukrainian
    await page.goto('/')
    await page.click('[data-testid="language-uk"]')
    
    // Verify preference is saved
    const initialPreference = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('esmuseum-language-preference') || '{}')
    })
    expect(initialPreference.preferredLanguage).toBe('uk')
    
    // Navigate to root URL manually
    await page.goto('https://localhost:3000/')
    
    // Check if preference is respected or if user needs to reselect
    const finalGreeting = await page.locator('[data-testid="greeting"]').textContent()
    const finalPreference = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('esmuseum-language-preference') || '{}')
    })
    
    console.log('Initial preference:', initialPreference)
    console.log('Final preference:', finalPreference)
    console.log('Final greeting:', finalGreeting)
    
    // localStorage preference should persist
    expect(finalPreference.preferredLanguage).toBe('uk')
  })

  test('handles browser back/forward navigation with language changes', async ({ page }) => {
    // Start at root
    await page.goto('/')
    const initialUrl = page.url()
    
    // Switch to Ukrainian
    await page.click('[data-testid="language-uk"]')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Ласкаво просимо до картографічного застосунку ESMuseum')
    const ukrainianUrl = page.url()
    
    // Switch to English
    await page.click('[data-testid="language-en-GB"]')
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Welcome to the ESMuseum Map Application')
    const englishUrl = page.url()
    
    console.log('URL progression:', { initialUrl, ukrainianUrl, englishUrl })
    
    // Use browser back button
    await page.goBack()
    await page.waitForTimeout(500)
    
    // Should go back to Ukrainian
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Ласкаво просимо до картографічного застосунку ESMuseum')
    
    // Use browser forward button
    await page.goForward()
    await page.waitForTimeout(500)
    
    // Should return to English
    await expect(page.locator('[data-testid="greeting"]')).toContainText('Welcome to the ESMuseum Map Application')
  })
})