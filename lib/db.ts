import { supabase, isSupabaseConfigured } from './supabase';

export interface Session {
  id: string;
  entry_code: string;
  instructor_id: string | null;
  created_at: string;
}

export interface Participant {
  id: string;
  session_id: string;
  name: string;
  affiliation: string;
  team_number: number;
  answers: number[] | null;
  scores: { O: number; C: number; E: number; A: number; N: number } | null;
  character_key: string | null;
  character_ranks: string[] | null;
  assigned_role: string | null;
  is_ready: boolean;
  created_at: string;
}

// Custom event key for in-tab mock database updates
const MOCK_DB_EVENT = 'team-party-mock-db-update';

// --- LocalStorage Mock Implementations ---

function getMockSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('team_party_sessions');
  return data ? JSON.parse(data) : [];
}

function saveMockSessions(sessions: Session[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('team_party_sessions', JSON.stringify(sessions));
}

function getMockParticipants(): Participant[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('team_party_participants');
  return data ? JSON.parse(data) : [];
}

function saveMockParticipants(participants: Participant[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('team_party_participants', JSON.stringify(participants));
  // Dispatch event for other listeners in the same tab
  window.dispatchEvent(new Event(MOCK_DB_EVENT));
}

// --- Unified Database Services ---

/**
 * Fetches a session by its entry code.
 */
export async function getSessionByCode(entryCode: string): Promise<Session | null> {
  const code = entryCode.trim().toUpperCase();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('entry_code', code)
      .maybeSingle();

    if (error) {
      console.error("Error fetching session:", error);
      return null;
    }
    return data;
  } else {
    // Mock DB Fallback
    const sessions = getMockSessions();
    return sessions.find(s => s.entry_code === code) || null;
  }
}

/**
 * Creates a new session with an entry code.
 */
export async function createSession(entryCode: string, instructorId: string | null = null): Promise<Session> {
  const code = entryCode.trim().toUpperCase();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('sessions')
      .insert([{ entry_code: code, instructor_id: instructorId || null }])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } else {
    // Mock DB Fallback
    const newSession: Session = {
      id: crypto.randomUUID(),
      entry_code: code,
      instructor_id: instructorId || null,
      created_at: new Date().toISOString()
    };
    const sessions = getMockSessions();
    sessions.push(newSession);
    saveMockSessions(sessions);
    return newSession;
  }
}

/**
 * Fetches all participants in a session.
 */
export async function getParticipants(sessionId: string): Promise<Participant[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', sessionId);

    if (error) {
      console.error("Error fetching participants:", error);
      return [];
    }
    return data || [];
  } else {
    // Mock DB Fallback
    const participants = getMockParticipants();
    return participants.filter(p => p.session_id === sessionId);
  }
}

/**
 * Add a participant to a session.
 */
export async function joinSession(
  sessionId: string,
  name: string,
  affiliation: string,
  teamNumber: number
): Promise<Participant> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('participants')
      .insert([{
        session_id: sessionId,
        name: name.trim(),
        affiliation: affiliation.trim(),
        team_number: teamNumber,
        is_ready: false
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } else {
    // Mock DB Fallback
    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      name: name.trim(),
      affiliation: affiliation.trim(),
      team_number: teamNumber,
      answers: null,
      scores: null,
      character_key: null,
      character_ranks: null,
      assigned_role: null,
      is_ready: false,
      created_at: new Date().toISOString()
    };

    const participants = getMockParticipants();
    participants.push(newParticipant);
    saveMockParticipants(participants);
    return newParticipant;
  }
}

/**
 * Updates an existing participant.
 */
export async function updateParticipant(
  participantId: string,
  updates: Partial<Omit<Participant, 'id' | 'session_id'>>
): Promise<Participant> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('participants')
      .update(updates)
      .eq('id', participantId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } else {
    // Mock DB Fallback
    const participants = getMockParticipants();
    const index = participants.findIndex(p => p.id === participantId);
    if (index === -1) {
      throw new Error("Participant not found");
    }

    const updatedParticipant = {
      ...participants[index],
      ...updates
    };

    participants[index] = updatedParticipant;
    saveMockParticipants(participants);
    return updatedParticipant;
  }
}

/**
 * Subscribe to participant updates in real-time.
 * Returns an unsubscribe function.
 */
export function subscribeToParticipants(
  sessionId: string,
  callback: (participants: Participant[]) => void
): () => void {
  if (isSupabaseConfigured && supabase) {
    // Initial fetch
    getParticipants(sessionId).then(callback);

    // Setup postgres changes subscription
    const channel = supabase
      .channel(`participants:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `session_id=eq.${sessionId}`
        },
        async () => {
          // Fetch complete list on change and notify callback
          const updated = await getParticipants(sessionId);
          callback(updated);
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  } else {
    // LocalStorage fallback subscription
    const handleUpdate = () => {
      const all = getMockParticipants();
      const filtered = all.filter(p => p.session_id === sessionId);
      callback(filtered);
    };

    // Initial trigger
    handleUpdate();

    // Listen to changes in the same tab
    window.addEventListener(MOCK_DB_EVENT, handleUpdate);

    // Listen to changes in other tabs (cross-tab sync)
    const handleCrossTabUpdate = (e: StorageEvent) => {
      if (e.key === 'team_party_participants') {
        handleUpdate();
      }
    };
    window.addEventListener('storage', handleCrossTabUpdate);

    return () => {
      window.removeEventListener(MOCK_DB_EVENT, handleUpdate);
      window.removeEventListener('storage', handleCrossTabUpdate);
    };
  }
}

/**
 * Fetches a single participant by ID.
 */
export async function getParticipantById(participantId: string): Promise<Participant | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching participant by ID:", error);
      return null;
    }
    return data;
  } else {
    // Mock DB Fallback
    const participants = getMockParticipants();
    return participants.find(p => p.id === participantId) || null;
  }
}

/**
 * Deletes a session and all its participants.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // Delete participants in this session first to ensure constraint cleanliness
    const { error: partError } = await supabase
      .from('participants')
      .delete()
      .eq('session_id', sessionId);
    if (partError) {
      console.error("Error deleting participants during session delete:", partError);
    }

    // Delete the session itself
    const { error: sessError } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);
    if (sessError) {
      throw sessError;
    }
  } else {
    // Mock DB Fallback
    const sessions = getMockSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    saveMockSessions(filteredSessions);

    const participants = getMockParticipants();
    const filteredParticipants = participants.filter(p => p.session_id !== sessionId);
    saveMockParticipants(filteredParticipants);
    
    // Dispatch event to sync UI in other tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(MOCK_DB_EVENT));
    }
  }
}

