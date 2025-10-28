import React, { useState, useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';

interface SettingsScreenProps {
  onBack: () => void;
  onResetGame: () => void;
  username: string;
  onUpdateUsername: (newName: string) => void;
}

const SettingsRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center justify-between w-full py-3 border-b border-white/10">
        <label className="text-lg text-gray-300">{label}</label>
        {children}
    </div>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onResetGame, username, onUpdateUsername }) => {
  const { volume, setVolume } = useContext(AppContext);
  const [currentUsername, setCurrentUsername] = useState(username);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const handleSaveUsername = () => {
      if (currentUsername.trim()) {
          onUpdateUsername(currentUsername.trim());
          alert('Username updated!');
      }
  };
  
  const handleResetClick = () => {
      onResetGame();
      setIsConfirmingReset(false);
  }

  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center max-w-xl w-full p-4">
       <div className="bg-black/50 ios-backdrop-blur p-8 rounded-2xl border border-white/10 shadow-2xl w-full">
          <h1 className="text-5xl md-text-6xl font-bold text-red-600 blood-text-shadow">
            Settings
          </h1>
          
          <div className="mt-8 w-full flex flex-col">
             <SettingsRow label="Volume">
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-32 accent-red-600"
                />
            </SettingsRow>
            <SettingsRow label="Edit Name">
                <div className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={currentUsername}
                        onChange={(e) => setCurrentUsername(e.target.value)}
                        className="px-2 py-1 bg-gray-800 border-2 border-gray-600 text-white font-semibold text-base rounded-lg w-32 text-center focus:outline-none focus:border-red-600"
                    />
                     <button 
                        onClick={handleSaveUsername}
                        className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white font-semibold text-sm rounded-lg"
                        >
                        Save
                    </button>
                </div>
            </SettingsRow>
             <SettingsRow label="Reset Progress">
                 {!isConfirmingReset ? (
                    <button 
                      onClick={() => setIsConfirmingReset(true)}
                      className="px-4 py-2 bg-red-900 hover:bg-red-800 border border-red-700 text-white font-semibold text-sm transition-all duration-300 rounded-lg"
                    >
                      Reset Game
                    </button>
                 ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-sm">Are you sure?</span>
                         <button 
                            onClick={handleResetClick}
                            className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white font-semibold text-sm rounded-lg"
                        >
                            Yes
                        </button>
                        <button 
                            onClick={() => setIsConfirmingReset(false)}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm rounded-lg"
                        >
                            No
                        </button>
                    </div>
                 )}
            </SettingsRow>
          </div>


          <button
            onClick={onBack}
            className="mt-12 px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl"
          >
            Back to Menu
          </button>
       </div>
    </div>
  );
};

export default SettingsScreen;