import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="text-center flex flex-col items-center justify-center">
      <h1 className="text-6xl md:text-8xl font-bold text-red-600 blood-text-shadow animate-pulse">
        Loading...
      </h1>
      <p className="mt-8 text-xl text-gray-300">Preparing the shadows...</p>
    </div>
  );
};

export default LoadingScreen;
