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
      setGameStatus('gameEnd');
    }
  }, [currentLevel]);

  const handleResetGame = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all progress? You will start back at Level 1.')) {
      setCurrentLevel(1);
      setGameStatus('start');
    }
  }, []);

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
        return <EndScreen status="gameOver" onRestart={() => startGame(currentLevel)} />;
      case 'win': // This case might be deprecated in favor of gameEnd
        return <EndScreen status="win" onRestart={() => startGame(1)} />;
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