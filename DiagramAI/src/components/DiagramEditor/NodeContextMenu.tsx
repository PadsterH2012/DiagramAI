'use client'

import React, { useEffect, useRef } from 'react'
import { Node } from '@xyflow/react'

interface NodeContextMenuProps {
  node: Node | null
  position: { x: number; y: number }
  isVisible: boolean
  onClose: () => void
  onShowProperties: () => void
  onDelete: () => void
  onCopy: () => void
  onDuplicate?: () => void
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  node,
  position,
  isVisible,
  onClose,
  onShowProperties,
  onDelete,
  onCopy,
  onDuplicate,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      // Prevent context menu from appearing on the context menu itself
      document.addEventListener('contextmenu', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('contextmenu', handleClickOutside)
    }
  }, [isVisible, onClose])

  // Adjust position to keep menu within viewport
  const adjustedPosition = React.useMemo(() => {
    if (!isVisible || !menuRef.current) return position

    const menuRect = menuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let { x, y } = position

    // Adjust horizontal position
    if (x + menuRect.width > viewportWidth) {
      x = viewportWidth - menuRect.width - 10
    }
    if (x < 10) {
      x = 10
    }

    // Adjust vertical position
    if (y + menuRect.height > viewportHeight) {
      y = viewportHeight - menuRect.height - 10
    }
    if (y < 10) {
      y = 10
    }

    return { x, y }
  }, [position, isVisible])

  if (!isVisible || !node) {
    return null
  }

  const handleMenuAction = (action: () => void) => {
    action()
    onClose()
  }

  return (
    <>
      {/* Backdrop to capture clicks */}
      <div 
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'transparent' }}
      />
      
      {/* Context Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Menu Header */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {node.type} Node
          </div>
          <div className="text-sm font-medium text-gray-900 truncate">
            {node.data?.label || node.id}
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          {/* Properties */}
          <button
            onClick={() => handleMenuAction(onShowProperties)}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <span className="text-base">⚙️</span>
            <span>Properties</span>
          </button>

          {/* Copy */}
          <button
            onClick={() => handleMenuAction(onCopy)}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <span className="text-base">📋</span>
            <span>Copy</span>
            <span className="ml-auto text-xs text-gray-400">Ctrl+C</span>
          </button>

          {/* Duplicate */}
          {onDuplicate && (
            <button
              onClick={() => handleMenuAction(onDuplicate)}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <span className="text-base">📄</span>
              <span>Duplicate</span>
            </button>
          )}

          {/* Separator */}
          <div className="border-t border-gray-100 my-1" />

          {/* Delete */}
          <button
            onClick={() => handleMenuAction(onDelete)}
            className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2"
          >
            <span className="text-base">🗑️</span>
            <span>Delete</span>
            <span className="ml-auto text-xs text-red-400">Del</span>
          </button>
        </div>
      </div>
    </>
  )
}
