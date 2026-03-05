import * as ss from 'simple-statistics'

export interface LinearRegressionResult {
  slope: number
  intercept: number
  rSquared: number
  adjustedRSquared: number
  standardError: number
  predictions: number[]
  residuals: number[]
  coefficients: {
    variable: string
    value: number
    standardError: number
    tValue: number
    pValue: number
  }[]
}

export interface MultipleRegressionResult {
  coefficients: {
    variable: string
    value: number
    standardError: number
    tValue: number
    pValue: number
  }[]
  rSquared: number
  adjustedRSquared: number
  standardError: number
  predictions: number[]
  residuals: number[]
  fStatistic: number
  fPValue: number
}

/**
 * Simple linear regression
 */
export function simpleLinearRegression(
  x: number[],
  y: number[],
  xName: string = 'X'
): LinearRegressionResult | null {
  if (x.length !== y.length || x.length < 3) return null

  const n = x.length
  const data = x.map((xi, i) => [xi, y[i]])

  // Calculate regression
  const regression = ss.linearRegression(data)
  const line = ss.linearRegressionLine(regression)

  // Predictions and residuals
  const predictions = x.map(xi => line(xi))
  const residuals = y.map((yi, i) => yi - predictions[i])

  // R-squared
  const yMean = ss.mean(y)
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
  const ssResidual = residuals.reduce((sum, r) => sum + r * r, 0)
  const rSquared = 1 - (ssResidual / ssTotal)

  // Adjusted R-squared
  const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - 2))

  // Standard error of estimate
  const standardError = Math.sqrt(ssResidual / (n - 2))

  // Standard error of slope
  const xMean = ss.mean(x)
  const ssX = x.reduce((sum, xi) => sum + Math.pow(xi - xMean, 2), 0)
  const seSlope = standardError / Math.sqrt(ssX)

  // Standard error of intercept
  const seIntercept = standardError * Math.sqrt(1 / n + (xMean * xMean) / ssX)

  // t-values
  const tSlope = regression.m / seSlope
  const tIntercept = regression.b / seIntercept

  // p-values (two-tailed)
  const df = n - 2
  const pSlope = 2 * (1 - tDistributionApprox(Math.abs(tSlope), df))
  const pIntercept = 2 * (1 - tDistributionApprox(Math.abs(tIntercept), df))

  return {
    slope: regression.m,
    intercept: regression.b,
    rSquared,
    adjustedRSquared,
    standardError,
    predictions,
    residuals,
    coefficients: [
      {
        variable: '(Intercept)',
        value: regression.b,
        standardError: seIntercept,
        tValue: tIntercept,
        pValue: pIntercept,
      },
      {
        variable: xName,
        value: regression.m,
        standardError: seSlope,
        tValue: tSlope,
        pValue: pSlope,
      },
    ],
  }
}

/**
 * Multiple linear regression using matrix operations
 */
