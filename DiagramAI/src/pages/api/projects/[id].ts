import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query

    if (typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid project ID' }
      })
    }

    switch (req.method) {
      case 'GET':
        return await getProject(req, res, id)
      case 'PUT':
        return await updateProject(req, res, id)
      case 'DELETE':
        return await deleteProject(req, res, id)
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        return res.status(405).json({ 
          success: false, 
          error: { message: 'Method not allowed' } 
        })
    }
  } catch (error) {
    console.error('Project API Error:', error)
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    })
  }
}

async function getProject(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        diagrams: {
          select: {
            id: true,
            title: true,
            description: true,
            format: true,
            tags: true,
            isFavorite: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
            lastAccessedAt: true,
          },
          orderBy: { updatedAt: 'desc' }
        },
        _count: {
          select: { diagrams: true }
        }
      }
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found' }
      })
    }

    return res.status(200).json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Get project error:', error)
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch project' }
    })
  }
}

async function updateProject(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { name, description, color } = req.body

    // Validate name if provided
    if (name !== undefined) {
      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Project name cannot be empty' }
        })
      }

      if (name.length < 3 || name.length > 255) {
        return res.status(400).json({
          success: false,
          error: { message: 'Project name must be between 3 and 255 characters' }
        })
      }
    }

    // Validate color format if provided
    if (color !== undefined && color !== null && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Color must be a valid hex color (e.g., #FF0000)' }
      })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (color !== undefined) updateData.color = color || null

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { diagrams: true }
        }
      }
    })

    return res.status(200).json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Update project error:', error)

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('projects_name_user_id_key')) {
      return res.status(400).json({
        success: false,
        error: { message: 'A project with this name already exists' }
      })
    }

    // Handle not found
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found' }
      })
    }

    return res.status(500).json({
      success: false,
      error: { message: 'Failed to update project' }
    })
  }
}

async function deleteProject(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Check if project exists and has diagrams
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: { diagrams: true }
        }
      }
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found' }
      })
    }

    // Delete the project - diagrams will be set to null due to onDelete: SetNull
    await prisma.project.delete({
      where: { id }
    })

    return res.status(200).json({
      success: true,
      data: { 
        message: 'Project deleted successfully',
        diagramsUnassigned: project._count.diagrams
      }
    })
  } catch (error) {
    console.error('Delete project error:', error)

    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found' }
      })
    }

    return res.status(500).json({
      success: false,
      error: { message: 'Failed to delete project' }
    })
  }
}