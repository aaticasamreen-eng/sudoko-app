import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateSudoku, checkSolution, Difficulty } from '../lib/sudoku';
import { useStatsStore } from './statsStore';

export interface CellAction {
  r: number;
  c: number;
  val: number | null;
  notes: number[];
}

interface GameHistorySnapshot {
  grid: (number | null)[][];
  notes: number[][][];
}

interface GameState {
  hasStarted: boolean;
  difficulty: Difficulty;
  grid: (number | null)[][];
  givenCells: boolean[][];
  solution: number[][];
  notes: number[][][];
  timeElapsed: number;
  hintsRemaining: number;
  mistakes: number;
  isPaused: boolean;
  isGameOver: boolean;
  isSuccess: boolean;
  history: GameHistorySnapshot[];
  redoHistory: GameHistorySnapshot[];
  notesMode: boolean;
  selectedCell: { r: number, c: number } | null;
  errorCells: { r: number, c: number }[];

  startNewGame: (difficulty: Difficulty) => void;
  abandonGame: () => void;
  selectCell: (r: number, c: number) => void;
  inputNumber: (num: number, showMistakes: boolean, errorLimitMode: boolean) => void;
  deleteNumber: () => void;
  toggleNotesMode: () => void;
  undo: () => void;
  redo: () => void;
  useHint: () => void;
  checkBoard: () => void;
  togglePause: () => void;
  incrementTime: () => void;
}

