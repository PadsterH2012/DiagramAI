'use client'

import React, { useState } from 'react'
import { NodePalette } from './NodePalette'

interface SlideOutMenuProps {
  onNodeAdd: (nodeType: string, nodeData: any) => void
}

export const SlideOutMenu: React.FC<SlideOutMenuProps> = ({ onNodeAdd }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'nodes' | 'layers' | 'history'>('nodes')

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Menu Toggle Button */}
      <button
        onClick={toggleMenu}
        className={`fixed top-4 left-4 z-50 p-3 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-200 ${
          isOpen ? 'translate-x-80' : 'translate-x-0'
        }`}
        title={isOpen ? 'Close Menu' : 'Open Menu'}
      >
        <div className="w-5 h-5 flex flex-col justify-center space-y-1">
          <div className={`h-0.5 bg-gray-600 transition-all duration-200 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`h-0.5 bg-gray-600 transition-all duration-200 ${isOpen ? 'opacity-0' : ''}`} />
          <div className={`h-0.5 bg-gray-600 transition-all duration-200 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-30 pointer-events-none"
          onClick={toggleMenu}
        >
          {/* Clickable area only on the right side (not covering the menu) */}
          <div
            className="absolute top-0 left-80 right-0 bottom-0 pointer-events-auto"
            onClick={toggleMenu}
          />
        </div>
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="h-16 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4">
          <h2 className="text-lg font-semibold text-gray-900">Tools</h2>
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'nodes'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            🔷 Nodes
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'layers'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            📚 Layers
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            🕒 History
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'nodes' && (
            <div className="p-4">
              <NodePalette onNodeAdd={onNodeAdd} />
            </div>
          )}
          
          {activeTab === 'layers' && (
            <div className="p-4">
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900 mb-3">Diagram Layers</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm font-medium">Main Flow</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-xs text-gray-500 hover:text-gray-700">👁️</button>
                      <button className="text-xs text-gray-500 hover:text-gray-700">🔒</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm font-medium">Annotations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-xs text-gray-500 hover:text-gray-700">👁️</button>
                      <button className="text-xs text-gray-500 hover:text-gray-700">🔒</button>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-4 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                  + Add Layer
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="p-4">
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900 mb-3">Recent Actions</div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    <span className="text-xs">🔄</span>
                    <span>Added Process node</span>
                    <span className="text-xs text-gray-400 ml-auto">2m ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    <span className="text-xs">✏️</span>
                    <span>Modified Decision node</span>
                    <span className="text-xs text-gray-400 ml-auto">5m ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                    <span className="text-xs">🔗</span>
                    <span>Connected nodes</span>
                    <span className="text-xs text-gray-400 ml-auto">8m ago</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                    Clear History
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
