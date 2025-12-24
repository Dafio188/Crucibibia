package com.crucibibia.app

import android.app.Application
import com.crucibibia.app.data.local.AppDatabase
import com.crucibibia.app.data.repository.PuzzleRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class CrucibibiaApp : Application() {

    private val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    val database by lazy { AppDatabase.getDatabase(this) }
    val repository by lazy { PuzzleRepository(database.puzzleDao(), this) }

    override fun onCreate() {
        super.onCreate()

        // Initialize puzzles from assets
        applicationScope.launch {
            repository.initializePuzzles()
        }
    }
}
