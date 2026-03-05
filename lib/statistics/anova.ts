import * as ss from 'simple-statistics'

export interface ANOVAResult {
  source: string
  sumOfSares: number
  degreesOfFreedom: number
  meanSquare: number
  fValue: number
  pValue: number
}

export interface OneWayANOVAOutput {
  anova: ANOVAResult[]
  groups: {
    name: string
    n: number
    mean: number
    stdDev: number
    stdError: number
    confidenceInterval: [number, number]
  }[]
  significant: boolean
  postHoc?: PostHocResult[]
}

export interface PostHocResult {
  comparison: string
  meanDifference: number
  standardError: number
  qStatistic: number
  pValue: number
  significant: boolean
}

/**
 * One-way ANOVA
 * Tests if means of three or more independent groups are equal
 */
export function oneWayANOVA(
  groups: { name: string; values: number[] }[],
  alpha: number = 0.05
): OneWayANOVAOutput | null {
  if (groups.length < 2) return null

  // Filter out empty groups
  const validGroups = groups.filter(g => g.values.length > 0)
  if (validGroups.length < 2) return null

  const k = validGroups.length
  const allValues: number[] = []
  const groupStats: OneWayANOVAOutput['groups'] = []

  // Calculate group statistics
  for (const group of validGroups) {
    allValues.push(...group.values)
    const n = group.values.length
    const mean = ss.mean(group.values)
    const stdDev = ss.standardDeviation(group.values)
    const stdError = stdDev / Math.sqrt(n)

    // 95% CI
    const tCritical = tDistributionInverse(1 - alpha / 2, n - 1)
    const ci: [number, number] = [
      mean - tCritical * stdError,
      mean + tCritical * stdError,
    ]

    groupStats.push({
      name: group.name,
      n,
      mean,
      stdDev,
      stdError,
      confidenceInterval: ci,
    })
  }

  const N = allValues.length
  const grandMean = ss.mean(allValues)

  // Calculate sum of squares
  let ssBetween = 0
  let ssWithin = 0

  for (let i = 0; i < validGroups.length; i++) {
    const group = validGroups[i]
    const groupMean = ss.mean(group.values)
    const ni = group.values.length

    ssBetween += ni * Math.pow(groupMean - grandMean, 2)

    for (const value of group.values) {
      ssWithin += Math.pow(value - groupMean, 2)
    }
  }

  // Degrees of freedom
  const dfBetween = k - 1
  const dfWithin = N - k

  // Mean squares
  const msBetween = ssBetween / dfBetween
  const msWithin = ssWithin / dfWithin

  // F-statistic
  const fValue = msBetween / msWithin

  // p-value
  const pValue = fDistributionCDF(1 - fValue, dfBetween, dfWithin)

  // ANOVA table
  const anova: ANOVAResult[] = [
    {
      source: 'Between Groups',
      sumOfSares: ssBetween,
      degreesOfFreedom: dfBetween,
      meanSquare: msBetween,
      fValue,
      pValue,
    },
    {
      source: 'Within Groups',
      sumOfSares: ssWithin,
      degreesOfFreedom: dfWithin,
      meanSquare: msWithin,
      fValue: NaN,
      pValue: NaN,
    },
    {
      source: 'Total',
      sumOfSares: ssBetween + ssWithin,
      degreesOfFreedom: N - 1,
      meanSquare: NaN,
      fValue: NaN,
      pValue: NaN,
    },
  ]

  // Post-hoc test (Tukey HSD)
  let postHoc: PostHocResult[] | undefined
  if (pValue < alpha && k > 2) {
    postHoc = tukeyHSD(validGroups, msWithin, dfWithin, alpha)
  }

  return {
    anova,
    groups: groupStats,
    significant: pValue < alpha,
    postHoc,
  }
}

/**
 * Tukey's Honestly Significant Difference (HSD) post-hoc test
 */
