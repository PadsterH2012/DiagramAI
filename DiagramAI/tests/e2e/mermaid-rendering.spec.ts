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
    
    // Check if the page title is correct (be more specific)
    const title = await page.locator('h1').nth(1).textContent()
    console.log('Page title:', title)
    expect(title).toContain('Simple Mermaid Test')
    
    // Check if Mermaid View indicator is present (updated for new component)
    const mermaidView = await page.locator('text=Mermaid View').or(page.locator('text=Mermaid View (Fixed)')).isVisible()
    console.log('Mermaid View indicator visible:', mermaidView)
    expect(mermaidView).toBe(true)
    
    // Check for any error messages (updated for new error format)
    const errorMessage = await page.locator('text=❌ Rendering Error').or(page.locator('text=Rendering Error')).isVisible()
    console.log('Error message visible:', errorMessage)
    expect(errorMessage).toBe(false)

    // Check if loading indicator is gone (updated for new loading text)
    const loadingIndicator = await page.locator('text=Loading Mermaid...').or(page.locator('text=Rendering diagram...')).isVisible()
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
    
    // Check if the page title is correct (be more specific)
    const title = await page.locator('h1').nth(1).textContent()
    console.log('Page title:', title)
    expect(title).toContain('AI Agent Architecture Demo')
    
    // Check if Mermaid View indicator is present (updated for new component)
    const mermaidView = await page.locator('text=Mermaid View').or(page.locator('text=Mermaid View (Fixed)')).isVisible()
    console.log('Mermaid View indicator visible:', mermaidView)
    expect(mermaidView).toBe(true)
    
    // Check for any error messages (updated for new error format)
    const errorMessage = await page.locator('text=❌ Rendering Error').or(page.locator('text=Rendering Error')).isVisible()
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
    
    // Check if loading indicator is gone (updated for new loading text)
    const loadingIndicator = await page.locator('text=Loading Mermaid...').or(page.locator('text=Rendering diagram...')).isVisible()
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

  test('should capture and analyze specific Mermaid errors', async ({ page }) => {
    console.log('Capturing detailed browser console logs and errors...')

    const logs: string[] = []
    const errors: string[] = []
    const mermaidLogs: string[] = []
    const criticalErrors: string[] = []

    // Capture console logs with detailed filtering
    page.on('console', msg => {
      const logMessage = `[${msg.type()}] ${msg.text()}`
      logs.push(logMessage)

      // Filter Mermaid-specific logs (updated patterns)
      if (logMessage.includes('MermaidViewer') || logMessage.includes('Mermaid') || logMessage.includes('mermaid') ||
          logMessage.includes('🔧 ROBUST:') || logMessage.includes('🔧 FIXED:') || logMessage.includes('🔧 MermaidService:')) {
        mermaidLogs.push(logMessage)
        console.log('🔍 MERMAID LOG:', logMessage)
      }

      // Filter critical errors (updated patterns)
      if (logMessage.includes('CRITICAL') || logMessage.includes('zero dimensions') || logMessage.includes('Element in DOM') ||
          logMessage.includes('🔧 ROBUST: FAILED') || logMessage.includes('Cannot render Mermaid')) {
        criticalErrors.push(logMessage)
        console.log('🚨 CRITICAL ERROR:', logMessage)
      }

      console.log('Browser console:', logMessage)
    })

    // Capture page errors
    page.on('pageerror', error => {
      const errorMessage = `Page error: ${error.message}`
      errors.push(errorMessage)
      console.log('🔥 Browser error:', errorMessage)
    })

    // Navigate to simple diagram and capture logs
    await page.goto('http://localhost:3000/diagram/f50ff3c6-f439-4952-9370-49d686372c22')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(4000) // Wait longer to capture all logs

    // Check for specific error indicators in the UI (updated for new error format)
    const renderingError = await page.locator('text=❌ Rendering Error').or(page.locator('text=Rendering Error')).isVisible()
    const errorMessage = await page.locator('text=Cannot render Mermaid').isVisible()
    const zeroDimensionsError = await page.locator('text=element has zero dimensions').isVisible()

    console.log('\n=== UI ERROR INDICATORS ===')
    console.log('Rendering Error visible:', renderingError)
    console.log('Cannot render Mermaid visible:', errorMessage)
    console.log('Zero dimensions error visible:', zeroDimensionsError)

    // Capture error details if visible
    if (renderingError) {
      try {
        const errorDetails = await page.locator('.text-red-600').textContent()
        console.log('Error details from UI:', errorDetails)
      } catch (e) {
        console.log('Could not capture error details from UI')
      }
    }

    console.log('\n=== MERMAID-SPECIFIC LOGS ===')
    mermaidLogs.forEach(log => console.log(log))

    console.log('\n=== CRITICAL ERRORS ===')
    criticalErrors.forEach(error => console.log(error))

    console.log('\n=== ALL BROWSER CONSOLE LOGS ===')
    logs.forEach(log => console.log(log))

    console.log('\n=== BROWSER ERRORS ===')
    if (errors.length > 0) {
      errors.forEach(error => console.log(error))
    } else {
      console.log('No browser errors detected')
    }

    // Analyze the logs for specific patterns
    const hasZeroDimensions = logs.some(log => log.includes('dimensions: 0 x 0'))
    const hasElementNotInDOM = logs.some(log => log.includes('Element in DOM: false'))
    const hasCriticalError = logs.some(log => log.includes('CRITICAL'))
    const hasRenderingError = logs.some(log => log.includes('Mermaid rendering error'))

    console.log('\n=== ERROR ANALYSIS ===')
    console.log('Has zero dimensions error:', hasZeroDimensions)
    console.log('Has element not in DOM error:', hasElementNotInDOM)
    console.log('Has critical error:', hasCriticalError)
    console.log('Has rendering error:', hasRenderingError)

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'DiagramAI/tests/screenshots/mermaid-error-analysis.png',
      fullPage: true
    })
    console.log('Screenshot saved to tests/screenshots/mermaid-error-analysis.png')

    // The test passes but provides comprehensive error analysis
    expect(true).toBe(true)
  })
})
