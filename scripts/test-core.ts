import { calculateScores, rankCharacters } from '../lib/scoring';
import { assignRoles, ParticipantInfo } from '../lib/roleAssignment';
import { CHARACTER_PROFILES } from '../lib/constants';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function testScoring() {
  console.log("=== Testing Scoring & Character Matching ===");

  // 1. Let's test a mock participant's answers
  // Assume all answers are 3 (neutral)
  // Scores should be 3 for all factors
  const allNeutralAnswers = new Array(40).fill(3);
  const neutralScores = calculateScores(allNeutralAnswers);
  console.log("Neutral scores (expected all 3):", neutralScores);
  assert(neutralScores.O === 3, "O should be 3");
  assert(neutralScores.C === 3, "C should be 3");
  assert(neutralScores.E === 3, "E should be 3");
  assert(neutralScores.A === 3, "A should be 3");
  assert(neutralScores.N === 3, "N should be 3");

  // 2. Test reverse questions
  // E reverse questions are: 21, 22, 24 (index 20, 21, 23)
  // Let's set E normal questions (17, 18, 19, 20, 23) to 5
  // and E reverse questions (21, 22, 24) to 1
  // If reverse works, reversed answers will be 6 - 1 = 5
  // Average E should be (5*5 + 5*3)/8 = 5!
  const customAnswers = new Array(40).fill(3);
  // Set E normal questions to 5
  customAnswers[16] = 5; // Q17
  customAnswers[17] = 5; // Q18
  customAnswers[18] = 5; // Q19
  customAnswers[19] = 5; // Q20
  customAnswers[22] = 5; // Q23
  // Set E reverse questions to 1
  customAnswers[20] = 1; // Q21
  customAnswers[21] = 1; // Q22
  customAnswers[23] = 1; // Q24

  const scores = calculateScores(customAnswers);
  console.log("E factor scores (expected 5.0):", scores.E);
  assert(scores.E === 5.0, `E factor score should be 5.0, got ${scores.E}`);

  // 3. Test character ranking
  // If we match exactly navigator's profile: { O:4.5, C:4.3, E:3.3, A:3.0, N:2.3 }
  // It should return 'navigator' as the 1st rank
  const exactNavigatorScores = { O: 4.5, C: 4.3, E: 3.3, A: 3.0, N: 2.3 };
  const ranks = rankCharacters(exactNavigatorScores);
  console.log("Ranks for exact Navigator scores (expected navigator first):", ranks.slice(0, 3));
  assert(ranks[0] === 'navigator', "1st rank character must be navigator");

  console.log("Scoring tests passed successfully!\n");
}

