'use client'

import React, { useState } from 'react'
import { connectionPresets } from '@/utils/edge-config'

interface EdgeConfigPanelProps {
  selectedEdgeId?: string
  selectedEdgeData?: {
    style?: {
      stroke?: string
      strokeWidth?: number
      strokeDasharray?: string
    }
    animated?: boolean
    label?: string
    type?: string
  }
  onEdgeUpdate?: (edgeId: string, updates: any) => void
  onClose?: () => void
}

export const EdgeConfigPanel: React.FC<EdgeConfigPanelProps> = ({
  selectedEdgeId,
  selectedEdgeData,
  onEdgeUpdate,
  onClose
}) => {
  const [strokeColor, setStrokeColor] = useState(selectedEdgeData?.style?.stroke || '#374151')
  const [strokeWidth, setStrokeWidth] = useState(selectedEdgeData?.style?.strokeWidth || 2)
  const [strokeStyle, setStrokeStyle] = useState(
    selectedEdgeData?.style?.strokeDasharray ? 'dashed' : 'solid'
  )
  const [animated, setAnimated] = useState(selectedEdgeData?.animated || false)
  const [label, setLabel] = useState(selectedEdgeData?.label || '')
  const [edgeType, setEdgeType] = useState(selectedEdgeData?.type || 'smoothstep')

  const handleUpdate = () => {
    if (selectedEdgeId && onEdgeUpdate) {
      const updates = {
        style: {
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDasharray: strokeStyle === 'dashed' ? '5,5' : 
                          strokeStyle === 'dotted' ? '2,2' : undefined
        },
        animated,
        label: label || undefined,
        type: edgeType
      }
      onEdgeUpdate(selectedEdgeId, updates)
    }
  }

  const applyPreset = (presetName: keyof typeof connectionPresets) => {
    const preset = connectionPresets[presetName]
    setStrokeColor(preset.stroke)
    setStrokeWidth(preset.strokeWidth)
    setStrokeStyle(preset.strokeDasharray ? 'dashed' : 'solid')
    setAnimated(preset.animated)
  }

  const predefinedColors = [
    '#374151', '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
    '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#d946ef', '#ec4899', '#f43f5e'
  ]

  if (!selectedEdgeId) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="text-sm">No connection selected</div>
        <div className="text-xs mt-1">Select a connection to configure its properties</div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Connection Properties</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        )}
      </div>

      {/* Presets */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(connectionPresets).slice(0, 8).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key as keyof typeof connectionPresets)}
              className="p-2 text-xs border border-gray-300 rounded hover:bg-gray-50 text-left"
              style={{ 
                borderLeft: `4px solid ${preset.stroke}`,
              }}
            >
              <div className="font-medium capitalize">{key}</div>
              <div className="text-gray-500 text-xs">
                {preset.animated ? 'Animated' : 'Static'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Connection Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Connection Type
        </label>
        <select
          value={edgeType}
          onChange={(e) => setEdgeType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="default">Bezier (Curved)</option>
          <option value="straight">Straight</option>
          <option value="smoothstep">Smooth Step</option>
          <option value="step">Step</option>
        </select>
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
          placeholder="Connection label"
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
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-6 gap-1">
          {predefinedColors.map((color) => (
            <button
              key={color}
              onClick={() => setStrokeColor(color)}
              className={`w-8 h-8 rounded border-2 ${
                strokeColor === color ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Width */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Width: {strokeWidth}px
        </label>
        <input
          type="range"
          min="1"
          max="8"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1px</span>
          <span>8px</span>
        </div>
      </div>

      {/* Style */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Line Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['solid', 'dashed', 'dotted'].map((style) => (
            <button
              key={style}
              onClick={() => setStrokeStyle(style)}
              className={`p-2 border rounded text-center ${
                strokeStyle === style
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="text-xs font-medium capitalize">{style}</div>
              <div
                className="mt-1 h-0.5 w-full mx-auto"
                style={{
                  borderTop: style === 'dashed' ? `1px dashed ${strokeColor}` :
                            style === 'dotted' ? `1px dotted ${strokeColor}` :
                            `1px solid ${strokeColor}`,
                  backgroundColor: 'transparent'
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Animation */}
      <div className="mb-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={animated}
            onChange={(e) => setAnimated(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Animated</span>
        </label>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
          <svg width="100%" height="40" viewBox="0 0 200 40">
            <defs>
              {animated && (
                <style>
                  {`
                    .animated-line {
                      stroke-dasharray: 10;
                      animation: dash 2s linear infinite;
                    }
                    @keyframes dash {
                      to {
                        stroke-dashoffset: -20;
                      }
                    }
                  `}
                </style>
              )}
            </defs>
            <line
              x1="10"
              y1="20"
              x2="190"
              y2="20"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={
                strokeStyle === 'dashed' ? '5,5' :
                strokeStyle === 'dotted' ? '2,2' : undefined
              }
              className={animated ? 'animated-line' : ''}
              markerEnd="url(#arrowhead)"
            />
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={strokeColor}
                />
              </marker>
            </defs>
            {label && (
              <text
                x="100"
                y="15"
                textAnchor="middle"
                className="text-xs"
                fill="#374151"
              >
                {label}
              </text>
            )}
          </svg>
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