function tukeyHSD(
  groups: { name: string; values: number[] }[],
  msWithin: number,
  dfWithin: number,
  alpha: number
): PostHocResult[] {
  const k = groups.length
  const results: PostHocResult[] = []

  // Harmonic mean of group sizes
  const groupSizes = groups.map(g => g.values.length)
  const harmonicN = k / groupSizes.reduce((sum, n) => sum + 1 / n, 0)

  // Standard error
  const se = Math.sqrt(msWithin / harmonicN)

  // Critical q value (approximation)
  const qCritical = tukeyQCritical(k, dfWithin, alpha)

  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const mean1 = ss.mean(groups[i].values)
      const mean2 = ss.mean(groups[j].values)
      const meanDiff = mean1 - mean2
      const q = Math.abs(meanDiff) / se

      // p-value approximation
      const pValue = tukeyPValue(q, k, dfWithin)

      results.push({
        comparison: `${groups[i].name} - ${groups[j].name}`,
        meanDifference: meanDiff,
        standardError: se,
        qStatistic: q,
        pValue,
        significant: Math.abs(meanDiff) > qCritical * se,
      })
    }
  }

  return results
}

/**
 * Approximate Tukey q critical value
 */
function tukeyQCritical(k: number, df: number, alpha: number): number {
  // Approximation based on studentized range distribution
  // For large df, use normal approximation
  if (df > 100) {
    const z = ss.probit(1 - alpha / 2)
    return z * Math.sqrt(2)
  }

  // Simple approximation
  return 2.8 + 0.5 * Math.log(k) * (1 - df / (df + 10))
}

/**
 * Approximate Tukey p-value
 */
function tukeyPValue(q: number, k: number, df: number): number {
  // Approximation based on studentized range distribution
  if (df > 100) {
    const z = q / Math.sqrt(2)
    return 2 * (1 - ss.cumulativeStdNormalProbability(z))
  }
  // Conservative approximation
  return Math.max(0.001, 1 - q / (tukeyQCritical(k, df, 0.05) * 1.5))
}

/**
 * Two-way ANOVA (for factorial designs)
 */
export interface TwoWayANOVAOutput {
  anova: ANOVAResult[]
  significant: {
    factorA: boolean
    factorB: boolean
    interaction: boolean
  }
}

