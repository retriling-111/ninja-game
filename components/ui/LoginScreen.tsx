import React, { useState } from 'react';
import { signIn, signUp, saveOfflineProfile, getOffline } from '../../data/supabase';
import type { PlayerProfile } from '../../types';

interface LoginScreenProps {
  onLoginSuccess: (payload: { offlineProfile?: PlayerProfile }) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const handleOfflineSuccess = (profile: PlayerProfile) => {
      setInfo("Offline mode detected. A local profile has been created.");
      setTimeout(() => {
        onLoginSuccess({ offlineProfile: profile });
      }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (isSigningUp) {
      if (!username.trim()) {
        setError('Please enter a username.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, username.trim());
      
      if (error) {
        if (error.message === 'Supabase not configured') {
            const offlineProfile: PlayerProfile = { 
              username: username.trim(), 
              dead_count: 0, 
              current_level: 1,
              tutorial_complete: false,
              max_level_unlocked: 1,
            };
            saveOfflineProfile(offlineProfile);
            handleOfflineSuccess(offlineProfile);
        } else {
            setError(error.message);
        }
      } else {
        alert('Signed up successfully! Please check your email to confirm your account.');
        onLoginSuccess({});
      }
    } else { // Logging In
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message === 'Supabase not configured') {
            const offlineProfile = getOffline();
            if (offlineProfile) {
                handleOfflineSuccess(offlineProfile);
            } else {
                setError("No offline profile found. Please sign up to create one.");
            }
        } else {
            setError(error.message);
        }
      } else {
        onLoginSuccess({});
      }
    }

    setLoading(false);
  };

  const formInputClass = "px-4 py-3 bg-gray-800 border-2 border-gray-600 text-white font-semibold text-lg rounded-xl w-80 text-center focus:outline-none focus:border-red-600 transition-colors";
  const buttonClass = "w-80 px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-semibold text-xl transition-all duration-300 rounded-xl shadow-lg shadow-red-900/50 disabled:bg-gray-700 disabled:shadow-none";

  return (
    <div className="text-center animate-fadeIn flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl md:text-8xl font-bold text-red-600 blood-text-shadow">
        Crimson Shinobi
      </h1>
      <p className="text-xl text-gray-300 mt-4 mb-8">{isSigningUp ? 'Create an Account' : 'Enter the Shadows'}</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
        {isSigningUp && (
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className={formInputClass}
            maxLength={20}
            required
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={formInputClass}
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={formInputClass}
          required
        />

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {info && <p className="text-green-400 mt-2">{info}</p>}
        
        <button type="submit" disabled={loading} className={`${buttonClass} mt-4`}>
          {loading ? 'Loading...' : isSigningUp ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      
      <button onClick={() => { setIsSigningUp(!isSigningUp); setError(null); }} className="mt-4 text-gray-400 hover:text-white">
        {isSigningUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
};

export default LoginScreen;