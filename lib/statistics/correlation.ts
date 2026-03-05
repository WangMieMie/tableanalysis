import * as ss from 'simple-statistics'

export interface CorrelationResult {
  coefficient: number
  pValue: number
  n: number
  interpretation: string
}

export interface CorrelationMatrix {
  variables: string[]
  matrix: (number | null)[][]
}

/**
 * Pearson correlation coefficient
 */
export function pearsonCorrelation(x: number[], y: number[]): CorrelationResult | null {
  if (x.length !== y.length || x.length < 3) return null

  const n = x.length
  const r = ss.sampleCorrelation(x, y)

  // t-statistic for testing significance
  const t = r * Math.sqrt((n - 2) / (1 - r * r))

  // p-value (two-tailed) using t-distribution approximation
  const df = n - 2
  const pValue = 2 * (1 - tDistributionApprox(Math.abs(t), df))

  return {
    coefficient: r,
    pValue,
    n,
    interpretation: interpretCorrelation(r),
  }
}

/**
 * Spearman rank correlation coefficient
 */
export function spearmanCorrelation(x: number[], y: number[]): CorrelationResult | null {
  if (x.length !== y.length || x.length < 3) return null

  const n = x.length

  // Convert to ranks
  const rankX = getRanks(x)
  const rankY = getRanks(y)

  // Calculate Pearson correlation of ranks
  const r = ss.sampleCorrelation(rankX, rankY)

  // t-statistic for testing significance
  const t = r * Math.sqrt((n - 2) / (1 - r * r))
  const df = n - 2
  const pValue = 2 * (1 - tDistributionApprox(Math.abs(t), df))

  return {
    coefficient: r,
    pValue,
    n,
    interpretation: interpretCorrelation(r),
  }
}

/**
 * Kendall's tau correlation coefficient
 */
export function kendallCorrelation(x: number[], y: number[]): CorrelationResult | null {
  if (x.length !== y.length || x.length < 3) return null

  const n = x.length
  let concordant = 0
  let discordant = 0

  // Count concordant and discordant pairs
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const xDiff = x[i] - x[j]
      const yDiff = y[i] - y[j]

      if (xDiff * yDiff > 0) {
        concordant++
      } else if (xDiff * yDiff < 0) {
        discordant++
      }
    }
  }

  const totalPairs = (n * (n - 1)) / 2
  const tau = (concordant - discordant) / totalPairs

  // Approximate p-value using normal distribution for large n
  const variance = (2 * (2 * n + 5)) / (9 * n * (n - 1))
  const z = tau / Math.sqrt(variance)
  const pValue = 2 * (1 - ss.cumulativeStdNormalProbability(Math.abs(z)))

  return {
    coefficient: tau,
    pValue,
    n,
    interpretation: interpretCorrelation(tau),
  }
}

/**
 * Calculate ranks for Spearman correlation
 */
function getRanks(values: number[]): number[] {
  const sorted = [...values].map((v, i) => ({ value: v, index: i }))
  sorted.sort((a, b) => a.value - b.value)

  const ranks: number[] = new Array(values.length)
  let i = 0

  while (i < sorted.length) {
    let j = i
    // Find ties
    while (j < sorted.length - 1 && sorted[j].value === sorted[j + 1].value) {
      j++
    }
    // Average rank for ties
    const avgRank = (i + j) / 2 + 1
    for (let k = i; k <= j; k++) {
      ranks[sorted[k].index] = avgRank
    }
    i = j + 1
  }

  return ranks
}

/**
 * Interpret correlation coefficient
 */
