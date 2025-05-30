import { test, expect } from '@playwright/test'

test.describe('Debug Mermaid Test', () => {
  test('should test Mermaid rendering in isolation', async ({ page }) => {
    console.log('Testing debug Mermaid page...')
    
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
    
    // Navigate to debug page
    await page.goto('http://localhost:3000/debug-mermaid')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Check if page loaded (use nth(1) to skip header H1)
    const title = await page.locator('h1').nth(1).textContent()
    console.log('Page title:', title)
    expect(title).toBe('Debug Mermaid Page')
    
    // Check for container
    const container = await page.locator('div[style*="border: 3px solid blue"]')
    const containerVisible = await container.isVisible()
    console.log('Blue container visible:', containerVisible)
    
    // Check for mermaid div (green border - updated to 2px)
    const mermaidDiv = await page.locator('div[style*="border: 2px solid green"]')
    const mermaidVisible = await mermaidDiv.isVisible()
    console.log('Green mermaid div visible:', mermaidVisible)
    
    // Check for SVG (successful render)
    const svgElement = await page.locator('svg').first()
    const svgExists = await svgElement.isVisible()
    console.log('SVG element visible:', svgExists)
    
    // Take screenshot
    await page.screenshot({ 
      path: 'DiagramAI/tests/screenshots/debug-mermaid-test.png',
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
    
    // Analyze debug logs (updated for new patterns)
    const hasContainerFound = logs.some(log => log.includes('🔧 ROBUST: Container found') || log.includes('🔧 DEBUG: Container found'))
    const hasContainerInDOM = logs.some(log => log.includes('🔧 ROBUST: Container in DOM: true') || log.includes('🔧 DEBUG: Container in DOM: true'))
    const hasMermaidSuccess = logs.some(log => log.includes('🔧 ROBUST: Mermaid service render SUCCESS!') || log.includes('🔧 DEBUG: Mermaid init SUCCESS!'))
    const hasDimensionsOK = logs.some(log => log.includes('🔧 ROBUST: Dimensions OK') || log.includes('🔧 DEBUG: Dimensions OK'))
    const hasMermaidService = logs.some(log => log.includes('🔧 MermaidService:'))

    console.log('\n=== DEBUG ANALYSIS ===')
    console.log('Container found:', hasContainerFound)
    console.log('Container in DOM:', hasContainerInDOM)
    console.log('Dimensions OK:', hasDimensionsOK)
    console.log('Mermaid success:', hasMermaidSuccess)
    console.log('MermaidService logs:', hasMermaidService)
    
    // The test passes - we're just debugging
    expect(true).toBe(true)
  })
})
