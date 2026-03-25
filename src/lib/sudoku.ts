export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

const N = 9;
const SRND = Math.sqrt(N);

export interface PuzzleResult {
  puzzle: (number | null)[][];
  solution: number[][];
}

const getTargetGivenCount = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'Easy': return Math.floor(Math.random() * (40 - 36 + 1)) + 36;
    case 'Medium': return Math.floor(Math.random() * (35 - 28 + 1)) + 28;
    case 'Hard': return Math.floor(Math.random() * (27 - 22 + 1)) + 22;
    case 'Expert': return Math.floor(Math.random() * (21 - 17 + 1)) + 17;
  }
};

const isSafe = (board: number[][], row: number, col: number, num: number) => {
  for (let d = 0; d < N; d++) {
    if (board[row][d] === num) return false;
  }
  for (let r = 0; r < N; r++) {
    if (board[r][col] === num) return false;
  }
  let boxRowStart = row - (row % SRND);
  let boxColStart = col - (col % SRND);
  for (let r = 0; r < SRND; r++) {
    for (let d = 0; d < SRND; d++) {
      if (board[r + boxRowStart][d + boxColStart] === num) return false;
    }
  }
  return true;
};

const fillBox = (board: number[][], rowStart: number, colStart: number) => {
  let num: number;
  for (let i = 0; i < SRND; i++) {
    for (let j = 0; j < SRND; j++) {
      do {
        num = Math.floor(Math.random() * N) + 1;
      } while (!isSafe(board, rowStart + i, colStart + j, num));
      board[rowStart + i][colStart + j] = num;
    }
  }
};

const fillDiagonal = (board: number[][]) => {
  for (let i = 0; i < N; i = i + SRND) {
    fillBox(board, i, i);
  }
};

const fillRemaining = (board: number[][], i: number, j: number): boolean => {
  if (j >= N && i < N - 1) {
    i = i + 1;
    j = 0;
  }
  if (i >= N && j >= N) {
    return true;
  }
  if (i < SRND) {
    if (j < SRND) {
      j = SRND;
    }
  } else if (i < N - SRND) {
    if (j === Math.floor(i / SRND) * SRND) {
      j = j + SRND;
    }
  } else {
    if (j === N - SRND) {
      i = i + 1;
      j = 0;
      if (i >= N) return true;
    }
  }
  
  if (board[i][j] !== 0) {
    return fillRemaining(board, i, j + 1);
  }

  for (let num = 1; num <= N; num++) {
    if (isSafe(board, i, j, num)) {
      board[i][j] = num;
      if (fillRemaining(board, i, j + 1)) return true;
      board[i][j] = 0;
    }
  }
  return false;
};

const solveBoard = (board: number[][]): boolean => {
  let row = -1;
  let col = -1;
  let isEmpty = true;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (board[i][j] === 0) {
        row = i;
        col = j;
        isEmpty = false;
        break;
      }
    }
    if (!isEmpty) {
      break;
    }
  }

  if (isEmpty) {
    return true;
  }

  for (let num = 1; num <= N; num++) {
    if (isSafe(board, row, col, num)) {
      board[row][col] = num;
      if (solveBoard(board)) {
        return true;
      }
      board[row][col] = 0;
    }
  }
  return false;
};

const countSolutions = (board: number[][], limit = 2): number => {
  let row = -1;
  let col = -1;
  let isEmpty = true;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (board[i][j] === 0) {
        row = i;
        col = j;
        isEmpty = false;
        break;
      }
    }
    if (!isEmpty) {
      break;
    }
  }

  if (isEmpty) {
    return 1;
  }

  let count = 0;
  for (let num = 1; num <= N; num++) {
    if (isSafe(board, row, col, num)) {
      board[row][col] = num;
      count += countSolutions(board, limit);
      board[row][col] = 0;
      if (count >= limit) return count;
    }
  }
  return count;
};

export const generateSudoku = (difficulty: Difficulty): PuzzleResult => {
  const board = Array.from({ length: N }, () => Array(N).fill(0));
  fillDiagonal(board);
  fillRemaining(board, 0, SRND);

  const solution = board.map(row => [...row]);

  let targetGiven = getTargetGivenCount(difficulty);
  let cellsToRemove = N * N - targetGiven;

  // Try removing random cells
  const cellPositions = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      cellPositions.push([r, c]);
    }
  }

  // Shuffle positions
  for (let i = cellPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cellPositions[i], cellPositions[j]] = [cellPositions[j], cellPositions[i]];
  }

  for (const [r, c] of cellPositions) {
    if (cellsToRemove <= 0) break;
    const temp = board[r][c];
    if (temp !== 0) {
      board[r][c] = 0;
      const solutions = countSolutions(board.map(row => [...row]), 2);
      if (solutions !== 1) {
        board[r][c] = temp;
      } else {
        cellsToRemove--;
      }
    }
  }

  const puzzle = board.map(row => row.map(cell => cell === 0 ? null : cell));

  return { puzzle, solution };
};

export const checkSolution = (current: (number | null)[][], solution: number[][]) => {
  const errors: { r: number, c: number }[] = [];
  let isComplete = true;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (current[r][c] === null) {
        isComplete = false;
      } else if (current[r][c] !== solution[r][c]) {
        errors.push({ r, c });
      }
    }
  }
  return { errors, isComplete: isComplete && errors.length === 0 };
};
