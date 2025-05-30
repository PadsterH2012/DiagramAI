import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const versionInfo = {
      version: process.env.APP_VERSION || '1.0.45',
      buildDate: process.env.BUILD_DATE || new Date().toISOString(),
      gitCommit: process.env.GIT_COMMIT || 'unknown',
      nodeEnv: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(versionInfo)
  } catch (error) {
    console.error('Error fetching version info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch version information' },
      { status: 500 }
    )
  }
}
