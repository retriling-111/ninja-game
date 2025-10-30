import React from 'react';
import { ALL_LEVELS } from '../../constants';
import type { PlayerProfile } from '../../types';

interface LevelsScreenProps {
  onBack: () => void;
  onSelectLevel: (level: number) => void;
  playerProfile: PlayerProfile;
}

const LevelsScreen: React.FC<LevelsScreenProps> = ({ onBack, onSelectLevel, playerProfile }) => {
  const totalLevels = ALL_LEVELS.length;
  const maxUnlocked = playerProfile.max_level_unlocked || 1;

  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center max-w-4xl w-full h-[90vh] p-4">
      <div className="bg-black/50 ios-backdrop-blur border border-white/10 shadow-2xl rounded-2xl w-full h-full flex flex-col p-6">
        <h1 className="text-5xl md:text-6xl font-bold text-red-600 blood-text-shadow shrink-0">
          Select Level
        </h1>
        
        <div className="mt-8 p-4 border-2 border-gray-700/50 rounded-lg bg-black/40 w-full flex-grow overflow-y-auto">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
            {Array.from({ length: totalLevels }).map((_, i) => {
              const levelNum = i + 1;
              const isUnlocked = levelNum <= maxUnlocked;

              return (
                <button
                  key={levelNum}
                  onClick={() => isUnlocked && onSelectLevel(levelNum)}
                  disabled={!isUnlocked}
                  className={`aspect-square flex items-center justify-center font-bold text-xl md:text-2xl border rounded-lg transition-all duration-200 relative ${
                    isUnlocked 
                      ? 'bg-gray-800/80 border-gray-600/80 hover:bg-red-700 hover:border-red-600 text-white shadow-md shadow-black/50' 
                      : 'bg-black/50 border-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isUnlocked ? levelNum : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-6 px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl shrink-0"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default LevelsScreen;