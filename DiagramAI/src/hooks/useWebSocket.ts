'use client'

import { useEffect, useRef, useState } from 'react'

interface DiagramUpdate {
  type: 'diagram_updated' | 'pong' | 'error'
  diagram_uuid?: string
  changes?: any[]
  updated_by?: 'user' | 'agent'
  timestamp?: string
  error?: string
  request_id?: string
}

interface UseWebSocketProps {
  diagramId?: string
  onDiagramUpdate?: (update: DiagramUpdate) => void
  onError?: (error: string) => void
}

export function useWebSocket({ diagramId, onDiagramUpdate, onError }: UseWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<DiagramUpdate | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws/diagrams`
      
      console.log('🔌 Connecting to WebSocket:', wsUrl)
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected')
        setIsConnected(true)

        // Subscribe to diagram updates if diagramId is provided
        if (diagramId && wsRef.current?.readyState === WebSocket.OPEN) {
          try {
            const subscribeMessage = {
              type: 'subscribe',
              diagram_uuid: diagramId,
              agent_id: 'user_client',
              timestamp: new Date().toISOString()
            }
            wsRef.current.send(JSON.stringify(subscribeMessage))
            console.log('📡 Subscribed to diagram:', diagramId)
          } catch (error) {
            console.warn('⚠️ Failed to send subscribe message:', error)
          }
        }
      }

      wsRef.current.onmessage = (event) => {
        try {
          const update: DiagramUpdate = JSON.parse(event.data)
          console.log('📨 WebSocket message received:', update)
          
          setLastUpdate(update)
          
          if (update.type === 'diagram_updated' && onDiagramUpdate) {
            onDiagramUpdate(update)
          } else if (update.type === 'error' && onError) {
            onError(update.error || 'Unknown WebSocket error')
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error)
        }
      }

      wsRef.current.onclose = () => {
        console.log('🔌 WebSocket disconnected')
        setIsConnected(false)
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...')
          connect()
        }, 3000)
      }

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setIsConnected(false)
        if (onError) {
          onError('WebSocket connection error')
        }
      }
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error)
      if (onError) {
        onError('Failed to establish WebSocket connection')
      }
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      // Only send unsubscribe if WebSocket is open and ready
      if (diagramId && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          const unsubscribeMessage = {
            type: 'unsubscribe',
            diagram_uuid: diagramId,
            agent_id: 'user_client',
            timestamp: new Date().toISOString()
          }
          wsRef.current.send(JSON.stringify(unsubscribeMessage))
        } catch (error) {
          console.warn('⚠️ Failed to send unsubscribe message:', error)
        }
      }

      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }

  useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      connect()
    }, 100)

    return () => {
      clearTimeout(timer)
      disconnect()
    }
  }, [diagramId])

  return {
    isConnected,
    lastUpdate,
    connect,
    disconnect
  }
}
