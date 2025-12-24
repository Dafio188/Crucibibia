package com.crucibibia.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Rappresenta un cruciverba completo
 */
@Entity(tableName = "puzzles")
data class Puzzle(
    @PrimaryKey
    val id: String,           // es. "1994_01"
    val year: Int,            // Anno di pubblicazione (1994-2005)
    val number: Int,          // Numero nel anno (1-6)
    val title: String,        // Titolo del cruciverba
    val source: String,       // Fonte (es. "Svegliatevi! Gennaio 1994")
    val gridSize: Int = 15,   // Dimensione griglia (15x15)
    val isCompleted: Boolean = false,
    val completedTime: Long? = null,  // Tempo impiegato in secondi
    val lastPlayedAt: Long? = null
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
    val lastModified: Long = System.currentTimeMillis()
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
