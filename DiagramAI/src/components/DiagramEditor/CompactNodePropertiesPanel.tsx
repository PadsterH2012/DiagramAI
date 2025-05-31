'use client'

import React, { useState, useEffect } from 'react'
import { Node } from '@xyflow/react'
import { NodeConnectionConfig, getDefaultConnections, EnhancedNodeData } from '../../types/connection-config'

interface CompactNodePropertiesPanelProps {
  selectedNode: Node | null
  onNodeUpdate: (nodeId: string, updates: any) => void
  onClose: () => void
}

export const CompactNodePropertiesPanel: React.FC<CompactNodePropertiesPanelProps> = ({
  selectedNode,
  onNodeUpdate,
  onClose
}) => {
  const [label, setLabel] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [connections, setConnections] = useState<NodeConnectionConfig>({
    inputs: { count: 1, labels: ['Input'] },
    outputs: { count: 1, labels: ['Output'] }
  })

  useEffect(() => {
    if (selectedNode) {
      const data = selectedNode.data as unknown as EnhancedNodeData | undefined
      setLabel(String(data?.label || ''))
      setColor(String(data?.color || '#3b82f6'))
      setBackgroundColor(String(data?.backgroundColor || '#ffffff'))
      
      // Load connection configuration or use defaults
      if (data?.connections) {
        setConnections(data.connections)
      } else {
        const defaultConfig = getDefaultConnections(data?.symbolType || 'process')
        setConnections(defaultConfig)
      }
    }
  }, [selectedNode])

  const handleSave = () => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, {
        label,
        color,
        backgroundColor,
        connections
      })
      onClose()
    }
  }

  const handleInputCountChange = (count: number) => {
    const newConnections = {
      ...connections,
      inputs: {
        count,
        labels: Array(count).fill('').map((_, i) => 
          connections.inputs.labels[i] || `Input ${i + 1}`
        )
      }
    }
    setConnections(newConnections)
  }

  const handleOutputCountChange = (count: number) => {
    const newConnections = {
      ...connections,
      outputs: {
        count,
        labels: Array(count).fill('').map((_, i) => 
          connections.outputs.labels[i] || `Output ${i + 1}`
        )
      }
    }
    setConnections(newConnections)
  }

  const handleInputLabelChange = (index: number, label: string) => {
    const newLabels = [...connections.inputs.labels]
    newLabels[index] = label
    setConnections({
      ...connections,
      inputs: { ...connections.inputs, labels: newLabels }
    })
  }

  const handleOutputLabelChange = (index: number, label: string) => {
    const newLabels = [...connections.outputs.labels]
    newLabels[index] = label
    setConnections({
      ...connections,
      outputs: { ...connections.outputs, labels: newLabels }
    })
  }

  const colorPresets = [
    '#3b82f6', '#10b981', '#8b5cf6', '#ef4444',
    '#f59e0b', '#14b8a6', '#ec4899', '#6b7280'
  ]

  if (!selectedNode) return null

  return (
    <div className="fixed right-4 top-20 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Node Properties</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Label */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="Node label"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Color
          </label>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {colorPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setColor(preset)}
                className={`w-full h-5 rounded border transition-all ${
                  color === preset ? 'border-gray-400 ring-1 ring-gray-300' : 'border-gray-200'
                }`}
                style={{ backgroundColor: preset }}
                title={preset}
              />
            ))}
          </div>
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="Background"
          />
        </div>

        {/* Inputs Configuration */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Inputs
          </label>
          <select
            value={connections.inputs.count}
            onChange={(e) => handleInputCountChange(Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6].map(count => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
          
          {Array.from({ length: connections.inputs.count }, (_, i) => (
            <div key={i} className="mt-1">
              <input
                type="text"
                value={connections.inputs.labels[i] || ''}
                onChange={(e) => handleInputLabelChange(i, e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={`Input ${i + 1}`}
              />
            </div>
          ))}
        </div>

        {/* Outputs Configuration */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Outputs
          </label>
          <select
            value={connections.outputs.count}
            onChange={(e) => handleOutputCountChange(Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6].map(count => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
          
          {Array.from({ length: connections.outputs.count }, (_, i) => (
            <div key={i} className="mt-1">
              <input
                type="text"
                value={connections.outputs.labels[i] || ''}
                onChange={(e) => handleOutputLabelChange(i, e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={`Output ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-gray-200 flex space-x-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 text-white px-3 py-1 text-xs rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Apply
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}