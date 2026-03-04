import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAIAnalysisLimit } from '@/lib/usage-limits'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const usageStatus = await checkAIAnalysisLimit(user.id)

    return NextResponse.json({
      remaining: usageStatus.remainingAIAnalyses,
      limit: usageStatus.aiAnalysesLimit,
      plan: usageStatus.plan,
      used: usageStatus.aiAnalysesUsed,
    })
  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json(
      { error: 'Failed to get usage info' },
      { status: 500 }
    )
  }
}