const copyGrid = (grid: (number | null)[][]) => grid.map(row => [...row]);
const copyNotes = (notes: number[][][]) => notes.map(row => row.map(cell => [...cell]));

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      hasStarted: false,
      difficulty: 'Easy',
      grid: Array(9).fill(null).map(() => Array(9).fill(null)),
      givenCells: Array(9).fill(null).map(() => Array(9).fill(false)),
      solution: Array(9).fill(null).map(() => Array(9).fill(0)),
      notes: Array(9).fill(null).map(() => Array(9).fill([])),
      timeElapsed: 0,
      hintsRemaining: 3,
      mistakes: 0,
      isPaused: false,
      isGameOver: false,
      isSuccess: false,
      history: [],
      redoHistory: [],
      notesMode: false,
      selectedCell: null,
      errorCells: [],

      startNewGame: (difficulty: Difficulty) => {
        const current = get();
        if (current.hasStarted && !current.isGameOver && !current.isSuccess) {
          useStatsStore.getState().recordGameLost(current.difficulty);
        }
        
        const { puzzle, solution } = generateSudoku(difficulty);
        const givenCells = puzzle.map(row => row.map(cell => cell !== null));
        
        set({
          hasStarted: true,
          difficulty,
          grid: puzzle,
          givenCells,
          solution,
          notes: Array(9).fill(null).map(() => Array(9).fill([])),
          timeElapsed: 0,
          hintsRemaining: 3,
          mistakes: 0,
          isPaused: false,
          isGameOver: false,
          isSuccess: false,
          history: [],
          redoHistory: [],
          notesMode: false,
          selectedCell: null,
          errorCells: [],
        });
      },

      abandonGame: () => {
        const current = get();
        if (current.hasStarted && !current.isGameOver && !current.isSuccess) {
          useStatsStore.getState().recordGameLost(current.difficulty);
        }
        set({
          hasStarted: false,
          isGameOver: true,
        });
      },

      selectCell: (r, c) => {
        if (get().isPaused || get().isGameOver || get().isSuccess) return;
        set({ selectedCell: { r, c }, errorCells: [] });
      },

      inputNumber: (num, showMistakes, errorLimitMode) => {
        const { selectedCell, givenCells, notesMode, grid, notes, solution, history, isGameOver, isSuccess } = get();
        if (!selectedCell || isGameOver || isSuccess || get().isPaused) return;
        const { r, c } = selectedCell;
        
        if (givenCells[r][c]) return;

        const snapshot = { grid: copyGrid(grid), notes: copyNotes(notes) };

        if (notesMode) {
          const cellNotes = [...notes[r][c]];
          const idx = cellNotes.indexOf(num);
          if (idx !== -1) {
            cellNotes.splice(idx, 1);
          } else {
            cellNotes.push(num);
            cellNotes.sort();
          }
          const newNotes = copyNotes(notes);
          newNotes[r][c] = cellNotes;
          set({
            notes: newNotes,
            history: [...history, snapshot],
            redoHistory: [],
            errorCells: [],
          });
        } else {
          if (grid[r][c] === num) return;
          
          let newMistakes = get().mistakes;
          let newErrorCells: {r: number, c: number}[] = [];
          
          const isWrong = num !== solution[r][c];
          
          const newGrid = copyGrid(grid);
          newGrid[r][c] = num;
          
          if (isWrong) {
             newMistakes++;
          }
          
          const newNotes = copyNotes(notes);
          newNotes[r][c] = [];
          
          let gameOver = false;
          if (errorLimitMode && newMistakes >= 3) {
            gameOver = true;
            useStatsStore.getState().recordGameLost(get().difficulty);
          }
          
          const { isComplete } = checkSolution(newGrid, solution);
          let success = false;
          if (isComplete && !isWrong && !gameOver) {
             success = true;
             useStatsStore.getState().recordGameWon(get().difficulty, get().timeElapsed);
          }

          set({
            grid: newGrid,
            notes: newNotes,
            mistakes: newMistakes,
            isGameOver: gameOver,
            isSuccess: success,
            history: [...history, snapshot],
            redoHistory: [],
            errorCells: newErrorCells,
          });
        }
      },

      deleteNumber: () => {
        const { selectedCell, givenCells, grid, notes, history, isGameOver, isSuccess } = get();
        if (!selectedCell || isGameOver || isSuccess) return;
        const { r, c } = selectedCell;
        
        if (givenCells[r][c]) return;
        if (grid[r][c] === null && notes[r][c].length === 0) return;

        const snapshot = { grid: copyGrid(grid), notes: copyNotes(notes) };
        const newGrid = copyGrid(grid);
        const newNotes = copyNotes(notes);
        
        newGrid[r][c] = null;
        newNotes[r][c] = [];
        
        set({
          grid: newGrid,
          notes: newNotes,
          history: [...history, snapshot],
          redoHistory: [],
          errorCells: [],
        });
      },

      toggleNotesMode: () => set(state => ({ notesMode: !state.notesMode })),

      undo: () => {
        const { history, grid, notes, redoHistory } = get();
        if (history.length === 0) return;
        
        const lastState = history[history.length - 1];
        const newHistory = history.slice(0, -1);
        
        const currentStateSnapshot = { grid: copyGrid(grid), notes: copyNotes(notes) };
        
        set({
          grid: lastState.grid,
          notes: lastState.notes,
          history: newHistory,
          redoHistory: [...redoHistory, currentStateSnapshot],
          errorCells: [],
        });
      },

      redo: () => {
        const { history, grid, notes, redoHistory } = get();
        if (redoHistory.length === 0) return;
        
        const nextState = redoHistory[redoHistory.length - 1];
        const newRedoHistory = redoHistory.slice(0, -1);
        
        const currentStateSnapshot = { grid: copyGrid(grid), notes: copyNotes(notes) };
        
        set({
          grid: nextState.grid,
          notes: nextState.notes,
          history: [...history, currentStateSnapshot],
          redoHistory: newRedoHistory,
          errorCells: [],
        });
      },

      useHint: () => {
        const { hintsRemaining, grid, givenCells, solution, isGameOver, isSuccess, history, redoHistory } = get();
        if (hintsRemaining <= 0 || isGameOver || isSuccess) return;

        const options: {r: number, c: number}[] = [];
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (!givenCells[r][c] && grid[r][c] !== solution[r][c]) {
              options.push({r, c});
            }
          }
        }

        if (options.length === 0) return;

        const pick = options[Math.floor(Math.random() * options.length)];
        const val = solution[pick.r][pick.c];
        
        const newGrid = copyGrid(grid);
        newGrid[pick.r][pick.c] = val;
        
        const newNotes = copyNotes(get().notes);
        newNotes[pick.r][pick.c] = [];

        const newGivenCells = givenCells.map(row => [...row]);
        newGivenCells[pick.r][pick.c] = true;
        
        const updateSnapshot = (snap: GameHistorySnapshot) => {
          const sg = copyGrid(snap.grid);
          const sn = copyNotes(snap.notes);
          sg[pick.r][pick.c] = val;
          sn[pick.r][pick.c] = [];
          return { grid: sg, notes: sn };
        };

        const newHistory = history.map(updateSnapshot);
        const newRedoHistory = redoHistory.map(updateSnapshot);

        const { isComplete } = checkSolution(newGrid, solution);
        let success = false;
        if (isComplete) {
           success = true;
           useStatsStore.getState().recordGameWon(get().difficulty, get().timeElapsed);
        }

        set({
          grid: newGrid,
          notes: newNotes,
          givenCells: newGivenCells,
          hintsRemaining: hintsRemaining - 1,
          isSuccess: success,
          history: newHistory,
          redoHistory: newRedoHistory,
          errorCells: get().errorCells.filter(e => !(e.r === pick.r && e.c === pick.c))
        });
      },

      checkBoard: () => {
        const { grid, solution, isGameOver, isSuccess } = get();
        if (isGameOver || isSuccess) return;
        const { errors, isComplete } = checkSolution(grid, solution);
        set({ errorCells: errors });
        if (isComplete) {
          set({ isSuccess: true });
          useStatsStore.getState().recordGameWon(get().difficulty, get().timeElapsed);
        }
      },

      togglePause: () => {
        if (!get().hasStarted || get().isGameOver || get().isSuccess) return;
        set(state => ({ isPaused: !state.isPaused }));
      },

      incrementTime: () => {
        if (!get().isPaused && !get().isGameOver && !get().isSuccess && get().hasStarted) {
          set(state => ({ timeElapsed: state.timeElapsed + 1 }));
        }
      }
    }),
    {
      name: 'sudomaster-game',
    }
  )
);