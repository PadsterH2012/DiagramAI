'use client'

import { useEffect } from 'react'
import useMermaidPreload from '@/hooks/useMermaidPreload'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Pre-load Mermaid globally
  useMermaidPreload()

  return <>{children}</>
}
