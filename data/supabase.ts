
import { supabase } from '../supabaseClient';
import type { AuthError, User, PostgrestError } from '@supabase/supabase-js';

export interface PlayerData {
  user_id: string;
  username: string;
  dead_count: number;
  current_level: number;
}

export interface LeaderboardEntry {
  username: string;
  dead_count: number;
}

// --- AUTH FUNCTIONS ---

export const signUp = async (email: string, password: string, username: string): Promise<{ user: User | null; error: AuthError | null }> => {
  // First, check if username is already taken
  const { data: existingUser, error: fetchError } = await supabase
    .from('players')
    .select('username')
    .eq('username', username)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found, which is good
    return { user: null, error: { name: 'FetchError', message: 'Could not validate username.' } as AuthError };
  }

  if (existingUser) {
    return { user: null, error: { name: 'UsernameTaken', message: 'This username is already taken.' } as AuthError };
  }

  // If username is available, proceed with signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      }
    }
  });

  // If auth user created, create their player profile
  if (data.user && !error) {
    const { error: profileError } = await supabase.from('players').insert({
      user_id: data.user.id,
      username: username,
      dead_count: 0,
      current_level: 1,
    });

    if (profileError) {
      // This is a tricky state. The user exists in auth but not in players.
      // For simplicity, we'll return the error. A more robust solution might try to delete the auth user.
      console.error("Error creating player profile:", profileError);
      // FIX: Conversion of type 'PostgrestError' to type 'AuthError' may be a mistake because neither type sufficiently overlaps with the other.
      // Create a new error object that is compatible with AuthError.
      return { user: null, error: { name: 'ProfileCreationError', message: profileError.message } as unknown as AuthError };
    }
  }

  return { user: data.user, error };
}

export const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
}

export const signOut = async () => {
    return await supabase.auth.signOut();
}

export const updateUserPassword = async (newPassword: string) => {
    return await supabase.auth.updateUser({ password: newPassword });
}

export const updateUsername = async (userId: string, newUsername: string) => {
    return await supabase.from('players').update({ username: newUsername }).eq('user_id', userId);
}


// --- DATA FUNCTIONS ---

// Save player data to Supabase, or store locally if offline
// FIX: Added username to the function signature to ensure it's available for offline fallback saves.
export const savePlayerData = async (userId: string, deadCount: number, currentLevel: number, username: string): Promise<void> => {
  const playerData = {
    user_id: userId,
    username,
    dead_count: deadCount,
    current_level: currentLevel,
  };

  if (navigator.onLine) {
    const { error } = await supabase
      .from('players')
      .update({ dead_count: deadCount, current_level: currentLevel, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      if (error.code !== 'NO_CREDS') {
        console.error('Error saving player data:', error.message);
      }
      // FIX: The playerData object now includes the 'username' property, resolving the type error.
      saveOffline(playerData); // Save offline as a fallback
    } else {
      console.log('Player data saved successfully.');
    }
  } else {
    // FIX: With username passed in, we can directly save player data offline.
    saveOffline(playerData);
  }
};

// Load player data from Supabase
export const loadPlayerData = async (userId: string): Promise<Omit<PlayerData, 'user_id'> | null> => {
  if (!navigator.onLine) {
    console.warn("Offline mode: Cannot load data from server.");
    return getOffline();
  }
  
  const { data, error } = await supabase
    .from('players')
    .select('username, dead_count, current_level')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116' && error.code !== 'NO_CREDS') {
        console.error('Error loading player data:', error.message);
    }
    return null;
  }

  return data;
};

// Get leaderboard data
export const getLeaderboardData = async (): Promise<LeaderboardEntry[] | null> => {
    if (!navigator.onLine) {
        console.warn("Offline mode: Cannot load leaderboard.");
        return null;
    }

    const { data, error } = await supabase
        .from('players')
        .select('username, dead_count')
        .order('dead_count', { ascending: true })
        .limit(20);

    if (error) {
        if (error.code !== 'NO_CREDS') {
            console.error('Error loading leaderboard data:', error.message);
        }
        return null;
    }
    return data;
};


// --- OFFLINE HELPERS ---

const OFFLINE_STORAGE_KEY = 'crimsonShinobi_offlineData';

const saveOffline = (playerData: Omit<PlayerData, 'user_id'> & { user_id?: string }) => {
  console.log('Saving data locally for offline use.');
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(playerData));
};

export const getOffline = (): Omit<PlayerData, 'user_id'> | null => {
  const offlineData = localStorage.getItem(OFFLINE_STORAGE_KEY);
  return offlineData ? JSON.parse(offlineData) : null;
};

export const clearOffline = () => {
  localStorage.removeItem(OFFLINE_STORAGE_KEY);
};
