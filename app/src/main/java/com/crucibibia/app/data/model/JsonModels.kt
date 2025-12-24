package com.crucibibia.app.data.model

/**
 * Modelli per il parsing dei file JSON delle griglie
 * Questi modelli verranno adattati in base al formato esatto dei file
 */

/**
 * Struttura JSON della griglia
 */
data class GridJson(
    val size: Int = 15,
    val grid: List<List<String>>,  // Griglia con lettere o "#" per celle nere
    val numbers: List<NumberPosition>? = null  // Posizioni dei numeri
)

data class NumberPosition(
    val number: Int,
    val row: Int,
    val col: Int
)

/**
 * Struttura JSON dello schema/definizioni
 */
data class SchemaJson(
    val id: String,
    val year: Int,
    val number: Int,
    val title: String,
    val source: String? = null,
    val horizontal: List<ClueJson>,
    val vertical: List<ClueJson>
)

data class ClueJson(
    val number: Int,
    val clue: String,
    val answer: String? = null  // Opzionale, potrebbe essere nella griglia
)

/**
 * Formato alternativo - tutto in un unico file
 */
data class PuzzleJson(
    val id: String,
    val year: Int,
    val number: Int,
    val title: String,
    val source: String? = null,
    val grid: List<List<String>>,
    val clues: CluesJson
)

data class CluesJson(
    val horizontal: List<ClueJson>,
    val vertical: List<ClueJson>
)
