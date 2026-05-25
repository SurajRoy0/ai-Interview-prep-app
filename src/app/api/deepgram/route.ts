import { createClient } from '@deepgram/sdk'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const apiKey = process.env.DEEPGRAM_API_KEY
  const projectId = process.env.DEEPGRAM_PROJECT_ID

  if (!apiKey || !projectId) {
    console.error('[deepgram] API Key or Project ID is missing')
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
  }

  try {
    const deepgram = createClient(apiKey)

    const { result, error } = await deepgram.manage.createProjectKey(projectId, {
      comment: `Interview key for user ${session.user.id}`,
      scopes: ['usage:write'],
      timeToLiveInSeconds: 3600,
    })

    if (error) {
      console.error('[deepgram] Key creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ key: result.key })
  } catch (err) {
    console.error('[deepgram] Failed to generate temp key:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
