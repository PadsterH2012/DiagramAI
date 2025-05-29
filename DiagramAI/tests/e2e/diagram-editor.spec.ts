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

    // Check for AI generation panel
    await expect(page.locator('h2').filter({ hasText: 'AI Diagram Generation' })).toBeVisible();
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

    // Check for React Flow container
    await expect(page.locator('.react-flow')).toBeVisible();

    // Check for node palette heading
    await expect(page.locator('h3').filter({ hasText: 'Node Palette' })).toBeVisible();

    // Check for different node types in palette
    await expect(page.locator('div').filter({ hasText: 'Start' }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: 'Process' }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: 'Decision' }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: 'End' }).first()).toBeVisible();
  });

  test('should have interactive node palette', async ({ page }) => {
    // Ensure we're on the visual tab (default)
    await expect(page.locator('button').filter({ hasText: 'Visual Editor' })).toHaveClass(/border-blue-500/);

    // Wait for React Flow to be ready
    await page.waitForSelector('.react-flow', { state: 'visible' });

    // Check that nodes are already present (demo nodes)
    await expect(page.locator('.react-flow__node')).toHaveCount(5);

    // Check that palette nodes are clickable
    const startNodePalette = page.locator('div[draggable="true"]').filter({ hasText: 'Start' }).first();
    await expect(startNodePalette).toBeVisible();
    await expect(startNodePalette).toHaveAttribute('draggable', 'true');

    // Check that palette has instructions
    await expect(page.locator('text=Click to add to center')).toBeVisible();
    await expect(page.locator('text=Drag to position')).toBeVisible();
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

  test('should have AI generation functionality', async ({ page }) => {
    // Look for AI input and button
    const aiInput = page.locator('input[placeholder*="Describe your diagram"]');
    const aiButton = page.locator('button:has-text("Generate")');

    // Check if AI components are present
    await expect(aiInput).toBeVisible();
    await expect(aiButton).toBeVisible();

    // Test AI input functionality
    await aiInput.fill('user login process');
    await expect(aiButton).toBeEnabled();

    // Clear input and check button is disabled
    await aiInput.clear();
    await expect(aiButton).toBeDisabled();
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
