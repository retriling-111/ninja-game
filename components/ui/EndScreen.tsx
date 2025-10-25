
import React from 'react';
import type { GameStatus } from '../../types';

interface EndScreenProps {
  status: 'gameOver' | 'win';
  onRestart: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ status, onRestart }) => {
  const messages = {
    gameOver: {
      title: 'Fallen in Shadow',
      subtitle: 'The path ends here.',
    },
    win: {
      title: 'Victory in Silence',
      subtitle: 'You have mastered the shadow.',
    },
  };

  const message = messages[status];

  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center">
      <h1 className="text-6xl md:text-8xl font-bold text-red-600 blood-text-shadow">
        {message.title}
      </h1>
      <p className="mt-4 text-2xl text-gray-300">{message.subtitle}</p>
      <button
        onClick={onRestart}
        className="mt-12 px-8 py-3 bg-red-800 hover:bg-red-700 border-2 border-red-600 text-white font-bold text-xl transition-all duration-300 rounded-sm shadow-lg shadow-red-900/50"
      >
        Retry
      </button>
    </div>
  );
};

export default EndScreen;
