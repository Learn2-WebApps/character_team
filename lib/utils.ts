/**
 * Converts a 5-point scale score to a 100-point scale.
 * Formula: ((score - 1) / 4) * 100
 */
export function convertTo100PointScale(score: number): number {
  const scaled = ((score - 1) / 4) * 100;
  // Limit between 0 and 100, and round
  return Math.min(100, Math.max(0, Math.round(scaled)));
}

/**
 * Calculates the difference between user score (100-point scale) and average value.
 */
export function getDifferenceFromAverage(userScore100: number, average: number): number {
  return userScore100 - average;
}
