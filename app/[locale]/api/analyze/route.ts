import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { checkAIAnalysisLimit, logAIAnalysis } from '@/lib/usage-limits'

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI()

  if (!openai) {
    return NextResponse.json(
      { error: 'OpenAI API not configured' },
      { status: 503 }
    )
  }

  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Check usage limits
    const usageStatus = await checkAIAnalysisLimit(user.id)

    if (!usageStatus.canUseAI) {
      return NextResponse.json(
        {
          error: 'AI analysis limit reached',
          code: 'LIMIT_EXCEEDED',
          plan: usageStatus.plan,
          limit: usageStatus.aiAnalysesLimit,
          used: usageStatus.aiAnalysesUsed,
        },
        { status: 403 }
      )
    }

    const { datasetName, columns, sampleData } = await request.json()

    const prompt = `Analyze the following dataset and provide insights.

Dataset Name: ${datasetName}

Columns:
${columns.map((c: { name: string; type: string }) => `- ${c.name} (${c.type})`).join('\n')}

Sample Data (first 100 rows):
${JSON.stringify(sampleData, null, 2)}

Please provide a comprehensive analysis in the following format:

1. **Overview**: A brief summary of what this dataset contains and its purpose.
2. **Data Quality**: Assessment of data quality including missing values, inconsistencies, and potential issues.
3. **Trends & Patterns**: Key trends, patterns, or insights discovered in the data.
4. **Recommendations**: Actionable recommendations based on the analysis.

Respond in JSON format with keys: overview, quality, trends, recommendations`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a data analyst expert. Provide clear, actionable insights in a professional tone.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    })

    const content = completion.choices[0].message.content
    const report = content ? JSON.parse(content) : null

    // Log the usage after successful analysis
    await logAIAnalysis(user.id)

    // Return the report with updated usage info
    return NextResponse.json({
      report,
      usage: {
        remaining: usageStatus.remainingAIAnalyses !== null
          ? usageStatus.remainingAIAnalyses - 1
          : null,
        limit: usageStatus.aiAnalysesLimit,
      },
    })
  } catch (error) {
    console.error('AI Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze data' },
      { status: 500 }
    )
  }
}