import React from 'react';
import { Link } from 'react-router-dom';
import { getAvailableYears } from '../utils/puzzleLoader';
import { useGameStorage } from '../hooks/useGameStorage';
import { formatTime } from '../utils/scoreCalculator';

export const HomePage: React.FC = () => {
  const years = getAvailableYears();
  const { getPlayerStats } = useGameStorage();
  const stats = getPlayerStats();

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      style={{
        backgroundImage: 'url(/images/sfondo_menu.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay for readability */}
      <div className="min-h-screen bg-white/85 dark:bg-gray-900/90">
        {/* Header */}
        <header className="bg-primary-600 text-white py-6 px-4 shadow-lg">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">CruciBibbia</h1>
                <p className="text-primary-100">Cruciverba dalla Bibbia</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/help"
                  className="p-2 rounded-lg hover:bg-primary-500 transition-colors"
                  aria-label="Aiuto"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link
                  to="/settings"
                  className="p-2 rounded-lg hover:bg-primary-500 transition-colors"
                  aria-label="Impostazioni"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Player Stats Card */}
          {stats.totalCompleted > 0 && (
            <Link to="/settings" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-l-4 border-primary-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Il tuo livello</p>
                    <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {stats.level.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalScore}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">punti</p>
                  </div>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t dark:border-gray-700 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-gray-900 dark:text-white">{stats.totalCompleted}</p>
                    <p className="text-gray-500 dark:text-gray-400">completati</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-yellow-600 dark:text-yellow-400">{stats.perfectPuzzles}</p>
                    <p className="text-gray-500 dark:text-gray-400">perfetti</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-orange-600 dark:text-orange-400">{stats.currentStreak}</p>
                    <p className="text-gray-500 dark:text-gray-400">streak</p>
                  </div>
                  {stats.averageTime && (
                    <div className="text-center">
                      <p className="font-bold text-gray-900 dark:text-white">{formatTime(stats.averageTime)}</p>
                      <p className="text-gray-500 dark:text-gray-400">media</p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* Years Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Seleziona un anno
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {years.map(({ year, puzzleCount, completedCount }) => (
                <Link
                  key={year}
                  to={`/year/${year}`}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 border dark:border-gray-700"
                >
                  <div className="text-center">
                    <span className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                      {year}
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {puzzleCount} cruciverba
                    </p>
                    {completedCount > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${(completedCount / puzzleCount) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          {completedCount}/{puzzleCount} completati
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/help"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3 hover:shadow-lg transition-shadow border dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Come giocare</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Guida e suggerimenti</p>
              </div>
            </Link>

            <Link
              to="/settings"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-3 hover:shadow-lg transition-shadow border dark:border-gray-700"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Impostazioni</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Statistiche e tema</p>
              </div>
            </Link>
          </div>

          {/* Info section */}
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-700 p-4">
            <div className="flex items-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0"
              >
                <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
              </svg>
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Cruciverba Biblici
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Una raccolta di cruciverba tratti dalla Bibbia, originariamente pubblicati nelle
                  riviste Svegliatevi! dal 1994 al 2005.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Fonte: jw.org</p>
        </footer>
      </div>
    </div>
  );
};
