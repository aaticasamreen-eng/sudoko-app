import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Difficulty } from '../lib/sudoku';

interface DifficultyStats {
  gamesPlayed: number;
  bestTime: number | null;
}

interface StatsState {
  totalWins: number;
  currentWinStreak: number;
  statsByDifficulty: Record<Difficulty, DifficultyStats>;
  recordGameWon: (difficulty: Difficulty, timeInSeconds: number) => void;
  recordGameLost: (difficulty: Difficulty) => void;
  resetStats: () => void;
}

const initialStats = {
  totalWins: 0,
  currentWinStreak: 0,
  statsByDifficulty: {
    Easy: { gamesPlayed: 0, bestTime: null },
    Medium: { gamesPlayed: 0, bestTime: null },
    Hard: { gamesPlayed: 0, bestTime: null },
    Expert: { gamesPlayed: 0, bestTime: null },
  }
};

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      ...initialStats,
      recordGameWon: (difficulty: Difficulty, timeInSeconds: number) => set((state) => {
        const diffStats = state.statsByDifficulty[difficulty];
        const isBestTime = diffStats.bestTime === null || timeInSeconds < diffStats.bestTime;
        return {
          totalWins: state.totalWins + 1,
          currentWinStreak: state.currentWinStreak + 1,
          statsByDifficulty: {
            ...state.statsByDifficulty,
            [difficulty]: {
              gamesPlayed: diffStats.gamesPlayed + 1,
              bestTime: isBestTime ? timeInSeconds : diffStats.bestTime,
            }
          }
        };
      }),
      recordGameLost: (difficulty: Difficulty) => set((state) => ({
        currentWinStreak: 0,
        statsByDifficulty: {
          ...state.statsByDifficulty,
          [difficulty]: {
            ...state.statsByDifficulty[difficulty],
            gamesPlayed: state.statsByDifficulty[difficulty].gamesPlayed + 1,
          }
        }
      })),
      resetStats: () => set(initialStats),
    }),
    {
      name: 'sudomaster-stats',
    }
  )
);
