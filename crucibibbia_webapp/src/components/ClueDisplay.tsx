import React from 'react';
import type { Clue } from '../types';
import { getWolUrlFromText } from '../utils/bibleHelper';

interface ClueDisplayProps {
  clue: Clue | null;
}

export const ClueDisplay: React.FC<ClueDisplayProps> = ({ clue }) => {
  if (!clue) {
    return (
      <div className="bg-primary-50 rounded-xl p-4 mb-4">
        <p className="text-gray-500 text-center">Seleziona una cella per vedere la definizione</p>
      </div>
    );
  }

  const wolUrl = getWolUrlFromText(clue.text);

  return (
    <div className="bg-primary-50 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-primary-700 font-bold text-lg">{clue.number}.</span>
        <div className="flex-1">
          <span className="text-xs text-primary-600 uppercase tracking-wide">
            {clue.direction === 'horizontal' ? 'Orizzontale' : 'Verticale'}
          </span>
          <p className="text-gray-800 mt-1">{clue.text}</p>
        </div>
        {wolUrl && (
          <a
            href={wolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-primary-100 hover:bg-primary-200 transition-colors"
            title="Apri scrittura"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-primary-700"
            >
              <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};
