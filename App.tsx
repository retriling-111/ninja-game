import React, { useState, useCallback, useEffect } from 'react';
import type { GameStatus } from './types';
import Game from './components/Game';
import StartScreen from './components/ui/StartScreen';
import EndScreen from './components/ui/EndScreen';
import LoadingScreen from './components/ui/LoadingScreen';
import AboutScreen from './components/ui/AboutScreen';
import LevelsScreen from './components/ui/LevelsScreen';
import SettingsScreen from './components/ui/SettingsScreen';
import { ALL_LEVELS } from './constants';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('loading');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameKey, setGameKey] = useState(0); // Used to force remounting the Game component

  useEffect(() => {
    if (gameStatus === 'loading') {
      const timer = setTimeout(() => {
        setGameStatus('start');
      }, 2000); // Simulate 2-second load time
      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  const startGame = useCallback((level: number = 1) => {
    setCurrentLevel(level);
    setGameStatus('playing');
    setGameKey(prev => prev + 1);
  }, []);

  const goToMainMenu = useCallback(() => {
    setGameStatus('start');
    // We don't reset the level here so the start screen shows the last played level
  }, []);
  
  const showAbout = useCallback(() => {
    setGameStatus('about');
  }, []);

  const showLevels = useCallback(() => {
    setGameStatus('levels');
  }, []);

  const showSettings = useCallback(() => {
    setGameStatus('settings');
  }, []);

  const restartCurrentLevel = useCallback(() => {
    setGameStatus('playing');
    setGameKey(prev => prev + 1);
  }, []);

  const handleGameOver = useCallback(() => {
    setGameStatus('gameOver');
  }, []);

  const handleLevelComplete = useCallback(() => {
    if (currentLevel < ALL_LEVELS.length) {
      setCurrentLevel(prev => prev + 1);
      setGameKey(prev => prev + 1);
    } else {
      setGameStatus('win');
    }
  }, [currentLevel]);

  const renderContent = () => {
    switch (gameStatus) {
      case 'loading':
        return <LoadingScreen />;
      case 'start':
        return <StartScreen 
                  onStart={() => startGame(currentLevel)} 
                  onShowAbout={showAbout} 
                  onShowLevels={showLevels}
                  onShowSettings={showSettings}
                  currentLevel={currentLevel} 
                />;
      case 'about':
        return <AboutScreen onBack={goToMainMenu} />;
      case 'levels':
        return <LevelsScreen onBack={goToMainMenu} onSelectLevel={startGame} />;
      case 'settings':
        return <SettingsScreen onBack={goToMainMenu} />;
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
        return <EndScreen status="gameOver" onRestart={() => startGame(currentLevel)} />;
      case 'win':
        return <EndScreen status="win" onRestart={() => startGame(1)} />;
      default:
        return <LoadingScreen />;
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      {renderContent()}
    </main>
  );
};

export default App;