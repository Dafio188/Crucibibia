import type { ScoreBreakdown, PlayerLevel, PlayerLevelInfo } from '../types';

// Costanti punteggio
const BASE_SCORE = 100;
const FAST_TIME_BONUS = 50;
const FAST_TIME_THRESHOLD = 600; // 10 minuti in secondi
const HINT_PENALTY = 10;
const ERROR_PENALTY = 5;
const PERFECT_BONUS = 100;
const STREAK_BONUS_PER_DAY = 10;
const MAX_STREAK_BONUS = 50;

// Definizione livelli
export const PLAYER_LEVELS: PlayerLevelInfo[] = [
  { id: 'principiante', title: 'Principiante', minScore: 0 },
  { id: 'apprendista', title: 'Apprendista', minScore: 500 },
  { id: 'studente', title: 'Studente Biblico', minScore: 1500 },
  { id: 'lettore', title: 'Lettore Assiduo', minScore: 3000 },
  { id: 'esperto', title: 'Esperto', minScore: 5000 },
  { id: 'maestro', title: 'Maestro', minScore: 8000 },
  { id: 'sapiente', title: 'Sapiente', minScore: 12000 },
  { id: 'erudito', title: 'Erudito Biblico', minScore: 18000 },
];

/**
 * Calcola il punteggio totale
 */
export function calculateScore(
  completedTime: number,
  hintsUsed: number,
  errorsCount: number,
  currentStreak: number = 0
): number {
  let score = BASE_SCORE;

  // Bonus tempo veloce
  if (completedTime < FAST_TIME_THRESHOLD) {
    const timeBonus = Math.floor((FAST_TIME_THRESHOLD - completedTime) / 60) * 5;
    score += Math.min(timeBonus, FAST_TIME_BONUS);
  }

  // Penalità suggerimenti
  score -= hintsUsed * HINT_PENALTY;

  // Penalità errori
  score -= errorsCount * ERROR_PENALTY;

  // Bonus perfetto
  if (hintsUsed === 0 && errorsCount === 0) {
    score += PERFECT_BONUS;
  }

  // Bonus streak
  const streakBonus = Math.min(currentStreak * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS);
  score += streakBonus;

  return Math.max(score, 10); // Minimo 10 punti
}

/**
 * Ottiene il dettaglio del punteggio
 */
export function getScoreBreakdown(
  completedTime: number,
  hintsUsed: number,
  errorsCount: number,
  currentStreak: number = 0
): ScoreBreakdown {
  const timeBonus = completedTime < FAST_TIME_THRESHOLD
    ? Math.min(Math.floor((FAST_TIME_THRESHOLD - completedTime) / 60) * 5, FAST_TIME_BONUS)
    : 0;

  const hintPenalty = hintsUsed * HINT_PENALTY;
  const errorPenalty = errorsCount * ERROR_PENALTY;
  const perfectBonus = hintsUsed === 0 && errorsCount === 0 ? PERFECT_BONUS : 0;
  const streakBonus = Math.min(currentStreak * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS);

  const total = Math.max(
    BASE_SCORE + timeBonus - hintPenalty - errorPenalty + perfectBonus + streakBonus,
    10
  );

  return {
    baseScore: BASE_SCORE,
    timeBonus,
    hintPenalty,
    errorPenalty,
    perfectBonus,
    streakBonus,
    total,
  };
}

/**
 * Ottiene il livello dal punteggio
 */
export function getLevelFromScore(score: number): PlayerLevelInfo {
  for (let i = PLAYER_LEVELS.length - 1; i >= 0; i--) {
    if (score >= PLAYER_LEVELS[i].minScore) {
      return PLAYER_LEVELS[i];
    }
  }
  return PLAYER_LEVELS[0];
}

/**
 * Ottiene il prossimo livello
 */
export function getNextLevel(currentLevel: PlayerLevel): PlayerLevelInfo | null {
  const index = PLAYER_LEVELS.findIndex(l => l.id === currentLevel);
  if (index < PLAYER_LEVELS.length - 1) {
    return PLAYER_LEVELS[index + 1];
  }
  return null;
}

/**
 * Calcola il progresso verso il prossimo livello (0-1)
 */
export function getProgressToNextLevel(score: number): number {
  const current = getLevelFromScore(score);
  const next = getNextLevel(current.id);
  if (!next) return 1;

  const progressInLevel = score - current.minScore;
  const levelRange = next.minScore - current.minScore;
  return progressInLevel / levelRange;
}

/**
 * Formatta il tempo in mm:ss
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
