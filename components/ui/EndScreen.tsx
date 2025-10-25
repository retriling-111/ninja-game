import React from 'react';

interface EndScreenProps {
  status: 'gameOver' | 'win' | 'gameEnd';
  onRestart: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ status, onRestart }) => {
  const messages = {
    gameOver: {
      title: 'Fallen in Shadow',
      subtitle: 'The path ends here.',
      button: 'Retry',
    },
    win: {
      title: 'Victory in Silence',
      subtitle: 'You have mastered the shadow.',
      button: 'Play Again',
    },
    gameEnd: {
      title: 'This Game is End',
      subtitle: 'You have conquered all the shadows.',
      button: 'Play Again from Level 1',
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
        {message.button}
      </button>
    </div>
  );
};

export default EndScreen;
