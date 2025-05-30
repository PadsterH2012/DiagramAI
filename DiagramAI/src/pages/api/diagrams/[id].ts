import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid diagram ID' }
      })
    }

    switch (req.method) {
      case 'GET':
        return await getDiagram(req, res, id)
      case 'PUT':
        return await updateDiagram(req, res, id)
      case 'DELETE':
        return await deleteDiagram(req, res, id)
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        return res.status(405).json({ 
          success: false, 
          error: { message: 'Method not allowed' } 
        })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    })
  }
}

async function getDiagram(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const diagram = await prisma.diagram.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        format: true,
        tags: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!diagram) {
      return res.status(404).json({
        success: false,
        error: { message: 'Diagram not found' }
      })
    }

    return res.status(200).json({
      success: true,
      data: diagram
    })
  } catch (error) {
    console.error('Get diagram error:', error)
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch diagram' }
    })
  }
}

async function updateDiagram(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { title, description, content, format, tags, isPublic } = req.body

    // Check if diagram exists
    const existingDiagram = await prisma.diagram.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!existingDiagram) {
      return res.status(404).json({
        success: false,
        error: { message: 'Diagram not found' }
      })
    }

    // Generate new content hash if content is being updated
    const contentHash = content ? generateContentHash(JSON.stringify(content)) : undefined

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (content !== undefined) {
      updateData.content = content
      updateData.contentHash = contentHash
    }
    if (format !== undefined) updateData.format = format
    if (tags !== undefined) updateData.tags = tags
    if (isPublic !== undefined) updateData.isPublic = isPublic

    const diagram = await prisma.diagram.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        format: true,
        tags: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Broadcast real-time update to WebSocket subscribers
    if (global.wsService && content !== undefined) {
      global.wsService.broadcastDiagramUpdate(id, {
        type: 'content_updated',
        content: content,
        timestamp: new Date().toISOString()
      }, 'user')
      console.log(`🔄 Broadcasted diagram update for ${id}`)
    }

    return res.status(200).json({
      success: true,
      data: diagram
    })
  } catch (error) {
    console.error('Update diagram error:', error)
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to update diagram' }
    })
  }
}

async function deleteDiagram(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Check if diagram exists
    const existingDiagram = await prisma.diagram.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!existingDiagram) {
      return res.status(404).json({
        success: false,
        error: { message: 'Diagram not found' }
      })
    }

    await prisma.diagram.delete({
      where: { id }
    })

    return res.status(200).json({
      success: true,
      message: 'Diagram deleted successfully'
    })
  } catch (error) {
    console.error('Delete diagram error:', error)
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to delete diagram' }
    })
  }
}

function generateContentHash(content: string): string {
  // Simple hash function for content versioning
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}
