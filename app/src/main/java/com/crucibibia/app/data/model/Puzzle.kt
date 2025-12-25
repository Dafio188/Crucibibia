package com.crucibibia.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Rappresenta un cruciverba completo
 */
@Entity(tableName = "puzzles")
data class Puzzle(
    @PrimaryKey
    val id: String,           // es. "2005_08_08"
    val year: Int,            // Anno di pubblicazione (1994-2005)
    val month: Int = 1,       // Mese di pubblicazione (1-12)
    val number: Int,          // Numero nel anno (1-6)
    val title: String,        // Titolo del cruciverba
    val source: String,       // Fonte (es. "Svegliatevi! 8 agosto 2005")
    val gridSize: Int = 15,   // Dimensione griglia (15x15)
    val isCompleted: Boolean = false,
    val completedTime: Long? = null,  // Tempo impiegato in secondi
    val lastPlayedAt: Long? = null,
    val score: Int = 0,              // Punteggio ottenuto
    val hintsUsed: Int = 0,          // Suggerimenti usati
    val errorsCount: Int = 0,        // Errori commessi durante il gioco
    val perfectCompletion: Boolean = false  // Completato senza aiuti
)

/**
 * Cella della griglia
 */
data class Cell(
    val row: Int,
    val col: Int,
    val solution: Char?,      // Lettera corretta, null se cella nera
    val number: Int? = null,  // Numero della definizione (se presente)
    val isBlocked: Boolean = false
)

/**
 * Griglia del cruciverba
 */
data class Grid(
    val size: Int = 15,
    val cells: List<List<Cell>>
)

/**
 * Definizione/indizio
 */
data class Clue(
    val number: Int,
    val direction: Direction,
    val text: String,
    val answer: String,
    val startRow: Int,
    val startCol: Int,
    val length: Int
)

enum class Direction {
    HORIZONTAL,  // Orizzontale
    VERTICAL     // Verticale
}

/**
 * Dati completi del cruciverba per il gioco
 */
data class PuzzleData(
    val puzzle: Puzzle,
    val grid: Grid,
    val horizontalClues: List<Clue>,
    val verticalClues: List<Clue>
)

/**
 * Stato del gioco salvato
 */
@Entity(tableName = "game_states")
data class GameState(
    @PrimaryKey
    val puzzleId: String,
    val userInput: String,    // JSON della griglia utente
    val elapsedTime: Long,    // Tempo trascorso in secondi
    val lastModified: Long = System.currentTimeMillis(),
    val hintsUsed: Int = 0,         // Suggerimenti usati in questa sessione
    val errorsFound: Int = 0,       // Errori trovati durante le verifiche
    val cellsRevealed: Int = 0      // Celle rivelate con suggerimento
)

/**
 * Statistiche globali del giocatore
 */
data class PlayerStats(
    val totalScore: Int,
    val totalCompleted: Int,
    val totalPuzzles: Int,
    val perfectPuzzles: Int,
    val averageTime: Long?,
    val currentStreak: Int,
    val bestStreak: Int,
    val totalHintsUsed: Int,
    val level: PlayerLevel
)

/**
 * Livelli del giocatore basati sul punteggio
 */
enum class PlayerLevel(val title: String, val minScore: Int) {
    PRINCIPIANTE("Principiante", 0),
    APPRENDISTA("Apprendista", 500),
    STUDENTE("Studente Biblico", 1500),
    LETTORE("Lettore Assiduo", 3000),
    ESPERTO("Esperto", 5000),
    MAESTRO("Maestro", 8000),
    SAPIENTE("Sapiente", 12000),
    ERUDITO("Erudito Biblico", 18000);

