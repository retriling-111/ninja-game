import React from 'react';
import { ALL_LEVELS } from '../../constants';

interface LevelsScreenProps {
  onBack: () => void;
  onSelectLevel: (level: number) => void;
}

const LevelsScreen: React.FC<LevelsScreenProps> = ({ onBack, onSelectLevel }) => {
  const totalLevelsToShow = 12; // Example: show 12 level boxes

  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center max-w-3xl w-full">
      <h1 className="text-5xl md:text-6xl font-bold text-red-600 blood-text-shadow">
        Select Level
      </h1>
      
      <div className="mt-8 grid grid-cols-4 sm:grid-cols-6 gap-4 p-4 border border-gray-700 rounded-md bg-black/30 w-full">
        {Array.from({ length: totalLevelsToShow }).map((_, i) => {
          const levelNum = i + 1;
          const isUnlocked = levelNum <= ALL_LEVELS.length;

          return (
            <button
              key={levelNum}
              onClick={() => isUnlocked && onSelectLevel(levelNum)}
              disabled={!isUnlocked}
              className={`aspect-square flex items-center justify-center font-bold text-2xl border-2 rounded-md transition-all duration-200 ${
                isUnlocked 
                  ? 'bg-gray-800 border-gray-600 hover:bg-red-800 hover:border-red-600 text-white' 
                  : 'bg-black/50 border-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {levelNum}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xl text-gray-400">More levels coming soon... (200+ Planned!)</p>

      <button
        onClick={onBack}
        className="mt-12 px-8 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 text-white font-bold text-xl transition-all duration-300 rounded-sm"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default LevelsScreen;