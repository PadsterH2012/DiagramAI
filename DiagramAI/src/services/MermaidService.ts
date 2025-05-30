'use client'

import mermaid from 'mermaid'

class MermaidService {
  private static instance: MermaidService
  private isInitialized = false
  private initPromise: Promise<void> | null = null

  private constructor() {}

  static getInstance(): MermaidService {
    if (!MermaidService.instance) {
      MermaidService.instance = new MermaidService()
    }
    return MermaidService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve()
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = this.performInitialization()
    return this.initPromise
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('🔧 MermaidService: Initializing Mermaid globally...')
      
      // Initialize mermaid with optimal configuration
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 14,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
        },
        sequence: {
          useMaxWidth: true,
          wrap: true,
        },
        gantt: {
          useMaxWidth: true,
        },
        journey: {
          useMaxWidth: true,
        },
        gitGraph: {
          useMaxWidth: true,
        },
      })

      this.isInitialized = true
      console.log('🔧 MermaidService: Initialization complete!')
    } catch (error) {
      console.error('🔧 MermaidService: Initialization failed:', error)
      this.initPromise = null
      throw error
    }
  }

  async renderDiagram(element: HTMLElement, syntax: string): Promise<void> {
    // Ensure Mermaid is initialized
    await this.initialize()

    try {
      console.log('🔧 MermaidService: Rendering diagram...')
      await mermaid.init(undefined, element)
      console.log('🔧 MermaidService: Render complete!')
    } catch (error) {
      console.error('🔧 MermaidService: Render failed:', error)
      throw error
    }
  }

  isReady(): boolean {
    return this.isInitialized
  }
}

export default MermaidService
