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
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl md:text-8xl font-bold text-red-600 blood-text-shadow">
        Crimson Shinobi
      </h1>
      <p className="text-2xl text-gray-200 mt-4 font-light">Welcome, <span className="font-semibold">{username}</span></p>
      <p className="text-xl text-gray-300 mt-2">Level {currentLevel}</p>
      <p className="text-lg text-gray-400 mt-1">Total Deaths: {deathCount}</p>
      
      <div className="mt-8 flex flex-col gap-4 w-64">
        <button
          onClick={onStart}
          className="w-full px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-semibold text-xl transition-all duration-300 rounded-xl shadow-lg shadow-red-900/50"
        >
          {currentLevel > 1 ? 'Continue' : 'Start Game'}
        </button>
        <button 
          onClick={onShowLevels}
          className="w-full px-8 py-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl">
          Levels
        </button>
        <button 
          onClick={onShowSettings}
          className="w-full px-8 py-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl">
          Settings
        </button>
        <button 
          onClick={onShowAbout}
          className="w-full px-8 py-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl">
          About
        </button>
      </div>
    </div>
  );
};

export default StartScreen;