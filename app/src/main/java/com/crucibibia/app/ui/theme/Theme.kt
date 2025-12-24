package com.crucibibia.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Light theme colors
private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF1565C0),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFBBDEFB),
    onPrimaryContainer = Color(0xFF0D47A1),

    secondary = Color(0xFFFFB300),
    onSecondary = Color.Black,
    secondaryContainer = Color(0xFFFFE082),
    onSecondaryContainer = Color(0xFFFF6F00),

    tertiary = Color(0xFF4CAF50),
    onTertiary = Color.White,

    background = Color(0xFFFAFAFA),
    onBackground = Color(0xFF1C1B1F),

    surface = Color.White,
    onSurface = Color(0xFF1C1B1F),
    surfaceVariant = Color(0xFFE7E0EC),
    onSurfaceVariant = Color(0xFF49454F),

    error = Color(0xFFF44336),
    onError = Color.White,

    outline = Color(0xFF79747E),
    outlineVariant = Color(0xFFCAC4D0)
)

// Dark theme colors
private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF90CAF9),
    onPrimary = Color(0xFF0D47A1),
    primaryContainer = Color(0xFF1565C0),
    onPrimaryContainer = Color(0xFFBBDEFB),

    secondary = Color(0xFFFFD54F),
    onSecondary = Color.Black,
    secondaryContainer = Color(0xFFFF8F00),
    onSecondaryContainer = Color(0xFFFFE082),

    tertiary = Color(0xFF81C784),
    onTertiary = Color.Black,

    background = Color(0xFF121212),
    onBackground = Color(0xFFE6E1E5),

    surface = Color(0xFF1E1E1E),
    onSurface = Color(0xFFE6E1E5),
    surfaceVariant = Color(0xFF49454F),
    onSurfaceVariant = Color(0xFFCAC4D0),

    error = Color(0xFFEF5350),
    onError = Color.Black,

    outline = Color(0xFF938F99),
    outlineVariant = Color(0xFF49454F)
)

// Grid colors
object GridColors {
    val cellEmpty = Color.White
    val cellEmptyDark = Color(0xFF2C2C2C)
    val cellBlocked = Color(0xFF212121)
    val cellBlockedDark = Color(0xFF000000)
    val cellSelected = Color(0xFFBBDEFB)
    val cellSelectedDark = Color(0xFF1565C0)
    val cellHighlighted = Color(0xFFE3F2FD)
    val cellHighlightedDark = Color(0xFF0D47A1)
    val cellCorrect = Color(0xFFC8E6C9)
    val cellCorrectDark = Color(0xFF2E7D32)
    val cellError = Color(0xFFFFCDD2)
    val cellErrorDark = Color(0xFFC62828)
    val border = Color(0xFF9E9E9E)
    val borderDark = Color(0xFF616161)
    val text = Color(0xFF212121)
    val textDark = Color(0xFFE0E0E0)
    val number = Color(0xFF757575)
    val numberDark = Color(0xFFBDBDBD)
}

@Composable
fun CrucibibiaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
