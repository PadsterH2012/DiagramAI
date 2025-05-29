import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage successfully', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/DiagramAI/);

    // Check for main heading (be specific to avoid multiple h1 elements)
    await expect(page.locator('h1').filter({ hasText: 'Create Diagrams with AI Power' })).toBeVisible();

    // Check for navigation elements
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Test Editor link
    const editorLink = page.locator('a[href="/editor"]');
    await expect(editorLink).toBeVisible();
    await editorLink.click();
    await expect(page).toHaveURL('/editor');
    
    // Go back to homepage
    await page.goto('/');
    
    // Test Dashboard link
    const dashboardLink = page.locator('a[href="/dashboard"]');
    await expect(dashboardLink).toBeVisible();
    await dashboardLink.click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that content is still visible and accessible
    await expect(page.locator('h1').filter({ hasText: 'Create Diagrams with AI Power' })).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();

    // Check that navigation works on mobile
    const editorLink = page.locator('a[href="/editor"]');
    await expect(editorLink).toBeVisible();
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    // Check for essential meta tags
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/);
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon.ico') &&
      !error.includes('DevTools')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have accessible content', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1').filter({ hasText: 'Create Diagrams with AI Power' });
    await expect(h1).toBeVisible();

    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }

    // Check for proper link text
    const links = page.locator('a');
    const linkCount = await links.count();

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      // Links should have either text content or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
