'use client'

import React, { useState } from 'react'

interface NodeConfigPanelProps {
  selectedNodeId?: string
  selectedNodeData?: {
    label: string
    description?: string
    color?: string
    icon?: string
  }
  onNodeUpdate?: (nodeId: string, updates: any) => void
  onClose?: () => void
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  selectedNodeId,
  selectedNodeData,
  onNodeUpdate,
  onClose
}) => {
  const [label, setLabel] = useState(selectedNodeData?.label || '')
  const [description, setDescription] = useState(selectedNodeData?.description || '')
  const [color, setColor] = useState(selectedNodeData?.color || '#3b82f6')
  const [icon, setIcon] = useState(selectedNodeData?.icon || '⚙️')

  const handleUpdate = () => {
    if (selectedNodeId && onNodeUpdate) {
      onNodeUpdate(selectedNodeId, {
        label,
        description,
        color,
        icon
      })
    }
  }

  const predefinedColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#6b7280'
  ]

  const predefinedIcons = [
    '⚙️', '📄', '🗄️', '🖥️', '📡', '☁️',
    '👤', '🔌', '📥', '📤', '🔄', '💾',
    '⚡', '🔧', '📊', '📝', '⭕', '◆'
  ]

  if (!selectedNodeId) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="text-sm">No node selected</div>
        <div className="text-xs mt-1">Select a node to configure its properties</div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Node Properties</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        )}
      </div>

      {/* Label */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Label
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Enter node label"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder="Enter node description"
        />
      </div>

      {/* Color */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-6 gap-1">
          {predefinedColors.map((presetColor) => (
            <button
              key={presetColor}
              onClick={() => setColor(presetColor)}
              className={`w-8 h-8 rounded border-2 ${
                color === presetColor ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: presetColor }}
              title={presetColor}
            />
          ))}
        </div>
      </div>

      {/* Icon */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icon
        </label>
        <div className="grid grid-cols-6 gap-1 mb-2">
          {predefinedIcons.map((presetIcon) => (
            <button
              key={presetIcon}
              onClick={() => setIcon(presetIcon)}
              className={`w-8 h-8 flex items-center justify-center border rounded text-lg ${
                icon === presetIcon
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {presetIcon}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Custom icon"
        />
      </div>

      {/* Preview */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div
          className="p-3 border border-gray-300 rounded-md bg-gray-50 flex items-center space-x-3"
        >
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{label || 'Node Label'}</div>
            {description && (
              <div className="text-xs text-gray-600">{description}</div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={handleUpdate}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Apply Changes
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}