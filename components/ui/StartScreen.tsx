import React from 'react';

interface StartScreenProps {
  onStart: () => void;
  onShowAbout: () => void;
  onShowLevels: () => void;
  onShowSettings: () => void;
  currentLevel: number;
  deathCount: number;
  username: string;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowAbout, onShowLevels, onShowSettings, currentLevel, deathCount, username }) => {
  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center">
      <h1 className="text-6xl md:text-8xl font-bold text-red-600 blood-text-shadow">
        Crimson Shinobi
      </h1>
      <p className="text-2xl text-gray-200 mt-4">Welcome, {username}</p>
      <p className="text-2xl text-gray-300 mt-2">Level {currentLevel}</p>
      <p className="text-xl text-gray-400 mt-1">Total Deaths: {deathCount}</p>
      
      <div className="mt-8 flex flex-col gap-4">
        <button
          onClick={onStart}
          className="px-8 py-3 bg-red-800 hover:bg-red-700 border-2 border-red-600 text-white font-bold text-xl transition-all duration-300 rounded-sm shadow-lg shadow-red-900/50"
        >
          {currentLevel > 1 ? 'Continue' : 'Start Game'}
        </button>
        <button 
          onClick={onShowLevels}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 text-white font-bold text-xl transition-all duration-300 rounded-sm">
          Levels
        </button>
        <button 
          onClick={onShowSettings}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 text-white font-bold text-xl transition-all duration-300 rounded-sm">
          Settings
        </button>
        <button 
          onClick={onShowAbout}
          className="px-8 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 text-white font-bold text-xl transition-all duration-300 rounded-sm">
          About
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