    companion object {
        fun fromScore(score: Int): PlayerLevel {
            return values().filter { it.minScore <= score }.maxByOrNull { it.minScore } ?: PRINCIPIANTE
        }

        fun nextLevel(currentLevel: PlayerLevel): PlayerLevel? {
            val index = values().indexOf(currentLevel)
            return if (index < values().size - 1) values()[index + 1] else null
        }

        fun progressToNextLevel(score: Int): Float {
            val current = fromScore(score)
            val next = nextLevel(current) ?: return 1f
            val progressInLevel = score - current.minScore
            val levelRange = next.minScore - current.minScore
            return progressInLevel.toFloat() / levelRange
        }
    }
}

/**
 * Sistema di calcolo punteggio
 */
object ScoreCalculator {
    // Punteggio base per completamento
    private const val BASE_SCORE = 100

    // Bonus tempo (sotto i 10 minuti)
    private const val FAST_TIME_BONUS = 50
    private const val FAST_TIME_THRESHOLD = 600 // 10 minuti

    // Penalità per suggerimenti
    private const val HINT_PENALTY = 10

    // Penalità per errori
    private const val ERROR_PENALTY = 5

    // Bonus perfetto (no errori, no suggerimenti)
    private const val PERFECT_BONUS = 100

    // Bonus streak
    private const val STREAK_BONUS_PER_DAY = 10
    private const val MAX_STREAK_BONUS = 50

    fun calculateScore(
        completedTime: Long,
        hintsUsed: Int,
        errorsCount: Int,
        currentStreak: Int = 0
    ): Int {
        var score = BASE_SCORE

        // Bonus tempo veloce
        if (completedTime < FAST_TIME_THRESHOLD) {
            val timeBonus = ((FAST_TIME_THRESHOLD - completedTime) / 60 * 5).toInt()
            score += minOf(timeBonus, FAST_TIME_BONUS)
        }

        // Penalità suggerimenti
        score -= hintsUsed * HINT_PENALTY

        // Penalità errori
        score -= errorsCount * ERROR_PENALTY

        // Bonus perfetto
        if (hintsUsed == 0 && errorsCount == 0) {
            score += PERFECT_BONUS
        }

        // Bonus streak
        val streakBonus = minOf(currentStreak * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS)
        score += streakBonus

        return maxOf(score, 10) // Minimo 10 punti per completamento
    }

    fun getScoreBreakdown(
        completedTime: Long,
        hintsUsed: Int,
        errorsCount: Int,
        currentStreak: Int = 0
    ): ScoreBreakdown {
        val timeBonus = if (completedTime < FAST_TIME_THRESHOLD) {
            minOf(((FAST_TIME_THRESHOLD - completedTime) / 60 * 5).toInt(), FAST_TIME_BONUS)
        } else 0

        val hintPenalty = hintsUsed * HINT_PENALTY
        val errorPenalty = errorsCount * ERROR_PENALTY
        val perfectBonus = if (hintsUsed == 0 && errorsCount == 0) PERFECT_BONUS else 0
        val streakBonus = minOf(currentStreak * STREAK_BONUS_PER_DAY, MAX_STREAK_BONUS)

        return ScoreBreakdown(
            baseScore = BASE_SCORE,
            timeBonus = timeBonus,
            hintPenalty = hintPenalty,
            errorPenalty = errorPenalty,
            perfectBonus = perfectBonus,
            streakBonus = streakBonus,
            total = maxOf(BASE_SCORE + timeBonus - hintPenalty - errorPenalty + perfectBonus + streakBonus, 10)
        )
    }
}

/**
 * Dettaglio del punteggio
 */
data class ScoreBreakdown(
    val baseScore: Int,
    val timeBonus: Int,
    val hintPenalty: Int,
    val errorPenalty: Int,
    val perfectBonus: Int,
    val streakBonus: Int,
    val total: Int
)

/**
 * Stato di una cella durante il gioco
 */
data class CellState(
    val row: Int,
    val col: Int,
    val userChar: Char? = null,
    val isCorrect: Boolean? = null,  // null = non verificato
    val isRevealed: Boolean = false
)
