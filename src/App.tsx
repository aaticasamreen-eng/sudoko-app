import React, { useState, useEffect } from 'react';
import { useSettingsStore } from './store/settingsStore';
import { useGameStore } from './store/gameStore';
import { Header } from './components/Header';
import { SudokuGrid } from './components/SudokuGrid';
import { ControlPanel } from './components/ControlPanel';
import { Numpad } from './components/Numpad';
import { Overlays } from './components/Overlays';
import { StatsPage } from './components/StatsPage';

const App: React.FC = () => {
  const { isDarkMode } = useSettingsStore();
  const { hasStarted, difficulty, startNewGame } = useGameStore();
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-200">
      {showStats ? (
        <StatsPage onClose={() => setShowStats(false)} />
      ) : (
        <div className="w-full max-w-2xl flex flex-col h-full">
          <Header onOpenStats={() => setShowStats(true)} />
          
          {!hasStarted ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Welcome to SudoMaster</h2>
                <p className="text-slate-500 dark:text-slate-400">Select a difficulty above and click Start to begin.</p>
              </div>
              <button 
                onClick={() => startNewGame(difficulty)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Start Game
              </button>
            </div>
          ) : (
            <main className="flex flex-col items-center justify-center flex-1 relative mt-4">
              <SudokuGrid />
              <ControlPanel />
              <Numpad />
              <Overlays />
            </main>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
