import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getDiagrams(req, res)
      case 'POST':
        return await createDiagram(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
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

async function getDiagrams(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get diagrams for the default user or all public diagrams
    // In production, this would filter by authenticated user ID
    const diagrams = await prisma.diagram.findMany({
      where: {
        OR: [
          { isPublic: true },
          {
            user: {
              email: 'default@diagramai.dev'
            }
          }
        ]
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
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

    return res.status(200).json({
      success: true,
      data: diagrams
    })
  } catch (error) {
    console.error('Get diagrams error:', error)
    
    // Provide more specific error information for debugging
    const errorMessage = error instanceof Error 
      ? `Database error: ${error.message}` 
      : 'Failed to fetch diagrams'
    
    return res.status(500).json({
      success: false,
      error: { message: errorMessage }
    })
  }
}

async function createDiagram(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title, description, content, format, tags, isPublic } = req.body

    // Validate required fields
    if (!title || !content || !format) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required fields: title, content, format' }
      })
    }

    // Generate content hash for versioning
    const contentHash = generateContentHash(JSON.stringify(content))

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
          passwordHash: 'dev_only_hash', // Not a real password hash
          displayName: 'Default User',
          emailVerified: true,
        }
      })
    }

    const diagram = await prisma.diagram.create({
      data: {
        userId: defaultUser.id,
        title,
        description: description || null,
        content,
        format,
        contentHash,
        tags: tags || [],
        isPublic: isPublic || false,
      },
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

    return res.status(201).json({
      success: true,
      data: diagram
    })
  } catch (error) {
    console.error('Create diagram error:', error)

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid user reference' }
      })
    }

    return res.status(500).json({
      success: false,
      error: { message: 'Failed to create diagram' }
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
