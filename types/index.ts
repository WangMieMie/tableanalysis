// Core data types
export interface Column {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'boolean'
  width?: number
}

export interface Row {
  id: string
  [key: string]: string | number | boolean | null
}

export interface TableData {
  id: string
  name: string
  columns: Column[]
  rows: Row[]
  createdAt: Date
  updatedAt: Date
}

// Statistics types
export interface ColumnStatistics {
  count: number
  sum?: number
  average?: number
  min?: number
  max?: number
  median?: number
  stdDev?: number
  nullCount: number
  uniqueCount?: number
}

export interface TableStatistics {
  [columnName: string]: ColumnStatistics
}

// Chart types
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'boxPlot'

export interface ChartConfig {
  type: ChartType
  xAxis: string
  yAxis: string
  groupBy?: string
  title?: string
}

export interface SavedChart {
  id: string
  datasetId: string
  config: ChartConfig
  name: string
  createdAt: Date
}

// Pivot table types
export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max'

export interface PivotConfig {
  rows: string[]
  columns: string[]
  values: string
  aggregation: AggregationType
}

// AI Analysis types
export interface AIAnalysisReport {
  id: string
  datasetId: string
  overview: string
  statistics: string
  quality: string
  trends: string
  recommendations: string
  createdAt: Date
}

// Database types
export interface Profile {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}

export interface SavedDataset {
  id: string
  user_id: string
  name: string
  columns: Column[]
  data: Row[]
  row_count: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  current_period_end: string
  plan: 'free' | 'pro' | 'enterprise'
}

export interface UsageLog {
  id: string
  user_id: string
  action: 'ai_analysis' | 'dataset_created' | 'export'
  created_at: string
}

// Pricing plan types
export interface PricingPlan {
  id: 'free' | 'pro' | 'enterprise'
  name: string
  price: number
  period: string
  description: string
  features: string[]
  limits: {
    datasets: number | null // null means unlimited
    rowsPerDataset: number
    aiAnalysesPerMonth: number | null
  }
}

// File import types
export interface FileParseResult {
  columns: Column[]
  rows: Row[]
  errors?: string[]
}

// User session types
export interface UserSession {
  user: Profile | null
  subscription: Subscription | null
  isLoading: boolean
}