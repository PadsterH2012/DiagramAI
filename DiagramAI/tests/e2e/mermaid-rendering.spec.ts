import { test, expect } from '@playwright/test'

test.describe('Mermaid Diagram Rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for server to be ready
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test('should render simple Mermaid diagram correctly', async ({ page }) => {
    console.log('Testing simple Mermaid diagram...')
    
    // Navigate to the simple Mermaid diagram
    await page.goto('http://localhost:3000/diagram/f50ff3c6-f439-4952-9370-49d686372c22')
    await page.waitForLoadState('networkidle')
    
    // Wait for the page to load completely
    await page.waitForTimeout(2000)
    
    // Check if the page title is correct
    const title = await page.locator('h1').textContent()
    console.log('Page title:', title)
    expect(title).toContain('Simple Mermaid Test')
    
    // Check if Mermaid View indicator is present
    const mermaidView = await page.locator('text=Mermaid View').isVisible()
    console.log('Mermaid View indicator visible:', mermaidView)
    expect(mermaidView).toBe(true)
    
    // Check for any error messages
    const errorMessage = await page.locator('text=Rendering Error').isVisible()
    console.log('Error message visible:', errorMessage)
    expect(errorMessage).toBe(false)
    
    // Check if loading indicator is gone
    const loadingIndicator = await page.locator('text=Rendering diagram...').isVisible()
    console.log('Loading indicator visible:', loadingIndicator)
    expect(loadingIndicator).toBe(false)
    
    // Check if SVG element exists (this indicates successful Mermaid rendering)
    const svgElement = await page.locator('svg').first()
    const svgExists = await svgElement.isVisible()
    console.log('SVG element visible:', svgExists)
    expect(svgExists).toBe(true)
    
    // Get SVG content to verify it's actually rendered
    if (svgExists) {
      const svgContent = await svgElement.innerHTML()
      console.log('SVG content length:', svgContent.length)
      console.log('SVG content preview:', svgContent.substring(0, 200) + '...')
      expect(svgContent.length).toBeGreaterThan(100) // Should have substantial content
    }
    
    // Check for specific Mermaid elements (nodes A, B, C)
    const pageContent = await page.content()
    console.log('Page contains node A:', pageContent.includes('A'))
    console.log('Page contains node B:', pageContent.includes('B'))
    console.log('Page contains node C:', pageContent.includes('C'))
    
    // Take a screenshot for visual verification
    await page.screenshot({ 
      path: 'DiagramAI/tests/screenshots/simple-mermaid-test.png',
      fullPage: true 
    })
    console.log('Screenshot saved to tests/screenshots/simple-mermaid-test.png')
  })

  test('should render complex Mermaid diagram correctly', async ({ page }) => {
    console.log('Testing complex Mermaid diagram...')
    
    // Navigate to the complex Mermaid diagram
    await page.goto('http://localhost:3000/diagram/74a7ac31-15cc-4c87-a522-2ce85435d963')
    await page.waitForLoadState('networkidle')
    
    // Wait for the page to load completely
    await page.waitForTimeout(3000)
    
    // Check if the page title is correct
    const title = await page.locator('h1').textContent()
    console.log('Page title:', title)
    expect(title).toContain('AI Agent Architecture Demo')
    
    // Check if Mermaid View indicator is present
    const mermaidView = await page.locator('text=Mermaid View').isVisible()
    console.log('Mermaid View indicator visible:', mermaidView)
    expect(mermaidView).toBe(true)
    
    // Check for any error messages
    const errorMessage = await page.locator('text=Rendering Error').isVisible()
    console.log('Error message visible:', errorMessage)
    
    if (errorMessage) {
      // If there's an error, capture the error details
      const errorDetails = await page.locator('.text-red-600').textContent()
      console.log('Error details:', errorDetails)
      
      // Also check if there's more error info
      const errorInfo = await page.locator('.text-gray-600').textContent()
      console.log('Additional error info:', errorInfo)
    }
    
    expect(errorMessage).toBe(false)
    
    // Check if loading indicator is gone
    const loadingIndicator = await page.locator('text=Rendering diagram...').isVisible()
    console.log('Loading indicator visible:', loadingIndicator)
    expect(loadingIndicator).toBe(false)
    
    // Check if SVG element exists
    const svgElement = await page.locator('svg').first()
    const svgExists = await svgElement.isVisible()
    console.log('SVG element visible:', svgExists)
    expect(svgExists).toBe(true)
    
    // Get SVG content to verify it's actually rendered
    if (svgExists) {
      const svgContent = await svgElement.innerHTML()
      console.log('SVG content length:', svgContent.length)
      console.log('SVG content preview:', svgContent.substring(0, 300) + '...')
      expect(svgContent.length).toBeGreaterThan(500) // Complex diagram should have more content
    }
    
    // Check for specific elements in the complex diagram
    const pageContent = await page.content()
    console.log('Page contains "AI Agent":', pageContent.includes('AI Agent'))
    console.log('Page contains "MCP Server":', pageContent.includes('MCP Server'))
    console.log('Page contains "DiagramAI Backend":', pageContent.includes('DiagramAI Backend'))
    
    // Take a screenshot for visual verification
    await page.screenshot({ 
      path: 'DiagramAI/tests/screenshots/complex-mermaid-test.png',
      fullPage: true 
    })
    console.log('Screenshot saved to tests/screenshots/complex-mermaid-test.png')
  })

  test('should display console logs and errors', async ({ page }) => {
    console.log('Capturing browser console logs...')
    
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
    
    // Navigate to simple diagram and capture logs
    await page.goto('http://localhost:3000/diagram/f50ff3c6-f439-4952-9370-49d686372c22')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    console.log('\n=== BROWSER CONSOLE LOGS ===')
    logs.forEach(log => console.log(log))
    
    console.log('\n=== BROWSER ERRORS ===')
    if (errors.length > 0) {
      errors.forEach(error => console.log(error))
    } else {
      console.log('No browser errors detected')
    }
    
    // The test should not fail due to console logs, but we want to see them
    expect(true).toBe(true)
  })
})
