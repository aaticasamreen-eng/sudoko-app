import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatTime } from '../lib/utils';
import { Play, Pause, Settings, BarChart2, Moon, Sun, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { Difficulty } from '../lib/sudoku';

export const Header: React.FC<{ onOpenStats: () => void }> = ({ onOpenStats }) => {
  const { 
    difficulty, timeElapsed, isPaused, isGameOver, isSuccess, hasStarted, mistakes,
    togglePause, incrementTime, startNewGame
  } = useGameStore();
  const { 
    isDarkMode, isSoundEnabled, showMistakes, errorLimitMode,
    toggleDarkMode, toggleSound, toggleShowMistakes, toggleErrorLimitMode 
  } = useSettingsStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

  useEffect(() => {
    let interval: number;
    if (hasStarted && !isPaused && !isGameOver && !isSuccess) {
      interval = window.setInterval(() => {
        incrementTime();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, isGameOver, isSuccess, incrementTime]);

  const handleStartNewGame = (diff: Difficulty) => {
    if (hasStarted && !isGameOver && !isSuccess) {
      if (window.confirm("Abandon current game and start a new one?")) {
        startNewGame(diff);
      }
    } else {
      startNewGame(diff);
    }
    setShowNewGameConfirm(false);
  };

  return (
    <header className="w-full max-w-2xl mx-auto flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">SudoMaster</h1>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenStats}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <BarChart2 className="w-6 h-6" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
            
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                <button onClick={toggleDarkMode} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm text-slate-700 dark:text-slate-200">
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={toggleSound} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm text-slate-700 dark:text-slate-200">
                  {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  Sound {isSoundEnabled ? 'On' : 'Off'}
                </button>
                <button onClick={toggleShowMistakes} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm text-slate-700 dark:text-slate-200">
                  {showMistakes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  Mistakes {showMistakes ? 'Shown' : 'Hidden'}
                </button>
                <button onClick={toggleErrorLimitMode} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm text-slate-700 dark:text-slate-200">
                  <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${errorLimitMode ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${errorLimitMode ? 'translate-x-4' : ''}`} />
                  </div>
                  Error Limit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-1 sm:gap-2">
          {(['Easy', 'Medium', 'Hard', 'Expert'] as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => handleStartNewGame(diff)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                difficulty === diff && hasStarted 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {errorLimitMode && hasStarted && !isGameOver && !isSuccess && (
            <div className="text-red-500 font-medium text-sm">
              ✗ {mistakes}/3
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
            <span className="text-lg w-16 text-right font-mono">{formatTime(timeElapsed)}</span>
            <button 
              onClick={togglePause}
              disabled={!hasStarted || isGameOver || isSuccess}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
