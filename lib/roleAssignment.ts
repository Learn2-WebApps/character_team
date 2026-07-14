export interface ParticipantInfo {
  id: string;
  name: string;
  character_ranks: string[]; // Top 3 character keys, e.g. ["navigator", "solver", "idea_bank"]
}

export interface RoleAssignmentResult {
  participantId: string;
  assignedRole: string; // Key of the role (e.g. "mic", "leader")
}

// Candidate character keys for each standard role
export const ROLE_CANDIDATES: Record<string, string[]> = {
  mic: ["energizer", "idea_bank"],
  leader: ["navigator", "pioneer"],
  guard: ["solver", "observer"],
  timer: ["pro_planner", "firefighter"],
  item: ["detail_master", "early_adopter"],
  recorder: ["peacemaker", "network_builder"],
  housekeeper: ["pro_planner", "firefighter", "detail_master", "early_adopter"]
};

/**
 * Gets the list of active roles and their candidate mappings for a specific team size.
 */
export function getActiveRolesForTeamSize(size: number): { roleKey: string; candidates: string[] }[] {
  if (size === 6) {
    return [
      { roleKey: "mic", candidates: ROLE_CANDIDATES.mic },
      { roleKey: "leader", candidates: ROLE_CANDIDATES.leader },
      { roleKey: "guard", candidates: ROLE_CANDIDATES.guard },
      { roleKey: "timer", candidates: ROLE_CANDIDATES.timer },
      { roleKey: "item", candidates: ROLE_CANDIDATES.item },
      { roleKey: "recorder", candidates: ROLE_CANDIDATES.recorder }
    ];
  } else if (size === 5) {
    return [
      { roleKey: "mic", candidates: ROLE_CANDIDATES.mic },
      { roleKey: "leader", candidates: ROLE_CANDIDATES.leader },
      { roleKey: "guard", candidates: ROLE_CANDIDATES.guard },
      { roleKey: "housekeeper", candidates: ROLE_CANDIDATES.housekeeper },
      { roleKey: "recorder", candidates: ROLE_CANDIDATES.recorder }
    ];
  } else if (size === 4) {
    return [
      { roleKey: "mic", candidates: ROLE_CANDIDATES.mic },
      // Leader combines Leader and Guard candidate pools
      { roleKey: "leader", candidates: [...ROLE_CANDIDATES.leader, ...ROLE_CANDIDATES.guard] },
      { roleKey: "housekeeper", candidates: ROLE_CANDIDATES.housekeeper },
      { roleKey: "recorder", candidates: ROLE_CANDIDATES.recorder }
    ];
  } else {
    // size === 3 or fallback
    return [
      { roleKey: "mic", candidates: ROLE_CANDIDATES.mic },
      // Leader combines Leader, Guard, and Recorder candidate pools
      { roleKey: "leader", candidates: [...ROLE_CANDIDATES.leader, ...ROLE_CANDIDATES.guard, ...ROLE_CANDIDATES.recorder] },
      { roleKey: "housekeeper", candidates: ROLE_CANDIDATES.housekeeper }
    ];
  }
}

/**
 * Assigns roles to team members.
 * Uses a deterministic permutation search to maximize:
 * 1. Number of 1st-rank character matches.
 * 2. Number of 2nd-rank character matches.
 * 3. Number of 3rd-rank character matches.
 * Remaining ties are broken deterministically by sorting.
 */
export function assignRoles(participants: ParticipantInfo[]): Record<string, string> {
  const size = participants.length;
  if (size === 0) return {};

  // Sort participants by ID to ensure deterministic order for stable permutation evaluation
  const sortedParticipants = [...participants].sort((a, b) => a.id.localeCompare(b.id));

  // Determine active roles for this group size
  let activeRoles = getActiveRolesForTeamSize(size);

  // Fallback for team size > 6
  // We fill roles with standard 6, and assign "supporter" to the rest
  let extraParticipants: ParticipantInfo[] = [];
  let matchingParticipants = [...sortedParticipants];

  if (size > 6) {
    activeRoles = getActiveRolesForTeamSize(6);
    matchingParticipants = sortedParticipants.slice(0, 6);
    extraParticipants = sortedParticipants.slice(6);
  }

  // Generate all permutations of assigning roles to matchingParticipants
  const pCount = matchingParticipants.length;
  const bestAssignment: string[] = new Array(pCount).fill("");
  let maxScoreVector = [-1, -1, -1]; // [count1st, count2nd, count3rd]
  let bestDeterministicKey = "";

  // Helper to generate permutations recursively
  const usedRoles = new Array(pCount).fill(false);
  const currentRoles: string[] = new Array(pCount).fill("");

  function permute(pIndex: number) {
    if (pIndex === pCount) {
      // Evaluate current assignment
      let count1st = 0;
      let count2nd = 0;
      let count3rd = 0;

      for (let i = 0; i < pCount; i++) {
        const participant = matchingParticipants[i];
        const roleKey = currentRoles[i];
        const roleInfo = activeRoles.find(r => r.roleKey === roleKey);
        if (!roleInfo) continue;

        const firstRank = participant.character_ranks[0];
        const secondRank = participant.character_ranks[1];
        const thirdRank = participant.character_ranks[2];

        if (roleInfo.candidates.includes(firstRank)) {
          count1st++;
        } else if (secondRank && roleInfo.candidates.includes(secondRank)) {
          count2nd++;
        } else if (thirdRank && roleInfo.candidates.includes(thirdRank)) {
          count3rd++;
        }
      }

      // Check if current permutation is lexicographically better
      let isBetter = false;
      if (count1st > maxScoreVector[0]) {
        isBetter = true;
      } else if (count1st === maxScoreVector[0]) {
        if (count2nd > maxScoreVector[1]) {
          isBetter = true;
        } else if (count2nd === maxScoreVector[1]) {
          if (count3rd > maxScoreVector[2]) {
            isBetter = true;
          } else if (count3rd === maxScoreVector[2]) {
            // Tie-break: pick the one with lexicographically smaller concatenated role keys
            const key = currentRoles.join("_");
            if (bestDeterministicKey === "" || key.localeCompare(bestDeterministicKey) < 0) {
              isBetter = true;
            }
          }
        }
      }

      if (isBetter) {
        maxScoreVector = [count1st, count2nd, count3rd];
        bestDeterministicKey = currentRoles.join("_");
        for (let i = 0; i < pCount; i++) {
          bestAssignment[i] = currentRoles[i];
        }
      }
      return;
    }

    for (let rIndex = 0; rIndex < pCount; rIndex++) {
      if (!usedRoles[rIndex]) {
        usedRoles[rIndex] = true;
        currentRoles[pIndex] = activeRoles[rIndex].roleKey;
        permute(pIndex + 1);
        usedRoles[rIndex] = false;
      }
    }
  }

  // Run permutation search
  permute(0);

  // Construct mapping
  const result: Record<string, string> = {};
  for (let i = 0; i < pCount; i++) {
    result[matchingParticipants[i].id] = bestAssignment[i];
  }

  // Assign "supporter" to any extra participants (if team size > 6)
  for (const p of extraParticipants) {
    result[p.id] = "supporter"; // Fallback role key
  }

  return result;
}