export function multipleLinearRegression(
  X: number[][],  // Each row is an observation, each column is a variable
  y: number[],
  variableNames: string[] = []
): MultipleRegressionResult | null {
  const n = y.length
  const p = X[0]?.length || 0

  if (n < p + 1 || X.length !== n) return null

  // Add intercept column (all 1s)
  const XWithIntercept = X.map(row => [1, ...row])
  const k = p + 1  // Number of coefficients including intercept

  // Use normal equations: β = (X'X)^(-1) X'y
  const Xt = transpose(XWithIntercept)
  const XtX = matrixMultiply(Xt, XWithIntercept)
  const XtXInv = matrixInverse(XtX)
  const Xty = matrixVectorMultiply(Xt, y)
  const beta = matrixVectorMultiply(XtXInv, Xty)

  // Predictions
  const predictions = XWithIntercept.map(row =>
    row.reduce((sum, val, i) => sum + val * beta[i], 0)
  )

  // Residuals
  const residuals = y.map((yi, i) => yi - predictions[i])

  // R-squared
  const yMean = ss.mean(y)
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
  const ssResidual = residuals.reduce((sum, r) => sum + r * r, 0)
  const rSquared = 1 - (ssResidual / ssTotal)

  // Adjusted R-squared
  const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - k))

  // Standard error of estimate
  const standardError = Math.sqrt(ssResidual / (n - k))

  // Standard errors of coefficients
  const mse = ssResidual / (n - k)
  const varCovarMatrix = XtXInv.map(row => row.map(val => val * mse))

  const standardErrors = varCovarMatrix.map((row, i) => Math.sqrt(row[i]))

  // t-values and p-values
  const df = n - k
  const coefficients = beta.map((coef, i) => {
    const se = standardErrors[i]
    const tValue = coef / se
    const pValue = 2 * (1 - tDistributionApprox(Math.abs(tValue), df))

    return {
      variable: i === 0 ? '(Intercept)' : (variableNames[i - 1] || `X${i}`),
      value: coef,
      standardError: se,
      tValue,
      pValue,
    }
  })

  // F-statistic for overall significance
  const ssRegression = ssTotal - ssResidual
  const msRegression = ssRegression / (k - 1)
  const msResidual = ssResidual / (n - k)
  const fStatistic = msRegression / msResidual

  // F p-value (using chi-square approximation for large df)
  const fPValue = fDistributionApprox(fStatistic, k - 1, n - k)

  return {
    coefficients,
    rSquared,
    adjustedRSquared,
    standardError,
    predictions,
    residuals,
    fStatistic,
    fPValue,
  }
}

/**
 * Logistic regression for binary outcomes
 */
export interface LogisticRegressionResult {
  coefficients: {
    variable: string
    value: number
    oddsRatio: number
    standardError: number
    zValue: number
    pValue: number
  }[]
  logLikelihood: number
  aic: number
  predictions: number[]
}

export function logisticRegression(
  X: number[][],
  y: number[],  // Binary 0/1 values
  variableNames: string[] = [],
  maxIterations: number = 100
): LogisticRegressionResult | null {
  const n = y.length
  const p = X[0]?.length || 0

  if (n < p + 1 || X.length !== n) return null

  // Check y is binary
  if (!y.every(yi => yi === 0 || yi === 1)) return null

  // Add intercept column
  const XWithIntercept = X.map(row => [1, ...row])
  const k = p + 1

  // Initialize coefficients
  let beta: number[] = new Array(k).fill(0)

  // Iteratively reweighted least squares (IRLS)
  for (let iter = 0; iter < maxIterations; iter++) {
    // Calculate predicted probabilities
    const eta = XWithIntercept.map(row =>
      row.reduce((sum, val, i) => sum + val * beta[i], 0)
    )
    const p = eta.map(e => 1 / (1 + Math.exp(-e)))

    // Weights and working response
    const weights = p.map(pi => pi * (1 - pi))
    const z = eta.map((e, i) => e + (y[i] - p[i]) / weights[i])

    // Weighted least squares update
    const W = diagonalMatrix(weights)
    const Xt = transpose(XWithIntercept)
    const XtW = matrixMultiply(Xt, W)
    const XtWX = matrixMultiply(XtW, XWithIntercept)
    const XtWz = matrixVectorMultiply(XtW, z)

    try {
      const XtWXInv = matrixInverse(XtWX)
      const newBeta = matrixVectorMultiply(XtWXInv, XtWz)

      // Check convergence
      const diff = newBeta.reduce((sum, b, i) => sum + Math.abs(b - beta[i]), 0)
      beta = newBeta

      if (diff < 1e-6) break
    } catch {
      break
    }
  }

  // Calculate predictions
  const eta = XWithIntercept.map(row =>
    row.reduce((sum, val, i) => sum + val * beta[i], 0)
  )
  const predictions = eta.map(e => 1 / (1 + Math.exp(-e)))

  // Log-likelihood
  const logLikelihood = predictions.reduce((sum, pi, i) => {
    return sum + (y[i] * Math.log(pi + 1e-10) + (1 - y[i]) * Math.log(1 - pi + 1e-10))
  }, 0)

  // AIC
  const aic = -2 * logLikelihood + 2 * k

  // Standard errors using Hessian
  const pFinal = predictions
  const weightsFinal = pFinal.map(pi => pi * (1 - pi))
  const WFinal = diagonalMatrix(weightsFinal)
  const XtFinal = transpose(XWithIntercept)
  const XtWXFinal = matrixMultiply(matrixMultiply(XtFinal, WFinal), XWithIntercept)

  let standardErrors: number[]
  try {
    const XtWXInvFinal = matrixInverse(XtWXFinal)
    standardErrors = XtWXInvFinal.map((row, i) => Math.sqrt(row[i]))
  } catch {
    standardErrors = new Array(k).fill(Infinity)
  }

  // Coefficients with statistics
  const coefficients = beta.map((coef, i) => {
    const se = standardErrors[i]
    const oddsRatio = Math.exp(coef)
    const zValue = coef / se
    const pValue = 2 * (1 - ss.cumulativeStdNormalProbability(Math.abs(zValue)))

    return {
      variable: i === 0 ? '(Intercept)' : (variableNames[i - 1] || `X${i}`),
      value: coef,
      oddsRatio,
      standardError: se,
      zValue,
      pValue,
    }
  })

  return {
    coefficients,
    logLikelihood,
    aic,
    predictions,
  }
}

