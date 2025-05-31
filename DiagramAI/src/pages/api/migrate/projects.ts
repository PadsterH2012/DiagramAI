import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'POST':
        return await runMigration(req, res)
      default:
        res.setHeader('Allow', ['POST'])
        return res.status(405).json({ 
          success: false, 
          error: { message: 'Method not allowed' } 
        })
    }
  } catch (error) {
    console.error('Migration API Error:', error)
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    })
  }
}

async function runMigration(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get or create default user
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

    // Check if there are diagrams without projects
    const unassignedDiagrams = await prisma.diagram.findMany({
      where: {
        projectId: null,
        userId: defaultUser.id
      }
    })

    if (unassignedDiagrams.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          message: 'No migration needed - all diagrams are already assigned to projects',
          diagramsProcessed: 0
        }
      })
    }

    // Create or find default project
    let defaultProject = await prisma.project.findFirst({
      where: {
        userId: defaultUser.id,
        name: 'Default Project'
      }
    })

    if (!defaultProject) {
      defaultProject = await prisma.project.create({
        data: {
          userId: defaultUser.id,
          name: 'Default Project',
          description: 'Auto-created for existing diagrams',
          color: '#6B7280' // Gray color
        }
      })
    }

    // Assign unassigned diagrams to default project
    const updateResult = await prisma.diagram.updateMany({
      where: {
        projectId: null,
        userId: defaultUser.id
      },
      data: {
        projectId: defaultProject.id
      }
    })

    return res.status(200).json({
      success: true,
      data: {
        message: 'Migration completed successfully',
        diagramsProcessed: updateResult.count,
        defaultProjectId: defaultProject.id,
        defaultProjectName: defaultProject.name
      }
    })
  } catch (error) {
    console.error('Migration error:', error)
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to run migration' }
    })
  }
}