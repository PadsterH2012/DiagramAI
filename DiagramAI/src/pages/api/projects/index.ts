import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getProjects(req, res)
      case 'POST':
        return await createProject(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({ 
          success: false, 
          error: { message: 'Method not allowed' } 
        })
    }
  } catch (error) {
    console.error('Projects API Error:', error)
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    })
  }
}

async function getProjects(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get or create a default user for development
    let defaultUser = await prisma.user.findFirst({
      where: { email: 'default@diagramai.dev' }
    })

    if (!defaultUser) {
      // Create a default user for development
      defaultUser = await prisma.user.create({
        data: {
          email: 'default@diagramai.dev',
          username: 'default_user',
          passwordHash: 'dev_only_hash',
          displayName: 'Default User',
          emailVerified: true,
        }
      })
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: defaultUser.id
      },
      include: {
        _count: {
          select: { diagrams: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return res.status(200).json({
      success: true,
      data: projects
    })
  } catch (error) {
    console.error('Get projects error:', error)
    
    const errorMessage = error instanceof Error 
      ? `Database error: ${error.message}` 
      : 'Failed to fetch projects'
    
    return res.status(500).json({
      success: false,
      error: { message: errorMessage }
    })
  }
}

async function createProject(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description, color } = req.body

    // Validate required fields
    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Project name is required' }
      })
    }

    // Validate name length
    if (name.length < 3 || name.length > 255) {
      return res.status(400).json({
        success: false,
        error: { message: 'Project name must be between 3 and 255 characters' }
      })
    }

    // Validate color format if provided
    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Color must be a valid hex color (e.g., #FF0000)' }
      })
    }

    // Get or create a default user for development
    let defaultUser = await prisma.user.findFirst({
      where: { email: 'default@diagramai.dev' }
    })

    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          email: 'default@diagramai.dev',
          username: 'default_user',
          passwordHash: 'dev_only_hash',
          displayName: 'Default User',
          emailVerified: true,
        }
      })
    }

    const project = await prisma.project.create({
      data: {
        userId: defaultUser.id,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || null,
      },
      include: {
        _count: {
          select: { diagrams: true }
        }
      }
    })

    return res.status(201).json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Create project error:', error)

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('projects_name_user_id_key')) {
      return res.status(400).json({
        success: false,
        error: { message: 'A project with this name already exists' }
      })
    }

    return res.status(500).json({
      success: false,
      error: { message: 'Failed to create project' }
    })
  }
}