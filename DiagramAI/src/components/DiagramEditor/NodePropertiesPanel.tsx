'use client'

import React, { useState, useEffect } from 'react'
import { Node } from '@xyflow/react'

interface NodePropertiesPanelProps {
  selectedNode: Node | null
  onNodeUpdate: (nodeId: string, updates: any) => void
  onClose: () => void
}

export const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  selectedNode,
  onNodeUpdate,
  onClose
}) => {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [icon, setIcon] = useState('')

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || '')
      setDescription(selectedNode.data.description || '')
      setColor(selectedNode.data.color || '#3b82f6')
      setIcon(selectedNode.data.icon || '')
    }
  }, [selectedNode])

  const handleSave = () => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, {
        label,
        description,
        color,
        icon
      })
      onClose()
    }
  }

  const colorPresets = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Gray', value: '#6b7280' },
  ]

  const iconPresets = [
    '⚙️', '📊', '🔧', '💾', '🌐', '🔒', '📱', '💡',
    '🚀', '⭐', '🎯', '📈', '🔍', '✅', '❌', '⚠️',
    '📝', '📄', '📁', '🗄️', '☁️', '🖥️', '🔌', '👤'
  ]

  if (!selectedNode) return null

  return (
    <div className="fixed right-4 top-20 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Node Properties</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter node label"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter description (optional)"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setColor(preset.value)}
                className={`w-full h-8 rounded-md border-2 transition-all ${
                  color === preset.value ? 'border-gray-400 scale-110' : 'border-gray-200'
                }`}
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              />
            ))}
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-8 rounded-md border border-gray-300"
          />
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Icon
          </label>
          <div className="grid grid-cols-8 gap-1 mb-2">
            {iconPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setIcon(preset)}
                className={`w-8 h-8 rounded-md border transition-all hover:bg-gray-50 ${
                  icon === preset ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Custom icon or emoji"
          />
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div 
            className="p-3 border-2 rounded-md flex items-center space-x-3"
            style={{ borderColor: color, backgroundColor: `${color}10` }}
          >
            {icon && (
              <div 
                className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: color }}
              >
                {icon}
              </div>
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {label || 'Node Label'}
              </div>
              {description && (
                <div className="text-xs text-gray-600 mt-1">
                  {description}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex space-x-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Save Changes
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
