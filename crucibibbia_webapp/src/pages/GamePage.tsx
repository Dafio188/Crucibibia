import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CrosswordGrid, CustomKeyboard, ClueDisplay } from '../components';
import { loadPuzzle, getMonthName } from '../utils/puzzleLoader';
import { formatTime, getScoreBreakdown } from '../utils/scoreCalculator';
import { useGameStorage } from '../hooks/useGameStorage';
import type { PuzzleData, Position, Direction, Clue, ScoreBreakdown } from '../types';

export const GamePage: React.FC = () => {
  const { year, month } = useParams<{ year: string; month: string }>();
  const navigate = useNavigate();
  const yearNum = parseInt(year || '2000');
  const monthNum = parseInt(month || '1');
  const puzzleId = `${yearNum}_${String(monthNum).padStart(2, '0')}_08`;

  const {
    saveGameState,
    loadGameState,
    deleteGameState,
    markPuzzleCompleted,
    getPlayerStats,
  } = useGameStorage();

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

  // Timer e punteggio
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [errorsFound, setErrorsFound] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load puzzle
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await loadPuzzle(yearNum, monthNum);
      if (data) {
        setPuzzle(data);

        // Try to load saved state
        const savedState = loadGameState(puzzleId);
        if (savedState) {
          setUserGrid(savedState.userGrid);
          setElapsedTime(savedState.elapsedTime);
          setHintsUsed(savedState.hintsUsed);
          setErrorsFound(savedState.errorsFound);
        } else {
          // Initialize empty user grid
          const emptyGrid = data.grid.map((row) =>
            row.map((cell) => (cell.isBlack ? '' : ''))
          );
          setUserGrid(emptyGrid);
        }
      }
      setLoading(false);
    };
    load();
  }, [yearNum, monthNum, puzzleId, loadGameState]);

  // Timer
  useEffect(() => {
    if (!loading && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading, isCompleted]);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!puzzle || isCompleted || loading) return;

    const saveInterval = setInterval(() => {
      saveGameState({
        puzzleId,
        userGrid,
        elapsedTime,
        hintsUsed,
        errorsFound,
        lastModified: new Date().toISOString(),
      });
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [puzzle, userGrid, elapsedTime, hintsUsed, errorsFound, isCompleted, loading, puzzleId, saveGameState]);

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
      const otherDir = direction === 'horizontal' ? 'vertical' : 'horizontal';
      const otherClue = findClueForCell(selectedCell.row, selectedCell.col, otherDir);
      if (otherClue) {
        setDirection(otherDir);
        setHighlightedCells(otherClue.positions);
        setCurrentClue(otherClue);
      }
    }
  }, [selectedCell, direction, puzzle, findClueForCell]);

  // Check if puzzle is complete
  const checkCompletion = useCallback(() => {
    if (!puzzle) return false;

    for (let row = 0; row < puzzle.grid.length; row++) {
      for (let col = 0; col < puzzle.grid[row].length; col++) {
        const cell = puzzle.grid[row][col];
        if (!cell.isBlack) {
          const userLetter = userGrid[row]?.[col]?.toUpperCase();
          const correctLetter = cell.letter.toUpperCase();
          if (userLetter !== correctLetter) {
            return false;
          }
        }
      }
    }
    return true;
  }, [puzzle, userGrid]);

  // Handle completion
  const handleCompletion = useCallback(() => {
    if (isCompleted) return;

    setIsCompleted(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const stats = getPlayerStats();
    const breakdown = getScoreBreakdown(
      elapsedTime,
      hintsUsed,
      errorsFound,
      stats.currentStreak
    );

    setScoreBreakdown(breakdown);
    setShowCompletionDialog(true);

    // Save completion
    markPuzzleCompleted({
      puzzleId,
      completedAt: new Date().toISOString(),
      time: elapsedTime,
      score: breakdown.total,
      hintsUsed,
      errorsCount: errorsFound,
      perfectCompletion: hintsUsed === 0 && errorsFound === 0,
    });
  }, [isCompleted, elapsedTime, hintsUsed, errorsFound, puzzleId, getPlayerStats, markPuzzleCompleted]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setDirection((d) => (d === 'horizontal' ? 'vertical' : 'horizontal'));
    } else {
      setSelectedCell({ row, col });
    }
    setErrorCells([]);
    setCorrectCells([]);
  };

  // Handle key input
  const handleKeyPress = (key: string) => {
    if (!selectedCell || !puzzle || isCompleted) return;

    const { row, col } = selectedCell;
    const cell = puzzle.grid[row]?.[col];
    if (!cell || cell.isBlack) return;

    const newGrid = userGrid.map((r) => [...r]);
    newGrid[row][col] = key.toUpperCase();
    setUserGrid(newGrid);

    moveToNextCell();

    // Check completion after update
    setTimeout(() => {
      if (checkCompletion()) {
        handleCompletion();
      }
    }, 100);
  };

  // Handle backspace
  const handleBackspace = () => {
    if (!selectedCell || !puzzle || isCompleted) return;

    const { row, col } = selectedCell;

    if (userGrid[row]?.[col]) {
      const newGrid = userGrid.map((r) => [...r]);
      newGrid[row][col] = '';
      setUserGrid(newGrid);
    } else {
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
    setErrorsFound((prev) => prev + errors.length);

    if (errors.length === 0 && checkCompletion()) {
      handleCompletion();
    }
  };

  // Reveal current cell
  const handleHint = () => {
    if (!selectedCell || !puzzle || isCompleted) return;

    const { row, col } = selectedCell;
    const cell = puzzle.grid[row]?.[col];
    if (!cell || cell.isBlack) return;

    // Check if already revealed
    const alreadyRevealed = revealedCells.some(
      (p) => p.row === row && p.col === col
    );

    const newGrid = userGrid.map((r) => [...r]);
    newGrid[row][col] = cell.letter;
    setUserGrid(newGrid);

    if (!alreadyRevealed) {
      setRevealedCells([...revealedCells, { row, col }]);
      setHintsUsed((prev) => prev + 1);
    }

    moveToNextCell();

    // Check completion
    setTimeout(() => {
      if (checkCompletion()) {
        handleCompletion();
      }
    }, 100);
  };

  // Show solution
  const handleSolution = () => {
    if (!puzzle) return;

    if (confirm('Sei sicuro di voler vedere la soluzione? Non otterrai punti.')) {
      const newGrid = puzzle.grid.map((row) =>
        row.map((cell) => (cell.isBlack ? '' : cell.letter))
      );
      setUserGrid(newGrid);
      setIsCompleted(true);
      deleteGameState(puzzleId);
    }
  };

  // Restart puzzle
  const handleRestart = () => {
    if (!puzzle) return;

    if (confirm('Sei sicuro di voler ricominciare?')) {
      const emptyGrid = puzzle.grid.map((row) =>
        row.map((cell) => (cell.isBlack ? '' : ''))
      );
      setUserGrid(emptyGrid);
      setSelectedCell(null);
      setHighlightedCells([]);
      setErrorCells([]);
      setCorrectCells([]);
      setRevealedCells([]);
      setElapsedTime(0);
      setHintsUsed(0);
      setErrorsFound(0);
      setIsCompleted(false);
      deleteGameState(puzzleId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Errore nel caricamento del cruciverba
          </p>
          <Link to="/" className="btn btn-primary">
            Torna alla home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-primary-600 text-white py-3 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
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

          {/* Timer */}
          <div className="flex items-center gap-2 bg-primary-500 px-3 py-1 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-mono font-bold">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="bg-gray-100 dark:bg-gray-800 py-2 px-4 border-b dark:border-gray-700">
        <div className="max-w-2xl mx-auto flex justify-around text-sm">
          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400">Suggerimenti</span>
            <p className="font-bold text-primary-600 dark:text-primary-400">{hintsUsed}</p>
          </div>
          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400">Errori</span>
            <p className="font-bold text-red-600 dark:text-red-400">{errorsFound}</p>
          </div>
          <button
            onClick={handleRestart}
            className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            Ricomincia
          </button>
        </div>
      </div>

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
          <button
            onClick={handleCheck}
            className="btn btn-secondary flex-1"
            disabled={isCompleted}
          >
            Verifica
          </button>
          <button
            onClick={handleHint}
            className="btn btn-secondary flex-1"
            disabled={isCompleted}
          >
            Suggerimento
          </button>
          <button
            onClick={handleSolution}
            className="btn btn-secondary flex-1"
            disabled={isCompleted}
          >
            Soluzione
          </button>
        </div>

        {/* Keyboard */}
        <CustomKeyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} />
      </main>

      {/* Completion Dialog */}
      {showCompletionDialog && scoreBreakdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-10 h-10 text-green-600 dark:text-green-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Complimenti!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Hai completato il cruciverba!
              </p>
            </div>

            {/* Score breakdown */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Punteggio base</span>
                  <span className="font-medium">+{scoreBreakdown.baseScore}</span>
                </div>
                {scoreBreakdown.timeBonus > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Bonus tempo</span>
                    <span>+{scoreBreakdown.timeBonus}</span>
                  </div>
                )}
                {scoreBreakdown.perfectBonus > 0 && (
                  <div className="flex justify-between text-yellow-600 dark:text-yellow-400">
                    <span>Bonus perfetto!</span>
                    <span>+{scoreBreakdown.perfectBonus}</span>
                  </div>
                )}
                {scoreBreakdown.streakBonus > 0 && (
                  <div className="flex justify-between text-orange-600 dark:text-orange-400">
                    <span>Bonus streak</span>
                    <span>+{scoreBreakdown.streakBonus}</span>
                  </div>
                )}
                {scoreBreakdown.hintPenalty > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Suggerimenti usati</span>
                    <span>-{scoreBreakdown.hintPenalty}</span>
                  </div>
                )}
                {scoreBreakdown.errorPenalty > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Errori</span>
                    <span>-{scoreBreakdown.errorPenalty}</span>
                  </div>
                )}
                <div className="border-t dark:border-gray-600 pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Totale</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    {scoreBreakdown.total}
                  </span>
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="text-center mb-6">
              <span className="text-gray-500 dark:text-gray-400">Tempo: </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {formatTime(elapsedTime)}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/year/${yearNum}`)}
                className="btn btn-secondary flex-1"
              >
                Lista puzzle
              </button>
              <button onClick={() => navigate('/')} className="btn btn-primary flex-1">
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
