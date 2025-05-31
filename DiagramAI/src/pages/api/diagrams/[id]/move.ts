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
        return await moveDiagram(req, res, id)
      default:
        res.setHeader('Allow', ['PUT'])
        return res.status(405).json({ 
          success: false, 
          error: { message: 'Method not allowed' } 
        })
    }
  } catch (error) {
    console.error('Move diagram API Error:', error)
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    })
  }
}

async function moveDiagram(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { projectId } = req.body

    // Get the diagram to check ownership
    const diagram = await prisma.diagram.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!diagram) {
      return res.status(404).json({
        success: false,
        error: { message: 'Diagram not found' }
      })
    }

    // Validate project exists if provided and belongs to the same user
    let validatedProjectId = null
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: diagram.userId
        }
      })
      if (!project) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid project ID or project does not belong to user' }
        })
      }
      validatedProjectId = projectId
    }

    const updatedDiagram = await prisma.diagram.update({
      where: { id },
      data: {
        projectId: validatedProjectId,
      },
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
    console.error('Move diagram error:', error)

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({
        success: false,
        error: { message: 'Diagram not found' }
      })
    }

    return res.status(500).json({
      success: false,
      error: { message: 'Failed to move diagram' }
    })
  }
}