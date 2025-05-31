import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import VersionDisplay from '@/components/VersionDisplay'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DiagramAI - AI-Powered Diagram Generation',
  description: 'Create and edit diagrams with AI assistance. Convert between visual flow diagrams and Mermaid syntax.',
  keywords: ['diagram', 'ai', 'mermaid', 'flowchart', 'visualization'],
  authors: [{ name: 'DiagramAI Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className=""> {/* {inter.className} */}
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-gray-900">DiagramAI</h1>
                    <VersionDisplay />
                  </div>
                </div>
                <nav className="flex space-x-4">
                  <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Home
                  </Link>
                  <Link href="/editor" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Editor
                  </Link>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link href="/settings" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1">
                    <span>⚙️</span>
                    <span>Settings</span>
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <ClientLayout>
              {children}
            </ClientLayout>
          </main>
          <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p className="text-center text-sm text-gray-500">
                © 2025 DiagramAI. AI-Powered Diagram Generation Platform.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
