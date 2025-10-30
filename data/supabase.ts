import { supabase } from '../supabaseClient';
import type { AuthError, User, PostgrestError } from '@supabase/supabase-js';
import type { PlayerProfile } from '../types';

export interface PlayerData extends PlayerProfile {
  user_id: string;
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
    if (fetchError.message === 'Supabase not configured') {
        return { user: null, error: { name: 'OfflineError', message: 'Supabase not configured' } as AuthError };
    }
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
      tutorial_complete: false,
      max_level_unlocked: 1,
    });

    if (profileError) {
      // This is a tricky state. The user exists in auth but not in players.
      // For simplicity, we'll return the error. A more robust solution might try to delete the auth user.
      console.error("Error creating player profile:", profileError);
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
    // In offline mode, this will fail gracefully but we need to update local storage.
    if(userId === 'offline_user') {
      const offlineData = getOffline();
      if(offlineData) {
        saveOfflineProfile({ ...offlineData, username: newUsername });
      }
       return { error: null };
    }
    return await supabase.from('players').update({ username: newUsername }).eq('user_id', userId);
}


// --- DATA FUNCTIONS ---

// Save player data to Supabase, or store locally if offline
export const savePlayerData = async (userId: string, profile: PlayerProfile): Promise<void> => {
  if(userId === 'offline_user') {
    saveOfflineProfile(profile);
    return;
  }
  
  if (navigator.onLine) {
    const { error } = await supabase
      .from('players')
      .update({ 
          dead_count: profile.dead_count, 
          current_level: profile.current_level, 
          tutorial_complete: profile.tutorial_complete,
          max_level_unlocked: profile.max_level_unlocked,
          updated_at: new Date().toISOString() 
        })
      .eq('user_id', userId);

    if (error) {
      if (error.code !== 'NO_CREDS') {
        console.error('Error saving player data:', error.message);
      }
      saveOfflineProfile(profile);
    } else {
      console.log('Player data saved successfully.');
    }
  } else {
    saveOfflineProfile(profile);
  }
};

// Load player data from Supabase
export const loadPlayerData = async (userId: string): Promise<PlayerProfile | null> => {
  if (!navigator.onLine) {
    console.warn("Offline mode: Loading local data.");
    return getOffline();
  }
  
  const { data, error } = await supabase
    .from('players')
    .select('username, dead_count, current_level, tutorial_complete, max_level_unlocked')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If Supabase is not configured, fall back to offline storage.
    if (error.message === 'Supabase not configured') {
      return getOffline();
    }
    if (error.code !== 'PGRST116') {
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
        return [];
    }

    const { data, error } = await supabase
        .from('players')
        .select('username, dead_count')
        .order('dead_count', { ascending: true })
        .limit(20);

    if (error) {
        if (error.message === 'Supabase not configured') {
          return [];
        }
        console.error('Error loading leaderboard data:', error.message);
        return null;
    }
    return data;
};


// --- OFFLINE HELPERS ---

const OFFLINE_STORAGE_KEY = 'crimsonShinobi_offlineData';

export const saveOfflineProfile = (playerData: PlayerProfile) => {
  console.log('Saving data locally for offline use.');
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(playerData));
};

export const getOffline = (): PlayerProfile | null => {
  const offlineData = localStorage.getItem(OFFLINE_STORAGE_KEY);
  return offlineData ? JSON.parse(offlineData) : null;
};

export const clearOffline = () => {
  localStorage.removeItem(OFFLINE_STORAGE_KEY);
};