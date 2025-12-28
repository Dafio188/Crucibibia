import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPuzzlesForYear, getMonthName } from '../utils/puzzleLoader';

export const YearPage: React.FC = () => {
  const { year } = useParams<{ year: string }>();
  const yearNum = parseInt(year || '2000');
  const puzzles = getPuzzlesForYear(yearNum);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-primary-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            to="/"
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
            <h1 className="text-2xl font-bold">{yearNum}</h1>
            <p className="text-primary-100 text-sm">
              {puzzles.length} cruciverba disponibili
            </p>
          </div>
        </div>
      </header>

      {/* Puzzle list */}
      <main className="max-w-2xl mx-auto p-4">
        <div className="space-y-3">
          {puzzles.map((puzzle) => (
            <Link
              key={puzzle.id}
              to={`/game/${puzzle.year}/${puzzle.month}`}
              className="card flex items-center justify-between hover:shadow-lg transition-shadow"
            >
              <div>
                <span className="font-semibold text-gray-800">
                  {getMonthName(puzzle.month)} {puzzle.year}
                </span>
                <p className="text-sm text-gray-500">8 {getMonthName(puzzle.month)}</p>
              </div>
              <div className="flex items-center gap-2">
                {puzzle.completed && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                    Completato
                  </span>
                )}
                {puzzle.inProgress && !puzzle.completed && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                    In corso
                  </span>
                )}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-gray-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {puzzles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Nessun cruciverba disponibile per questo anno</p>
          </div>
        )}
      </main>
    </div>
  );
};
