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
    let databaseTables = []
    let databaseMessage = ''
    
    try {
      await prisma.$queryRaw`SELECT 1`
      databaseStatus = 'connected'
      
      // Check if critical tables exist and are accessible
      const tableChecks = [
        { name: 'users', check: () => prisma.user.findFirst({ take: 1 }) },
        { name: 'diagrams', check: () => prisma.diagram.findFirst({ take: 1 }) },
        { name: 'application_settings', check: () => prisma.applicationSetting.findFirst({ take: 1 }) }
      ]
      
      for (const table of tableChecks) {
        try {
          await table.check()
          databaseTables.push(table.name)
        } catch (error) {
          console.error(`Table ${table.name} check failed:`, error.message)
          // Table might not exist or be accessible
        }
      }
      
      if (databaseTables.length === 0) {
        databaseStatus = 'no_tables'
        databaseMessage = 'Database connected but no tables found. Run migrations.'
      } else if (databaseTables.length < tableChecks.length) {
        databaseStatus = 'partial_tables'
        databaseMessage = `Some tables missing. Found: ${databaseTables.join(', ')}`
      } else {
        databaseMessage = `All critical tables verified: ${databaseTables.join(', ')}`
      }
      
    } catch (error) {
      console.error('Database health check failed:', error)
      databaseStatus = 'error'
      databaseMessage = error instanceof Error ? error.message : 'Connection failed'
    }

    // Check basic application health
    const healthData = {
      status: 'healthy',
      timestamp,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: databaseStatus,
          message: databaseMessage,
          tables: databaseTables
        },
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
    const isHealthy = databaseStatus === 'connected' && databaseTables.length > 0
    
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
