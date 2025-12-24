package com.crucibibia.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.crucibibia.app.data.model.*
import com.crucibibia.app.data.repository.PuzzleRepository
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class GameUiState(
    val isLoading: Boolean = true,
    val puzzleData: PuzzleData? = null,
    val userGrid: List<List<Char?>> = emptyList(),
    val selectedCell: Pair<Int, Int>? = null,
    val selectedDirection: Direction = Direction.HORIZONTAL,
    val highlightedCells: Set<Pair<Int, Int>> = emptySet(),
    val errorCells: Set<Pair<Int, Int>> = emptySet(),
    val correctCells: Set<Pair<Int, Int>> = emptySet(),
    val revealedCells: Set<Pair<Int, Int>> = emptySet(),
    val elapsedSeconds: Long = 0,
    val isCompleted: Boolean = false,
    val showCompletionDialog: Boolean = false,
    val showErrorDialog: Boolean = false,
    val errorCount: Int = 0
)

class GameViewModel(
    private val puzzleId: String,
    private val repository: PuzzleRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(GameUiState())
    val uiState: StateFlow<GameUiState> = _uiState.asStateFlow()

    private val gson = Gson()
    private var timerJob: Job? = null

    init {
        loadPuzzle()
    }

    private fun loadPuzzle() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)

            val puzzleData = repository.loadPuzzleData(puzzleId)
            if (puzzleData != null) {
                // Initialize empty user grid
                val userGrid = List(puzzleData.grid.size) { row ->
                    List(puzzleData.grid.size) { col ->
                        if (puzzleData.grid.cells[row][col].isBlocked) null
                        else null
                    }
                }

                // Load saved game state if exists
                val savedState = repository.getGameState(puzzleId)
                val (loadedGrid, elapsedTime) = if (savedState != null) {
                    val type = object : TypeToken<List<List<Char?>>>() {}.type
                    val grid: List<List<Char?>> = gson.fromJson(savedState.userInput, type)
                    Pair(grid, savedState.elapsedTime)
                } else {
                    Pair(userGrid, 0L)
                }

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    puzzleData = puzzleData,
                    userGrid = loadedGrid,
                    elapsedSeconds = elapsedTime
                )

                // Start timer
                startTimer()

                // Update last played
                repository.updateLastPlayed(puzzleId)
            } else {
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }

    private fun startTimer() {
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            while (true) {
                delay(1000)
                if (!_uiState.value.isCompleted) {
                    _uiState.value = _uiState.value.copy(
                        elapsedSeconds = _uiState.value.elapsedSeconds + 1
                    )
                }
            }
        }
    }

    fun selectCell(row: Int, col: Int) {
        val state = _uiState.value
        val puzzleData = state.puzzleData ?: return
        val cell = puzzleData.grid.cells.getOrNull(row)?.getOrNull(col) ?: return

        if (cell.isBlocked) return

        // If tapping the same cell, toggle direction
        val newDirection = if (state.selectedCell == Pair(row, col)) {
            if (state.selectedDirection == Direction.HORIZONTAL) Direction.VERTICAL
            else Direction.HORIZONTAL
        } else {
            state.selectedDirection
        }

        val highlightedCells = calculateHighlightedCells(row, col, newDirection, puzzleData)

        _uiState.value = state.copy(
            selectedCell = Pair(row, col),
            selectedDirection = newDirection,
            highlightedCells = highlightedCells,
            errorCells = emptySet() // Clear errors on new selection
        )
    }

    private fun calculateHighlightedCells(
        row: Int,
        col: Int,
        direction: Direction,
        puzzleData: PuzzleData
    ): Set<Pair<Int, Int>> {
        val cells = mutableSetOf<Pair<Int, Int>>()
        val grid = puzzleData.grid

        when (direction) {
            Direction.HORIZONTAL -> {
                // Find start of word
                var startCol = col
                while (startCol > 0 && !grid.cells[row][startCol - 1].isBlocked) {
                    startCol--
                }
                // Add all cells in word
                var c = startCol
                while (c < grid.size && !grid.cells[row][c].isBlocked) {
                    cells.add(Pair(row, c))
                    c++
                }
            }
            Direction.VERTICAL -> {
                // Find start of word
                var startRow = row
                while (startRow > 0 && !grid.cells[startRow - 1][col].isBlocked) {
                    startRow--
                }
                // Add all cells in word
                var r = startRow
                while (r < grid.size && !grid.cells[r][col].isBlocked) {
                    cells.add(Pair(r, col))
                    r++
                }
            }
        }

        return cells
    }

    fun inputLetter(letter: Char) {
        val state = _uiState.value
        val (row, col) = state.selectedCell ?: return
        val puzzleData = state.puzzleData ?: return

        if (puzzleData.grid.cells[row][col].isBlocked) return

        // Update user grid
        val newGrid = state.userGrid.mapIndexed { r, rowList ->
            rowList.mapIndexed { c, char ->
                if (r == row && c == col) letter.uppercaseChar()
                else char
            }
        }

        // Move to next cell
        val nextCell = findNextCell(row, col, state.selectedDirection, puzzleData)

        _uiState.value = state.copy(
            userGrid = newGrid,
            selectedCell = nextCell ?: state.selectedCell,
            highlightedCells = if (nextCell != null) {
                calculateHighlightedCells(nextCell.first, nextCell.second, state.selectedDirection, puzzleData)
            } else state.highlightedCells
        )

        saveGameState()
        checkCompletion()
    }

    fun deleteLetter() {
        val state = _uiState.value
        val (row, col) = state.selectedCell ?: return
        val puzzleData = state.puzzleData ?: return

        if (puzzleData.grid.cells[row][col].isBlocked) return

        // If current cell is empty, move back first
        val targetCell = if (state.userGrid[row][col] == null) {
            findPreviousCell(row, col, state.selectedDirection, puzzleData)
        } else {
            Pair(row, col)
        }

        if (targetCell != null) {
            val newGrid = state.userGrid.mapIndexed { r, rowList ->
                rowList.mapIndexed { c, char ->
                    if (r == targetCell.first && c == targetCell.second) null
                    else char
                }
            }

            _uiState.value = state.copy(
                userGrid = newGrid,
                selectedCell = targetCell,
                highlightedCells = calculateHighlightedCells(
                    targetCell.first, targetCell.second, state.selectedDirection, puzzleData
                )
            )

            saveGameState()
        }
    }

    private fun findNextCell(row: Int, col: Int, direction: Direction, puzzleData: PuzzleData): Pair<Int, Int>? {
        val grid = puzzleData.grid
        return when (direction) {
            Direction.HORIZONTAL -> {
                var nextCol = col + 1
                while (nextCol < grid.size && grid.cells[row][nextCol].isBlocked) {
                    nextCol++
                }
                if (nextCol < grid.size) Pair(row, nextCol) else null
            }
            Direction.VERTICAL -> {
                var nextRow = row + 1
                while (nextRow < grid.size && grid.cells[nextRow][col].isBlocked) {
                    nextRow++
                }
                if (nextRow < grid.size) Pair(nextRow, col) else null
            }
        }
    }

    private fun findPreviousCell(row: Int, col: Int, direction: Direction, puzzleData: PuzzleData): Pair<Int, Int>? {
        val grid = puzzleData.grid
        return when (direction) {
            Direction.HORIZONTAL -> {
                var prevCol = col - 1
                while (prevCol >= 0 && grid.cells[row][prevCol].isBlocked) {
                    prevCol--
                }
                if (prevCol >= 0) Pair(row, prevCol) else null
            }
            Direction.VERTICAL -> {
                var prevRow = row - 1
                while (prevRow >= 0 && grid.cells[prevRow][col].isBlocked) {
                    prevRow--
                }
                if (prevRow >= 0) Pair(prevRow, col) else null
            }
        }
    }

    fun checkAnswers() {
        val state = _uiState.value
        val puzzleData = state.puzzleData ?: return
        val grid = puzzleData.grid

        val errors = mutableSetOf<Pair<Int, Int>>()
        val correct = mutableSetOf<Pair<Int, Int>>()

        for (row in 0 until grid.size) {
            for (col in 0 until grid.size) {
                val cell = grid.cells[row][col]
                if (!cell.isBlocked) {
                    val userChar = state.userGrid[row][col]
                    if (userChar != null) {
                        if (userChar == cell.solution) {
                            correct.add(Pair(row, col))
                        } else {
                            errors.add(Pair(row, col))
                        }
                    }
                }
            }
        }

        _uiState.value = state.copy(
            errorCells = errors,
            correctCells = correct,
            showErrorDialog = errors.isNotEmpty(),
            errorCount = errors.size
        )

        if (errors.isEmpty() && isGridComplete()) {
            markCompleted()
        }
    }

    fun revealCurrentCell() {
        val state = _uiState.value
        val (row, col) = state.selectedCell ?: return
        val puzzleData = state.puzzleData ?: return
        val solution = puzzleData.grid.cells[row][col].solution ?: return

        val newGrid = state.userGrid.mapIndexed { r, rowList ->
            rowList.mapIndexed { c, char ->
                if (r == row && c == col) solution
                else char
            }
        }

        _uiState.value = state.copy(
            userGrid = newGrid,
            revealedCells = state.revealedCells + Pair(row, col)
        )

        saveGameState()
    }

    fun revealSolution() {
        val state = _uiState.value
        val puzzleData = state.puzzleData ?: return

        val newGrid = puzzleData.grid.cells.map { row ->
            row.map { cell -> cell.solution }
        }

        val allCells = mutableSetOf<Pair<Int, Int>>()
        for (r in newGrid.indices) {
            for (c in newGrid[r].indices) {
                if (newGrid[r][c] != null) {
                    allCells.add(Pair(r, c))
                }
            }
        }

        _uiState.value = state.copy(
            userGrid = newGrid,
            revealedCells = allCells,
            isCompleted = true
        )

        // Don't save as completed with time when revealing solution
        viewModelScope.launch {
            repository.deleteGameState(puzzleId)
        }
    }

    fun restartPuzzle() {
        val state = _uiState.value
        val puzzleData = state.puzzleData ?: return

        val emptyGrid = List(puzzleData.grid.size) { row ->
            List(puzzleData.grid.size) { col ->
                if (puzzleData.grid.cells[row][col].isBlocked) null
                else null
            }
        }

        _uiState.value = state.copy(
            userGrid = emptyGrid,
            selectedCell = null,
            highlightedCells = emptySet(),
            errorCells = emptySet(),
            correctCells = emptySet(),
            revealedCells = emptySet(),
            elapsedSeconds = 0,
            isCompleted = false
        )

        viewModelScope.launch {
            repository.deleteGameState(puzzleId)
        }
    }

    private fun checkCompletion() {
        if (isGridComplete() && isGridCorrect()) {
            markCompleted()
        }
    }

    private fun isGridComplete(): Boolean {
        val state = _uiState.value
        val puzzleData = state.puzzleData ?: return false

        for (row in 0 until puzzleData.grid.size) {
            for (col in 0 until puzzleData.grid.size) {
                if (!puzzleData.grid.cells[row][col].isBlocked) {
                    if (state.userGrid[row][col] == null) {
                        return false
                    }
                }
            }
        }
        return true
    }

    private fun isGridCorrect(): Boolean {
        val state = _uiState.value
        val puzzleData = state.puzzleData ?: return false

        for (row in 0 until puzzleData.grid.size) {
            for (col in 0 until puzzleData.grid.size) {
                val cell = puzzleData.grid.cells[row][col]
                if (!cell.isBlocked) {
                    if (state.userGrid[row][col] != cell.solution) {
                        return false
                    }
                }
            }
        }
        return true
    }

    private fun markCompleted() {
        val state = _uiState.value
        _uiState.value = state.copy(
            isCompleted = true,
            showCompletionDialog = true
        )

        viewModelScope.launch {
            repository.markAsCompleted(puzzleId, state.elapsedSeconds)
            repository.deleteGameState(puzzleId)
        }

        timerJob?.cancel()
    }

    private fun saveGameState() {
        viewModelScope.launch {
            val state = _uiState.value
            if (!state.isCompleted) {
                val gridJson = gson.toJson(state.userGrid)
                repository.saveGameState(
                    GameState(
                        puzzleId = puzzleId,
                        userInput = gridJson,
                        elapsedTime = state.elapsedSeconds
                    )
                )
            }
        }
    }

    fun dismissCompletionDialog() {
        _uiState.value = _uiState.value.copy(showCompletionDialog = false)
    }

    fun dismissErrorDialog() {
        _uiState.value = _uiState.value.copy(showErrorDialog = false)
    }

    fun selectClue(clue: Clue) {
        val state = _uiState.value
        val puzzleData = state.puzzleData ?: return

        val highlightedCells = calculateHighlightedCells(
            clue.startRow, clue.startCol, clue.direction, puzzleData
        )

        _uiState.value = state.copy(
            selectedCell = Pair(clue.startRow, clue.startCol),
            selectedDirection = clue.direction,
            highlightedCells = highlightedCells
        )
    }

    override fun onCleared() {
        super.onCleared()
        timerJob?.cancel()
        // Save state one last time
        viewModelScope.launch {
            val state = _uiState.value
            if (!state.isCompleted && state.puzzleData != null) {
                val gridJson = gson.toJson(state.userGrid)
                repository.saveGameState(
                    GameState(
                        puzzleId = puzzleId,
                        userInput = gridJson,
                        elapsedTime = state.elapsedSeconds
                    )
                )
            }
        }
    }

    class Factory(
        private val puzzleId: String,
        private val repository: PuzzleRepository
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            return GameViewModel(puzzleId, repository) as T
        }
    }
}
