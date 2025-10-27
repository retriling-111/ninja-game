import React from 'react';

interface LevelCompleteScreenProps {
  onNextLevel: () => void;
  level: number;
}

const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({ onNextLevel, level }) => {
  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center bg-black/50 ios-backdrop-blur p-8 rounded-2xl border border-white/10 shadow-2xl">
      <h1 className="text-6xl md:text-8xl font-bold text-red-600 blood-text-shadow">
        Victory
      </h1>
      <p className="mt-4 text-2xl text-gray-300">Level {level} Complete!</p>
      <button
        onClick={onNextLevel}
        className="mt-12 px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-semibold text-xl transition-all duration-300 rounded-xl shadow-lg shadow-red-900/50"
      >
        Continue
      </button>
    </div>
  );
};

export default LevelCompleteScreen;