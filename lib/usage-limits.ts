import { createClient } from '@/lib/supabase/server'

// Plan limits configuration
export const PLAN_LIMITS = {
  free: {
    datasets: 3,
    rowsPerDataset: 100,
    aiAnalysesPerMonth: 5,
  },
  pro: {
    datasets: null, // unlimited
    rowsPerDataset: 10000,
    aiAnalysesPerMonth: null, // unlimited
  },
  enterprise: {
    datasets: null, // unlimited
    rowsPerDataset: 100000,
    aiAnalysesPerMonth: null, // unlimited
  },
} as const

export type PlanType = keyof typeof PLAN_LIMITS

interface UsageStatus {
  plan: PlanType
  aiAnalysesUsed: number
  aiAnalysesLimit: number | null
  canUseAI: boolean
  remainingAIAnalyses: number | null
}

/**
 * Get the current month's start date
 */
function getCurrentMonthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

/**
 * Get user's subscription plan
 */
export async function getUserPlan(userId: string): Promise<PlanType> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data || data.status !== 'active') {
    return 'free'
  }

  return (data.plan as PlanType) || 'free'
}

/**
 * Get user's AI analysis usage for the current month
 */
export async function getAIAnalysisUsage(userId: string): Promise<number> {
  const supabase = await createClient()
  const monthStart = getCurrentMonthStart()

  const { count } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', 'ai_analysis')
    .gte('created_at', monthStart)

  return count || 0
}

/**
 * Check if user can use AI analysis
 */
export async function checkAIAnalysisLimit(userId: string): Promise<UsageStatus> {
  const plan = await getUserPlan(userId)
  const usage = await getAIAnalysisUsage(userId)
  const limits = PLAN_LIMITS[plan]

  const limit = limits.aiAnalysesPerMonth
  const canUse = limit === null || usage < limit
  const remaining = limit !== null ? Math.max(0, limit - usage) : null

  return {
    plan,
    aiAnalysesUsed: usage,
    aiAnalysesLimit: limit,
    canUseAI: canUse,
    remainingAIAnalyses: remaining,
  }
}

/**
 * Log an AI analysis usage
 */
export async function logAIAnalysis(userId: string): Promise<void> {
  const supabase = await createClient()

  await supabase.from('usage_logs').insert({
    user_id: userId,
    action: 'ai_analysis',
  })
}

/**
 * Get usage status for client-side display
 */
export async function getUsageStatus(): Promise<UsageStatus | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return checkAIAnalysisLimit(user.id)
}