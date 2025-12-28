import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSettings, useGameStorage } from '../hooks/useGameStorage';
import { getProgressToNextLevel, getNextLevel, PLAYER_LEVELS, formatTime } from '../utils/scoreCalculator';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useAppSettings();
  const { getPlayerStats } = useGameStorage();
  const stats = getPlayerStats();
  const nextLevel = getNextLevel(stats.level.id);
  const progress = getProgressToNextLevel(stats.totalScore);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-primary-600 text-white py-4 px-4 shadow-lg">
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
          <h1 className="text-xl font-bold">Impostazioni</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Player Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-primary-600"
            >
              <path
                fillRule="evenodd"
                d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307z"
                clipRule="evenodd"
              />
            </svg>
            Statistiche
          </h2>

          {/* Level */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {stats.level.title}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {stats.totalScore} punti
              </span>
            </div>
            {nextLevel && (
              <>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${progress * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {nextLevel.minScore - stats.totalScore} punti al prossimo livello
                </p>
              </>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {stats.totalCompleted}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completati</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.perfectPuzzles}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Perfetti</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.currentStreak}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Streak attuale</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">
                {stats.averageTime ? formatTime(stats.averageTime) : '-'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tempo medio</p>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-primary-600"
            >
              <path
                fillRule="evenodd"
                d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                clipRule="evenodd"
              />
            </svg>
            Aspetto
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Tema scuro</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Attiva la modalità scura
              </p>
            </div>
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.darkMode ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Levels Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-primary-600"
            >
              <path
                fillRule="evenodd"
                d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743-.356l.135-.054a2.25 2.25 0 012.146 0l.135.054a6.73 6.73 0 002.743.356 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z"
                clipRule="evenodd"
              />
              <path d="M12.75 12a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0V12zm-3.75 3.75a.75.75 0 00-.75.75v3a.75.75 0 001.5 0v-3a.75.75 0 00-.75-.75zm6.75.75a.75.75 0 00-1.5 0v3a.75.75 0 001.5 0v-3z" />
            </svg>
            Livelli
          </h2>

          <div className="space-y-3">
            {PLAYER_LEVELS.map((level) => (
              <div
                key={level.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  stats.level.id === level.id
                    ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500'
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {stats.totalScore >= level.minScore ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-green-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-gray-300 dark:text-gray-600"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span
                    className={`font-medium ${
                      stats.level.id === level.id
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {level.title}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {level.minScore} punti
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-primary-600"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
            Informazioni
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">CruciBibbia</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Cruciverba biblici tratti dalla rivista Svegliatevi! degli anni 1994-2005.
                Metti alla prova la tua conoscenza della Bibbia mentre ti diverti!
              </p>
            </div>

            <div className="border-t dark:border-gray-700 pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                I cruciverba sono tratti da Svegliatevi!, pubblicazione dei Testimoni di Geova.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Versione 1.0.0
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
