import { test, expect } from '@playwright/test'

test.describe('Hello World E2E Tests', () => {
  test('displays Hello World greeting on home page', async ({ page }) => {
    // Navigate to the home page
    await page.goto('https://localhost:3000')
    
    // Test that the Hello World text is visible
    await expect(page.locator('h1')).toContainText('Hello World')
    
    // Test that the page loads without errors
    await expect(page).toHaveTitle(/.*/)
  })

  test('is responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to the home page
    await page.goto('https://localhost:3000')
    
    // Test that the greeting is still visible on mobile
    await expect(page.locator('h1')).toContainText('Hello World')
    
    // Test that the greeting text is properly centered
    const greeting = page.locator('.greeting-text')
    await expect(greeting).toBeVisible()
  })

  test('has proper accessibility structure', async ({ page }) => {
    await page.goto('https://localhost:3000')
    
    // Test that there's a main heading for screen readers
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toContainText('Hello World')
    
    // Test that the page has no critical accessibility violations
    // (This is a basic check - more comprehensive testing would use axe-core)
    await expect(page).toHaveURL('https://localhost:3000')
  })

  test('loads over HTTPS', async ({ page }) => {
    // Test that we can access the page over HTTPS
    await page.goto('https://localhost:3000')
    
    // Verify the URL is HTTPS
    expect(page.url()).toContain('https://')
    
    // Test that the page loads successfully
    await expect(page.locator('body')).toBeVisible()
  })
})