import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { Undo2, Redo2, Lightbulb, PenTool, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { playSound } from '../lib/sounds';

export const ControlPanel: React.FC = () => {
  const { 
    undo, redo, useHint, toggleNotesMode, checkBoard, 
    notesMode, hintsRemaining, history, redoHistory, 
    isPaused, isGameOver, isSuccess
  } = useGameStore();
  const { isSoundEnabled } = useSettingsStore();

  const handleAction = (action: () => void) => {
    if (isPaused || isGameOver || isSuccess) return;
    action();
    if (isSoundEnabled) playSound('click');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || isGameOver || isSuccess) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) handleAction(redo);
          else handleAction(undo);
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          handleAction(redo);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isGameOver, isSuccess, undo, redo, isSoundEnabled]);

  const canUndo = history.length > 0;
  const canRedo = redoHistory.length > 0;

  return (
    <div className="flex justify-between w-full max-w-[300px] sm:max-w-md mx-auto mt-6">
      <button 
        onClick={() => handleAction(undo)} 
        disabled={!canUndo || isPaused || isGameOver || isSuccess}
        className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 disabled:opacity-30 transition-opacity"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Undo2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <span className="text-xs font-medium">Undo</span>
      </button>

      <button 
        onClick={() => handleAction(redo)} 
        disabled={!canRedo || isPaused || isGameOver || isSuccess}
        className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 disabled:opacity-30 transition-opacity"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Redo2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <span className="text-xs font-medium">Redo</span>
      </button>

      <button 
        onClick={() => handleAction(toggleNotesMode)} 
        disabled={isPaused || isGameOver || isSuccess}
        className={cn(
          "flex flex-col items-center gap-1 transition-colors",
          notesMode ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"
        )}
      >
        <div className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors",
          notesMode ? "bg-blue-100 dark:bg-blue-900/50" : "bg-slate-100 dark:bg-slate-800"
        )}>
          <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <span className="text-xs font-medium">Notes</span>
      </button>

      <button 
        onClick={() => handleAction(useHint)} 
        disabled={hintsRemaining <= 0 || isPaused || isGameOver || isSuccess}
        className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 disabled:opacity-30 transition-opacity relative"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full font-bold">
          {hintsRemaining}
        </span>
        <span className="text-xs font-medium">Hint</span>
      </button>

      <button 
        onClick={() => handleAction(checkBoard)} 
        disabled={isPaused || isGameOver || isSuccess}
        className="flex flex-col items-center gap-1 text-slate-600 dark:text-slate-400 disabled:opacity-30 transition-opacity"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <span className="text-xs font-medium">Check</span>
      </button>
    </div>
  );
};
