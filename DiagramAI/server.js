const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT, 10) || 3000

// Ensure we're in the correct directory
const projectDir = __dirname
process.chdir(projectDir)

// Create Next.js app
const app = next({ dev, hostname, port, dir: projectDir })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize WebSocket service only in Node.js environment
  if (typeof window === 'undefined') {
    try {
      // Register ts-node for TypeScript support
      require('ts-node').register({
        transpileOnly: true,
        compilerOptions: {
          module: 'commonjs',
          moduleResolution: 'node',
          target: 'es2020',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true
        }
      })

      const { DiagramWebSocketService } = require('./src/services/websocketService.ts')
      const wsService = new DiagramWebSocketService(server)
      console.log('✅ WebSocket service initialized')

      // Make WebSocket service available globally for API routes
      global.wsService = wsService
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket service:', error)
    }
  }

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
