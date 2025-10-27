import React from 'react';
import { ALL_LEVELS } from '../../constants';

interface LevelsScreenProps {
  onBack: () => void;
  onSelectLevel: (level: number) => void;
}

const LevelsScreen: React.FC<LevelsScreenProps> = ({ onBack, onSelectLevel }) => {
  const totalLevels = ALL_LEVELS.length;

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
              const isUnlocked = true;

              return (
                <button
                  key={levelNum}
                  onClick={() => isUnlocked && onSelectLevel(levelNum)}
                  disabled={!isUnlocked}
                  className={`aspect-square flex items-center justify-center font-bold text-xl md:text-2xl border rounded-lg transition-all duration-200 ${
                    isUnlocked 
                      ? 'bg-gray-800/80 border-gray-600/80 hover:bg-red-700 hover:border-red-600 text-white shadow-md shadow-black/50' 
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
          className="mt-6 px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl shrink-0"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default LevelsScreen;