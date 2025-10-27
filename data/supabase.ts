import { supabase } from '../supabaseClient';

export interface PlayerData {
  username: string;
  dead_count: number;
  current_level: number;
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
      console.error('Error saving player data:', error.message);
      // If Supabase fails, save offline as a fallback
      saveOffline(playerData);
    } else {
      console.log('Player data saved successfully.');
    }
  } else {
    // Save data to localStorage if offline
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

  if (error && error.code !== 'PGRST116') { // PGRST116: 'exact one row not found'
    console.error('Error loading player data:', error.message);
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