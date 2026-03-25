import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { playSound } from '../lib/sounds';
import { cn } from '../lib/utils';
import { Delete } from 'lucide-react';

export const Numpad: React.FC = () => {
  const { inputNumber, deleteNumber, isPaused, isGameOver, isSuccess } = useGameStore();
  const { isSoundEnabled, showMistakes, errorLimitMode } = useSettingsStore();

  const handleInput = (num: number) => {
    if (isPaused || isGameOver || isSuccess) return;
    inputNumber(num, showMistakes, errorLimitMode);
    if (isSoundEnabled) playSound('click');
  };

  const handleDelete = () => {
    if (isPaused || isGameOver || isSuccess) return;
    deleteNumber();
    if (isSoundEnabled) playSound('click');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || isGameOver || isSuccess) return;
      if (e.key >= '1' && e.key <= '9') {
        handleInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isGameOver, isSuccess, showMistakes, errorLimitMode, inputNumber, deleteNumber, isSoundEnabled]);

  return (
    <div className="grid grid-cols-5 gap-2 mt-6 w-full max-w-[300px] sm:max-w-md mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          onClick={() => handleInput(num)}
          className="h-12 sm:h-14 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-xl sm:text-2xl font-semibold shadow-sm transition-colors active:scale-95"
        >
          {num}
        </button>
      ))}
      <button
        onClick={handleDelete}
        className="h-12 sm:h-14 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg flex items-center justify-center shadow-sm transition-colors active:scale-95"
      >
        <Delete className="w-6 h-6" />
      </button>
    </div>
  );
};
