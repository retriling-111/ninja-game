import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useControlsContext, DEFAULT_KEYMAP, formatKey } from '../../contexts/ControlsContext';
import { updateUserPassword, updateUsername as updateSupabaseUsername } from '../../data/supabase';
import type { ControlAction, Keymap } from '../../types';
import MobileLayoutCustomizer from './MobileLayoutCustomizer';

interface SettingsScreenProps {
  onBack: () => void;
  onResetGame: () => void;
  username: string;
  userId: string;
  onUpdateProfile: (updates: { username: string }) => void;
  onSignOut: () => void;
}

const SettingsRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center justify-between w-full py-3 border-b border-white/10">
        <label className="text-lg text-gray-300">{label}</label>
        <div className="flex items-center gap-2">{children}</div>
    </div>
);

const ControlsCustomizer: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { keymap, setKeymap, resetKeymap } = useControlsContext();
    const [editingKeymap, setEditingKeymap] = useState<Keymap>(keymap);
    const [rebindingAction, setRebindingAction] = useState<ControlAction | null>(null);

    const controlsMap: { action: ControlAction, label: string }[] = [
      { action: 'moveLeft', label: 'Move Left' },
      { action: 'moveRight', label: 'Move Right' },
      { action: 'jump', label: 'Jump' },
      { action: 'attack', label: 'Attack' },
      { action: 'dash', label: 'Dash' },
      { action: 'shield', label: 'Shield' },
      { action: 'shuriken', label: 'Shuriken / Teleport' },
      { action: 'pause', label: 'Pause' },
    ];

    useEffect(() => {
        if (!rebindingAction) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            event.preventDefault();
            event.stopPropagation();
            // UPDATED: Use event.code for re-binding
            const newKey = event.code;
            
            if (newKey === 'Escape') {
                setRebindingAction(null);
                return;
            }

            const isUsed = Object.entries(editingKeymap).some(
                ([action, key]) => key.toLowerCase() === newKey.toLowerCase() && action !== rebindingAction
            );

            if (isUsed) {
                // UPDATED: Use formatKey for a more user-friendly alert.
                alert(`Key "${formatKey(newKey)}" is already assigned. Please choose another key.`);
                return;
            }
            
            setEditingKeymap(prev => ({...prev, [rebindingAction]: newKey}));
            setRebindingAction(null);
        };
        
        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [rebindingAction, editingKeymap]);

    const handleSave = () => { setKeymap(editingKeymap); onClose(); };
    const handleReset = () => { setEditingKeymap(DEFAULT_KEYMAP); };

    return (
        <div className="absolute inset-0 bg-black/60 ios-backdrop-blur flex flex-col items-center justify-center z-40 p-4">
            <div className="bg-gray-900/80 p-6 md:p-8 rounded-2xl border border-white/20 shadow-2xl w-full max-w-md flex flex-col">
                <h2 className="text-4xl font-bold text-red-600 blood-text-shadow text-center mb-6">Customize Controls</h2>
                <div className="space-y-2">
                    {controlsMap.map(({ action, label }) => (
                        <div key={action} className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
                            <span className="text-lg text-gray-200">{label}</span>
                            <button 
                                onClick={() => setRebindingAction(action)}
                                className="px-4 py-2 w-32 text-center bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-mono text-lg transition-all duration-300 rounded-lg"
                            >
                                {rebindingAction === action ? '...' : formatKey(editingKeymap[action])}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button onClick={handleSave} className="flex-1 px-6 py-2 bg-red-700 hover:bg-red-600 text-white font-semibold text-lg rounded-lg">Save</button>
                    <button onClick={handleReset} className="flex-1 px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-lg rounded-lg">Reset</button>
                    <button onClick={onClose} className="flex-1 px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-lg rounded-lg">Cancel</button>
                </div>
            </div>
        </div>
    );
};


const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onResetGame, username, userId, onUpdateProfile, onSignOut }) => {
  const { volume, setVolume } = useContext(AppContext);
  const [currentUsername, setCurrentUsername] = useState(username);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isCustomizingControls, setIsCustomizingControls] = useState(false);
  const [isCustomizingMobileLayout, setIsCustomizingMobileLayout] = useState(false);

  const handleSaveUsername = async () => {
      const newName = currentUsername.trim();
      if (newName && newName !== username) {
          const { error } = await updateSupabaseUsername(userId, newName);
          if (error) {
              alert(`Error: ${error.message}`);
          } else {
              onUpdateProfile({ username: newName });
              alert('Username updated!');
          }
      }
  };
  
  const handleChangePassword = async () => {
      if (newPassword.length < 6) {
          alert("Password must be at least 6 characters long.");
          return;
      }
      if (newPassword !== confirmPassword) {
          alert("Passwords do not match.");
          return;
      }
      const { error } = await updateUserPassword(newPassword);
      if (error) {
          alert(`Error: ${error.message}`);
      } else {
          alert('Password updated successfully!');
          setNewPassword('');
          setConfirmPassword('');
      }
  };

  const handleResetClick = () => {
      onResetGame();
      setIsConfirmingReset(false);
  };

  return (
    <>
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center max-w-2xl w-full p-4">
       <div className="bg-black/50 ios-backdrop-blur p-8 rounded-2xl border border-white/10 shadow-2xl w-full">
          <h1 className="text-5xl md-text-6xl font-bold text-red-600 blood-text-shadow">
            Settings
          </h1>
          
          <div className="mt-8 w-full flex flex-col text-left">
             <h2 className="text-2xl font-semibold text-red-500 mb-2">Game</h2>
             <SettingsRow label="Volume">
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-40 accent-red-600"
                />
            </SettingsRow>
            <SettingsRow label="Customize Controls">
                <button 
                    onClick={() => setIsCustomizingControls(true)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-sm transition-all duration-300 rounded-lg"
                >
                    Keyboard
                </button>
                <button 
                    onClick={() => setIsCustomizingMobileLayout(true)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-sm transition-all duration-300 rounded-lg"
                >
                    Mobile
                </button>
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
                    <>
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
                    </>
                 )}
            </SettingsRow>
            
            <h2 className="text-2xl font-semibold text-red-500 mt-8 mb-2">Account</h2>
            <SettingsRow label="Update Username">
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
            </SettingsRow>
            <SettingsRow label="New Password">
                 <input 
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-2 py-1 bg-gray-800 border-2 border-gray-600 text-white font-semibold text-base rounded-lg w-40 text-center focus:outline-none focus:border-red-600"
                />
            </SettingsRow>
            <SettingsRow label="Confirm Password">
                <input 
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="px-2 py-1 bg-gray-800 border-2 border-gray-600 text-white font-semibold text-base rounded-lg w-40 text-center focus:outline-none focus:border-red-600"
                />
                <button 
                    onClick={handleChangePassword}
                    className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white font-semibold text-sm rounded-lg"
                >
                    Change
                </button>
            </SettingsRow>

             <button 
                onClick={onSignOut}
                className="w-full mt-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-base transition-all duration-300 rounded-lg"
            >
                Log Out
            </button>
          </div>

          <button
            onClick={onBack}
            className="mt-8 px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl"
          >
            Back to Menu
          </button>
       </div>
    </div>
    {isCustomizingControls && <ControlsCustomizer onClose={() => setIsCustomizingControls(false)} />}
    {isCustomizingMobileLayout && <MobileLayoutCustomizer onClose={() => setIsCustomizingMobileLayout(false)} />}
    </>
  );
};

export default SettingsScreen;