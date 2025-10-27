import React, { useState, useCallback, useEffect } from 'react';
import type { GameStatus } from './types';
import { savePlayerData, loadPlayerData, getOffline, clearOffline } from './data/supabase';
import Game from './components/Game';
import StartScreen from './components/ui/StartScreen';
import EndScreen from './components/ui/EndScreen';
import LoadingScreen from './components/ui/LoadingScreen';
import LoginScreen from './components/ui/LoginScreen';
import AboutScreen from './components/ui/AboutScreen';
import LevelsScreen from './components/ui/LevelsScreen';
import SettingsScreen from './components/ui/SettingsScreen';
import LevelCompleteScreen from './components/ui/LevelCompleteScreen';
import { ALL_LEVELS } from './constants';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('loading');
  const [username, setUsername] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [deathCount, setDeathCount] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  // --- OFFLINE SYNC ---
  const syncOfflineData = useCallback(async () => {
    const offlineData = getOffline();
    if (offlineData && navigator.onLine) {
      console.log('Online, attempting to sync offline data...');
      await savePlayerData(offlineData.username, offlineData.dead_count, offlineData.current_level);
      clearOffline();
      console.log('Offline data synced.');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('online', syncOfflineData);
    return () => {
      window.removeEventListener('online', syncOfflineData);
    };
  }, [syncOfflineData]);


  // --- INITIAL LOAD ---
  useEffect(() => {
    const savedUsername = localStorage.getItem('crimsonShinobi_username');
    if (savedUsername) {
      setUsername(savedUsername);
      setGameStatus('loadingData');
    } else {
      setGameStatus('login');
    }
  }, []);

  // --- DATA LOADING ---
  useEffect(() => {
    const loadData = async () => {
      if (gameStatus === 'loadingData' && username) {
        const data = await loadPlayerData(username);
        if (data) {
          setCurrentLevel(data.current_level);
          setDeathCount(data.dead_count);
        } else {
          // If no data on server, check offline or start fresh
          const offlineData = getOffline();
           if(offlineData && offlineData.username === username) {
             setCurrentLevel(offlineData.current_level);
             setDeathCount(offlineData.dead_count);
           } else {
             setCurrentLevel(1);
             setDeathCount(0);
           }
        }
        setGameStatus('start');
      }
    };
    loadData();
  }, [gameStatus, username]);

  // --- GAME STATE HANDLERS ---
  const handleLogin = (name: string) => {
    setUsername(name);
    localStorage.setItem('crimsonShinobi_username', name);
    setGameStatus('loadingData');
  };

  const startGame = useCallback(async (level: number) => {
    setCurrentLevel(level);
    setGameStatus('playing');
    setGameKey(prev => prev + 1);
     if (username) {
      await savePlayerData(username, deathCount, level);
    }
  }, [username, deathCount]);

  const goToMainMenu = useCallback(() => setGameStatus('start'), []);
  const showAbout = useCallback(() => setGameStatus('about'), []);
  const showLevels = useCallback(() => setGameStatus('levels'), []);
  const showSettings = useCallback(() => setGameStatus('settings'), []);
  const restartCurrentLevel = useCallback(() => {
    setGameStatus('playing');
    setGameKey(prev => prev + 1);
  }, []);

  const handleGameOver = useCallback(async () => {
    const newDeathCount = deathCount + 1;
    setDeathCount(newDeathCount);
    setGameStatus('gameOver');
    if (username) {
      await savePlayerData(username, newDeathCount, currentLevel);
    }
  }, [deathCount, username, currentLevel]);

  const handleLevelComplete = useCallback(() => {
    if (currentLevel < ALL_LEVELS.length) {
      setGameStatus('levelComplete');
    } else {
      setGameStatus('gameEnd');
    }
  }, [currentLevel]);

  const handleContinueToNextLevel = useCallback(() => {
    const nextLevel = currentLevel + 1;
    startGame(nextLevel);
  }, [currentLevel, startGame]);

  const handleResetGame = useCallback(async () => {
    if (window.confirm('Are you sure you want to reset all progress? Your level and death count will be permanently reset to the beginning.')) {
      const newLevel = 1;
      const newDeaths = 0;
      setCurrentLevel(newLevel);
      setDeathCount(newDeaths);
      setGameStatus('start');
      if (username) {
        await savePlayerData(username, newDeaths, newLevel);
      }
      clearOffline();
    }
  }, [username]);

  const renderContent = () => {
    switch (gameStatus) {
      case 'loading':
      case 'loadingData':
        return <LoadingScreen />;
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'start':
        return <StartScreen 
                  onStart={() => startGame(currentLevel)} 
                  onShowAbout={showAbout} 
                  onShowLevels={showLevels}
                  onShowSettings={showSettings}
                  currentLevel={currentLevel}
                  deathCount={deathCount}
                  username={username || ''}
                />;
      case 'about':
        return <AboutScreen onBack={goToMainMenu} />;
      case 'levels':
        return <LevelsScreen onBack={goToMainMenu} onSelectLevel={startGame} />;
      case 'settings':
        return <SettingsScreen onBack={goToMainMenu} onResetGame={handleResetGame} />;
      case 'playing':
        return <Game 
                  key={gameKey} 
                  level={currentLevel} 
                  onGameOver={handleGameOver} 
                  onLevelComplete={handleLevelComplete} 
                  onGoToMainMenu={goToMainMenu}
                  onRestartCurrentLevel={restartCurrentLevel}
                />;
      case 'gameOver':
        return <EndScreen status="gameOver" onRestart={() => startGame(currentLevel)} deathCount={deathCount} />;
      case 'levelComplete':
        return <LevelCompleteScreen onNextLevel={handleContinueToNextLevel} level={currentLevel} />;
      case 'gameEnd':
        return <EndScreen status="gameEnd" onRestart={() => startGame(1)} />;
      default:
        return <LoadingScreen />;
    }
  };

  return (
    <main className="flex items-center justify-center h-screen bg-black text-white">
      {renderContent()}
    </main>
  );
};

export default App;