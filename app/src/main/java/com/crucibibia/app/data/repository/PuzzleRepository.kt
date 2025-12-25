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

    suspend fun markAsCompleted(
        puzzleId: String,
        time: Long,
        score: Int,
        hintsUsed: Int,
        errorsCount: Int,
        perfectCompletion: Boolean
    ) {
        puzzleDao.markAsCompleted(puzzleId, time, score, hintsUsed, errorsCount, perfectCompletion)
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

            // Carica griglia da assets/puzzles/{year}/{month}/{puzzleId}_grid.json
            val monthStr = String.format("%02d", puzzle.month)
            val gridJson = loadJsonFromAssets("puzzles/${puzzle.year}/$monthStr/${puzzleId}_grid.json")

            // Carica definizioni da assets/puzzles/{year}/{month}/{puzzleId}_clues.json
            val cluesJson = loadJsonFromAssets("puzzles/${puzzle.year}/$monthStr/${puzzleId}_clues.json")

            // Prima parsa le definizioni per ottenere i numeri corretti
            val schemaJson = gson.fromJson(cluesJson, SchemaJson::class.java)

            // Poi parsa la griglia usando le definizioni per la numerazione
            val grid = parseGridWithClues(gridJson, schemaJson)

            // Infine crea le definizioni con le posizioni corrette
            val (horizontal, vertical) = parseCluesWithGrid(schemaJson, grid)

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

    /**
     * Parsa la griglia usando le definizioni per determinare la numerazione corretta
     */
    private fun parseGridWithClues(json: String, schema: SchemaJson): Grid {
        val gridJson = gson.fromJson(json, GridJson::class.java)

        // Prima crea la griglia senza numeri
        val cellsWithoutNumbers = mutableListOf<MutableList<Cell>>()
        for (row in 0 until gridJson.size) {
            val rowCells = mutableListOf<Cell>()
            for (col in 0 until gridJson.size) {
                val cellValue = gridJson.grid.getOrNull(row)?.getOrNull(col) ?: "#"
                val isBlocked = cellValue == "#" || cellValue == "."
                val solution = if (isBlocked) null else cellValue.firstOrNull()?.uppercaseChar()
                rowCells.add(Cell(row, col, solution, null, isBlocked))
            }
            cellsWithoutNumbers.add(rowCells)
        }

        // Trova le posizioni di tutte le risposte e associa i numeri
        val numberPositions = mutableMapOf<Pair<Int, Int>, Int>()

        // Processa le definizioni orizzontali
        for (clue in schema.horizontal) {
            val answer = clue.answer ?: continue // Salta se non c'è risposta
            val position = findAnswerInGrid(cellsWithoutNumbers, answer, Direction.HORIZONTAL)
            if (position != null) {
                numberPositions[position] = clue.number
            }
        }

        // Processa le definizioni verticali
        for (clue in schema.vertical) {
            val answer = clue.answer ?: continue // Salta se non c'è risposta
            val position = findAnswerInGrid(cellsWithoutNumbers, answer, Direction.VERTICAL)
            if (position != null) {
                // Se la posizione ha già un numero (dalla definizione orizzontale), usa quello
                // altrimenti usa il numero della definizione verticale
                if (!numberPositions.containsKey(position)) {
                    numberPositions[position] = clue.number
                }
            }
        }

        // Assegna i numeri alle celle
        val cells = cellsWithoutNumbers.map { row ->
            row.map { cell ->
                val position = Pair(cell.row, cell.col)
                val number = numberPositions[position]
                if (number != null) {
                    cell.copy(number = number)
                } else {
                    cell
                }
            }
        }

        return Grid(size = gridJson.size, cells = cells)
    }

    /**
     * Trova la posizione di una risposta nella griglia
     */
    private fun findAnswerInGrid(
        cells: List<List<Cell>>,
        answer: String,
        direction: Direction
    ): Pair<Int, Int>? {
        val size = cells.size

        for (row in 0 until size) {
            for (col in 0 until size) {
                if (matchesAnswerAtPosition(cells, row, col, answer, direction, size)) {
                    return Pair(row, col)
                }
            }
        }
        return null
    }

    /**
     * Verifica se la risposta corrisponde alla posizione data
     */
    private fun matchesAnswerAtPosition(
        cells: List<List<Cell>>,
        startRow: Int,
        startCol: Int,
        answer: String,
        direction: Direction,
        size: Int
    ): Boolean {
        var row = startRow
        var col = startCol

        // Verifica che sia l'inizio di una parola (cella precedente bloccata o bordo)
        when (direction) {
            Direction.HORIZONTAL -> {
                if (col > 0 && !cells[row][col - 1].isBlocked) return false
            }
            Direction.VERTICAL -> {
                if (row > 0 && !cells[row - 1][col].isBlocked) return false
            }
        }

        // Verifica che le lettere corrispondano
        for (i in answer.indices) {
            if (row >= size || col >= size) return false
            val cell = cells[row][col]
            if (cell.isBlocked) return false
            if (cell.solution != answer[i].uppercaseChar()) return false

            when (direction) {
                Direction.HORIZONTAL -> col++
                Direction.VERTICAL -> row++
            }
        }

        // Verifica che la parola finisca (cella successiva bloccata o bordo)
        if (row < size && col < size && !cells[row][col].isBlocked) {
            return false // La parola continua, non è la posizione giusta
        }

        return true
    }

    /**
     * Crea le definizioni con le posizioni corrette dalla griglia
     */
    private fun parseCluesWithGrid(schema: SchemaJson, grid: Grid): Pair<List<Clue>, List<Clue>> {
        val horizontalClues = schema.horizontal.mapNotNull { clueJson ->
            val answer = clueJson.answer ?: return@mapNotNull null
            findCluePositionByAnswer(grid, answer, Direction.HORIZONTAL)?.let { (startRow, startCol, length) ->
                Clue(
                    number = clueJson.number,
                    direction = Direction.HORIZONTAL,
                    text = clueJson.clue,
                    answer = answer,
                    startRow = startRow,
                    startCol = startCol,
                    length = length
                )
            }
        }

        val verticalClues = schema.vertical.mapNotNull { clueJson ->
            val answer = clueJson.answer ?: return@mapNotNull null
            findCluePositionByAnswer(grid, answer, Direction.VERTICAL)?.let { (startRow, startCol, length) ->
                Clue(
                    number = clueJson.number,
                    direction = Direction.VERTICAL,
                    text = clueJson.clue,
                    answer = answer,
                    startRow = startRow,
                    startCol = startCol,
                    length = length
                )
            }
        }

        return Pair(horizontalClues, verticalClues)
    }

    /**
     * Trova la posizione di una definizione basandosi sulla risposta
     */
    private fun findCluePositionByAnswer(
        grid: Grid,
        answer: String,
        direction: Direction
    ): Triple<Int, Int, Int>? {
        for (row in grid.cells.indices) {
            for (col in grid.cells[row].indices) {
                if (matchesAnswerAtGridPosition(grid, row, col, answer, direction)) {
                    return Triple(row, col, answer.length)
                }
            }
        }
        return null
    }

    /**
     * Verifica se la risposta corrisponde a una posizione nella griglia
     */
    private fun matchesAnswerAtGridPosition(
        grid: Grid,
        startRow: Int,
        startCol: Int,
        answer: String,
        direction: Direction
    ): Boolean {
        var row = startRow
        var col = startCol

        // Verifica che sia l'inizio di una parola
        when (direction) {
            Direction.HORIZONTAL -> {
                if (col > 0 && !grid.cells[row][col - 1].isBlocked) return false
            }
            Direction.VERTICAL -> {
                if (row > 0 && !grid.cells[row - 1][col].isBlocked) return false
            }
        }

        // Verifica le lettere
        for (i in answer.indices) {
            if (row >= grid.size || col >= grid.size) return false
            val cell = grid.cells[row][col]
            if (cell.isBlocked) return false
            if (cell.solution != answer[i].uppercaseChar()) return false

            when (direction) {
                Direction.HORIZONTAL -> col++
                Direction.VERTICAL -> row++
            }
        }

        // Verifica che la parola finisca
        if (row < grid.size && col < grid.size && !grid.cells[row][col].isBlocked) {
            return false
        }

        return true
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

    // Scoring
    suspend fun getTotalScore(): Int = puzzleDao.getTotalScore() ?: 0
    suspend fun getPerfectPuzzleCount(): Int = puzzleDao.getPerfectPuzzleCount()
    suspend fun getTotalHintsUsed(): Int = puzzleDao.getTotalHintsUsed() ?: 0

    // Resume and progression
    suspend fun getLastInProgressPuzzle(): Puzzle? = puzzleDao.getLastInProgressPuzzle()
    suspend fun getNextSuggestedPuzzle(): Puzzle? = puzzleDao.getNextSuggestedPuzzle()
    fun getInProgressPuzzles(): Flow<List<Puzzle>> = puzzleDao.getInProgressPuzzles()
    suspend fun getActiveGamesCount(): Int = puzzleDao.getActiveGamesCount()

    // Streak calculation
    suspend fun calculateCurrentStreak(): Int {
        val recentPuzzles = puzzleDao.getRecentCompletedPuzzles()
        if (recentPuzzles.isEmpty()) return 0

        var streak = 0
        val today = System.currentTimeMillis()
        val oneDayMs = 24 * 60 * 60 * 1000L

        // Sort by completion time descending
        val sortedPuzzles = recentPuzzles.sortedByDescending { it.lastPlayedAt ?: 0 }

        var lastDate = today
        for (puzzle in sortedPuzzles) {
            val puzzleDate = puzzle.lastPlayedAt ?: continue
            val daysDiff = (lastDate - puzzleDate) / oneDayMs

            if (daysDiff <= 1) {
                streak++
                lastDate = puzzleDate
            } else {
                break
            }
        }

        return streak
    }

    suspend fun getPlayerStats(): PlayerStats {
        val totalScore = getTotalScore()
        val totalCompleted = getCompletedPuzzleCount()
        val totalPuzzles = getTotalPuzzleCount()
        val perfectPuzzles = getPerfectPuzzleCount()
        val averageTime = getAverageCompletionTime()?.toLong()
        val currentStreak = calculateCurrentStreak()
        val totalHintsUsed = getTotalHintsUsed()
        val level = PlayerLevel.fromScore(totalScore)

        return PlayerStats(
            totalScore = totalScore,
            totalCompleted = totalCompleted,
            totalPuzzles = totalPuzzles,
            perfectPuzzles = perfectPuzzles,
            averageTime = averageTime,
            currentStreak = currentStreak,
            bestStreak = currentStreak, // TODO: Store best streak separately
            totalHintsUsed = totalHintsUsed,
            level = level
        )
    }
}

private data class CluePosition(
    val startRow: Int,
    val startCol: Int,
    val length: Int,
    val answer: String
)
