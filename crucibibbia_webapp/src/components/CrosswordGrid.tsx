import React from 'react';
import type { Cell, Position } from '../types';

interface CrosswordGridProps {
  grid: Cell[][];
  userGrid: string[][];
  selectedCell: Position | null;
  highlightedCells: Position[];
  errorCells: Position[];
  correctCells: Position[];
  revealedCells: Position[];
  onCellClick: (row: number, col: number) => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  grid,
  userGrid,
  selectedCell,
  highlightedCells,
  errorCells,
  correctCells,
  revealedCells,
  onCellClick,
}) => {
  const gridSize = grid.length;

  const isSelected = (row: number, col: number) =>
    selectedCell?.row === row && selectedCell?.col === col;

  const isHighlighted = (row: number, col: number) =>
    highlightedCells.some(c => c.row === row && c.col === col);

  const isError = (row: number, col: number) =>
    errorCells.some(c => c.row === row && c.col === col);

  const isCorrect = (row: number, col: number) =>
    correctCells.some(c => c.row === row && c.col === col);

  const isRevealed = (row: number, col: number) =>
    revealedCells.some(c => c.row === row && c.col === col);

  const getCellClasses = (cell: Cell, row: number, col: number) => {
    const base = 'relative flex items-center justify-center border border-gray-400 text-lg font-bold select-none';

    if (cell.isBlack) {
      return `${base} bg-gray-800`;
    }

    let bg = 'bg-white';
    if (isSelected(row, col)) {
      bg = 'bg-primary-400';
    } else if (isHighlighted(row, col)) {
      bg = 'bg-primary-100';
    }

    let textColor = 'text-gray-900';
    if (isError(row, col)) {
      bg = 'bg-red-200';
      textColor = 'text-red-700';
    } else if (isCorrect(row, col)) {
      bg = 'bg-green-200';
      textColor = 'text-green-700';
    } else if (isRevealed(row, col)) {
      textColor = 'text-blue-600';
    }

    return `${base} ${bg} ${textColor} cursor-pointer hover:bg-primary-50 active:bg-primary-200 transition-colors`;
  };

  // Calculate cell size based on viewport
  const cellSize = `min(calc((100vw - 2rem) / ${gridSize}), calc((100vh - 20rem) / ${gridSize}), 2.5rem)`;

  return (
    <div
      className="grid gap-0 mx-auto"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, ${cellSize})`,
        gridTemplateRows: `repeat(${gridSize}, ${cellSize})`,
      }}
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={getCellClasses(cell, rowIndex, colIndex)}
            style={{ width: cellSize, height: cellSize }}
            onClick={() => !cell.isBlack && onCellClick(rowIndex, colIndex)}
          >
            {/* Cell number */}
            {cell.number && !cell.isBlack && (
              <span className="absolute top-0 left-0.5 text-[0.5rem] text-gray-600 leading-none">
                {cell.number}
              </span>
            )}
            {/* User input or empty */}
            {!cell.isBlack && (
              <span className="uppercase">
                {userGrid[rowIndex]?.[colIndex] || ''}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
};
