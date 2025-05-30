'use client'

import { useEffect } from 'react'
import MermaidService from '@/services/MermaidService'

export function useMermaidPreload() {
  useEffect(() => {
    // Pre-load Mermaid as soon as any component mounts
    const preloadMermaid = async () => {
      try {
        const mermaidService = MermaidService.getInstance()
        await mermaidService.initialize()
        console.log('🚀 Mermaid pre-loaded successfully!')
      } catch (error) {
        console.warn('⚠️ Mermaid pre-load failed:', error)
      }
    }

    preloadMermaid()
  }, [])
}

export default useMermaidPreload
