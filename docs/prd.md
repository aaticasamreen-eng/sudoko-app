# Requirements Document

## 1. Application Overview

- **Application Name:** SudoMaster
- **Description:** A modern, feature-rich Sudoku web application with a clean, responsive interface. Players can enjoy dynamically generated puzzles across four difficulty levels, with gameplay aids including notes mode, hints, undo/redo, a timer, and persistent progress saving via local storage.

---

## 2. Users & Use Cases

- **Target Users:** Casual and competitive puzzle enthusiasts across all age groups, on both desktop and mobile devices.
- **Core Use Cases:**
  - Start a new game at a chosen difficulty level
  - Play through a puzzle with real-time feedback and gameplay aids
  - Resume a previously saved game on reload
  - Review personal statistics across difficulty levels

---

## 3. Page Structure & Core Features

### 3.1 Page Overview

```
SudoMaster
├── Home / Game Page
│   ├── Difficulty Selector
│   ├── Sudoku Grid
│   ├── Control Panel (Undo, Redo, Hint, Notes Mode, Check Solution, New Game)
│   ├── Timer (with Pause/Resume)
│   └── Settings Bar (Dark Mode, Sound Toggle, Show Mistakes Toggle)
├── Pause Overlay
└── Statistics Page
```

### 3.2 Home / Game Page

**Difficulty Selector**
- Four difficulty options: Easy, Medium, Hard, Expert
- Selecting a difficulty generates a new valid puzzle with a unique solution
- Active difficulty is visually highlighted

**Sudoku Grid**
- 9×9 grid with clearly delineated 3×3 sub-grids via thicker borders
- Cells are touch-friendly and keyboard-navigable
- Selecting a cell highlights the entire row, column, and 3×3 box of that cell
- Pre-filled (given) cells are visually distinct from user-entered cells
- Smooth animation on cell selection and number entry

**Number Input**
- Number pad (1–9) displayed below or beside the grid for touch/mouse input
- Keyboard input (1–9, Delete/Backspace to clear) supported on desktop
- In Notes Mode, numbers entered appear as small pencil marks within the cell
- In normal mode, numbers replace the cell value

**Notes Mode (Pencil Marks)**
- Toggle button to switch between normal input and notes mode
- Notes mode allows multiple candidate numbers (1–9) to be marked inside a single cell
- Notes are displayed as a 3×3 mini-grid of small digits within the cell
- Notes are cleared automatically when a definitive number is placed in that cell

**Undo / Redo**
- Undo reverses the last action (number entry, deletion, or note toggle)
- Redo re-applies the last undone action
- Both are accessible via on-screen buttons and keyboard shortcuts (Ctrl+Z / Ctrl+Y)

**Hint System**
- A Hint button fills one empty or incorrectly filled cell with the correct value
- Hints are limited per game (maximum 3 hints per game)
- Hint count remaining is displayed on the button

**Check Solution Button**
- Validates the entire current board against the unique solution
- Highlights all incorrect cells in a distinct error color
- Displays a success message if the board is fully and correctly completed

**Timer**
- Starts automatically when a new game begins
- Displays elapsed time in MM:SS format
- Pause button freezes the timer and hides the grid (shows Pause Overlay)
- Resume button restores the grid and continues the timer

**Show Mistakes Toggle**
- When enabled, incorrect number entries are highlighted in real-time as the user types
- When disabled, no real-time error indication is shown

**Error Limit Mode**
- When enabled, the game tracks the number of incorrect entries
- After 3 mistakes, the game ends and a Game Over state is displayed
- Mistake count (e.g., ✗ 1/3) is shown on the game page

**Dark Mode Toggle**
- Switches the entire UI between light and dark color themes
- Preference is persisted in local storage

**Sound Effects Toggle**
- Enables or disables sound effects for cell selection, number placement, errors, and puzzle completion
- Preference is persisted in local storage

**New Game Button**
- Prompts a confirmation dialog before discarding the current game
- Starts a fresh puzzle at the currently selected difficulty

### 3.3 Pause Overlay

