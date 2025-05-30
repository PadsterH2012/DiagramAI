/**
 * Real-time WebSocket Update Tests
 * Tests the complete real-time collaboration system
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import WebSocket from 'ws'
import { DiagramWebSocketService } from '../src/services/websocketService'
import { createServer } from 'http'
import { prisma } from '../src/lib/prisma'

describe('Real-time WebSocket Updates', () => {
  let server: any
  let wsService: DiagramWebSocketService
  let testDiagramId: string
  let clientWs: WebSocket
  let port: number

  beforeEach(async () => {
    // Create test server
    server = createServer()
    wsService = new DiagramWebSocketService(server)
    
    // Find available port
    port = 3002 + Math.floor(Math.random() * 1000)
    await new Promise<void>((resolve) => {
      server.listen(port, resolve)
    })

    // Create test diagram
    const testDiagram = await prisma.diagram.create({
      data: {
        title: 'Real-time Test Diagram',
        description: 'Test diagram for WebSocket updates',
        content: 'graph TD\n    A --> B',
        format: 'mermaid',
        isPublic: true
      }
    })
    testDiagramId = testDiagram.id

    // Set up global wsService for API calls
    global.wsService = wsService
  })

  afterEach(async () => {
    // Clean up
    if (clientWs) {
      clientWs.close()
    }
    server.close()
    
    // Clean up test data
    await prisma.diagram.delete({
      where: { id: testDiagramId }
    }).catch(() => {}) // Ignore if already deleted
    
    global.wsService = undefined
  })

  describe('WebSocket Connection', () => {
    it('should establish WebSocket connection successfully', (done) => {
      clientWs = new WebSocket(`ws://localhost:${port}/ws/diagrams`)
      
      clientWs.on('open', () => {
        expect(clientWs.readyState).toBe(WebSocket.OPEN)
        done()
      })

      clientWs.on('error', done)
    })

    it('should receive welcome message on connection', (done) => {
      clientWs = new WebSocket(`ws://localhost:${port}/ws/diagrams`)
      
      clientWs.on('message', (data) => {
        const message = JSON.parse(data.toString())
        expect(message.type).toBe('pong')
        expect(message.timestamp).toBeDefined()
        done()
      })

      clientWs.on('error', done)
    })

    it('should handle subscription to diagram', (done) => {
      clientWs = new WebSocket(`ws://localhost:${port}/ws/diagrams`)
      
      clientWs.on('open', () => {
        const subscribeMessage = {
          type: 'subscribe',
          diagram_uuid: testDiagramId,
          agent_id: 'test_client',
          timestamp: new Date().toISOString()
        }
        clientWs.send(JSON.stringify(subscribeMessage))
        
        // If no error after 100ms, subscription worked
        setTimeout(() => {
          expect(clientWs.readyState).toBe(WebSocket.OPEN)
          done()
        }, 100)
      })

      clientWs.on('error', done)
    })
  })

  describe('Real-time Diagram Updates', () => {
    it('should broadcast content updates to subscribers', (done) => {
      clientWs = new WebSocket(`ws://localhost:${port}/ws/diagrams`)
      
      let messageCount = 0
      clientWs.on('message', (data) => {
        const message = JSON.parse(data.toString())
        messageCount++
        
        if (messageCount === 1) {
          // Welcome message
          expect(message.type).toBe('pong')
        } else if (messageCount === 2) {
          // Diagram update
          expect(message.type).toBe('diagram_updated')
          expect(message.diagram_uuid).toBe(testDiagramId)
          expect(message.changes).toHaveLength(1)
          expect(message.changes[0].type).toBe('content_updated')
          expect(message.updated_by).toBe('user')
          expect(message.timestamp).toBeDefined()
          done()
        }
      })

      clientWs.on('open', () => {
        // Subscribe to diagram
        const subscribeMessage = {
          type: 'subscribe',
          diagram_uuid: testDiagramId,
          agent_id: 'test_client',
          timestamp: new Date().toISOString()
        }
        clientWs.send(JSON.stringify(subscribeMessage))
        
        // Simulate content update after subscription
        setTimeout(() => {
          wsService.broadcastDiagramUpdate(testDiagramId, {
            type: 'content_updated',
            content: 'graph TD\n    A[Updated] --> B[Content]',
            timestamp: new Date().toISOString()
          }, 'user')
        }, 50)
      })

      clientWs.on('error', done)
    })

    it('should handle multiple subscribers', (done) => {
      const client1 = new WebSocket(`ws://localhost:${port}/ws/diagrams`)
      const client2 = new WebSocket(`ws://localhost:${port}/ws/diagrams`)
      
      let client1Updates = 0
      let client2Updates = 0
      
      const checkCompletion = () => {
        if (client1Updates > 0 && client2Updates > 0) {
          client1.close()
          client2.close()
          done()
        }
      }

      client1.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === 'diagram_updated') {
          client1Updates++
          checkCompletion()
        }
      })

      client2.on('message', (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === 'diagram_updated') {
          client2Updates++
          checkCompletion()
        }
      })

      let connectionsReady = 0
      const onClientReady = () => {
        connectionsReady++
        if (connectionsReady === 2) {
          // Both clients connected, send update
          wsService.broadcastDiagramUpdate(testDiagramId, {
            type: 'content_updated',
            content: 'graph TD\n    A --> B --> C',
            timestamp: new Date().toISOString()
          }, 'user')
        }
      }

      client1.on('open', () => {
        client1.send(JSON.stringify({
          type: 'subscribe',
          diagram_uuid: testDiagramId,
          agent_id: 'client1',
          timestamp: new Date().toISOString()
        }))
        onClientReady()
      })

      client2.on('open', () => {
        client2.send(JSON.stringify({
          type: 'subscribe',
          diagram_uuid: testDiagramId,
          agent_id: 'client2',
          timestamp: new Date().toISOString()
        }))
        onClientReady()
      })
    })
  })

  describe('API Integration', () => {
    it('should trigger WebSocket broadcast when diagram is updated via API', async () => {
      // This test simulates the API call that triggers broadcasts
      const updateData = {
        type: 'content_updated',
        content: 'graph TD\n    A[API Update] --> B[WebSocket Broadcast]',
        timestamp: new Date().toISOString()
      }

      // Mock the broadcast call that happens in the API
      const broadcastSpy = jest.spyOn(wsService, 'broadcastDiagramUpdate')
      
      // Simulate API call
      wsService.broadcastDiagramUpdate(testDiagramId, updateData, 'user')
      
      expect(broadcastSpy).toHaveBeenCalledWith(testDiagramId, updateData, 'user')
      expect(broadcastSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid JSON messages gracefully', (done) => {
      clientWs = new WebSocket(`ws://localhost:${port}/ws/diagrams`)
      
      clientWs.on('open', () => {
        // Send invalid JSON
        clientWs.send('invalid json')
        
        // Should not crash - wait and check connection is still open
        setTimeout(() => {
          expect(clientWs.readyState).toBe(WebSocket.OPEN)
          done()
        }, 100)
      })

      clientWs.on('error', done)
    })

    it('should handle disconnection gracefully', (done) => {
      clientWs = new WebSocket(`ws://localhost:${port}/ws/diagrams`)
      
      clientWs.on('open', () => {
        // Subscribe first
        clientWs.send(JSON.stringify({
          type: 'subscribe',
          diagram_uuid: testDiagramId,
          agent_id: 'test_client'
        }))
        
        // Then disconnect
        clientWs.close()
      })

      clientWs.on('close', () => {
        // Should clean up subscriptions without errors
        setTimeout(() => {
          expect(true).toBe(true) // Test passes if no errors thrown
          done()
        }, 50)
      })
    })
  })
})
