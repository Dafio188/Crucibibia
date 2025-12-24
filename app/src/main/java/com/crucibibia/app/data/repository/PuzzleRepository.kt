package com.crucibibia.app.data.repository

import android.content.Context
import com.crucibibia.app.data.local.PuzzleDao
import com.crucibibia.app.data.model.*
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class PuzzleRepository(
    private val puzzleDao: PuzzleDao,
    private val context: Context
) {
    private val gson = Gson()

    // Cache per i dati dei puzzle caricati
    private val puzzleDataCache = mutableMapOf<String, PuzzleData>()

    fun getAllPuzzles(): Flow<List<Puzzle>> = puzzleDao.getAllPuzzles()

    fun getPuzzlesByYear(year: Int): Flow<List<Puzzle>> = puzzleDao.getPuzzlesByYear(year)

    fun getAllYears(): Flow<List<Int>> = puzzleDao.getAllYears()

    suspend fun getPuzzleById(id: String): Puzzle? = puzzleDao.getPuzzleById(id)

    suspend fun getPuzzleCountByYear(year: Int): Int = puzzleDao.getPuzzleCountByYear(year)

    suspend fun getCompletedCountByYear(year: Int): Int = puzzleDao.getCompletedCountByYear(year)

    suspend fun markAsCompleted(puzzleId: String, time: Long) {
        puzzleDao.markAsCompleted(puzzleId, time)
    }

    suspend fun updateLastPlayed(puzzleId: String) {
        puzzleDao.updateLastPlayed(puzzleId, System.currentTimeMillis())
    }

    // Game state
    suspend fun getGameState(puzzleId: String): GameState? = puzzleDao.getGameState(puzzleId)

    suspend fun saveGameState(gameState: GameState) {
        puzzleDao.saveGameState(gameState)
    }

    suspend fun deleteGameState(puzzleId: String) {
        puzzleDao.deleteGameState(puzzleId)
    }

    /**
     * Carica i dati completi del puzzle dagli assets
     */
    suspend fun loadPuzzleData(puzzleId: String): PuzzleData? = withContext(Dispatchers.IO) {
        // Controlla cache
        puzzleDataCache[puzzleId]?.let { return@withContext it }

        try {
            val puzzle = puzzleDao.getPuzzleById(puzzleId) ?: return@withContext null

            // Carica griglia da assets/puzzles/{year}/{puzzleId}_grid.json
            val gridJson = loadJsonFromAssets("puzzles/${puzzle.year}/${puzzleId}_grid.json")
            val grid = parseGrid(gridJson)

            // Carica definizioni da assets/puzzles/{year}/{puzzleId}_clues.json
            val cluesJson = loadJsonFromAssets("puzzles/${puzzle.year}/${puzzleId}_clues.json")
            val (horizontal, vertical) = parseClues(cluesJson, grid)

            val puzzleData = PuzzleData(
                puzzle = puzzle,
                grid = grid,
                horizontalClues = horizontal,
                verticalClues = vertical
            )

            puzzleDataCache[puzzleId] = puzzleData
            puzzleData
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun loadJsonFromAssets(path: String): String {
        return context.assets.open(path).bufferedReader().use { it.readText() }
    }

    private fun parseGrid(json: String): Grid {
        val gridJson = gson.fromJson(json, GridJson::class.java)
        val cells = mutableListOf<List<Cell>>()
        var numberCounter = 1

        for (row in 0 until gridJson.size) {
            val rowCells = mutableListOf<Cell>()
            for (col in 0 until gridJson.size) {
                val cellValue = gridJson.grid.getOrNull(row)?.getOrNull(col) ?: "#"
                val isBlocked = cellValue == "#" || cellValue == "."
                val solution = if (isBlocked) null else cellValue.firstOrNull()?.uppercaseChar()

                // Determina se questa cella inizia una parola
                val needsNumber = !isBlocked && (
                    // Inizio orizzontale
                    (col == 0 || gridJson.grid[row][col - 1] == "#") &&
                    (col < gridJson.size - 1 && gridJson.grid[row].getOrNull(col + 1) != "#") ||
                    // Inizio verticale
                    (row == 0 || gridJson.grid[row - 1][col] == "#") &&
                    (row < gridJson.size - 1 && gridJson.grid.getOrNull(row + 1)?.getOrNull(col) != "#")
                )

                val number = if (needsNumber) numberCounter++ else null

                rowCells.add(Cell(
                    row = row,
                    col = col,
                    solution = solution,
                    number = number,
                    isBlocked = isBlocked
                ))
            }
            cells.add(rowCells)
        }

        return Grid(size = gridJson.size, cells = cells)
    }

    private fun parseClues(json: String, grid: Grid): Pair<List<Clue>, List<Clue>> {
        val schemaJson = gson.fromJson(json, SchemaJson::class.java)

        val horizontalClues = schemaJson.horizontal.mapNotNull { clueJson ->
            findCluePosition(grid, clueJson.number, Direction.HORIZONTAL)?.let { (startRow, startCol, length, answer) ->
                Clue(
                    number = clueJson.number,
                    direction = Direction.HORIZONTAL,
                    text = clueJson.clue,
                    answer = clueJson.answer ?: answer,
                    startRow = startRow,
                    startCol = startCol,
                    length = length
                )
            }
        }

        val verticalClues = schemaJson.vertical.mapNotNull { clueJson ->
            findCluePosition(grid, clueJson.number, Direction.VERTICAL)?.let { (startRow, startCol, length, answer) ->
                Clue(
                    number = clueJson.number,
                    direction = Direction.VERTICAL,
                    text = clueJson.clue,
                    answer = clueJson.answer ?: answer,
                    startRow = startRow,
                    startCol = startCol,
                    length = length
                )
            }
        }

        return Pair(horizontalClues, verticalClues)
    }

    private fun findCluePosition(grid: Grid, number: Int, direction: Direction): CluePosition? {
        for (row in grid.cells.indices) {
            for (col in grid.cells[row].indices) {
                val cell = grid.cells[row][col]
                if (cell.number == number) {
                    val (length, answer) = calculateWordLength(grid, row, col, direction)
                    if (length > 0) {
                        return CluePosition(row, col, length, answer)
                    }
                }
            }
        }
        return null
    }

    private fun calculateWordLength(grid: Grid, startRow: Int, startCol: Int, direction: Direction): Pair<Int, String> {
        var length = 0
        val answer = StringBuilder()
        var row = startRow
        var col = startCol

        while (row < grid.size && col < grid.size) {
            val cell = grid.cells[row][col]
            if (cell.isBlocked) break
            length++
            cell.solution?.let { answer.append(it) }

            when (direction) {
                Direction.HORIZONTAL -> col++
                Direction.VERTICAL -> row++
            }
        }

        return Pair(length, answer.toString())
    }

    /**
     * Inizializza il database con i puzzle dagli assets
     */
    suspend fun initializePuzzles() = withContext(Dispatchers.IO) {
        if (puzzleDao.getTotalPuzzleCount() > 0) return@withContext

        try {
            // Carica indice dei puzzle da assets/puzzles/index.json
            val indexJson = loadJsonFromAssets("puzzles/index.json")
            val type = object : TypeToken<List<Puzzle>>() {}.type
            val puzzles: List<Puzzle> = gson.fromJson(indexJson, type)
            puzzleDao.insertPuzzles(puzzles)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Statistics
    suspend fun getTotalPuzzleCount(): Int = puzzleDao.getTotalPuzzleCount()
    suspend fun getCompletedPuzzleCount(): Int = puzzleDao.getCompletedPuzzleCount()
    suspend fun getAverageCompletionTime(): Double? = puzzleDao.getAverageCompletionTime()
}

private data class CluePosition(
    val startRow: Int,
    val startCol: Int,
    val length: Int,
    val answer: String
)