// Matrix utility functions

function transpose(A: number[][]): number[][] {
  return A[0].map((_, j) => A.map(row => row[j]))
}

function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const m = A.length
  const n = B[0].length
  const p = B.length
  const result: number[][] = []

  for (let i = 0; i < m; i++) {
    result[i] = []
    for (let j = 0; j < n; j++) {
      let sum = 0
      for (let k = 0; k < p; k++) {
        sum += A[i][k] * B[k][j]
      }
      result[i][j] = sum
    }
  }

  return result
}

function matrixVectorMultiply(A: number[][], v: number[]): number[] {
  return A.map(row => row.reduce((sum, val, i) => sum + val * v[i], 0))
}

function diagonalMatrix(diag: number[]): number[][] {
  const n = diag.length
  const result: number[][] = []
  for (let i = 0; i < n; i++) {
    result[i] = []
    for (let j = 0; j < n; j++) {
      result[i][j] = i === j ? diag[i] : 0
    }
  }
  return result
}

function matrixInverse(A: number[][]): number[][] {
  const n = A.length

  // Gauss-Jordan elimination
  const augmented: number[][] = A.map((row, i) => [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)])

  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k
      }
    }

    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]]

    // Check for singularity
    if (Math.abs(augmented[i][i]) < 1e-10) {
      throw new Error('Matrix is singular')
    }

    // Scale pivot row
    const pivot = augmented[i][i]
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot
    }

    // Eliminate column
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i]
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j]
        }
      }
    }
  }

  // Extract inverse
  return augmented.map(row => row.slice(n))
}

function tDistributionApprox(t: number, df: number): number {
  if (df > 100) {
    return ss.cumulativeStdNormalProbability(t)
  }
  // Simplified approximation
  const x = df / (df + t * t)
  return 1 - 0.5 * incompleteBetaApprox(df / 2, 0.5, x)
}

function incompleteBetaApprox(a: number, b: number, x: number): number {
  if (x === 0) return 0
  if (x === 1) return 1
  const coef = Math.pow(x, a) * Math.pow(1 - x, b)
  return coef * a / (a + b) * 5
}

function fDistributionApprox(f: number, df1: number, df2: number): number {
  // Approximate using chi-square
  if (f < 0) return 1
  const x = df2 / (df2 + df1 * f)
  return incompleteBetaApprox(df2 / 2, df1 / 2, x)
}