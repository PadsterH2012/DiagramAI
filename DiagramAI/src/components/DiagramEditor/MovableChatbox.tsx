'use client'

import React, { useState, useRef, useEffect } from 'react'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

interface MovableChatboxProps {
  isOpen: boolean
  onToggle: () => void
}

export const MovableChatbox: React.FC<MovableChatboxProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your diagram assistant. I can help you create, modify, and understand diagrams in any format. What would you like to work on today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [size, setSize] = useState({ width: 400, height: 500 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  const chatboxRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true)
      const rect = chatboxRef.current?.getBoundingClientRect()
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Handle resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
  }

  const handleResizeMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const rect = chatboxRef.current?.getBoundingClientRect()
      if (rect) {
        setSize({
          width: Math.max(300, e.clientX - rect.left),
          height: Math.max(200, e.clientY - rect.top)
        })
      }
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mousemove', handleResizeMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset])

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: inputText.trim(),
        sender: 'user',
        timestamp: new Date()
      }
      
      setMessages(prev => {
        const updated = [...prev, newMessage]
        // Keep only last 10 messages
        return updated.slice(-10)
      })
      
      setInputText('')
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "I understand you want to work on that. Let me help you with your diagram. Could you provide more details about what you'd like to create or modify?",
          sender: 'ai',
          timestamp: new Date()
        }
        
        setMessages(prev => {
          const updated = [...prev, aiResponse]
          // Keep only last 10 messages
          return updated.slice(-10)
        })
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Open AI Assistant"
      >
        <div className="w-6 h-6 flex items-center justify-center">
          🤖
        </div>
      </button>
    )
  }

  return (
    <div
      ref={chatboxRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Header */}
      <div
        className="drag-handle flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg cursor-grab"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">🤖</span>
          <span className="font-medium">Diagram AI Assistant</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm">{message.text}</div>
              <div className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">
            Create auth flow
          </button>
          <button className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200">
            Convert to Mermaid
          </button>
          <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200">
            Explain diagram
          </button>
          <button className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200">
            Add error handling
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your diagram or describe what you want to create..."
            className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400"></div>
      </div>
    </div>
  )
}
