import { test, expect } from '@playwright/test';

test.describe('Diagram Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor');
  });

  test('should load the editor page successfully', async ({ page }) => {
    // Check that the editor page loads
    await expect(page).toHaveTitle(/DiagramAI/);

    // Check for main heading
    await expect(page.locator('h1').filter({ hasText: 'Diagram Editor' })).toBeVisible();

    // Check for diagram editor
    await expect(page.locator('[data-testid="unified-diagram-editor"]')).toBeVisible();
  });

  test('should have both Visual and Mermaid editor tabs', async ({ page }) => {
    // Check for tab navigation
    await expect(page.locator('button').filter({ hasText: 'Visual Editor' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Mermaid Code' })).toBeVisible();

    // Test tab switching
    await page.click('button:has-text("Mermaid Code")');
    await expect(page.locator('textarea')).toBeVisible();

    await page.click('button:has-text("Visual Editor")');
    await expect(page.locator('.react-flow')).toBeVisible();
  });

  test('should display React Flow visual editor', async ({ page }) => {
    // Ensure we're on the visual tab (default)
    await expect(page.locator('button').filter({ hasText: 'Visual Editor' })).toHaveClass(/border-blue-500/);

    // Check for React Flow container with timeout
    await expect(page.locator('.react-flow')).toBeVisible({ timeout: 10000 });

    // Check for slide-out menu toggle button
    await expect(page.locator('button[title*="Open Menu"]')).toBeVisible({ timeout: 5000 });

    // Open the slide-out menu to access node palette
    const menuButton = page.locator('button[title*="Open Menu"]');
    await menuButton.click();

    // Wait for menu animation with longer timeout
    await page.waitForTimeout(1000);

    // Check for Tools header in slide-out menu (not "Node Palette")
    await expect(page.locator('h2').filter({ hasText: 'Tools' })).toBeVisible();

    // Check for different node types in palette (after opening menu)
    await expect(page.locator('div').filter({ hasText: 'Start' }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: 'Process' }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: 'Decision' }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: 'End' }).first()).toBeVisible();
  });

  test('should have interactive node palette', async ({ page }) => {
    // Ensure we're on the visual tab (default)
    await expect(page.locator('button').filter({ hasText: 'Visual Editor' })).toHaveClass(/border-blue-500/);

    // Wait for React Flow to be ready with longer timeout
    await page.waitForSelector('.react-flow', { state: 'visible', timeout: 10000 });

    // Open the slide-out menu to access node palette
    const menuButton = page.locator('button[title*="Open Menu"]');
    await expect(menuButton).toBeVisible({ timeout: 5000 });
    await menuButton.click();

    // Wait for menu animation with longer timeout
    await page.waitForTimeout(1000);

    // Wait for the Tools header to be visible (indicates menu is open)
    await expect(page.locator('h2').filter({ hasText: 'Tools' })).toBeVisible({ timeout: 5000 });

    // Check that palette nodes are clickable and draggable
    const startNodePalette = page.locator('div[draggable="true"]').filter({ hasText: 'Start' }).first();
    await expect(startNodePalette).toBeVisible({ timeout: 5000 });
    await expect(startNodePalette).toHaveAttribute('draggable', 'true');

    // Check for node descriptions (instead of instruction text that doesn't exist)
    await expect(page.locator('text=Start point of the process')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Process or action step')).toBeVisible({ timeout: 5000 });
  });

  test('should display Mermaid text editor', async ({ page }) => {
    // Switch to Mermaid tab
    await page.click('button:has-text("Mermaid Code")');

    // Check for Mermaid editor
    await expect(page.locator('textarea')).toBeVisible();

    // Check that the tab is active
    await expect(page.locator('button').filter({ hasText: 'Mermaid Code' })).toHaveClass(/border-blue-500/);
  });

  test('should allow text input in Mermaid editor', async ({ page }) => {
    // Switch to Mermaid tab
    await page.click('button:has-text("Mermaid Code")');

    // Find the text input area
    const textArea = page.locator('textarea').first();

    // Clear existing content and type some Mermaid syntax
    await textArea.clear();
    const mermaidCode = `graph TD
    A[Start] --> B[Process]
    B --> C[End]`;

    await textArea.fill(mermaidCode);

    // Verify the text was entered
    await expect(textArea).toHaveValue(mermaidCode);
  });



  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1').filter({ hasText: 'Diagram Editor' })).toBeVisible();

    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1').filter({ hasText: 'Diagram Editor' })).toBeVisible();

    // Test desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('h1').filter({ hasText: 'Diagram Editor' })).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    
    // Check that focus moves through interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const jsErrors: string[] = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = jsErrors.filter(error => 
      !error.includes('favicon.ico') &&
      !error.includes('DevTools') &&
      !error.includes('ResizeObserver')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
