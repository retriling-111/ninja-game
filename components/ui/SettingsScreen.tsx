import React from 'react';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center justify-between w-full py-2">
        <label className="text-lg text-gray-300">{label}</label>
        {children}
    </div>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center max-w-xl w-full">
      <h1 className="text-5xl md:text-6xl font-bold text-red-600 blood-text-shadow">
        Settings
      </h1>
      
      <div className="mt-8 p-6 border border-gray-700 rounded-md bg-black/30 w-full flex flex-col gap-4">
        
        {/* Audio Settings */}
        <h2 className="text-2xl font-bold text-white self-start border-b-2 border-red-700 pb-1">Audio</h2>
        <SettingsRow label="Master Volume">
            <input type="range" className="w-48" defaultValue="80" />
        </SettingsRow>
        <SettingsRow label="Music">
            <input type="range" className="w-48" defaultValue="60" />
        </SettingsRow>
        <SettingsRow label="SFX">
            <input type="range" className="w-48" defaultValue="90" />
        </SettingsRow>

        {/* Graphics Settings */}
        <h2 className="text-2xl font-bold text-white self-start border-b-2 border-red-700 pb-1 mt-4">Graphics</h2>
         <SettingsRow label="Screen Shake">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700"></div>
            </label>
        </SettingsRow>

        {/* Game Settings */}
        <h2 className="text-2xl font-bold text-white self-start border-b-2 border-red-700 pb-1 mt-4">Game</h2>
         <SettingsRow label="Reset Progress">
            <button 
              onClick={() => alert('This will delete all save data. (Functionality coming soon!)')}
              className="px-4 py-1 bg-red-900 hover:bg-red-800 border border-red-700 text-white font-semibold text-sm transition-all duration-300 rounded-sm"
            >
              Reset
            </button>
        </SettingsRow>
      </div>


      <button
        onClick={onBack}
        className="mt-12 px-8 py-3 bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 text-white font-bold text-xl transition-all duration-300 rounded-sm"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default SettingsScreen;