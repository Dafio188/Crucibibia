package com.crucibibia.app.data.local

import androidx.room.*
import com.crucibibia.app.data.model.GameState
import com.crucibibia.app.data.model.Puzzle
import kotlinx.coroutines.flow.Flow

@Dao
interface PuzzleDao {

    // Puzzle queries
    @Query("SELECT * FROM puzzles ORDER BY year, number")
    fun getAllPuzzles(): Flow<List<Puzzle>>

    @Query("SELECT * FROM puzzles WHERE year = :year ORDER BY month, number")
    fun getPuzzlesByYear(year: Int): Flow<List<Puzzle>>

    @Query("SELECT * FROM puzzles WHERE id = :id")
    suspend fun getPuzzleById(id: String): Puzzle?

    @Query("SELECT DISTINCT year FROM puzzles ORDER BY year")
    fun getAllYears(): Flow<List<Int>>

    @Query("SELECT COUNT(*) FROM puzzles WHERE year = :year")
    suspend fun getPuzzleCountByYear(year: Int): Int

    @Query("SELECT COUNT(*) FROM puzzles WHERE year = :year AND isCompleted = 1")
    suspend fun getCompletedCountByYear(year: Int): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPuzzle(puzzle: Puzzle)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPuzzles(puzzles: List<Puzzle>)

    @Update
    suspend fun updatePuzzle(puzzle: Puzzle)

    @Query("UPDATE puzzles SET isCompleted = 1, completedTime = :time, score = :score, hintsUsed = :hints, errorsCount = :errors, perfectCompletion = :perfect WHERE id = :puzzleId")
    suspend fun markAsCompleted(puzzleId: String, time: Long, score: Int, hints: Int, errors: Int, perfect: Boolean)

    @Query("UPDATE puzzles SET lastPlayedAt = :timestamp WHERE id = :puzzleId")
    suspend fun updateLastPlayed(puzzleId: String, timestamp: Long)

    // Game state queries
    @Query("SELECT * FROM game_states WHERE puzzleId = :puzzleId")
    suspend fun getGameState(puzzleId: String): GameState?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveGameState(gameState: GameState)

    @Query("DELETE FROM game_states WHERE puzzleId = :puzzleId")
    suspend fun deleteGameState(puzzleId: String)

    @Query("DELETE FROM game_states")
    suspend fun clearAllGameStates()

    // Statistics
    @Query("SELECT COUNT(*) FROM puzzles")
    suspend fun getTotalPuzzleCount(): Int

    @Query("SELECT COUNT(*) FROM puzzles WHERE isCompleted = 1")
    suspend fun getCompletedPuzzleCount(): Int

    @Query("SELECT AVG(completedTime) FROM puzzles WHERE isCompleted = 1 AND completedTime IS NOT NULL")
    suspend fun getAverageCompletionTime(): Double?

    // Scoring queries
    @Query("SELECT SUM(score) FROM puzzles WHERE isCompleted = 1")
    suspend fun getTotalScore(): Int?

    @Query("SELECT COUNT(*) FROM puzzles WHERE perfectCompletion = 1")
    suspend fun getPerfectPuzzleCount(): Int

    @Query("SELECT SUM(hintsUsed) FROM puzzles WHERE isCompleted = 1")
    suspend fun getTotalHintsUsed(): Int?

    // Resume and progression queries
    @Query("SELECT * FROM puzzles WHERE lastPlayedAt IS NOT NULL AND isCompleted = 0 ORDER BY lastPlayedAt DESC LIMIT 1")
    suspend fun getLastInProgressPuzzle(): Puzzle?

    @Query("SELECT * FROM game_states ORDER BY lastModified DESC LIMIT 1")
    suspend fun getLastGameState(): GameState?

    @Query("SELECT * FROM puzzles WHERE isCompleted = 0 ORDER BY year, month, number LIMIT 1")
    suspend fun getNextSuggestedPuzzle(): Puzzle?

    @Query("SELECT * FROM puzzles WHERE lastPlayedAt IS NOT NULL AND isCompleted = 0")
    fun getInProgressPuzzles(): Flow<List<Puzzle>>

    @Query("SELECT COUNT(*) FROM game_states")
    suspend fun getActiveGamesCount(): Int

    // Recent completed puzzles for streak calculation
    @Query("SELECT * FROM puzzles WHERE isCompleted = 1 ORDER BY lastPlayedAt DESC LIMIT 30")
    suspend fun getRecentCompletedPuzzles(): List<Puzzle>
}
