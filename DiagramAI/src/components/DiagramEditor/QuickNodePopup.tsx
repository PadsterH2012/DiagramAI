'use client'

import React, { useEffect, useRef } from 'react'

interface QuickNodeSymbol {
  type: string
  icon: string
  label: string
  data: any
}

interface QuickNodePopupProps {
  isOpen: boolean
  onClose: () => void
  onNodeSelect: (nodeType: string, nodeData: any) => void
  onViewAll: () => void
  position: { x: number; y: number }
}

export const QuickNodePopup: React.FC<QuickNodePopupProps> = ({
  isOpen,
  onClose,
  onNodeSelect,
  onViewAll,
  position,
}) => {
  const popupRef = useRef<HTMLDivElement>(null)

  // Most common flowchart symbols as specified in the issue
  const quickSymbols: QuickNodeSymbol[] = [
    {
      type: 'process',
      icon: '⚙️',
      label: 'Process',
      data: { label: 'Process', icon: '⚙️', color: '#3b82f6' }
    },
    {
      type: 'decision',
      icon: '❓',
      label: 'Decision',
      data: { label: 'Decision?', icon: '❓', color: '#f59e0b' }
    },
    {
      type: 'start',
      icon: '▶️',
      label: 'Start/End',
      data: { label: 'Start', icon: '▶️', color: '#10b981' }
    },
    {
      type: 'input',
      icon: '📥',
      label: 'Input/Output',
      data: { label: 'Input', icon: '📥', color: '#8b5cf6' }
    },
    {
      type: 'database',
      icon: '🗄️',
      label: 'Database',
      data: { label: 'Database', icon: '🗄️', color: '#84cc16' }
    },
    {
      type: 'document',
      icon: '📄',
      label: 'Document',
      data: { label: 'Document', icon: '📄', color: '#f97316' }
    },
    {
      type: 'circle',
      icon: '●',
      label: 'Connector',
      data: { label: 'Connector', icon: '●', color: '#6b7280' }
    },
    {
      type: 'cloud',
      icon: '☁️',
      label: 'Cloud',
      data: { label: 'Cloud', icon: '☁️', color: '#14b8a6' }
    },
  ]

  // Close popup when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as HTMLElement)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Calculate popup position to avoid screen edges
  const calculatePosition = () => {
    if (!popupRef.current) return { left: position.x, top: position.y }

    const rect = popupRef.current.getBoundingClientRect()
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    let left = position.x
    let top = position.y

    // Adjust horizontal position if popup would go off-screen
    if (left + rect.width > screenWidth) {
      left = screenWidth - rect.width - 10
    }
    if (left < 10) {
      left = 10
    }

    // Adjust vertical position if popup would go off-screen
    if (top + rect.height > screenHeight) {
      top = position.y - rect.height - 10 // Show above the button
    }
    if (top < 10) {
      top = 10
    }

    return { left, top }
  }

  const handleNodeSelect = (symbol: QuickNodeSymbol) => {
    onNodeSelect(symbol.type, symbol.data)
    onClose()
  }

  if (!isOpen) return null

  const adjustedPosition = calculatePosition()

  return (
    <>
      {/* Backdrop to capture clicks */}
      <div className="fixed inset-0 z-40" style={{ backgroundColor: 'transparent' }} />
      
      {/* Popup Menu */}
      <div
        ref={popupRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[280px]"
        style={{
          left: adjustedPosition.left,
          top: adjustedPosition.top,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-900">Quick Add Nodes</h3>
        </div>

        {/* Symbol Grid */}
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            {quickSymbols.map((symbol) => (
              <button
                key={symbol.type}
                onClick={() => handleNodeSelect(symbol)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors group text-left"
                title={`Add ${symbol.label}`}
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: symbol.data.color }}
                >
                  {symbol.icon}
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {symbol.label}
                </span>
              </button>
            ))}
          </div>

          {/* View All Link */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={onViewAll}
              className="w-full flex items-center justify-center space-x-2 p-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              <span>📋</span>
              <span>View All Symbols...</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}