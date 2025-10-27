import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl md:text-8xl font-bold text-red-600 blood-text-shadow">
        Crimson Shinobi
      </h1>
      <p className="text-xl text-gray-300 mt-4 mb-8">Enter your name to begin.</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your name"
          className="px-4 py-3 bg-gray-800 border-2 border-gray-600 text-white font-semibold text-lg rounded-xl w-72 text-center focus:outline-none focus:border-red-600 transition-colors"
          maxLength={20}
        />
        <button
          type="submit"
          disabled={!username.trim()}
          className="w-72 px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-semibold text-xl transition-all duration-300 rounded-xl shadow-lg shadow-red-900/50 disabled:bg-gray-700 disabled:border-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Enter the Shadows
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;