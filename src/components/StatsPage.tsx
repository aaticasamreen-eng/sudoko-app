import React from 'react';
import { useStatsStore } from '../store/statsStore';
import { formatTime } from '../lib/utils';
import { ArrowLeft, Trophy, Flame, Target, Trash2 } from 'lucide-react';
import { Difficulty } from '../lib/sudoku';

export const StatsPage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { totalWins, currentWinStreak, statsByDifficulty, resetStats } = useStatsStore();

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all your statistics? This cannot be undone.")) {
      resetStats();
    }
  };

  const totalGamesPlayed = Object.values(statsByDifficulty).reduce((acc, stat) => acc + stat.gamesPlayed, 0);
  const winRate = totalGamesPlayed > 0 ? Math.round((totalWins / totalGamesPlayed) * 100) : 0;

  return (
    <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 z-50 flex flex-col overflow-y-auto">
      <div className="max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col min-h-full">
        <header className="flex items-center gap-4 mb-8">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-800 dark:text-slate-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Statistics</h2>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
            <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">{totalWins}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total Wins</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
            <Flame className="w-8 h-8 text-orange-500 mb-2" />
            <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">{currentWinStreak}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Current Streak</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
            <Target className="w-8 h-8 text-blue-500 mb-2" />
            <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">{winRate}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Win Rate</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-indigo-500">#</span>
            </div>
            <span className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">{totalGamesPlayed}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Games Played</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">By Difficulty</h3>
        <div className="space-y-3 mb-8 flex-1">
          {(['Easy', 'Medium', 'Hard', 'Expert'] as Difficulty[]).map(diff => {
            const stats = statsByDifficulty[diff];
            return (
              <div key={diff} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100">{diff}</h4>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{stats.gamesPlayed} games played</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500 dark:text-slate-400">Best Time</div>
                  <div className="font-mono font-medium text-slate-800 dark:text-slate-100">
                    {stats.bestTime !== null ? formatTime(stats.bestTime) : '--:--'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={handleReset}
          className="mt-auto py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Reset Statistics
        </button>
      </div>
    </div>
  );
};
