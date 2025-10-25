import React from 'react';
import { ALL_LEVELS } from '../../constants';

interface LevelsScreenProps {
  onBack: () => void;
  onSelectLevel: (level: number) => void;
}

const LevelsScreen: React.FC<LevelsScreenProps> = ({ onBack, onSelectLevel }) => {
  const totalLevels = ALL_LEVELS.length;

  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center max-w-4xl w-full h-[90vh]">
      <h1 className="text-5xl md:text-6xl font-bold text-red-600 blood-text-shadow shrink-0">
        Select Level
      </h1>
      
      <div className="mt-8 p-4 border-2 border-gray-700 rounded-md bg-black/40 w-full flex-grow overflow-y-auto">
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4">
          {Array.from({ length: totalLevels }).map((_, i) => {
            const levelNum = i + 1;
            // For now, all generated levels are considered unlocked
            const isUnlocked = true;

            return (
              <button
                key={levelNum}
                onClick={() => isUnlocked && onSelectLevel(levelNum)}
                disabled={!isUnlocked}
                className={`aspect-square flex items-center justify-center font-bold text-xl md:text-2xl border-2 rounded-md transition-all duration-200 ${
                  isUnlocked 
                    ? 'bg-gray-800 border-gray-600 hover:bg-red-800 hover:border-red-600 text-white shadow-md shadow-black/50' 
                    : 'bg-black/50 border-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                {levelNum}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onBack}
        className="mt-8 px-8 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 text-white font-bold text-xl transition-all duration-300 rounded-sm shrink-0"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default LevelsScreen;
