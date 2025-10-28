
import React, { useState, useCallback, useEffect } from 'react';
import type { GameStatus } from './types';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { savePlayerData, loadPlayerData, clearOffline, signOut } from './data/supabase';
import Game from './components/Game';
import StartScreen from './components/ui/StartScreen';
import EndScreen from './components/ui/EndScreen';
import LoadingScreen from './components/ui/LoadingScreen';
import LoginScreen from './components/ui/LoginScreen';
import AboutScreen from './components/ui/AboutScreen';
import LevelsScreen from './components/ui/LevelsScreen';
import SettingsScreen from './components/ui/SettingsScreen';
import LevelCompleteScreen from './components/ui/LevelCompleteScreen';
import LeaderboardScreen from './components/ui/LeaderboardScreen';
import { ALL_LEVELS } from './constants';

interface PlayerProfile {
    username: string;
    current_level: number;
    dead_count: number;
}

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [gameKey, setGameKey] = useState(0);

  // --- AUTH & SESSION MANAGEMENT ---
  useEffect(() => {
    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setGameStatus('login');
      } else {
        setGameStatus('loadingData');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
       if (!session) {
         setPlayerProfile(null);
         setGameStatus('login');
       } else if (_event === 'SIGNED_IN') {
         setGameStatus('loadingData');
       }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- DATA LOADING ---
  useEffect(() => {
    const loadData = async () => {
      if (gameStatus === 'loadingData' && session?.user) {
        const data = await loadPlayerData(session.user.id);
        if (data) {
          setPlayerProfile(data);
        } else {
            // This might happen if profile creation failed after signup.
            // Forcing logout so they can try again.
            console.error("Failed to load player profile, logging out.");
            signOut();
            return;
        }
        setGameStatus('start');
      }
    };
    loadData();
  }, [gameStatus, session]);
  

  const updatePlayerProfile = (updates: Partial<PlayerProfile>) => {
      if (playerProfile) {
          setPlayerProfile(prev => prev ? { ...prev, ...updates } : null);
      }
  };

  // --- GAME STATE HANDLERS ---
  const handleLoginSuccess = () => {
    setGameStatus('loadingData');
  };

  const startGame = useCallback(async (level: number) => {
    if (playerProfile && session) {
      const newProfile = { ...playerProfile, current_level: level };
      setPlayerProfile(newProfile);
      // FIX: Pass username to savePlayerData to support offline saving.
      await savePlayerData(session.user.id, newProfile.dead_count, newProfile.current_level, newProfile.username);
    }
    setGameStatus('playing');
    setGameKey(prev => prev + 1);
  }, [session, playerProfile]);

  const goToMainMenu = useCallback(() => setGameStatus('start'), []);
  const showAbout = useCallback(() => setGameStatus('about'), []);
  const showLevels = useCallback(() => setGameStatus('levels'), []);
  const showSettings = useCallback(() => setGameStatus('settings'), []);
  const showLeaderboard = useCallback(() => setGameStatus('leaderboard'), []);
  const restartCurrentLevel = useCallback(() => {
    setGameStatus('playing');
    setGameKey(prev => prev + 1);
  }, []);

  const handleGameOver = useCallback(async () => {
    if (playerProfile && session) {
        const newDeathCount = playerProfile.dead_count + 1;
        const newProfile = { ...playerProfile, dead_count: newDeathCount };
        setPlayerProfile(newProfile);
        setGameStatus('gameOver');
        // FIX: Pass username to savePlayerData to support offline saving.
        await savePlayerData(session.user.id, newProfile.dead_count, newProfile.current_level, newProfile.username);
    }
  }, [playerProfile, session]);

  const handleLevelComplete = useCallback(() => {
    if (playerProfile && playerProfile.current_level < ALL_LEVELS.length) {
      setGameStatus('levelComplete');
    } else {
      setGameStatus('gameEnd');
    }
  }, [playerProfile]);

  const handleContinueToNextLevel = useCallback(async () => {
    if (playerProfile && session) {
        const nextLevel = playerProfile.current_level + 1;
        startGame(nextLevel);
    }
  }, [playerProfile, session, startGame]);
  
  const handleSignOut = async () => {
      await signOut();
      setGameStatus('login');
  };

  const handleResetGame = useCallback(async () => {
    if (playerProfile && session) {
        const newProfile = { ...playerProfile, current_level: 1, dead_count: 0 };
        setPlayerProfile(newProfile);
        setGameStatus('start');
        // FIX: Pass username to savePlayerData to support offline saving.
        await savePlayerData(session.user.id, newProfile.dead_count, newProfile.current_level, newProfile.username);
        clearOffline();
    }
  }, [session, playerProfile]);

  const renderContent = () => {
    switch (gameStatus) {
      case 'loading':
      case 'loadingData':
        return <LoadingScreen />;
      case 'login':
      case 'signup':
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
      case 'start':
        if (!playerProfile) return <LoadingScreen />;
        return <StartScreen 
                  onStart={() => startGame(playerProfile.current_level)} 
                  onShowAbout={showAbout} 
                  onShowLevels={showLevels}
                  onShowSettings={showSettings}
                  onShowLeaderboard={showLeaderboard}
                  currentLevel={playerProfile.current_level}
                  deathCount={playerProfile.dead_count}
                  username={playerProfile.username}
                />;
      case 'about':
        return <AboutScreen onBack={goToMainMenu} />;
      case 'levels':
        return <LevelsScreen onBack={goToMainMenu} onSelectLevel={startGame} />;
      case 'settings':
         if (!playerProfile || !session) return <LoadingScreen />;
        return <SettingsScreen 
                  onBack={goToMainMenu} 
                  onResetGame={handleResetGame} 
                  username={playerProfile.username}
                  onUpdateProfile={updatePlayerProfile}
                  onSignOut={handleSignOut}
                  userId={session.user.id}
                />;
      case 'leaderboard':
        return <LeaderboardScreen onBack={goToMainMenu} />;
      case 'playing':
        if (!playerProfile) return <LoadingScreen />;
        return <Game 
                  key={gameKey} 
                  level={playerProfile.current_level} 
                  onGameOver={handleGameOver} 
                  onLevelComplete={handleLevelComplete} 
                  onGoToMainMenu={goToMainMenu}
                  onRestartCurrentLevel={restartCurrentLevel}
                />;
      case 'gameOver':
         if (!playerProfile) return <LoadingScreen />;
        return <EndScreen status="gameOver" onRestart={() => startGame(playerProfile.current_level)} deathCount={playerProfile.dead_count} />;
      case 'levelComplete':
        if (!playerProfile) return <LoadingScreen />;
        return <LevelCompleteScreen onNextLevel={handleContinueToNextLevel} level={playerProfile.current_level} />;
      case 'gameEnd':
        return <EndScreen status="gameEnd" onRestart={() => startGame(1)} />;
      default:
        return <LoadingScreen />;
    }
  };

  return (
    <main className="flex items-center justify-center h-screen bg-black text-white w-full h-full">
      {renderContent()}
    </main>
  );
};

export default App;
