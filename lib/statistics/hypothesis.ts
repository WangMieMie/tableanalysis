import * as ss from 'simple-statistics'

export interface TTestResult {
  tStatistic: number
  pValue: number
  degreesOfFreedom: number
  meanDifference: number
  confidenceInterval: {
    lower: number
    upper: number
  }
  significant: boolean
  alpha: number
}

/**
 * One-sample t-test
 * Tests if the mean of a sample differs from a known population mean
 */
export function oneSampleTTest(
  sample: number[],
  testValue: number,
  alpha: number = 0.05
): TTestResult | null {
  if (sample.length < 2) return null

  const n = sample.length
  const mean = ss.mean(sample)
  const sd = ss.standardDeviation(sample)
  const se = sd / Math.sqrt(n)

  // t-statistic
  const t = (mean - testValue) / se

  // degrees of freedom
  const df = n - 1

  // p-value (two-tailed)
  // Using the t-distribution CDF
  const pValue = 2 * (1 - tDistributionCDF(Math.abs(t), df))

  // Confidence interval
  const tCritical = tDistributionInverseCDF(1 - alpha / 2, df)
  const ciLower = mean - tCritical * se
  const ciUpper = mean + tCritical * se

  return {
    tStatistic: t,
    pValue,
    degreesOfFreedom: df,
    meanDifference: mean - testValue,
    confidenceInterval: {
      lower: ciLower,
      upper: ciUpper,
    },
    significant: pValue < alpha,
    alpha,
  }
}

/**
 * Paired samples t-test
 * Tests if the mean difference between paired observations is zero
 */
export function pairedTTest(
  sample1: number[],
  sample2: number[],
  alpha: number = 0.05
): TTestResult | null {
  if (sample1.length !== sample2.length || sample1.length < 2) return null

  // Calculate differences
  const differences = sample1.map((val, i) => val - sample2[i])

  // Run one-sample t-test on differences against 0
  return oneSampleTTest(differences, 0, alpha)
}

/**
 * Independent samples t-test (Welch's t-test)
 * Tests if two independent samples have the same mean
 */
export function independentTTest(
  sample1: number[],
  sample2: number[],
  alpha: number = 0.05
): TTestResult | null {
  if (sample1.length < 2 || sample2.length < 2) return null

  const n1 = sample1.length
  const n2 = sample2.length
  const mean1 = ss.mean(sample1)
  const mean2 = ss.mean(sample2)
  const var1 = ss.variance(sample1)
  const var2 = ss.variance(sample2)

  // Welch's t-test (unequal variances)
  const se = Math.sqrt(var1 / n1 + var2 / n2)
  const t = (mean1 - mean2) / se

  // Welch-Satterthwaite degrees of freedom
  const numerator = Math.pow(var1 / n1 + var2 / n2, 2)
  const denominator = Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1)
  const df = numerator / denominator

  // p-value (two-tailed)
  const pValue = 2 * (1 - tDistributionCDF(Math.abs(t), df))

  // Confidence interval
  const tCritical = tDistributionInverseCDF(1 - alpha / 2, df)
  const ciLower = (mean1 - mean2) - tCritical * se
  const ciUpper = (mean1 - mean2) + tCritical * se

  return {
    tStatistic: t,
    pValue,
    degreesOfFreedom: df,
    meanDifference: mean1 - mean2,
    confidenceInterval: {
      lower: ciLower,
      upper: ciUpper,
    },
    significant: pValue < alpha,
    alpha,
  }
}

/**
 * Approximate t-distribution CDF using normal approximation for large df
 * For small df, uses numerical integration approximation
 */
function tDistributionCDF(t: number, df: number): number {
  if (df > 100) {
    // Approximate with normal distribution for large df
    return ss.cumulativeStdNormalProbability(t)
  }

  // Use beta function approximation
  const x = df / (df + t * t)
  return 1 - 0.5 * incompleteBeta(df / 2, 0.5, x)
}

/**
 * Approximate inverse t-distribution CDF
 */
