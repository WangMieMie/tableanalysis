import * as ss from 'simple-statistics'

export interface AdvancedStatistics {
  count: number
  sum?: number
  average?: number
  mean?: number
  min?: number
  max?: number
  median?: number
  mode?: number | string
  stdDev?: number
  variance?: number
  range?: number
  skewness?: number
  kurtosis?: number
  q1?: number
  q2?: number
  q3?: number
  iqr?: number
  nullCount: number
  uniqueCount?: number
}

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

/**
 * Calculate mode (most frequent value)
 */
export function calculateMode(values: number[]): number | null {
  if (values.length === 0) return null

  const frequency: Record<number, number> = {}
  let maxFreq = 0
  let mode: number | null = null

  for (const val of values) {
    frequency[val] = (frequency[val] || 0) + 1
    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val]
      mode = val
    }
  }

  return mode
}

/**
 * Calculate skewness using the Fisher-Pearson coefficient
 */
export function calculateSkewness(values: number[]): number | null {
  if (values.length < 3) return null

  const n = values.length
  const mean = ss.mean(values)
  const sd = ss.standardDeviation(values)

  if (sd === 0) return 0

  const sumCubed = values.reduce((sum, val) => {
    return sum + Math.pow((val - mean) / sd, 3)
  }, 0)

  // Fisher-Pearson coefficient with bias correction
  return (n / ((n - 1) * (n - 2))) * sumCubed
}

/**
 * Calculate kurtosis (excess kurtosis)
 */
export function calculateKurtosis(values: number[]): number | null {
  if (values.length < 4) return null

  const n = values.length
  const mean = ss.mean(values)
  const sd = ss.standardDeviation(values)

  if (sd === 0) return 0

  const sumFourth = values.reduce((sum, val) => {
    return sum + Math.pow((val - mean) / sd, 4)
  }, 0)

  // Excess kurtosis with bias correction
  const kurtosis = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sumFourth
  const correction = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3))

  return kurtosis - correction
}

/**
 * Calculate percentile
 */
export function calculatePercentile(values: number[], percentile: number): number | null {
  if (values.length === 0) return null
  return ss.quantile(values, percentile / 100)
}

/**
 * Calculate all advanced statistics for a column
 */
export function calculateAdvancedStatistics(
  values: (number | string | boolean | null)[]
): AdvancedStatistics {
  const numericValues = values
    .filter((v): v is number => typeof v === 'number' && !isNaN(v))

  const nullCount = values.filter(v => v === null || v === undefined).length
  const uniqueCount = new Set(values.filter(v => v !== null && v !== undefined)).size

  if (numericValues.length === 0) {
    return {
      count: values.length,
      nullCount,
      uniqueCount,
    }
  }

  const sortedValues = [...numericValues].sort((a, b) => a - b)
  const q1 = ss.quantile(sortedValues, 0.25)
  const q3 = ss.quantile(sortedValues, 0.75)

  return {
    count: values.length,
    sum: ss.sum(numericValues),
    average: ss.mean(numericValues),
    mean: ss.mean(numericValues),
    min: ss.min(numericValues),
    max: ss.max(numericValues),
    median: ss.median(numericValues),
    mode: calculateMode(numericValues) ?? undefined,
    stdDev: ss.standardDeviation(numericValues),
    variance: ss.variance(numericValues),
    range: ss.max(numericValues) - ss.min(numericValues),
    skewness: calculateSkewness(numericValues) ?? undefined,
    kurtosis: calculateKurtosis(numericValues) ?? undefined,
    q1: q1,
    q2: ss.median(numericValues),
    q3: q3,
    iqr: q3 - q1,
    nullCount,
    uniqueCount,
  }
}

/**
 * Calculate basic statistics for a column (backward compatible)
 */
export function calculateStatistics(
  values: (number | string | boolean | null)[]
): ColumnStatistics {
  const stats = calculateAdvancedStatistics(values)
  return {
    count: stats.count,
    sum: stats.sum,
    average: stats.average,
    min: stats.min,
    max: stats.max,
    median: stats.median,
    stdDev: stats.stdDev,
    nullCount: stats.nullCount,
    uniqueCount: stats.uniqueCount,
  }
}

/**
 * Calculate statistics for all columns in a dataset
 */
export function calculateAllStatistics(
  data: Record<string, (number | string | boolean | null)>[]
): Record<string, AdvancedStatistics> {
  const result: Record<string, AdvancedStatistics> = {}

  if (data.length === 0) return result

  const columns = Object.keys(data[0])

  for (const column of columns) {
    const values = data.map(row => row[column])
    result[column] = calculateAdvancedStatistics(values)
  }

  return result
}