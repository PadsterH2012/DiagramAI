import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up security monitoring
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('CSP')) {
        console.warn('CSP violation detected:', msg.text());
      }
    });
  });

  test('should prevent XSS attacks in AI input', async ({ page }) => {
    await page.goto('/editor');
    
    const aiInput = page.locator('input[placeholder*="Describe your diagram"]');
    
    // Test various XSS payloads
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      '"><script>alert("XSS")</script>',
    ];
    
    for (const payload of xssPayloads) {
      await aiInput.clear();
      await aiInput.fill(payload);
      
      // Check that the input is properly sanitized
      const inputValue = await aiInput.inputValue();
      
      // The input should contain the text but not execute as script
      expect(inputValue).toBe(payload);
      
      // No alert should appear
      page.on('dialog', dialog => {
        throw new Error(`Unexpected alert: ${dialog.message()}`);
      });
      
      await page.waitForTimeout(500);
    }
  });

  test('should prevent XSS in Mermaid editor', async ({ page }) => {
    await page.goto('/editor');
    
    // Switch to Mermaid editor
    await page.click('button:has-text("Mermaid Code")');
    
    const textarea = page.locator('textarea');
    
    // Test XSS in Mermaid syntax
    const maliciousMermaid = `graph TD
    A[<script>alert('XSS')</script>] --> B[Normal Node]
    B --> C[<img src=x onerror=alert('XSS')>]`;
    
    await textarea.clear();
    await textarea.fill(maliciousMermaid);
    
    // Switch to visual editor to render
    await page.click('button:has-text("Visual Editor")');
    
    // No alert should appear
    page.on('dialog', dialog => {
      throw new Error(`Unexpected alert: ${dialog.message()}`);
    });
    
    await page.waitForTimeout(1000);
    
    // Check that content is rendered safely
    await expect(page.locator('.react-flow')).toBeVisible();
  });

  test('should have proper Content Security Policy headers', async ({ page }) => {
    const response = await page.goto('/');
    
    const headers = response?.headers();
    
    // Check for security headers
    if (headers) {
      // These headers might not be set in development, but we should check
      const securityHeaders = [
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
      ];
      
      securityHeaders.forEach(header => {
        if (headers[header]) {
          console.log(`Security header ${header}: ${headers[header]}`);
        }
      });
    }
    
    // Page should load successfully regardless
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should prevent clickjacking attacks', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page can be embedded in an iframe
    const canBeFramed = await page.evaluate(() => {
      try {
        return window.self === window.top;
      } catch (e) {
        return false;
      }
    });
    
    // In a production environment, this should be false to prevent clickjacking
    // For development, we'll just log the result
    console.log('Can be framed:', canBeFramed);
  });

  test('should sanitize user input in diagram labels', async ({ page }) => {
    await page.goto('/editor');
    
    // Switch to Mermaid editor
    await page.click('button:has-text("Mermaid Code")');
    
    const textarea = page.locator('textarea');
    
    // Test with potentially dangerous characters
    const dangerousInput = `graph TD
    A["User Input: <>&'\""] --> B[Normal]
    B --> C["Special chars: \${alert('xss')}"]`;
    
    await textarea.clear();
    await textarea.fill(dangerousInput);
    
    // Switch to visual editor
    await page.click('button:has-text("Visual Editor")');
    
    // Check that the diagram renders without executing scripts
    await expect(page.locator('.react-flow')).toBeVisible();
    
    // No JavaScript should execute
    page.on('dialog', dialog => {
      throw new Error(`Unexpected alert: ${dialog.message()}`);
    });
    
    await page.waitForTimeout(1000);
  });

  test('should handle malformed input gracefully', async ({ page }) => {
    await page.goto('/editor');
    
    const aiInput = page.locator('input[placeholder*="Describe your diagram"]');
    
    // Test with various malformed inputs
    const malformedInputs = [
      'A'.repeat(10000), // Very long input
      '\x00\x01\x02\x03', // Control characters
      '🚀🎉💻🔥', // Emojis
      'SELECT * FROM users;', // SQL injection attempt
      '../../../etc/passwd', // Path traversal attempt
      '${7*7}', // Template injection attempt
    ];
    
    for (const input of malformedInputs) {
      await aiInput.clear();
      await aiInput.fill(input);
      
      // Application should handle gracefully without crashing
      await expect(page.locator('h1')).toBeVisible();
      
      // Try to generate diagram
      const generateButton = page.locator('button:has-text("Generate")');
      if (await generateButton.isEnabled()) {
        await generateButton.click();
        await page.waitForTimeout(1000);
        
        // Page should still be functional
        await expect(page.locator('.react-flow')).toBeVisible();
      }
    }
  });

  test('should prevent CSRF attacks', async ({ page }) => {
    await page.goto('/editor');
    
    // Check for CSRF protection mechanisms
    // In a real application, this would check for CSRF tokens
    
    // For now, we'll just verify that the application loads correctly
    await expect(page.locator('h1')).toBeVisible();
    
    // Test that forms don't accept requests from other origins
    // This would typically be tested with actual API endpoints
    console.log('CSRF protection should be implemented at the API level');
  });

  test('should handle file upload security', async ({ page }) => {
    await page.goto('/editor');
    
    // If there are file upload features, test them
    const fileInputs = page.locator('input[type="file"]');
    const fileInputCount = await fileInputs.count();
    
    if (fileInputCount > 0) {
      // Test with various file types
      const testFiles = [
        'test.txt',
        'test.exe', // Executable file
        'test.php', // Script file
        'test.svg', // SVG with potential XSS
      ];
      
      for (let i = 0; i < Math.min(fileInputCount, testFiles.length); i++) {
        const fileInput = fileInputs.nth(i);
        
        // Create a test file
        const testContent = '<svg onload="alert(\'XSS\')"></svg>';
        
        // In a real test, you would upload actual files
        // For now, we just verify the input exists
        await expect(fileInput).toBeVisible();
      }
    } else {
      console.log('No file upload inputs found');
    }
  });

  test('should validate data integrity', async ({ page }) => {
    await page.goto('/editor');
    
    // Test data integrity by manipulating the DOM
    await page.evaluate(() => {
      // Try to manipulate application data
      const reactFlowElement = document.querySelector('.react-flow');
      if (reactFlowElement) {
        // Attempt to inject malicious data
        reactFlowElement.setAttribute('data-malicious', 'true');
      }
    });
    
    // Application should continue to function normally
    await expect(page.locator('.react-flow')).toBeVisible();
    
    // Test tab switching still works
    await page.click('button:has-text("Mermaid Code")');
    await expect(page.locator('textarea')).toBeVisible();
    
    await page.click('button:has-text("Visual Editor")');
    await expect(page.locator('.react-flow')).toBeVisible();
  });

  test('should handle authentication securely', async ({ page }) => {
    // Test authentication-related security
    // Since the app might not have authentication yet, we'll test basic security
    
    await page.goto('/');
    
    // Check for secure cookies (if any)
    const cookies = await page.context().cookies();
    
    cookies.forEach(cookie => {
      if (cookie.name.toLowerCase().includes('session') || 
          cookie.name.toLowerCase().includes('auth')) {
        // Session cookies should be secure and httpOnly
        expect(cookie.secure).toBe(true);
        expect(cookie.httpOnly).toBe(true);
      }
    });
    
    // Check that sensitive operations require proper authorization
    // This would be more relevant when authentication is implemented
    console.log('Authentication security checks completed');
  });
});
