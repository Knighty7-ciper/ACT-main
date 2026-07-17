import { test, expect } from '@playwright/test';

test('should load blog page without console errors', async ({ page }) => {
  const consoleErrors = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');
  
  // Verify main elements are present
  await expect(page.locator('h1:has-text("Pesa-Afrik Blog")')).toBeVisible();
  
  // Wait for news to load (with API call)
  await page.waitForTimeout(3000);
  
  // Check for console errors
  const criticalErrors = consoleErrors.filter(e => 
    !e.includes('favicon') && 
    !e.includes('404') &&
    !e.includes('Failed to load resource')
  );
  
  expect(criticalErrors).toHaveLength(0);
});

test('should display news articles with images', async ({ page }) => {
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');
  
  // Wait for news section to load
  await page.waitForTimeout(3000);
  
  // Check that news cards are displayed
  const newsCards = page.locator('a[href^="https"]').first();
  await expect(newsCards).toBeVisible();
});
