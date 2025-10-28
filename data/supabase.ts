import { supabase } from '../supabaseClient';

export interface PlayerData {
  username: string;
  dead_count: number;
  current_level: number;
}

export interface LeaderboardEntry {
  username: string;
  dead_count: number;
}


// Save player data to Supabase, or store locally if offline
export const savePlayerData = async (username: string, deadCount: number, currentLevel: number): Promise<void> => {
  const playerData: PlayerData = {
    username,
    dead_count: deadCount,
    current_level: currentLevel,
  };

  if (navigator.onLine) {
    const { error } = await supabase
      .from('players')
      .upsert({ ...playerData, updated_at: new Date().toISOString() }, { onConflict: 'username' });

    if (error) {
      if (error.code !== 'NO_CREDS') {
        console.error('Error saving player data:', error.message);
      }
      saveOffline(playerData);
    } else {
      console.log('Player data saved successfully.');
    }
  } else {
    saveOffline(playerData);
  }
};

// Load player data from Supabase
export const loadPlayerData = async (username: string): Promise<PlayerData | null> => {
  if (!navigator.onLine) {
    console.warn("Offline mode: Cannot load data from server.");
    return getOffline();
  }
  
  const { data, error } = await supabase
    .from('players')
    .select('username, dead_count, current_level')
    .eq('username', username)
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
        .order('dead_count', { ascending: false }) // Higher death count is worse, so maybe order ascending? User asked for dashboard, this is a good start. Let's make it ascending.
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

const saveOffline = (playerData: PlayerData) => {
  console.log('Saving data locally for offline use.');
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(playerData));
};

export const getOffline = (): PlayerData | null => {
  const offlineData = localStorage.getItem(OFFLINE_STORAGE_KEY);
  return offlineData ? JSON.parse(offlineData) : null;
};

export const clearOffline = () => {
  localStorage.removeItem(OFFLINE_STORAGE_KEY);
};