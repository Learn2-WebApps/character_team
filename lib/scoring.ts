import { CHARACTER_PROFILES } from './constants';

export interface Big5Scores {
  O: number;
  C: number;
  E: number;
  A: number;
  N: number;
}

// 1-based question indexes that require reverse scoring (6 - response)
const REVERSE_QUESTIONS = new Set([
  6, 7,        // O
  13, 14, 16,  // C
  21, 22, 24,  // E
  29, 30,      // A
  37, 38, 40   // N
]);

/**
 * Calculates Big 5 scores from a list of 40 answers (1-5).
 * @param answers Array of 40 numbers (1-5), 0-indexed corresponding to Q1-Q40.
 */
export function calculateScores(answers: number[]): Big5Scores {
  if (answers.length !== 40) {
    throw new Error(`Expected exactly 40 answers, got ${answers.length}`);
  }

  const factorSums = { O: 0, C: 0, E: 0, A: 0, N: 0 };

  for (let i = 0; i < 40; i++) {
    const qNum = i + 1;
    let val = answers[i];

    // Input validation
    if (val < 1 || val > 5) {
      val = 3; // Fallback default to neutral
    }

    if (REVERSE_QUESTIONS.has(qNum)) {
      val = 6 - val;
    }

    // Determine factor based on question number (1-indexed)
    // O: 1-8, C: 9-16, E: 17-24, A: 25-32, N: 33-40
    if (qNum >= 1 && qNum <= 8) {
      factorSums.O += val;
    } else if (qNum >= 9 && qNum <= 16) {
      factorSums.C += val;
    } else if (qNum >= 17 && qNum <= 24) {
      factorSums.E += val;
    } else if (qNum >= 25 && qNum <= 32) {
      factorSums.A += val;
    } else if (qNum >= 33 && qNum <= 40) {
      factorSums.N += val;
    }
  }

  return {
    O: parseFloat((factorSums.O / 8).toFixed(3)),
    C: parseFloat((factorSums.C / 8).toFixed(3)),
    E: parseFloat((factorSums.E / 8).toFixed(3)),
    A: parseFloat((factorSums.A / 8).toFixed(3)),
    N: parseFloat((factorSums.N / 8).toFixed(3))
  };
}

/**
 * Calculates the Euclidean distance between two 5-dimensional vectors.
 */
export function calculateDistance(vec1: Big5Scores, vec2: Big5Scores): number {
  return Math.sqrt(
    Math.pow(vec1.O - vec2.O, 2) +
    Math.pow(vec1.C - vec2.C, 2) +
    Math.pow(vec1.E - vec2.E, 2) +
    Math.pow(vec1.A - vec2.A, 2) +
    Math.pow(vec1.N - vec2.N, 2)
  );
}

/**
 * Ranks all 12 characters based on proximity (Euclidean distance) to the calculated scores.
 * Returns the character keys sorted from closest (1st rank) to furthest.
 */
export function rankCharacters(scores: Big5Scores): string[] {
  const charactersWithDistance = Object.values(CHARACTER_PROFILES).map(profile => {
    const dist = calculateDistance(scores, profile.scores);
    return { key: profile.key, distance: dist };
  });

  // Sort by distance ascending
  charactersWithDistance.sort((a, b) => a.distance - b.distance);

  return charactersWithDistance.map(item => item.key);
}
