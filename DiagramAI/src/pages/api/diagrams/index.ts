import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    // For now, return mock data since we don't have authentication
    // In production, this would filter by user ID
    const diagrams = await prisma.diagram.findMany({
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
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch diagrams' }
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

    // For now, use a default user ID since we don't have authentication
    // In production, this would come from the authenticated user
    const defaultUserId = '00000000-0000-0000-0000-000000000000'

    const diagram = await prisma.diagram.create({
      data: {
        userId: defaultUserId,
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
