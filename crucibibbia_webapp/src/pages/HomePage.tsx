import React from 'react';
import { Link } from 'react-router-dom';
import { getAvailableYears } from '../utils/puzzleLoader';

export const HomePage: React.FC = () => {
  const years = getAvailableYears();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-primary-600 text-white py-8 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-bold mb-2">CruciBibbia</h1>
        <p className="text-primary-100">Cruciverba dalla Bibbia</p>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Seleziona un anno</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {years.map(({ year, puzzleCount }) => (
            <Link
              key={year}
              to={`/year/${year}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <span className="text-2xl font-bold text-primary-700">{year}</span>
                <p className="text-sm text-gray-500 mt-1">
                  {puzzleCount} {puzzleCount === 1 ? 'cruciverba' : 'cruciverba'}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Info section */}
        <div className="mt-8 p-4 bg-bible-cream rounded-xl border border-bible-gold/30">
          <h3 className="font-semibold text-bible-brown mb-2">Informazioni</h3>
          <p className="text-sm text-gray-700">
            CruciBibbia è una raccolta di cruciverba tratti dalla Bibbia,
            originariamente pubblicati nelle riviste Svegliatevi! dal 1994 al 2005.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500 mt-8">
        <p>Fonte: jw.org</p>
      </footer>
    </div>
  );
};
