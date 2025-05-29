'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)

  const features = [
    {
      title: 'AI-Powered Generation',
      description: 'Generate diagrams from natural language descriptions using advanced AI models.',
      icon: '🤖',
    },
    {
      title: 'Visual Flow Editor',
      description: 'Interactive drag-and-drop editor powered by React Flow for intuitive diagram creation.',
      icon: '🎨',
    },
    {
      title: 'Mermaid Integration',
      description: 'Seamless conversion between visual diagrams and Mermaid text syntax.',
      icon: '📊',
    },
    {
      title: 'Real-time Collaboration',
      description: 'Work together with your team in real-time with live updates and comments.',
      icon: '👥',
    },
    {
      title: 'Export & Share',
      description: 'Export diagrams in multiple formats and share with stakeholders easily.',
      icon: '📤',
    },
    {
      title: 'Version Control',
      description: 'Track changes and maintain version history of your diagrams.',
      icon: '📝',
    },
  ]

  const handleGetStarted = () => {
    setIsLoading(true)
    // Simulate loading for demo purposes
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = '/editor'
    }, 1000)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Create Diagrams with
              <span className="text-blue-600"> AI Power</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your ideas into beautiful diagrams using natural language. 
              DiagramAI combines the power of AI with intuitive visual editing for seamless diagram creation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Get Started Free'}
              </button>
              <Link href="/demo" className="btn-secondary text-lg px-8 py-3 inline-block text-center">
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Diagramming
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, edit, and share professional diagrams with the power of AI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="status-indicator status-success mb-2">✅ Online</div>
                <h3 className="font-semibold">Application</h3>
                <p className="text-sm text-gray-600">Next.js 15 App</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="status-indicator status-success mb-2">✅ Connected</div>
                <h3 className="font-semibold">Database</h3>
                <p className="text-sm text-gray-600">PostgreSQL</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="status-indicator status-success mb-2">✅ Active</div>
                <h3 className="font-semibold">Cache</h3>
                <p className="text-sm text-gray-600">Redis</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="status-indicator status-info mb-2">🔧 Setup</div>
                <h3 className="font-semibold">AI Services</h3>
                <p className="text-sm text-gray-600">
                  <a href="/settings" className="text-blue-600 hover:text-blue-800 underline">
                    Configure API Keys
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
