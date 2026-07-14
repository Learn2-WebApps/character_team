import { calculateScores, rankCharacters } from '../lib/scoring';
import { CHARACTER_PROFILES } from '../lib/constants';

// Box-Muller transform for normal distribution
function randomNormal(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
}

function runSimulation() {
  const trials = 1000;
  const uniformCounts: Record<string, number> = {};
  const normalCounts: Record<string, number> = {};

  // Initialize counts
  const keys = Object.keys(CHARACTER_PROFILES);
  keys.forEach(key => {
    uniformCounts[key] = 0;
    normalCounts[key] = 0;
  });

  // 1. Uniform Random Simulation
  for (let t = 0; t < trials; t++) {
    const answers: number[] = [];
    for (let q = 0; q < 40; q++) {
      // Uniform random integer between 1 and 5
      answers.push(Math.floor(Math.random() * 5) + 1);
    }
    const scores = calculateScores(answers);
    const ranks = rankCharacters(scores);
    const topCharacter = ranks[0];
    uniformCounts[topCharacter]++;
  }

  // 2. Normal Distribution Simulation (mean 3.2, sd 0.8)
  for (let t = 0; t < trials; t++) {
    const answers: number[] = [];
    for (let q = 0; q < 40; q++) {
      const val = Math.round(randomNormal(3.2, 0.8));
      const clampedVal = Math.max(1, Math.min(5, val));
      answers.push(clampedVal);
    }
    const scores = calculateScores(answers);
    const ranks = rankCharacters(scores);
    const topCharacter = ranks[0];
    normalCounts[topCharacter]++;
  }

  console.log("=== SIMULATION RESULTS ===");
  console.log("| 캐릭터 이름 | Uniform Count | Uniform % | Normal Count | Normal % |");
  console.log("|---|---|---|---|---|");

  keys.forEach(key => {
    const charName = CHARACTER_PROFILES[key].name;
    const uCount = uniformCounts[key];
    const uPct = ((uCount / trials) * 100).toFixed(1);
    const nCount = normalCounts[key];
    const nPct = ((nCount / trials) * 100).toFixed(1);
    console.log(`| ${charName} | ${uCount} | ${uPct}% | ${nCount} | ${nPct}% |`);
  });
}

runSimulation();
