/**
 * End-to-End Real-time Flow Integration Tests
 * Tests the complete flow: API Update → WebSocket → Browser Refresh
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals'
import { chromium, Browser, Page } from 'playwright'
import { createServer } from 'http'
import { DiagramWebSocketService } from '../../src/services/websocketService'
import { prisma } from '../../src/lib/prisma'

describe('Real-time Flow Integration', () => {
  let browser: Browser
  let page: Page
  let server: any
  let wsService: DiagramWebSocketService
  let testDiagramId: string
  let baseUrl: string

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true })
    
    // Set up test server
    server = createServer()
    wsService = new DiagramWebSocketService(server)
    const port = 3003
    await new Promise<void>((resolve) => {
      server.listen(port, resolve)
    })
    
    baseUrl = `http://localhost:3001` // Main app URL
    global.wsService = wsService
  })

  afterAll(async () => {
    await browser.close()
    server.close()
    global.wsService = undefined
  })

  beforeEach(async () => {
    page = await browser.newPage()
    
    // Create test diagram
    const testDiagram = await prisma.diagram.create({
      data: {
        title: 'Integration Test Diagram',
        description: 'Test diagram for real-time integration',
        content: 'graph TD\n    A[Start] --> B[Process]',
        format: 'mermaid',
        isPublic: true
      }
    })
    testDiagramId = testDiagram.id

    // Enable console logging
    page.on('console', msg => {
      if (msg.text().includes('🔄') || msg.text().includes('🔌') || msg.text().includes('✅')) {
        console.log(`Browser Console: ${msg.text()}`)
      }
    })
  })

  afterEach(async () => {
    await page.close()
    
    // Clean up test data
    await prisma.diagram.delete({
      where: { id: testDiagramId }
    }).catch(() => {})
  })

  describe('Complete Real-time Flow', () => {
    it('should update diagram in browser without page refresh', async () => {
      // Navigate to diagram page
      await page.goto(`${baseUrl}/diagram/${testDiagramId}`)
      
      // Wait for initial load
      await page.waitForSelector('[data-testid="mermaid-diagram"]', { timeout: 10000 })
      
      // Wait for WebSocket connection
      await page.waitForFunction(() => {
        return window.console.log.toString().includes('WebSocket connected') ||
               document.querySelector('[data-testid="connection-status"]')?.textContent?.includes('Live')
      }, { timeout: 5000 })

      // Get initial content
      const initialContent = await page.textContent('[data-testid="mermaid-diagram"]')
      expect(initialContent).toContain('Start')

      // Simulate API update (this would normally come from curl/API call)
      const updateContent = 'graph TD\n    A[🎯 UPDATED] --> B[✅ Success]\n    B --> C[🎉 Complete]'
      
      // Make API call to update diagram
      const response = await page.request.put(`${baseUrl}/api/diagrams/${testDiagramId}`, {
        headers: { 'Content-Type': 'application/json' },
        data: { content: updateContent }
      })
      
      expect(response.ok()).toBe(true)

      // Wait for real-time update (should happen automatically)
      await page.waitForFunction(() => {
        const content = document.querySelector('[data-testid="mermaid-diagram"]')?.textContent || ''
        return content.includes('UPDATED') || content.includes('Success')
      }, { timeout: 5000 })

      // Verify content updated without page refresh
      const updatedContent = await page.textContent('[data-testid="mermaid-diagram"]')
      expect(updatedContent).toContain('UPDATED')
      expect(updatedContent).toContain('Success')
      
      // Verify no page reload occurred (check if WebSocket connection is still active)
      const connectionStatus = await page.textContent('[data-testid="connection-status"]')
      expect(connectionStatus).toContain('Live')
    })

    it('should show WebSocket connection status', async () => {
      await page.goto(`${baseUrl}/diagram/${testDiagramId}`)
      
      // Wait for connection status to appear
      await page.waitForSelector('[data-testid="connection-status"]', { timeout: 10000 })
      
      const statusText = await page.textContent('[data-testid="connection-status"]')
      expect(statusText).toMatch(/Live|Connected/)
    })

    it('should handle multiple rapid updates', async () => {
      await page.goto(`${baseUrl}/diagram/${testDiagramId}`)
      await page.waitForSelector('[data-testid="mermaid-diagram"]', { timeout: 10000 })

      // Send multiple rapid updates
      const updates = [
        'graph TD\n    A[Update 1] --> B[Test]',
        'graph TD\n    A[Update 2] --> B[Test]',
        'graph TD\n    A[Update 3] --> B[Test]'
      ]

      for (let i = 0; i < updates.length; i++) {
        await page.request.put(`${baseUrl}/api/diagrams/${testDiagramId}`, {
          headers: { 'Content-Type': 'application/json' },
          data: { content: updates[i] }
        })
        
        // Small delay between updates
        await page.waitForTimeout(100)
      }

      // Wait for final update
      await page.waitForFunction(() => {
        const content = document.querySelector('[data-testid="mermaid-diagram"]')?.textContent || ''
        return content.includes('Update 3')
      }, { timeout: 5000 })

      const finalContent = await page.textContent('[data-testid="mermaid-diagram"]')
      expect(finalContent).toContain('Update 3')
    })

    it('should maintain WebSocket connection during navigation', async () => {
      await page.goto(`${baseUrl}/diagram/${testDiagramId}`)
      await page.waitForSelector('[data-testid="connection-status"]', { timeout: 10000 })
      
      // Navigate away and back
      await page.goto(`${baseUrl}/dashboard`)
      await page.waitForTimeout(1000)
      await page.goto(`${baseUrl}/diagram/${testDiagramId}`)
      
      // Should reconnect
      await page.waitForSelector('[data-testid="connection-status"]', { timeout: 10000 })
      const statusText = await page.textContent('[data-testid="connection-status"]')
      expect(statusText).toMatch(/Live|Connected/)
    })
  })

  describe('Error Scenarios', () => {
    it('should handle WebSocket disconnection gracefully', async () => {
      await page.goto(`${baseUrl}/diagram/${testDiagramId}`)
      await page.waitForSelector('[data-testid="connection-status"]', { timeout: 10000 })

      // Simulate network disconnection by blocking WebSocket
      await page.route('**/ws/diagrams', route => route.abort())
      
      // Wait for disconnection to be detected
      await page.waitForTimeout(2000)
      
      // Should show disconnected status or attempt reconnection
      const statusText = await page.textContent('[data-testid="connection-status"]')
      expect(statusText).toMatch(/Disconnected|Reconnecting|Offline/)
    })

    it('should fallback to manual refresh when WebSocket fails', async () => {
      // Block WebSocket connections
      await page.route('**/ws/diagrams', route => route.abort())
      
      await page.goto(`${baseUrl}/diagram/${testDiagramId}`)
      await page.waitForSelector('[data-testid="mermaid-diagram"]', { timeout: 10000 })

      const initialContent = await page.textContent('[data-testid="mermaid-diagram"]')
      
      // Update via API
      await page.request.put(`${baseUrl}/api/diagrams/${testDiagramId}`, {
        headers: { 'Content-Type': 'application/json' },
        data: { content: 'graph TD\n    A[Manual Refresh Test] --> B[Updated]' }
      })

      // Should not update automatically (WebSocket blocked)
      await page.waitForTimeout(2000)
      const contentAfterUpdate = await page.textContent('[data-testid="mermaid-diagram"]')
      expect(contentAfterUpdate).toBe(initialContent)

      // Manual refresh should show updated content
      await page.reload()
      await page.waitForSelector('[data-testid="mermaid-diagram"]', { timeout: 10000 })
      const contentAfterRefresh = await page.textContent('[data-testid="mermaid-diagram"]')
      expect(contentAfterRefresh).toContain('Manual Refresh Test')
    })
  })

  describe('Performance', () => {
    it('should update within reasonable time limits', async () => {
      await page.goto(`${baseUrl}/diagram/${testDiagramId}`)
      await page.waitForSelector('[data-testid="mermaid-diagram"]', { timeout: 10000 })

      const startTime = Date.now()
      
      // Make API update
      await page.request.put(`${baseUrl}/api/diagrams/${testDiagramId}`, {
        headers: { 'Content-Type': 'application/json' },
        data: { content: 'graph TD\n    A[Performance Test] --> B[Fast Update]' }
      })

      // Wait for update
      await page.waitForFunction(() => {
        const content = document.querySelector('[data-testid="mermaid-diagram"]')?.textContent || ''
        return content.includes('Performance Test')
      }, { timeout: 5000 })

      const updateTime = Date.now() - startTime
      
      // Should update within 2 seconds
      expect(updateTime).toBeLessThan(2000)
      console.log(`Real-time update took ${updateTime}ms`)
    })
  })
})
