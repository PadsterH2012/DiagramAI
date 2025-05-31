import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ 
      success: false, 
      error: { message: 'Method not allowed' } 
    })
  }

  try {
    const timestamp = new Date().toISOString()
    
    // Check database connection
    let databaseStatus = 'disconnected'
    try {
      await prisma.$queryRaw`SELECT 1`
      databaseStatus = 'connected'
    } catch (error) {
      console.error('Database health check failed:', error)
      databaseStatus = 'error'
    }

    // Check basic application health
    const healthData = {
      status: 'healthy',
      timestamp,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: databaseStatus,
        websocket: 'active', // Assume active for now
        ai_providers: {
          openai: 'available',
          anthropic: 'available', 
          openrouter: 'available'
        }
      },
      metrics: {
        active_connections: 0, // Would need WebSocket tracking
        total_diagrams: 0, // Could query from database
        uptime: process.uptime()
      }
    }

    // Try to get diagram count
    try {
      const diagramCount = await prisma.diagram.count()
      healthData.metrics.total_diagrams = diagramCount
    } catch (error) {
      console.error('Failed to get diagram count:', error)
    }

    // Determine overall health status
    const isHealthy = databaseStatus === 'connected'
    
    return res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      data: {
        ...healthData,
        status: isHealthy ? 'healthy' : 'degraded'
      }
    })

  } catch (error) {
    console.error('Health check error:', error)
    return res.status(503).json({
      success: false,
      error: { 
        message: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
}