function interpretCorrelation(r: number): string {
  const absR = Math.abs(r)

  if (absR >= 0.9) {
    return `Very strong ${r > 0 ? 'positive' : 'negative'} correlation`
  } else if (absR >= 0.7) {
    return `Strong ${r > 0 ? 'positive' : 'negative'} correlation`
  } else if (absR >= 0.5) {
    return `Moderate ${r > 0 ? 'positive' : 'negative'} correlation`
  } else if (absR >= 0.3) {
    return `Weak ${r > 0 ? 'positive' : 'negative'} correlation`
  } else if (absR >= 0.1) {
    return `Very weak ${r > 0 ? 'positive' : 'negative'} correlation`
  } else {
    return 'No linear correlation'
  }
}

/**
 * Approximate t-distribution CDF
 */
function tDistributionApprox(t: number, df: number): number {
  if (df > 100) {
    return ss.cumulativeStdNormalProbability(t)
  }

  // Use normal approximation with correction
  const x = df / (df + t * t)
  return 1 - 0.5 * incompleteBetaApprox(df / 2, 0.5, x)
}

/**
 * Simplified incomplete beta function approximation
 */
function incompleteBetaApprox(a: number, b: number, x: number): number {
  if (x < 0 || x > 1) return 0
  if (x === 0) return 0
  if (x === 1) return 1

  // Use simple approximation
  const coef = Math.pow(x, a) * Math.pow(1 - x, b)
  const sum = a / (a + b)
  return coef * sum * 5 // Simplified approximation
}

/**
 * Calculate correlation matrix for multiple variables
 */
export function correlationMatrix(
  data: Record<string, number>[],
  variables: string[],
  method: 'pearson' | 'spearman' | 'kendall' = 'pearson'
): CorrelationMatrix {
  const n = variables.length
  const matrix: (number | null)[][] = []

  for (let i = 0; i < n; i++) {
    matrix[i] = []
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1
      } else {
        const x = data.map(row => row[variables[i]]).filter(v => typeof v === 'number')
        const y = data.map(row => row[variables[j]]).filter(v => typeof v === 'number')

        // Only use complete pairs
        const pairs: [number, number][] = []
        for (const row of data) {
          const xi = row[variables[i]]
          const yi = row[variables[j]]
          if (typeof xi === 'number' && typeof yi === 'number') {
            pairs.push([xi, yi])
          }
        }

        if (pairs.length < 3) {
          matrix[i][j] = null
        } else {
          const xVals = pairs.map(p => p[0])
          const yVals = pairs.map(p => p[1])

          let result: CorrelationResult | null
          switch (method) {
            case 'spearman':
              result = spearmanCorrelation(xVals, yVals)
              break
            case 'kendall':
              result = kendallCorrelation(xVals, yVals)
              break
            default:
              result = pearsonCorrelation(xVals, yVals)
          }

          matrix[i][j] = result?.coefficient ?? null
        }
      }
    }
  }

  return {
    variables,
    matrix,
  }
}

/**
 * Point-biserial correlation
 * For correlating a binary variable with a continuous variable
 */
export function pointBiserialCorrelation(
  binary: number[],  // 0 or 1 values
  continuous: number[]
): CorrelationResult | null {
  if (binary.length !== continuous.length || binary.length < 3) return null

  // Point-biserial is equivalent to Pearson correlation
  return pearsonCorrelation(binary, continuous)
}

/**
 * Partial correlation
 * Correlation between x and y controlling for z
 */
export function partialCorrelation(
  x: number[],
  y: number[],
  control: number[]
): CorrelationResult | null {
  if (x.length !== y.length || x.length !== control.length || x.length < 4) return null

  const n = x.length

  // Calculate residuals after regressing on control variable
  const xResiduals = getResiduals(x, control)
  const yResiduals = getResiduals(y, control)

  // Correlation of residuals
  return pearsonCorrelation(xResiduals, yResiduals)
}

/**
 * Get residuals from linear regression
 */
function getResiduals(y: number[], x: number[]): number[] {
  const regression = ss.linearRegression(x.map((xi, i) => [xi, y[i]]))
  const line = ss.linearRegressionLine(regression)

  return y.map((yi, i) => yi - line(x[i]))
}