import React from 'react';

interface StartScreenProps {
  onStart: () => void;
  onShowAbout: () => void;
  onShowLevels: () => void;
  onShowSettings: () => void;
  onShowLeaderboard: () => void;
  currentLevel: number;
  deathCount: number;
  username: string;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onShowAbout, onShowLevels, onShowSettings, onShowLeaderboard, currentLevel, deathCount, username }) => {
  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center p-4 h-full w-full">
      <div className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-6xl md:text-8xl font-bold text-red-600 blood-text-shadow">
          Crimson Shinobi
        </h1>
        <p className="text-2xl text-gray-200 mt-4 font-light">Welcome, <span className="font-semibold">{username}</span></p>
        <p className="text-xl text-gray-300 mt-2">Level {currentLevel}</p>
        <p className="text-lg text-gray-400 mt-1">Total Deaths: {deathCount}</p>
      </div>
      
      <div className="flex-shrink-0 mb-8 grid grid-cols-2 gap-4 w-full max-w-md">
        <button
          onClick={onStart}
          className="col-span-2 px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-semibold text-xl transition-all duration-300 rounded-xl shadow-lg shadow-red-900/50"
        >
          {currentLevel > 1 ? 'Continue' : 'Start Game'}
        </button>
        <button 
          onClick={onShowLevels}
          className="px-8 py-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl">
          Levels
        </button>
        <button 
          onClick={onShowLeaderboard}
          className="px-8 py-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl">
          Leaderboard
        </button>
        <button 
          onClick={onShowSettings}
          className="px-8 py-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl">
          Settings
        </button>
        <button 
          onClick={onShowAbout}
          className="px-8 py-3 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl">
          About
        </button>
      </div>
    </div>
  );
};

export default StartScreen;