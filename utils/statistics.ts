/**
 * Calculates the probability density function (PDF) of a normal distribution.
 */
export const normalPDF = (x: number, mean: number, stdDev: number): number => {
  if (stdDev === 0) return x === mean ? 1 : 0;
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
};

/**
 * Approximate Error function (erf).
 */
export const erf = (x: number): number => {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = (x < 0) ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
};

/**
 * Calculates the Cumulative Distribution Function (CDF) of a normal distribution.
 */
export const normalCDF = (x: number, mean: number, stdDev: number): number => {
  return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
};

/**
 * Gets the critical value (Z-score approximation) for a given alpha and tail configuration.
 * Note: Uses a simplified lookup for common values suitable for visualization.
 */
export function getCriticalValue(alpha: number, oneTailed: boolean): number {
  const p = oneTailed ? 1 - alpha : 1 - (alpha / 2);
  
  if (Math.abs(p - 0.95) < 0.001) return 1.645;
  if (Math.abs(p - 0.975) < 0.001) return 1.96;
  if (Math.abs(p - 0.99) < 0.001) return 2.33;
  if (Math.abs(p - 0.995) < 0.001) return 2.576;
  
  // Fallback linear approx for slider smoothness
  return 1.645 + (0.05 - alpha) * 10; 
}