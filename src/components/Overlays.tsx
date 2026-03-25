import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Play, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { formatTime } from '../lib/utils';
import { playSound } from '../lib/sounds';
import { useSettingsStore } from '../store/settingsStore';

export const Overlays: React.FC = () => {
  const { isPaused, isGameOver, isSuccess, togglePause, startNewGame, difficulty, timeElapsed } = useGameStore();
  const { isSoundEnabled } = useSettingsStore();

  React.useEffect(() => {
    if (isSuccess && isSoundEnabled) {
      playSound('success');
    } else if (isGameOver && !isSuccess && isSoundEnabled) {
      playSound('error');
    }
  }, [isSuccess, isGameOver, isSoundEnabled]);

  if (!isPaused && !isGameOver && !isSuccess) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Background blur */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] dark:bg-slate-900/60" />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center flex flex-col items-center">
        {isPaused && (
          <>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-blue-600 dark:text-blue-400 ml-1" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Game Paused</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Take a breath, your timer is frozen.</p>
            <button 
              onClick={togglePause}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
            >
              Resume Game
            </button>
          </>
        )}

        {isSuccess && (
          <>
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">You Won!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Excellent work completing the <strong className="text-slate-800 dark:text-slate-200">{difficulty}</strong> puzzle in <strong className="text-slate-800 dark:text-slate-200">{formatTime(timeElapsed)}</strong>.
            </p>
            <button 
              onClick={() => startNewGame(difficulty)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          </>
        )}

        {isGameOver && !isSuccess && (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Game Over</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">You've reached the maximum number of mistakes allowed.</p>
            <button 
              onClick={() => startNewGame(difficulty)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};
