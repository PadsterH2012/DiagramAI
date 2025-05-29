'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [diagrams] = useState([
    {
      id: 1,
      title: 'User Authentication Flow',
      type: 'flowchart',
      lastModified: '2 hours ago',
      status: 'published',
      collaborators: 3,
    },
    {
      id: 2,
      title: 'Database Architecture',
      type: 'entity-relationship',
      lastModified: '1 day ago',
      status: 'draft',
      collaborators: 1,
    },
    {
      id: 3,
      title: 'API Integration Sequence',
      type: 'sequence',
      lastModified: '3 days ago',
      status: 'published',
      collaborators: 5,
    },
  ])

  const stats = [
    { label: 'Total Diagrams', value: '12', change: '+3 this week' },
    { label: 'Collaborators', value: '8', change: '+2 new' },
    { label: 'AI Generations', value: '47', change: '+12 today' },
    { label: 'Exports', value: '23', change: '+5 this week' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Manage your diagrams and track your progress</p>
            </div>
            <Link href="/editor" className="btn-primary">
              Create New Diagram
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Diagrams List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Diagrams</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {diagrams.map((diagram) => (
                  <div key={diagram.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{diagram.title}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500 capitalize">{diagram.type}</span>
                          <span className="text-xs text-gray-500">{diagram.lastModified}</span>
                          <span className={`status-indicator text-xs ${
                            diagram.status === 'published' ? 'status-success' : 'status-warning'
                          }`}>
                            {diagram.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500">
                          👥 {diagram.collaborators}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-gray-200">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View all diagrams →
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions & System Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/editor" className="block w-full btn-primary text-center">
                  🎨 Create Diagram
                </Link>
                <button className="block w-full btn-secondary">
                  📤 Import Mermaid
                </button>
                <button className="block w-full btn-secondary">
                  👥 Invite Collaborator
                </button>
                <button className="block w-full btn-secondary">
                  📊 View Analytics
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Application</span>
                  <span className="status-indicator status-success text-xs">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="status-indicator status-success text-xs">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AI Services</span>
                  <span className="status-indicator status-warning text-xs">Setup Required</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cache</span>
                  <span className="status-indicator status-success text-xs">Active</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">🎨</span>
                  <div>
                    <p className="text-gray-900">Created new diagram</p>
                    <p className="text-gray-500 text-xs">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600">✅</span>
                  <div>
                    <p className="text-gray-900">Published diagram</p>
                    <p className="text-gray-500 text-xs">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-purple-600">🤖</span>
                  <div>
                    <p className="text-gray-900">AI generated flowchart</p>
                    <p className="text-gray-500 text-xs">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