- Displayed when the user pauses the game
- Covers the grid to prevent viewing the puzzle while paused
- Shows a Resume button to return to the game
- Timer is frozen while the overlay is active

### 3.4 Statistics Page

- Accessible via a navigation link or icon from the game page
- Displays the following stats, read from local storage:
  - Total games played (overall and per difficulty)
  - Best completion time per difficulty
  - Current win streak
  - Total wins
- A Reset Statistics button clears all stored stats after confirmation

---

## 4. Business Rules & Logic

### 4.1 Puzzle Generation
- Puzzles are generated dynamically using a backtracking algorithm
- Each generated puzzle is validated to have exactly one unique solution
- The number of pre-filled cells varies by difficulty:
  - Easy: ~36–40 given cells
  - Medium: ~28–35 given cells
  - Hard: ~22–27 given cells
  - Expert: ~17–21 given cells

### 4.2 Puzzle Validation
- An efficient solver verifies uniqueness of the solution at generation time
- The Check Solution feature compares the current board state against the stored solution

### 4.3 Progress Persistence
- Current game state (grid values, notes, timer, difficulty, hint count, mistake count) is saved to local storage on every user action
- On page reload, the last saved game is automatically restored
- Completing or abandoning a game clears the saved progress

### 4.4 Statistics Tracking
- On successful puzzle completion:
  - Games played count increments
  - If completion time is less than the stored best time for that difficulty, best time is updated
  - Win streak increments
- On game over (error limit reached) or manual abandon:
  - Win streak resets to 0
  - Games played count increments (as a loss)

### 4.5 Hint Logic
- Each game starts with 3 available hints
- Using a hint decrements the hint counter
- When hint count reaches 0, the Hint button is disabled
- Hints cannot be undone via the Undo function

### 4.6 Notes Behavior
- Notes in a cell are automatically cleared when a definitive number is placed in that cell
- Notes are included in the undo/redo history
- Notes are saved as part of the local storage game state

---

## 5. Exceptions & Edge Cases

| Scenario | Handling |
|---|---|
| User attempts to modify a pre-filled (given) cell | Input is blocked; cell is visually non-editable |
| Undo with no history | Undo button is disabled |
| Redo with no forward history | Redo button is disabled |
| Hint requested with 0 hints remaining | Hint button is disabled; no action taken |
| Error limit reached (3 mistakes) | Game Over overlay displayed; grid locked; option to start new game |
| Puzzle completed with all cells correct | Success animation and message displayed; stats updated |
| Local storage unavailable | Game functions normally without persistence; no error shown to user |
| User reloads with no saved game | Default state shown: difficulty selector active, empty grid, prompt to start a new game |
| Check Solution on incomplete board | Incorrect cells highlighted; no success message shown |

---

## 6. Acceptance Criteria

- A valid, uniquely solvable puzzle is generated for each difficulty level without fail
- Selecting a cell correctly highlights its row, column, and 3×3 box
- Notes mode correctly stores and displays multiple candidate digits per cell
- Undo and Redo correctly reverse and reapply all user actions (excluding hints)
- The timer starts, pauses, resumes, and stops accurately
- The Pause Overlay fully obscures the grid and freezes the timer
- Show Mistakes toggle correctly enables and disables real-time error highlighting
- Error Limit Mode correctly ends the game after 3 mistakes
- Hint correctly fills one cell and decrements the hint counter; disabled at 0
- Check Solution correctly identifies all incorrect cells and confirms a fully correct board
- Game state (grid, notes, timer, difficulty, hints, mistakes) is saved to and restored from local storage
- Statistics page accurately reflects games played, best times, and win streak
- Dark mode and sound toggle preferences persist across page reloads
- Layout is fully responsive and usable on both mobile and desktop screen sizes
- All interactive elements are keyboard-navigable

---

## 7. Out of Scope for This Release

- Daily Challenge mode
- Leaderboard or multiplayer system
- Multiple grid sizes (4×4, 6×6)
- Color theme customization beyond light/dark mode
- User accounts or cloud-based progress sync
- Commented or annotated source code output
- Backend or server-side components