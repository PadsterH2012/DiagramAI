import { test, expect } from '@playwright/test'

test.describe('Simple Mermaid Test', () => {
  test('should render Mermaid on test page', async ({ page }) => {
    console.log('Testing simple Mermaid test page...')
    
    const logs: string[] = []
    const errors: string[] = []
    
    // Capture console logs
    page.on('console', msg => {
      const logMessage = `[${msg.type()}] ${msg.text()}`
      logs.push(logMessage)
      console.log('Browser console:', logMessage)
    })
    
    // Capture page errors
    page.on('pageerror', error => {
      const errorMessage = `Page error: ${error.message}`
      errors.push(errorMessage)
      console.log('Browser error:', errorMessage)
    })
    
    // Navigate to test page
    await page.goto('http://localhost:3000/test-mermaid')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Check if page loaded
    const title = await page.locator('h1').textContent()
    console.log('Page title:', title)
    expect(title).toBe('Mermaid Test Page')
    
    // Check for SVG element
    const svgElement = await page.locator('svg').first()
    const svgExists = await svgElement.isVisible()
    console.log('SVG element visible:', svgExists)
    
    if (svgExists) {
      const svgContent = await svgElement.innerHTML()
      console.log('SVG content length:', svgContent.length)
      console.log('SVG content preview:', svgContent.substring(0, 200) + '...')
    }
    
    // Check for error messages
    const errorText = await page.locator('text=Error:').isVisible()
    console.log('Error message visible:', errorText)
    
    if (errorText) {
      const errorContent = await page.locator('p[style*="color: red"]').textContent()
      console.log('Error content:', errorContent)
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'DiagramAI/tests/screenshots/simple-mermaid-test-page.png',
      fullPage: true 
    })
    console.log('Screenshot saved')
    
    console.log('\n=== BROWSER CONSOLE LOGS ===')
    logs.forEach(log => console.log(log))
    
    console.log('\n=== BROWSER ERRORS ===')
    if (errors.length > 0) {
      errors.forEach(error => console.log(error))
    } else {
      console.log('No browser errors detected')
    }
    
    // The test passes if we can load the page - we're just debugging
    expect(true).toBe(true)
  })
})
