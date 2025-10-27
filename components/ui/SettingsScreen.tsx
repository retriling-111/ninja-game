import React, { useState, useEffect } from 'react';

interface SettingsScreenProps {
  onBack: () => void;
  onResetGame: () => void;
}

const SettingsRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center justify-between w-full py-3 border-b border-white/10">
        <label className="text-lg text-gray-300">{label}</label>
        {children}
    </div>
);

const IOSSwitch: React.FC<{ checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ checked, onChange }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
            <div className={`w-12 h-7 rounded-full transition-colors ${checked ? 'bg-red-600' : 'bg-gray-600'}`}></div>
            <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform transform ${checked ? 'translate-x-5' : 'translate-x-0'} shadow-md`}></div>
        </label>
    );
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onResetGame }) => {
  const [isShakeEnabled, setIsShakeEnabled] = useState(false);

  useEffect(() => {
    const savedShakeSetting = localStorage.getItem('screenShakeEnabled');
    setIsShakeEnabled(savedShakeSetting === 'true');
  }, []);

  const handleShakeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setIsShakeEnabled(enabled);
    localStorage.setItem('screenShakeEnabled', JSON.stringify(enabled));
  };


  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center max-w-xl w-full p-4">
       <div className="bg-black/50 ios-backdrop-blur p-8 rounded-2xl border border-white/10 shadow-2xl w-full">
          <h1 className="text-5xl md:text-6xl font-bold text-red-600 blood-text-shadow">
            Settings
          </h1>
          
          <div className="mt-8 w-full flex flex-col">
            
            <SettingsRow label="Screen Shake">
                <IOSSwitch checked={isShakeEnabled} onChange={handleShakeToggle} />
            </SettingsRow>
             <SettingsRow label="Reset Progress">
                <button 
                  onClick={onResetGame}
                  className="px-4 py-2 bg-red-900 hover:bg-red-800 border border-red-700 text-white font-semibold text-sm transition-all duration-300 rounded-lg"
                >
                  Reset Game
                </button>
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