export function twoWayANOVA(
  data: { factorA: string; factorB: string; value: number }[],
  factorALevels: string[],
  factorBLevels: string[]
): TwoWayANOVAOutput | null {
  const n = data.length
  if (n === 0) return null

  const a = factorALevels.length
  const b = factorBLevels.length

  // Calculate grand mean
  const grandMean = ss.mean(data.map(d => d.value))

  // Calculate marginal and cell means
  const factorAMeans: Record<string, number[]> = {}
  const factorBMeans: Record<string, number[]> = {}
  const cellMeans: Record<string, number[]> = {}

  for (const d of data) {
    if (!factorAMeans[d.factorA]) factorAMeans[d.factorA] = []
    if (!factorBMeans[d.factorB]) factorBMeans[d.factorB] = []
    const cellKey = `${d.factorA}|${d.factorB}`
    if (!cellMeans[cellKey]) cellMeans[cellKey] = []

    factorAMeans[d.factorA].push(d.value)
    factorBMeans[d.factorB].push(d.value)
    cellMeans[cellKey].push(d.value)
  }

  // Calculate sum of squares
  let ssFactorA = 0
  let ssFactorB = 0
  let ssInteraction = 0
  let ssError = 0

  // Factor A sum of squares
  for (const level of factorALevels) {
    const values = factorAMeans[level] || []
    if (values.length > 0) {
      const mean = ss.mean(values)
      ssFactorA += values.length * Math.pow(mean - grandMean, 2)
    }
  }

  // Factor B sum of squares
  for (const level of factorBLevels) {
    const values = factorBMeans[level] || []
    if (values.length > 0) {
      const mean = ss.mean(values)
      ssFactorB += values.length * Math.pow(mean - grandMean, 2)
    }
  }

  // Interaction and error sum of squares
  const cellsPerInteraction = n / (a * b)

  for (const d of data) {
    const cellKey = `${d.factorA}|${d.factorB}`
    const cellValues = cellMeans[cellKey] || []
    const cellMean = cellValues.length > 0 ? ss.mean(cellValues) : grandMean

    const factorAMean = factorAMeans[d.factorA]?.length > 0
      ? ss.mean(factorAMeans[d.factorA])
      : grandMean
    const factorBMean = factorBMeans[d.factorB]?.length > 0
      ? ss.mean(factorBMeans[d.factorB])
      : grandMean

    // Interaction effect
    const interactionEffect = cellMean - factorAMean - factorBMean + grandMean

    // Error
    ssError += Math.pow(d.value - cellMean, 2)
  }

  // Approximate interaction sum of squares
  ssInteraction = 0
  for (const [key, values] of Object.entries(cellMeans)) {
    if (values.length > 0) {
      const cellMean = ss.mean(values)
      const [factorA, factorB] = key.split('|')
      const factorAMean = factorAMeans[factorA]?.length > 0
        ? ss.mean(factorAMeans[factorA])
        : grandMean
      const factorBMean = factorBMeans[factorB]?.length > 0
        ? ss.mean(factorBMeans[factorB])
        : grandMean

      const expected = factorAMean + factorBMean - grandMean
      ssInteraction += values.length * Math.pow(cellMean - expected, 2)
    }
  }

  // Degrees of freedom
  const dfFactorA = a - 1
  const dfFactorB = b - 1
  const dfInteraction = (a - 1) * (b - 1)
  const dfError = n - a * b

  // Mean squares
  const msFactorA = ssFactorA / dfFactorA
  const msFactorB = ssFactorB / dfFactorB
  const msInteraction = ssInteraction / dfInteraction
  const msError = ssError / Math.max(dfError, 1)

  // F-statistics
  const fFactorA = msFactorA / msError
  const fFactorB = msFactorB / msError
  const fInteraction = msInteraction / msError

  // p-values
  const pFactorA = fDistributionCDF(1 - fFactorA, dfFactorA, dfError)
  const pFactorB = fDistributionCDF(1 - fFactorB, dfFactorB, dfError)
  const pInteraction = fDistributionCDF(1 - fInteraction, dfInteraction, dfError)

  const anova: ANOVAResult[] = [
    {
      source: 'Factor A',
      sumOfSares: ssFactorA,
      degreesOfFreedom: dfFactorA,
      meanSquare: msFactorA,
      fValue: fFactorA,
      pValue: pFactorA,
    },
    {
      source: 'Factor B',
      sumOfSares: ssFactorB,
      degreesOfFreedom: dfFactorB,
      meanSquare: msFactorB,
      fValue: fFactorB,
      pValue: pFactorB,
    },
    {
      source: 'Interaction',
      sumOfSares: ssInteraction,
      degreesOfFreedom: dfInteraction,
      meanSquare: msInteraction,
      fValue: fInteraction,
      pValue: pInteraction,
    },
    {
      source: 'Error',
      sumOfSares: ssError,
      degreesOfFreedom: dfError,
      meanSquare: msError,
      fValue: NaN,
      pValue: NaN,
    },
  ]

  return {
    anova,
    significant: {
      factorA: pFactorA < 0.05,
      factorB: pFactorB < 0.05,
      interaction: pInteraction < 0.05,
    },
  }
}

// Utility functions

function tDistributionInverse(p: number, df: number): number {
  if (df > 100) {
    return ss.probit(p)
  }
  // Approximation
  const a = 1 / (df - 0.5)
  const b = 48 / Math.pow(df, 2)
  const t = Math.sqrt(df * (Math.exp(a * Math.pow(ss.probit(p), 2)) - 1))
  return t
}

function fDistributionCDF(f: number, df1: number, df2: number): number {
  if (f < 0) return 0
  // Use incomplete beta function approximation
  const x = df2 / (df2 + df1 * f)
  return incompleteBetaApprox(df2 / 2, df1 / 2, x)
}

function incompleteBetaApprox(a: number, b: number, x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  return Math.pow(x, a) * Math.pow(1 - x, b) * a / (a + b) * 5
}