function tDistributionInverseCDF(p: number, df: number): number {
  if (df > 100) {
    // Approximate with normal distribution for large df
    return ss.probit(p)
  }

  // Use numerical approximation (Newton-Raphson)
  let t = p > 0.5 ? 1 : -1
  for (let i = 0; i < 100; i++) {
    const cdf = tDistributionCDF(t, df)
    const deriv = tDistributionPDF(t, df)
    const newT = t - (cdf - p) / deriv
    if (Math.abs(newT - t) < 1e-10) break
    t = newT
  }
  return t
}

/**
 * t-distribution PDF
 */
function tDistributionPDF(t: number, df: number): number {
  const coef = gamma((df + 1) / 2) / (Math.sqrt(df * Math.PI) * gamma(df / 2))
  return coef * Math.pow(1 + (t * t) / df, -(df + 1) / 2)
}

/**
 * Incomplete beta function approximation
 */
function incompleteBeta(a: number, b: number, x: number): number {
  if (x === 0) return 0
  if (x === 1) return 1

  // Use continued fraction expansion
  const maxIterations = 200
  const epsilon = 1e-10

  const qab = a + b
  const qap = a + 1
  const qam = a - 1
  let c = 1
  let d = 1 - (qab * x) / qap

  if (Math.abs(d) < epsilon) d = epsilon
  d = 1 / d
  let h = d

  for (let m = 1; m <= maxIterations; m++) {
    const m2 = 2 * m
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < epsilon) d = epsilon
    c = 1 + aa / c
    if (Math.abs(c) < epsilon) c = epsilon
    d = 1 / d
    h *= d * c

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < epsilon) d = epsilon
    c = 1 + aa / c
    if (Math.abs(c) < epsilon) c = epsilon
    d = 1 / d
    const delta = d * c
    h *= delta

    if (Math.abs(delta - 1) < epsilon) break
  }

  return (h * Math.pow(x, a) * Math.pow(1 - x, b)) / (a * beta(a, b))
}

/**
 * Beta function
 */
function beta(a: number, b: number): number {
  return (gamma(a) * gamma(b)) / gamma(a + b)
}

/**
 * Gamma function using Lanczos approximation
 */
function gamma(z: number): number {
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z))
  }

  z -= 1
  const g = 7
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ]

  let x = c[0]
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i)
  }

  const t = z + g + 0.5
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x
}

export interface NormalityTestResult {
  statistic: number
  pValue: number
  significant: boolean
  isNormal: boolean
}

/**
 * Shapiro-Wilk test for normality (simplified approximation)
 */
export function shapiroWilkTest(sample: number[]): NormalityTestResult | null {
  if (sample.length < 3 || sample.length > 5000) return null

  const n = sample.length
  const sorted = [...sample].sort((a, b) => a - b)
  const mean = ss.mean(sample)

  // Calculate W statistic
  const s2 = sample.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0)

  // Simplified coefficients (approximation)
  const m = sorted.map((_, i) => {
    const p = (i + 1 - 0.375) / (n + 0.25)
    return ss.probit(p)
  })

  const mSum = m.reduce((sum, mi) => sum + mi * mi, 0)
  const a = m.map(mi => mi / Math.sqrt(mSum))

  const numerator = sorted.reduce((sum, xi, i) => sum + a[i] * xi, 0)
  const W = (numerator * numerator) / s2

  // Approximate p-value (simplified)
  const mu = 0.0038915 * Math.pow(Math.log(n), 3) - 0.083751 * Math.pow(Math.log(n), 2) - 0.31082 * Math.log(n) - 1.5861
  const sigma = Math.exp(0.0030302 * Math.pow(Math.log(n), 2) - 0.082676 * Math.log(n) - 0.4803)
  const z = (Math.log(1 - W) - mu) / sigma
  const pValue = 1 - ss.cumulativeStdNormalProbability(z)

  return {
    statistic: W,
    pValue,
    significant: pValue < 0.05,
    isNormal: pValue >= 0.05,
  }
}