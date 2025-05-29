'use client'

import React from 'react'

interface KeyboardShortcutsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null

  const shortcuts = [
    {
      category: 'Selection & Navigation',
      items: [
        { keys: ['Click'], description: 'Select single node/edge' },
        { keys: ['Ctrl/Cmd', 'A'], description: 'Select all nodes and edges' },
        { keys: ['Click + Drag'], description: 'Multi-select with box selection' },
        { keys: ['Shift', 'Click'], description: 'Add to selection' },
      ]
    },
    {
      category: 'Editing',
      items: [
        { keys: ['Double Click'], description: 'Edit node text inline' },
        { keys: ['Delete'], description: 'Delete selected items' },
        { keys: ['Backspace'], description: 'Delete selected items' },
        { keys: ['Ctrl/Cmd', 'C'], description: 'Copy selected nodes' },
        { keys: ['Ctrl/Cmd', 'V'], description: 'Paste copied nodes' },
      ]
    },
    {
      category: 'Diagram Actions',
      items: [
        { keys: ['Ctrl/Cmd', 'S'], description: 'Save diagram' },
        { keys: ['Ctrl/Cmd', 'Z'], description: 'Undo (coming soon)' },
        { keys: ['Ctrl/Cmd', 'Y'], description: 'Redo (coming soon)' },
        { keys: ['Escape'], description: 'Clear selection' },
      ]
    },
    {
      category: 'View Controls',
      items: [
        { keys: ['Mouse Wheel'], description: 'Zoom in/out' },
        { keys: ['Space', 'Drag'], description: 'Pan canvas' },
        { keys: ['Ctrl/Cmd', '0'], description: 'Fit view (coming soon)' },
        { keys: ['Ctrl/Cmd', '1'], description: 'Zoom to 100% (coming soon)' },
      ]
    },
    {
      category: 'Node Creation',
      items: [
        { keys: ['Drag from Palette'], description: 'Add node at position' },
        { keys: ['Click in Palette'], description: 'Add node at center' },
        { keys: ['Tab'], description: 'Cycle through node types (coming soon)' },
      ]
    },
    {
      category: 'Connections',
      items: [
        { keys: ['Drag from Handle'], description: 'Create connection' },
        { keys: ['Click Handle'], description: 'Start connection mode (coming soon)' },
        { keys: ['Shift', 'Drag'], description: 'Create straight connection (coming soon)' },
      ]
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcuts.map((category) => (
              <div key={category.category} className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.description}</span>
                      <div className="flex items-center space-x-1">
                        {item.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                              {key}
                            </kbd>
                            {keyIndex < item.keys.length - 1 && (
                              <span className="text-xs text-gray-400">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Hold Shift while dragging to maintain aspect ratio</li>
              <li>• Use the Properties panel (🎨) to customize node colors and icons</li>
              <li>• Drag nodes from the palette or click to add at center</li>
              <li>• Connect nodes by dragging from the colored handles</li>
              <li>• Double-click any node to edit its text inline</li>
              <li>• Use Ctrl+A to select all, then copy/paste to duplicate sections</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Press <kbd className="px-1 py-0.5 text-xs bg-gray-200 rounded">?</kbd> or{' '}
            <kbd className="px-1 py-0.5 text-xs bg-gray-200 rounded">F1</kbd> to toggle this panel
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
