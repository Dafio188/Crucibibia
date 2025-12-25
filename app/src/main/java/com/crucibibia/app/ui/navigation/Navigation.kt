package com.crucibibia.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.crucibibia.app.data.repository.PuzzleRepository
import com.crucibibia.app.ui.screens.GameScreen
import com.crucibibia.app.ui.screens.HelpScreen
import com.crucibibia.app.ui.screens.HomeScreen
import com.crucibibia.app.ui.screens.SettingsScreen
import com.crucibibia.app.ui.screens.YearPuzzlesScreen

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object YearPuzzles : Screen("year/{year}") {
        fun createRoute(year: Int) = "year/$year"
    }
    object Game : Screen("game/{puzzleId}") {
        fun createRoute(puzzleId: String) = "game/$puzzleId"
    }
    object Settings : Screen("settings")
    object Help : Screen("help")
}

@Composable
fun CrucibibiaNavHost(
    navController: NavHostController,
    repository: PuzzleRepository,
    isDarkTheme: Boolean,
    onThemeChange: (Boolean) -> Unit
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                repository = repository,
                onYearClick = { year ->
                    navController.navigate(Screen.YearPuzzles.createRoute(year))
                },
                onPuzzleClick = { puzzleId ->
                    navController.navigate(Screen.Game.createRoute(puzzleId))
                },
                onSettingsClick = {
                    navController.navigate(Screen.Settings.route)
                },
                onHelpClick = {
                    navController.navigate(Screen.Help.route)
                }
            )
        }

        composable(
            route = Screen.YearPuzzles.route,
            arguments = listOf(navArgument("year") { type = NavType.IntType })
        ) { backStackEntry ->
            val year = backStackEntry.arguments?.getInt("year") ?: 1994
            YearPuzzlesScreen(
                year = year,
                repository = repository,
                onPuzzleClick = { puzzleId ->
                    navController.navigate(Screen.Game.createRoute(puzzleId))
                },
                onBackClick = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.Game.route,
            arguments = listOf(navArgument("puzzleId") { type = NavType.StringType })
        ) { backStackEntry ->
            val puzzleId = backStackEntry.arguments?.getString("puzzleId") ?: ""
            GameScreen(
                puzzleId = puzzleId,
                repository = repository,
                onBackClick = { navController.popBackStack() }
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                isDarkTheme = isDarkTheme,
                onThemeChange = onThemeChange,
                onBackClick = { navController.popBackStack() }
            )
        }

        composable(Screen.Help.route) {
            HelpScreen(
                onBackClick = { navController.popBackStack() }
            )
        }
    }
}
