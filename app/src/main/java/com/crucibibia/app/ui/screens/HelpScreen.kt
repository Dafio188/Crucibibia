package com.crucibibia.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.crucibibia.app.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HelpScreen(
    onBackClick: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = stringResource(R.string.help),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = stringResource(R.string.back)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Welcome Section
            item {
                WelcomeCard()
            }

            // How to Navigate
            item {
                HelpSectionCard(
                    title = stringResource(R.string.help_navigation_title),
                    icon = Icons.Default.Navigation,
                    items = listOf(
                        HelpItem(
                            icon = Icons.Default.Home,
                            title = stringResource(R.string.help_home_title),
                            description = stringResource(R.string.help_home_desc)
                        ),
                        HelpItem(
                            icon = Icons.Default.CalendarMonth,
                            title = stringResource(R.string.help_years_title),
                            description = stringResource(R.string.help_years_desc)
                        ),
                        HelpItem(
                            icon = Icons.Default.PlayArrow,
                            title = stringResource(R.string.help_resume_title),
                            description = stringResource(R.string.help_resume_desc)
                        ),
                        HelpItem(
                            icon = Icons.Default.Lightbulb,
                            title = stringResource(R.string.help_suggested_title),
                            description = stringResource(R.string.help_suggested_desc)
                        )
                    )
                )
            }

            // How to Play
            item {
                HelpSectionCard(
                    title = stringResource(R.string.help_gameplay_title),
                    icon = Icons.Default.Games,
                    items = listOf(
                        HelpItem(
                            icon = Icons.Default.TouchApp,
                            title = stringResource(R.string.help_select_title),
                            description = stringResource(R.string.help_select_desc)
                        ),
                        HelpItem(
                            icon = Icons.Default.Keyboard,
                            title = stringResource(R.string.help_input_title),
                            description = stringResource(R.string.help_input_desc)
                        ),
                        HelpItem(
                            icon = Icons.Default.CheckCircle,
                            title = stringResource(R.string.help_check_title),
                            description = stringResource(R.string.help_check_desc)
                        ),
                        HelpItem(
                            icon = Icons.Default.Lightbulb,
                            title = stringResource(R.string.help_hint_title),
                            description = stringResource(R.string.help_hint_desc)
                        )
                    )
                )
            }

            // Scoring System
            item {
                HelpSectionCard(
                    title = stringResource(R.string.help_scoring_title),
                    icon = Icons.Default.EmojiEvents,
                    items = listOf(
                        HelpItem(
                            icon = Icons.Default.Star,
                            title = stringResource(R.string.help_points_title),
                            description = stringResource(R.string.help_points_desc)
                        ),
                        HelpItem(
                            icon = Icons.Default.TrendingUp,
                            title = stringResource(R.string.help_levels_title),
                            description = stringResource(R.string.help_levels_desc)
                        ),
                        HelpItem(
                            icon = Icons.Default.LocalFireDepartment,
                            title = stringResource(R.string.help_streak_title),
                            description = stringResource(R.string.help_streak_desc)
                        )
                    )
                )
            }

            // Tips
            item {
                TipsCard()
            }
        }
    }
}

@Composable
fun WelcomeCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.MenuBook,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(64.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = stringResource(R.string.welcome_title),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onPrimaryContainer,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = stringResource(R.string.welcome_description),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f),
                textAlign = TextAlign.Center
            )
        }
    }
}

data class HelpItem(
    val icon: ImageVector,
    val title: String,
    val description: String
)

@Composable
fun HelpSectionCard(
    title: String,
    icon: ImageVector,
    items: List<HelpItem>
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            items.forEachIndexed { index, item ->
                HelpItemRow(item = item)
                if (index < items.lastIndex) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Divider(
                        color = MaterialTheme.colorScheme.outlineVariant,
                        modifier = Modifier.padding(start = 40.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
        }
    }
}

@Composable
fun HelpItemRow(item: HelpItem) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
    ) {
        Surface(
            shape = RoundedCornerShape(8.dp),
            color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f),
            modifier = Modifier.size(32.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = item.icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.title,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = item.description,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun TipsCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.tertiaryContainer
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.TipsAndUpdates,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.tertiary,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = stringResource(R.string.tips_title),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onTertiaryContainer
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            TipRow(stringResource(R.string.tip_1))
            TipRow(stringResource(R.string.tip_2))
            TipRow(stringResource(R.string.tip_3))
            TipRow(stringResource(R.string.tip_4))
        }
    }
}

@Composable
fun TipRow(text: String) {
    Row(
        modifier = Modifier.padding(vertical = 4.dp),
        verticalAlignment = Alignment.Top
    ) {
        Text(
            text = "•",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.tertiary,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onTertiaryContainer
        )
    }
}
