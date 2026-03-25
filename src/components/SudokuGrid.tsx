import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSettingsStore } from '../store/settingsStore';
import { cn } from '../lib/utils';
import { playSound } from '../lib/sounds';

export const SudokuGrid: React.FC = () => {
  const { 
    grid, givenCells, notes, selectedCell, errorCells, solution,
    selectCell, isPaused, isGameOver, isSuccess
  } = useGameStore();
  const { isSoundEnabled, showMistakes } = useSettingsStore();

  const handleCellClick = (r: number, c: number) => {
    if (isPaused || isGameOver || isSuccess) return;
    selectCell(r, c);
    if (isSoundEnabled) playSound('click');
  };

  const isSelected = (r: number, c: number) => selectedCell?.r === r && selectedCell?.c === c;
  const isRelated = (r: number, c: number) => {
    if (!selectedCell) return false;
    const { r: sr, c: sc } = selectedCell;
    if (r === sr && c === sc) return false;
    if (r === sr || c === sc) return true;
    const boxR = Math.floor(r / 3);
    const boxC = Math.floor(c / 3);
    const sBoxR = Math.floor(sr / 3);
    const sBoxC = Math.floor(sc / 3);
    return boxR === sBoxR && boxC === sBoxC;
  };
  const isSameValue = (r: number, c: number) => {
    if (!selectedCell) return false;
    const sv = grid[selectedCell.r][selectedCell.c];
    if (sv === null) return false;
    return grid[r][c] === sv && !isSelected(r, c);
  };
  const isError = (r: number, c: number) => {
    if (showMistakes && grid[r][c] !== null && grid[r][c] !== solution[r][c]) return true;
    return errorCells.some(e => e.r === r && e.c === c);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || isGameOver || isSuccess || !selectedCell) return;
      let { r, c } = selectedCell;
      
      switch(e.key) {
        case 'ArrowUp':
        case 'w':
          r = (r - 1 + 9) % 9;
          break;
        case 'ArrowDown':
        case 's':
          r = (r + 1) % 9;
          break;
        case 'ArrowLeft':
        case 'a':
          c = (c - 1 + 9) % 9;
          break;
        case 'ArrowRight':
        case 'd':
          c = (c + 1) % 9;
          break;
        default:
          return;
      }
      
      e.preventDefault();
      selectCell(r, c);
      if (isSoundEnabled) playSound('click');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isGameOver, isSuccess, selectedCell, selectCell, isSoundEnabled]);

  return (
    <div className="relative inline-block border-4 border-slate-800 dark:border-slate-300 bg-white dark:bg-slate-900 shadow-xl touch-none select-none">
      {grid.map((row, r) => (
        <div key={r} className="flex">
          {row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              className={cn(
                "relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 border border-slate-300 dark:border-slate-600 cursor-pointer text-xl sm:text-2xl font-medium transition-colors duration-150",
                (c + 1) % 3 === 0 && c !== 8 && "border-r-2 border-r-slate-800 dark:border-r-slate-300",
                (r + 1) % 3 === 0 && r !== 8 && "border-b-2 border-b-slate-800 dark:border-b-slate-300",
                isSelected(r, c) && "bg-blue-200 dark:bg-blue-800/80",
                !isSelected(r, c) && isRelated(r, c) && "bg-blue-50 dark:bg-blue-900/30",
                !isSelected(r, c) && !isRelated(r, c) && isSameValue(r, c) && "bg-teal-100 dark:bg-teal-900/40",
                isError(r, c) && "bg-red-200 dark:bg-red-900/50 text-red-600 dark:text-red-400",
                givenCells[r][c] ? "text-slate-800 dark:text-slate-200" : "text-blue-600 dark:text-blue-400"
              )}
            >
              {val !== null ? (
                <span>{val}</span>
              ) : (
                <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <div key={n} className="flex items-center justify-center text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-light">
                      {notes[r][c].includes(n) ? n : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      {isPaused && (
        <div className="absolute inset-0 bg-white dark:bg-slate-900 z-10" />
      )}
    </div>
  );
};
