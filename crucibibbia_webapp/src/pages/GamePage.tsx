import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CrosswordGrid, CustomKeyboard, ClueDisplay } from '../components';
import { loadPuzzle, getMonthName } from '../utils/puzzleLoader';
import type { PuzzleData, Position, Direction, Clue } from '../types';

export const GamePage: React.FC = () => {
  const { year, month } = useParams<{ year: string; month: string }>();
  const yearNum = parseInt(year || '2000');
  const monthNum = parseInt(month || '1');

  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [direction, setDirection] = useState<Direction>('horizontal');
  const [highlightedCells, setHighlightedCells] = useState<Position[]>([]);
  const [currentClue, setCurrentClue] = useState<Clue | null>(null);
  const [errorCells, setErrorCells] = useState<Position[]>([]);
  const [correctCells, setCorrectCells] = useState<Position[]>([]);
  const [revealedCells, setRevealedCells] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  // Load puzzle
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await loadPuzzle(yearNum, monthNum);
      if (data) {
        setPuzzle(data);
        // Initialize empty user grid
        const emptyGrid = data.grid.map((row) =>
          row.map((cell) => (cell.isBlack ? '' : ''))
        );
        setUserGrid(emptyGrid);
      }
      setLoading(false);
    };
    load();
  }, [yearNum, monthNum]);

  // Find clue for a cell
  const findClueForCell = useCallback(
    (row: number, col: number, dir: Direction): Clue | null => {
      if (!puzzle) return null;

      const clues = dir === 'horizontal' ? puzzle.horizontalClues : puzzle.verticalClues;
      return clues.find((clue) =>
        clue.positions.some((pos) => pos.row === row && pos.col === col)
      ) || null;
    },
    [puzzle]
  );

  // Update highlighted cells when selection changes
  useEffect(() => {
    if (!selectedCell || !puzzle) {
      setHighlightedCells([]);
      setCurrentClue(null);
      return;
    }

    const clue = findClueForCell(selectedCell.row, selectedCell.col, direction);
    if (clue) {
      setHighlightedCells(clue.positions);
      setCurrentClue(clue);
    } else {
      // Try other direction
      const otherDir = direction === 'horizontal' ? 'vertical' : 'horizontal';
      const otherClue = findClueForCell(selectedCell.row, selectedCell.col, otherDir);
      if (otherClue) {
        setDirection(otherDir);
        setHighlightedCells(otherClue.positions);
        setCurrentClue(otherClue);
      }
    }
  }, [selectedCell, direction, puzzle, findClueForCell]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (selectedCell?.row === row && selectedCell?.col === col) {
      // Toggle direction
      setDirection((d) => (d === 'horizontal' ? 'vertical' : 'horizontal'));
    } else {
      setSelectedCell({ row, col });
    }
    // Clear error highlighting on new selection
    setErrorCells([]);
    setCorrectCells([]);
  };

  // Handle key input
  const handleKeyPress = (key: string) => {
    if (!selectedCell || !puzzle) return;

    const { row, col } = selectedCell;
    const cell = puzzle.grid[row]?.[col];
    if (!cell || cell.isBlack) return;

    // Update user grid
    const newGrid = userGrid.map((r) => [...r]);
    newGrid[row][col] = key;
    setUserGrid(newGrid);

    // Move to next cell
    moveToNextCell();
  };

  // Handle backspace
  const handleBackspace = () => {
    if (!selectedCell || !puzzle) return;

    const { row, col } = selectedCell;

    // If current cell has content, clear it
    if (userGrid[row]?.[col]) {
      const newGrid = userGrid.map((r) => [...r]);
      newGrid[row][col] = '';
      setUserGrid(newGrid);
    } else {
      // Move to previous cell and clear
      moveToPreviousCell();
    }
  };

  // Move to next cell in current word
  const moveToNextCell = () => {
    if (!selectedCell || !currentClue) return;

    const currentIndex = currentClue.positions.findIndex(
      (p) => p.row === selectedCell.row && p.col === selectedCell.col
    );

    if (currentIndex < currentClue.positions.length - 1) {
      const nextPos = currentClue.positions[currentIndex + 1];
      setSelectedCell(nextPos);
    }
  };

  // Move to previous cell in current word
  const moveToPreviousCell = () => {
    if (!selectedCell || !currentClue) return;

    const currentIndex = currentClue.positions.findIndex(
      (p) => p.row === selectedCell.row && p.col === selectedCell.col
    );

    if (currentIndex > 0) {
      const prevPos = currentClue.positions[currentIndex - 1];
      setSelectedCell(prevPos);
      // Clear the previous cell
      const newGrid = userGrid.map((r) => [...r]);
      newGrid[prevPos.row][prevPos.col] = '';
      setUserGrid(newGrid);
    }
  };

  // Check answers
  const handleCheck = () => {
    if (!puzzle) return;

    const errors: Position[] = [];
    const correct: Position[] = [];

    puzzle.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (!cell.isBlack) {
          const userLetter = userGrid[rowIndex]?.[colIndex]?.toUpperCase();
          const correctLetter = cell.letter.toUpperCase();

          if (userLetter && userLetter !== correctLetter) {
            errors.push({ row: rowIndex, col: colIndex });
          } else if (userLetter === correctLetter) {
            correct.push({ row: rowIndex, col: colIndex });
          }
        }
      });
    });

    setErrorCells(errors);
    setCorrectCells(correct);
  };

  // Reveal current cell
  const handleHint = () => {
    if (!selectedCell || !puzzle) return;

    const { row, col } = selectedCell;
    const cell = puzzle.grid[row]?.[col];
    if (!cell || cell.isBlack) return;

    const newGrid = userGrid.map((r) => [...r]);
    newGrid[row][col] = cell.letter;
    setUserGrid(newGrid);
    setRevealedCells([...revealedCells, { row, col }]);

    moveToNextCell();
  };

  // Show solution
  const handleSolution = () => {
    if (!puzzle) return;

    if (confirm('Sei sicuro di voler vedere la soluzione?')) {
      const newGrid = puzzle.grid.map((row) =>
        row.map((cell) => (cell.isBlack ? '' : cell.letter))
      );
      setUserGrid(newGrid);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Errore nel caricamento del cruciverba</p>
          <Link to="/" className="btn btn-primary">
            Torna alla home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary-600 text-white py-3 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            to={`/year/${yearNum}`}
            className="p-2 rounded-lg hover:bg-primary-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <div>
            <h1 className="font-bold">
              {getMonthName(monthNum)} {yearNum}
            </h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4">
        {/* Clue display */}
        <ClueDisplay clue={currentClue} />

        {/* Grid */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <CrosswordGrid
            grid={puzzle.grid}
            userGrid={userGrid}
            selectedCell={selectedCell}
            highlightedCells={highlightedCells}
            errorCells={errorCells}
            correctCells={correctCells}
            revealedCells={revealedCells}
            onCellClick={handleCellClick}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-4">
          <button onClick={handleCheck} className="btn btn-secondary flex-1">
            Verifica
          </button>
          <button onClick={handleHint} className="btn btn-secondary flex-1">
            Suggerimento
          </button>
          <button onClick={handleSolution} className="btn btn-secondary flex-1">
            Soluzione
          </button>
        </div>

        {/* Keyboard */}
        <CustomKeyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
      </main>
    </div>
  );
};
