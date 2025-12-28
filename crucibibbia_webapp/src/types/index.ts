// Direction for clues
export type Direction = 'horizontal' | 'vertical';

// Cell position
export interface Position {
  row: number;
  col: number;
}

// A single cell in the grid
export interface Cell {
  row: number;
  col: number;
  letter: string;
  isBlack: boolean;
  number?: number;
  hasHorizontal?: boolean;
  hasVertical?: boolean;
}

// A clue with its metadata
export interface Clue {
  number: number;
  text: string;
  answer: string;
  direction: Direction;
  startRow: number;
  startCol: number;
  length: number;
  positions: Position[];
}

// Complete puzzle data
export interface PuzzleData {
  id: string;
  date: string;
  year: number;
  month: number;
  gridSize: number;
  grid: Cell[][];
  horizontalClues: Clue[];
  verticalClues: Clue[];
}

// User's progress on a puzzle
export interface UserProgress {
  puzzleId: string;
  userGrid: string[][];
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  hintsUsed: number;
  errorsFound: number;
}

// Game state
export interface GameState {
  puzzle: PuzzleData | null;
  userGrid: string[][];
  selectedCell: Position | null;
  currentDirection: Direction;
  highlightedCells: Position[];
  currentClue: Clue | null;
  isCompleted: boolean;
  errorCells: Position[];
  correctCells: Position[];
  revealedCells: Position[];
}

// Year with puzzles count
export interface YearInfo {
  year: number;
  puzzleCount: number;
  completedCount: number;
}

// Puzzle summary for list
export interface PuzzleSummary {
  id: string;
  date: string;
  year: number;
  month: number;
  completed: boolean;
  inProgress: boolean;
}
