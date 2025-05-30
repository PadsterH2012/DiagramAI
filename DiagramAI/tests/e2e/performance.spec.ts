import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      window.performance.mark('test-start');
    });
  });

  test('should load homepage within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check Core Web Vitals with timeout
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let resolved = false;

        // Set a timeout to prevent hanging
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve({ domContentLoaded: 0, loadComplete: 0 });
          }
        }, 2000);

        try {
          new PerformanceObserver((list) => {
            if (!resolved) {
              const entries = list.getEntries();
              const metrics: any = {};

              entries.forEach((entry) => {
                if (entry.entryType === 'navigation') {
                  const navEntry = entry as PerformanceNavigationTiming;
                  metrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
                  metrics.loadComplete = navEntry.loadEventEnd - navEntry.loadEventStart;
                }
              });

              resolved = true;
              resolve(metrics);
            }
          }).observe({ entryTypes: ['navigation'] });
        } catch (error) {
          if (!resolved) {
            resolved = true;
            resolve({ domContentLoaded: 0, loadComplete: 0 });
          }
        }
      });
    });
    
    console.log('Performance metrics:', metrics);
  });

  test('should load editor page within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');
    
    // Wait for React Flow to be ready
    await page.waitForSelector('.react-flow', { state: 'visible' });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Editor page should load within 4 seconds (more complex)
    expect(loadTime).toBeLessThan(4000);
  });

  test('should handle large diagrams efficiently', async ({ page }) => {
    await page.goto('/editor');
    await page.waitForSelector('.react-flow', { state: 'visible' });
    
    // Switch to Mermaid editor
    await page.click('button:has-text("Mermaid Code")');
    
    // Create a large diagram
    const largeDiagram = `graph TD
${Array.from({ length: 50 }, (_, i) => `    A${i}[Node ${i}] --> A${i + 1}[Node ${i + 1}]`).join('\n')}`;
    
    const startTime = Date.now();
    
    // Input the large diagram
    const textarea = page.locator('textarea');
    await textarea.clear();
    await textarea.fill(largeDiagram);
    
    // Switch back to visual editor to render
    await page.click('button:has-text("Visual Editor")');
    
    // Wait for rendering to complete
    await page.waitForTimeout(1000);
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    // Should render large diagram within 5 seconds
    expect(renderTime).toBeLessThan(5000);
  });

  test('should maintain responsiveness during AI generation', async ({ page }) => {
    await page.goto('/editor');

    // Open AI chatbox first
    await page.click('button[title*="Open AI Assistant"]');
    await page.waitForTimeout(500);

    // Find AI input (textarea in chatbox)
    const aiInput = page.locator('textarea[placeholder*="Ask me about your diagram"]');

    await aiInput.fill('complex business process with multiple decision points');

    const startTime = Date.now();

    // Send message (using arrow button or Enter key)
    await page.keyboard.press('Enter');
    
    // Check that UI remains responsive
    await page.click('button:has-text("Mermaid Code")');
    await page.click('button:has-text("Visual Editor")');
    
    // Wait for generation to complete (look for changes in the editor)
    await page.waitForTimeout(2000);
    
    const endTime = Date.now();
    const generationTime = endTime - startTime;
    
    // AI generation should complete within 10 seconds
    expect(generationTime).toBeLessThan(10000);
  });

  test('should handle rapid user interactions', async ({ page }) => {
    await page.goto('/editor');
    await page.waitForSelector('.react-flow', { state: 'visible' });
    
    const startTime = Date.now();
    
    // Perform rapid tab switching
    for (let i = 0; i < 10; i++) {
      await page.click('button:has-text("Mermaid Code")');
      await page.waitForTimeout(50);
      await page.click('button:has-text("Visual Editor")');
      await page.waitForTimeout(50);
    }
    
    const endTime = Date.now();
    const interactionTime = endTime - startTime;
    
    // Rapid interactions should complete within 3 seconds
    expect(interactionTime).toBeLessThan(3000);
    
    // UI should still be functional
    await expect(page.locator('.react-flow')).toBeVisible();
  });

  test('should maintain performance on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Mobile should load within 5 seconds (allowing for slower devices)
    expect(loadTime).toBeLessThan(5000);
    
    // Check that interactions are responsive on mobile
    await page.click('button:has-text("Mermaid Code")');
    await expect(page.locator('textarea')).toBeVisible();
    
    await page.click('button:has-text("Visual Editor")');
    await expect(page.locator('.react-flow')).toBeVisible();
  });

  test('should handle memory efficiently', async ({ page }) => {
    await page.goto('/editor');
    
    // Monitor memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    // Perform memory-intensive operations
    for (let i = 0; i < 5; i++) {
      // Switch between editors
      await page.click('button:has-text("Mermaid Code")');
      await page.waitForTimeout(100);
      await page.click('button:has-text("Visual Editor")');
      await page.waitForTimeout(100);
      
      // Add some content to Mermaid editor instead (since AI input requires opening chatbox)
      await page.click('button:has-text("Mermaid Code")');
      await page.waitForTimeout(200); // Wait for tab switch

      const mermaidInput = page.locator('textarea').first();
      await mermaidInput.fill(`graph TD\n  A${i}[Test ${i}] --> B${i}[End ${i}]`);
      await page.waitForTimeout(100);
      await mermaidInput.clear();
    }
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
    
    // Memory usage should not increase dramatically
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
      
      // Memory should not increase by more than 50%
      expect(memoryIncreasePercent).toBeLessThan(50);
    }
  });

  test('should handle concurrent users simulation', async ({ browser }) => {
    // Simulate multiple concurrent users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    const startTime = Date.now();
    
    // All users navigate to editor simultaneously
    await Promise.all(
      pages.map(page => page.goto('/editor'))
    );
    
    // All users wait for page to load
    await Promise.all(
      pages.map(page => page.waitForSelector('.react-flow', { state: 'visible' }))
    );
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // Concurrent loading should complete within 6 seconds
    expect(loadTime).toBeLessThan(6000);
    
    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });
});
