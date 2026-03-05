'use client'

import { useState } from 'react'
import { Column, Row } from '@/types'
import { useTranslations } from 'next-intl'
import { StatisticsPanel } from './statistics-panel'
import { ChartBuilder } from '@/components/charts/chart-builder'
import { PivotTable } from './pivot-table'
import { AIAnalyzer } from './ai-analyzer'
import { HypothesisTest } from './hypothesis-test'
import { CorrelationAnalysis } from './correlation-analysis'
import { RegressionAnalysis } from './regression-analysis'
import { ANOVAAnalysis } from './anova-analysis'

interface AnalysisTabsProps {
  columns: Column[]
  rows: Row[]
  statistics: Record<string, any>
}

type TabType = 'statistics' | 'charts' | 'hypothesis' | 'correlation' | 'regression' | 'anova' | 'pivot' | 'ai'

export function AnalysisTabs({ columns, rows, statistics }: AnalysisTabsProps) {
  const t = useTranslations('analysis')
  const [activeTab, setActiveTab] = useState<TabType>('statistics')

  const tabs: { id: TabType; label: string; description: string }[] = [
    { id: 'statistics', label: t('statistics.title'), description: 'Descriptive statistics' },
    { id: 'charts', label: t('charts.title'), description: 'Data visualization' },
    { id: 'hypothesis', label: t('hypothesis.title'), description: 't-Tests' },
    { id: 'correlation', label: t('correlation.title'), description: 'Variable relationships' },
    { id: 'regression', label: t('regression.title'), description: 'Predictive modeling' },
    { id: 'anova', label: t('anova.title'), description: 'Compare group means' },
    { id: 'pivot', label: t('pivot.title'), description: 'Data summarization' },
    { id: 'ai', label: t('ai.title'), description: 'AI-powered insights' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'statistics':
        return <StatisticsPanel columns={columns} statistics={statistics} />
      case 'charts':
        return <ChartBuilder columns={columns} rows={rows} />
      case 'hypothesis':
        return <HypothesisTest columns={columns} rows={rows} />
      case 'correlation':
        return <CorrelationAnalysis columns={columns} rows={rows} />
      case 'regression':
        return <RegressionAnalysis columns={columns} rows={rows} />
      case 'anova':
        return <ANOVAAnalysis columns={columns} rows={rows} />
      case 'pivot':
        return <PivotTable columns={columns} rows={rows} />
      case 'ai':
        return <AIAnalyzer columns={columns} rows={rows} datasetName="Dataset" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex flex-wrap -mb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  )
}