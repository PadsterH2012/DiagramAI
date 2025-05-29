'use client'

import { Node, Edge } from '@xyflow/react'

export interface DiagramData {
  id?: string
  title: string
  description?: string
  content: {
    nodes: Node[]
    edges: Edge[]
  }
  format: 'reactflow' | 'mermaid'
  tags?: string[]
  isPublic?: boolean
  userId?: string
}

export interface SaveResult {
  success: boolean
  diagramId?: string
  error?: string
  timestamp?: Date
}

class DiagramService {
  private baseUrl = '/api/diagrams'

  async saveDiagram(diagramData: DiagramData): Promise<SaveResult> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: diagramData.title,
          description: diagramData.description,
          content: diagramData.content,
          format: diagramData.format,
          tags: diagramData.tags || [],
          isPublic: diagramData.isPublic || false,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        diagramId: result.data.id,
        timestamp: new Date(result.data.updatedAt),
      }
    } catch (error) {
      console.error('Save diagram error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async updateDiagram(diagramId: string, diagramData: Partial<DiagramData>): Promise<SaveResult> {
    try {
      const response = await fetch(`${this.baseUrl}/${diagramId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagramData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        diagramId: result.data.id,
        timestamp: new Date(result.data.updatedAt),
      }
    } catch (error) {
      console.error('Update diagram error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async loadDiagram(diagramId: string): Promise<DiagramData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${diagramId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Load diagram error:', error)
      return null
    }
  }

  async listDiagrams(): Promise<DiagramData[]> {
    try {
      const response = await fetch(this.baseUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.data || []
    } catch (error) {
      console.error('List diagrams error:', error)
      return []
    }
  }

  async deleteDiagram(diagramId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${diagramId}`, {
        method: 'DELETE',
      })

      return response.ok
    } catch (error) {
      console.error('Delete diagram error:', error)
      return false
    }
  }

  // Local storage fallback for development
  saveToLocalStorage(diagramData: DiagramData): SaveResult {
    try {
      const diagrams = this.getLocalDiagrams()
      const diagramId = diagramData.id || `diagram-${Date.now()}`
      const timestamp = new Date()
      
      const updatedDiagram = {
        ...diagramData,
        id: diagramId,
        updatedAt: timestamp.toISOString(),
        createdAt: diagramData.id ? diagrams[diagramId]?.createdAt || timestamp.toISOString() : timestamp.toISOString(),
      }
      
      diagrams[diagramId] = updatedDiagram
      localStorage.setItem('diagramai_diagrams', JSON.stringify(diagrams))
      
      return {
        success: true,
        diagramId,
        timestamp,
      }
    } catch (error) {
      console.error('Local storage save error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Local storage error',
      }
    }
  }

  loadFromLocalStorage(diagramId: string): DiagramData | null {
    try {
      const diagrams = this.getLocalDiagrams()
      return diagrams[diagramId] || null
    } catch (error) {
      console.error('Local storage load error:', error)
      return null
    }
  }

  listFromLocalStorage(): DiagramData[] {
    try {
      const diagrams = this.getLocalDiagrams()
      return Object.values(diagrams).sort((a, b) => 
        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      )
    } catch (error) {
      console.error('Local storage list error:', error)
      return []
    }
  }

  private getLocalDiagrams(): Record<string, any> {
    try {
      const stored = localStorage.getItem('diagramai_diagrams')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  // Auto-save functionality
  async autoSave(diagramData: DiagramData): Promise<SaveResult> {
    // Try database first, fallback to local storage
    const result = await this.saveDiagram(diagramData)
    
    if (!result.success) {
      // Fallback to local storage
      return this.saveToLocalStorage(diagramData)
    }
    
    return result
  }
}

export const diagramService = new DiagramService()
