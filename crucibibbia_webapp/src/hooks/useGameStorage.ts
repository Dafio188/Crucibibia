import { useState, useEffect, useCallback } from 'react';
import type { SavedGameState, CompletedPuzzle, PlayerStats, AppSettings } from '../types';
import { getLevelFromScore } from '../utils/scoreCalculator';

const STORAGE_KEYS = {
  GAME_STATES: 'crucibibbia_game_states',
  COMPLETED_PUZZLES: 'crucibibbia_completed_puzzles',
  SETTINGS: 'crucibibbia_settings',
  LAST_PLAYED: 'crucibibbia_last_played',
};

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  soundEnabled: true,
};

/**
 * Hook per gestire il salvataggio dello stato di gioco
 */
export function useGameStorage() {
  // Salva lo stato del gioco
  const saveGameState = useCallback((state: SavedGameState) => {
    const states = getGameStates();
    states[state.puzzleId] = state;
    localStorage.setItem(STORAGE_KEYS.GAME_STATES, JSON.stringify(states));
  }, []);

  // Carica lo stato del gioco
  const loadGameState = useCallback((puzzleId: string): SavedGameState | null => {
    const states = getGameStates();
    return states[puzzleId] || null;
  }, []);

  // Elimina lo stato del gioco
  const deleteGameState = useCallback((puzzleId: string) => {
    const states = getGameStates();
    delete states[puzzleId];
    localStorage.setItem(STORAGE_KEYS.GAME_STATES, JSON.stringify(states));
  }, []);

  // Marca puzzle come completato
  const markPuzzleCompleted = useCallback((completed: CompletedPuzzle) => {
    const puzzles = getCompletedPuzzles();
    puzzles[completed.puzzleId] = completed;
    localStorage.setItem(STORAGE_KEYS.COMPLETED_PUZZLES, JSON.stringify(puzzles));

    // Rimuovi lo stato di gioco salvato
    deleteGameState(completed.puzzleId);

    // Aggiorna ultimo giocato
    localStorage.setItem(STORAGE_KEYS.LAST_PLAYED, new Date().toISOString());
  }, [deleteGameState]);

  // Controlla se un puzzle è completato
  const isPuzzleCompleted = useCallback((puzzleId: string): boolean => {
    const puzzles = getCompletedPuzzles();
    return puzzleId in puzzles;
  }, []);

  // Controlla se un puzzle è in corso
  const isPuzzleInProgress = useCallback((puzzleId: string): boolean => {
    const states = getGameStates();
    return puzzleId in states;
  }, []);

  // Ottieni info completamento puzzle
  const getCompletedPuzzle = useCallback((puzzleId: string): CompletedPuzzle | null => {
    const puzzles = getCompletedPuzzles();
    return puzzles[puzzleId] || null;
  }, []);

  // Calcola statistiche giocatore
  const getPlayerStats = useCallback((): PlayerStats => {
    const completed = Object.values(getCompletedPuzzles());

    const totalScore = completed.reduce((sum, p) => sum + p.score, 0);
    const totalCompleted = completed.length;
    const perfectPuzzles = completed.filter(p => p.perfectCompletion).length;
    const totalHintsUsed = completed.reduce((sum, p) => sum + p.hintsUsed, 0);

    const times = completed.map(p => p.time).filter(t => t > 0);
    const averageTime = times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : null;

    // Calcola streak
    const { currentStreak, bestStreak } = calculateStreak(completed);

    return {
      totalScore,
      totalCompleted,
      perfectPuzzles,
      averageTime,
      currentStreak,
      bestStreak,
      totalHintsUsed,
      level: getLevelFromScore(totalScore),
    };
  }, []);

  return {
    saveGameState,
    loadGameState,
    deleteGameState,
    markPuzzleCompleted,
    isPuzzleCompleted,
    isPuzzleInProgress,
    getCompletedPuzzle,
    getPlayerStats,
  };
}

/**
 * Hook per le impostazioni dell'app
 */
export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { settings, updateSettings };
}

// Helper functions
function getGameStates(): Record<string, SavedGameState> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_STATES);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function getCompletedPuzzles(): Record<string, CompletedPuzzle> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_PUZZLES);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function calculateStreak(completed: CompletedPuzzle[]): { currentStreak: number; bestStreak: number } {
  if (completed.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Ordina per data di completamento
  const sorted = [...completed].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  // Calcola streak corrente
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastCompleted = new Date(sorted[0].completedAt);
  lastCompleted.setHours(0, 0, 0, 0);

  const daysSinceLastCompletion = Math.floor(
    (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Se l'ultimo completamento è stato più di 1 giorno fa, streak è 0
  if (daysSinceLastCompletion > 1) {
    currentStreak = 0;
  } else {
    // Conta giorni consecutivi
    const completedDates = new Set(
      sorted.map(p => {
        const d = new Date(p.completedAt);
        d.setHours(0, 0, 0, 0);
        return d.toISOString();
      })
    );

    let checkDate = new Date(lastCompleted);
    while (completedDates.has(checkDate.toISOString())) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Calcola best streak (semplificato)
  const bestStreak = Math.max(currentStreak, completed.length > 5 ? 5 : completed.length);

  return { currentStreak, bestStreak };
}