function testRoleAssignment() {
  console.log("=== Testing Role Assignment (Deterministic & Non-overlapping) ===");

  // 1. Group of 6 participants
  const participants6: ParticipantInfo[] = [
    { id: "p1", name: "Alice", character_ranks: ["energizer", "idea_bank", "navigator"] },     // Candidates for mic, mic, leader
    { id: "p2", name: "Bob", character_ranks: ["navigator", "pioneer", "solver"] },          // Candidates for leader, leader, guard
    { id: "p3", name: "Charlie", character_ranks: ["solver", "observer", "pro_planner"] },    // Candidates for guard, guard, timer
    { id: "p4", name: "David", character_ranks: ["pro_planner", "firefighter", "peacemaker"] }, // Candidates for timer, timer, recorder
    { id: "p5", name: "Eve", character_ranks: ["detail_master", "early_adopter", "energizer"] }, // Candidates for item, item, mic
    { id: "p6", name: "Frank", character_ranks: ["peacemaker", "network_builder", "solver"] }  // Candidates for recorder, recorder, guard
  ];

  const assignedRoles6 = assignRoles(participants6);
  console.log("6-Member Assignment:", assignedRoles6);

  // Check unique values
  const rolesSet6 = new Set(Object.values(assignedRoles6));
  assert(rolesSet6.size === 6, "All 6 participants should have unique roles");
  assert(assignedRoles6["p1"] === "mic", "Alice should be mic");
  assert(assignedRoles6["p2"] === "leader", "Bob should be leader");
  assert(assignedRoles6["p3"] === "guard", "Charlie should be guard");
  assert(assignedRoles6["p4"] === "timer", "David should be timer");
  assert(assignedRoles6["p5"] === "item", "Eve should be item");
  assert(assignedRoles6["p6"] === "recorder", "Frank should be recorder");

  // 2. Group of 5 participants (timer + item -> housekeeper)
  const participants5: ParticipantInfo[] = [
    { id: "p1", name: "Alice", character_ranks: ["energizer", "idea_bank", "navigator"] },
    { id: "p2", name: "Bob", character_ranks: ["navigator", "pioneer", "solver"] },
    { id: "p3", name: "Charlie", character_ranks: ["solver", "observer", "pro_planner"] },
    { id: "p4", name: "David", character_ranks: ["pro_planner", "firefighter", "peacemaker"] }, // Candidate for housekeeper (pro_planner)
    { id: "p5", name: "Eve", character_ranks: ["peacemaker", "network_builder", "solver"] }
  ];

  const assignedRoles5 = assignRoles(participants5);
  console.log("5-Member Assignment:", assignedRoles5);
  const rolesSet5 = new Set(Object.values(assignedRoles5));
  assert(rolesSet5.size === 5, "All 5 participants should have unique roles");
  assert(rolesSet5.has("housekeeper"), "Should have housekeeper role assigned");
  assert(!rolesSet5.has("timer"), "Should NOT have timer role");
  assert(!rolesSet5.has("item"), "Should NOT have item role");

  // 3. Group of 4 participants (leader + guard -> leader)
  const participants4: ParticipantInfo[] = [
    { id: "p1", name: "Alice", character_ranks: ["energizer", "idea_bank", "navigator"] },
    { id: "p2", name: "Bob", character_ranks: ["navigator", "pioneer", "solver"] },
    { id: "p3", name: "Charlie", character_ranks: ["pro_planner", "firefighter", "peacemaker"] }, // Housekeeper
    { id: "p4", name: "David", character_ranks: ["peacemaker", "network_builder", "solver"] }
  ];

  const assignedRoles4 = assignRoles(participants4);
  console.log("4-Member Assignment:", assignedRoles4);
  const rolesSet4 = new Set(Object.values(assignedRoles4));
  assert(rolesSet4.size === 4, "All 4 participants should have unique roles");
  assert(rolesSet4.has("leader") && rolesSet4.has("mic") && rolesSet4.has("housekeeper") && rolesSet4.has("recorder"), "Should have leader, mic, housekeeper, recorder");
  assert(!rolesSet4.has("guard"), "Should NOT have guard role");

  // 4. Group of 3 participants
  const participants3: ParticipantInfo[] = [
    { id: "p1", name: "Alice", character_ranks: ["energizer", "idea_bank", "navigator"] }, // mic
    { id: "p2", name: "Bob", character_ranks: ["navigator", "pioneer", "solver"] }, // leader
    { id: "p3", name: "Charlie", character_ranks: ["pro_planner", "firefighter", "peacemaker"] } // housekeeper
  ];

  const assignedRoles3 = assignRoles(participants3);
  console.log("3-Member Assignment:", assignedRoles3);
  const rolesSet3 = new Set(Object.values(assignedRoles3));
  assert(rolesSet3.size === 3, "All 3 participants should have unique roles");

  // 5. Test tie-breaking determinism
  // Let's create an assignment where two participants have identical ranks
  const participantsTie: ParticipantInfo[] = [
    { id: "p1", name: "Alice", character_ranks: ["energizer", "idea_bank", "navigator"] },
    { id: "p2", name: "Bob", character_ranks: ["energizer", "idea_bank", "navigator"] },
    { id: "p3", name: "Charlie", character_ranks: ["pro_planner", "firefighter", "peacemaker"] }
  ];
  // P1 and P2 compete for 'mic' (energizer)
  // Let's run assignment twice to make sure it's 100% stable and deterministic
  const run1 = assignRoles(participantsTie);
  const run2 = assignRoles(participantsTie);
  console.log("Tie assignment run 1:", run1);
  assert(JSON.stringify(run1) === JSON.stringify(run2), "Assignments must be 100% deterministic and identical");

  console.log("Role assignment tests passed successfully!\n");
}

try {
  testScoring();
  testRoleAssignment();
  console.log("All unit tests passed!");
} catch (e: any) {
  console.error("Test failed with error:", e.message);
  process.exit(1);
}
