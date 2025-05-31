import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query

    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid diagram ID' }
      })
    }

    switch (req.method) {
      case 'PUT':
        return await updateMetadata(req, res, id)
      default:
        res.setHeader('Allow', ['PUT'])
        return res.status(405).json({ 
          success: false, 
          error: { message: 'Method not allowed' } 
        })
    }
  } catch (error) {
    console.error('Update metadata API Error:', error)
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    })
  }
}

async function updateMetadata(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { title, description, tags, isFavorite } = req.body

    // Validate title if provided
    if (title !== undefined) {
      if (!title?.trim()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Title cannot be empty' }
        })
      }

      if (title.length > 255) {
        return res.status(400).json({
          success: false,
          error: { message: 'Title must be 255 characters or less' }
        })
      }
    }

    // Validate description if provided
    if (description !== undefined && description !== null && description.length > 2000) {
      return res.status(400).json({
        success: false,
        error: { message: 'Description must be 2000 characters or less' }
      })
    }

    // Validate tags if provided
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Tags must be an array' }
        })
      }

      if (tags.length > 20) {
        return res.status(400).json({
          success: false,
          error: { message: 'Maximum 20 tags allowed' }
        })
      }

      for (const tag of tags) {
        if (typeof tag !== 'string' || tag.length < 1 || tag.length > 50) {
          return res.status(400).json({
            success: false,
            error: { message: 'Each tag must be a string between 1 and 50 characters' }
          })
        }
      }
    }

    // Build update data
    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (tags !== undefined) updateData.tags = tags
    if (isFavorite !== undefined) updateData.isFavorite = Boolean(isFavorite)

    const updatedDiagram = await prisma.diagram.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        format: true,
        tags: true,
        isFavorite: true,
        isPublic: true,
        project: true,
        createdAt: true,
        updatedAt: true,
        lastAccessedAt: true,
      }
    })

    return res.status(200).json({
      success: true,
      data: updatedDiagram
    })
  } catch (error) {
    console.error('Update diagram metadata error:', error)

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({
        success: false,
        error: { message: 'Diagram not found' }
      })
    }

    return res.status(500).json({
      success: false,
      error: { message: 'Failed to update diagram metadata' }
    })
  }
}