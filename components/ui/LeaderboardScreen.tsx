import React, { useState, useEffect } from 'react';
import { getLeaderboardData, LeaderboardEntry } from '../../data/supabase';

interface LeaderboardScreenProps {
  onBack: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboardData();
        setLeaderboard(data);
      } catch (e) {
        setError('Failed to load leaderboard data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="animate-fadeIn flex flex-col items-center justify-center w-full h-full p-4">
      <div className="bg-black/50 ios-backdrop-blur p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-lg h-full max-h-[90vh] flex flex-col">
        <h1 className="text-5xl md:text-6xl font-bold text-red-600 blood-text-shadow text-center shrink-0">
          Leaderboard
        </h1>
        <h2 className="text-xl text-gray-300 text-center mt-1 shrink-0">Top 20 Players (Least Deaths)</h2>

        <div className="mt-6 flex-grow overflow-y-auto pr-2 bg-black/30 rounded-lg border border-white/10 p-4">
          {loading && <p className="text-center text-gray-300">Loading...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {leaderboard && (
            <ol className="space-y-2">
              {leaderboard.map((entry, index) => (
                <li 
                    key={index} 
                    className={`flex justify-between items-center p-2 rounded-md ${
                        index === 0 ? 'bg-red-800/50' : 
                        index === 1 ? 'bg-red-800/40' : 
                        index === 2 ? 'bg-red-800/30' : 'bg-gray-800/50'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg w-8 text-center">{index + 1}</span>
                    <span className="font-semibold">{entry.username}</span>
                  </div>
                  <span className="font-light text-gray-300">Deaths: {entry.dead_count}</span>
                </li>
              ))}
            </ol>
          )}
          {!loading && leaderboard?.length === 0 && <p className="text-center text-gray-400">No data available.</p>}
        </div>

        <button
          onClick={onBack}
          className="mt-6 px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-semibold text-lg transition-all duration-300 rounded-xl shrink-0"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
