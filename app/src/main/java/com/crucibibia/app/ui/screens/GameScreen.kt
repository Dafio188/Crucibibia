package com.crucibibia.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.crucibibia.app.R
import com.crucibibia.app.data.model.Clue
import com.crucibibia.app.data.model.Direction
import com.crucibibia.app.data.repository.PuzzleRepository
import com.crucibibia.app.ui.theme.GridColors
import com.crucibibia.app.ui.viewmodel.GameViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GameScreen(
    puzzleId: String,
    repository: PuzzleRepository,
    onBackClick: () -> Unit
) {
    val viewModel: GameViewModel = viewModel(
        factory = GameViewModel.Factory(puzzleId, repository)
    )
    val uiState by viewModel.uiState.collectAsState()

    var showRestartDialog by remember { mutableStateOf(false) }
    var showSolutionDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = uiState.puzzleData?.puzzle?.title ?: "Cruciverba",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        // Timer
                        val minutes = uiState.elapsedSeconds / 60
                        val seconds = uiState.elapsedSeconds % 60
                        Text(
                            text = String.format("%02d:%02d", minutes, seconds),
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = stringResource(R.string.back)
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { showRestartDialog = true }) {
                        Icon(Icons.Default.Refresh, contentDescription = stringResource(R.string.restart))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary,
                    actionIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { paddingValues ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else if (uiState.puzzleData == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Text("Errore nel caricamento del cruciverba")
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                // Grid
                CrosswordGrid(
                    puzzleData = uiState.puzzleData!!,
                    userGrid = uiState.userGrid,
                    selectedCell = uiState.selectedCell,
                    highlightedCells = uiState.highlightedCells,
                    errorCells = uiState.errorCells,
                    correctCells = uiState.correctCells,
                    revealedCells = uiState.revealedCells,
                    onCellClick = { row, col -> viewModel.selectCell(row, col) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp)
                )

                // Action buttons
                ActionButtons(
                    onCheck = { viewModel.checkAnswers() },
                    onHint = { viewModel.revealCurrentCell() },
                    onSolution = { showSolutionDialog = true },
                    modifier = Modifier.padding(horizontal = 8.dp)
                )

                // Clues list
                CluesList(
                    horizontalClues = uiState.puzzleData!!.horizontalClues,
                    verticalClues = uiState.puzzleData!!.verticalClues,
                    selectedDirection = uiState.selectedDirection,
                    onClueClick = { clue -> viewModel.selectClue(clue) },
                    modifier = Modifier
                        .weight(1f)
                        .padding(8.dp)
                )

                // Keyboard
                CustomKeyboard(
                    onKeyPress = { letter -> viewModel.inputLetter(letter) },
                    onDelete = { viewModel.deleteLetter() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(4.dp)
                )
            }
        }
    }

    // Dialogs
    if (uiState.showCompletionDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.dismissCompletionDialog() },
            title = { Text(stringResource(R.string.congratulations)) },
            text = {
                Column {
                    val minutes = uiState.elapsedSeconds / 60
                    val seconds = uiState.elapsedSeconds % 60
                    Text(stringResource(R.string.puzzle_completed))
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Tempo: ${minutes}m ${seconds}s",
                        style = MaterialTheme.typography.bodyMedium
                    )

                    uiState.scoreBreakdown?.let { score ->
                        Spacer(modifier = Modifier.height(12.dp))
                        Divider()
                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = stringResource(R.string.score_earned),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        CompletionScoreRow(stringResource(R.string.score_base_short), "+${score.baseScore}")
                        if (score.timeBonus > 0) {
                            CompletionScoreRow(stringResource(R.string.score_time_short), "+${score.timeBonus}")
                        }
                        if (score.perfectBonus > 0) {
                            CompletionScoreRow(stringResource(R.string.score_perfect_short), "+${score.perfectBonus}")
                        }
                        if (score.hintPenalty > 0) {
                            CompletionScoreRow(stringResource(R.string.score_hints_short), "-${score.hintPenalty}")
                        }
                        if (score.errorPenalty > 0) {
                            CompletionScoreRow(stringResource(R.string.score_errors_short), "-${score.errorPenalty}")
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Divider()
                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = stringResource(R.string.total),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${score.total} ${stringResource(R.string.points)}",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.dismissCompletionDialog()
                    onBackClick()
                }) {
                    Text(stringResource(R.string.ok))
                }
            }
        )
    }

    if (uiState.showErrorDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.dismissErrorDialog() },
            title = { Text(stringResource(R.string.check)) },
            text = {
                if (uiState.errorCount > 0) {
                    Text(stringResource(R.string.errors_found, uiState.errorCount))
                } else {
                    Text(stringResource(R.string.no_errors))
                }
            },
            confirmButton = {
                TextButton(onClick = { viewModel.dismissErrorDialog() }) {
                    Text(stringResource(R.string.ok))
                }
            }
        )
    }

    if (showRestartDialog) {
        AlertDialog(
            onDismissRequest = { showRestartDialog = false },
            title = { Text(stringResource(R.string.restart)) },
            text = { Text(stringResource(R.string.confirm_restart)) },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.restartPuzzle()
                    showRestartDialog = false
                }) {
                    Text(stringResource(R.string.yes))
                }
            },
            dismissButton = {
                TextButton(onClick = { showRestartDialog = false }) {
                    Text(stringResource(R.string.no))
                }
            }
        )
    }

    if (showSolutionDialog) {
        AlertDialog(
            onDismissRequest = { showSolutionDialog = false },
            title = { Text(stringResource(R.string.solution)) },
            text = { Text(stringResource(R.string.confirm_solution)) },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.revealSolution()
                    showSolutionDialog = false
                }) {
                    Text(stringResource(R.string.yes))
                }
            },
            dismissButton = {
                TextButton(onClick = { showSolutionDialog = false }) {
                    Text(stringResource(R.string.no))
                }
            }
        )
    }
}

@Composable
fun CrosswordGrid(
    puzzleData: com.crucibibia.app.data.model.PuzzleData,
    userGrid: List<List<Char?>>,
    selectedCell: Pair<Int, Int>?,
    highlightedCells: Set<Pair<Int, Int>>,
    errorCells: Set<Pair<Int, Int>>,
    correctCells: Set<Pair<Int, Int>>,
    revealedCells: Set<Pair<Int, Int>>,
    onCellClick: (Int, Int) -> Unit,
    modifier: Modifier = Modifier
) {
    val grid = puzzleData.grid
    val isDark = MaterialTheme.colorScheme.background.luminance() < 0.5f

    BoxWithConstraints(modifier = modifier) {
        val cellSize = (maxWidth - 2.dp) / grid.size

        Column(
            modifier = Modifier
                .border(1.dp, if (isDark) GridColors.borderDark else GridColors.border)
        ) {
            for (row in 0 until grid.size) {
                Row {
                    for (col in 0 until grid.size) {
                        val cell = grid.cells[row][col]
                        val userChar = userGrid.getOrNull(row)?.getOrNull(col)
                        val isSelected = selectedCell == Pair(row, col)
                        val isHighlighted = Pair(row, col) in highlightedCells
                        val isError = Pair(row, col) in errorCells
                        val isCorrect = Pair(row, col) in correctCells
                        val isRevealed = Pair(row, col) in revealedCells

                        val backgroundColor = when {
                            cell.isBlocked -> if (isDark) GridColors.cellBlockedDark else GridColors.cellBlocked
                            isSelected -> if (isDark) GridColors.cellSelectedDark else GridColors.cellSelected
                            isError -> if (isDark) GridColors.cellErrorDark else GridColors.cellError
                            isCorrect -> if (isDark) GridColors.cellCorrectDark else GridColors.cellCorrect
                            isHighlighted -> if (isDark) GridColors.cellHighlightedDark else GridColors.cellHighlighted
                            else -> if (isDark) GridColors.cellEmptyDark else GridColors.cellEmpty
                        }

                        Box(
                            modifier = Modifier
                                .size(cellSize)
                                .background(backgroundColor)
                                .border(0.5.dp, if (isDark) GridColors.borderDark else GridColors.border)
                                .clickable(enabled = !cell.isBlocked) { onCellClick(row, col) },
                            contentAlignment = Alignment.Center
                        ) {
                            // Cell number
                            cell.number?.let { number ->
                                Text(
                                    text = number.toString(),
                                    fontSize = 6.sp,
                                    color = if (isDark) GridColors.numberDark else GridColors.number,
                                    modifier = Modifier
                                        .align(Alignment.TopStart)
                                        .padding(1.dp)
                                )
                            }

                            // User input or solution
                            userChar?.let { char ->
                                Text(
                                    text = char.toString(),
                                    fontSize = (cellSize.value * 0.5f).sp,
                                    fontWeight = FontWeight.Bold,
                                    color = when {
                                        isRevealed -> MaterialTheme.colorScheme.primary
                                        isError -> MaterialTheme.colorScheme.error
                                        else -> if (isDark) GridColors.textDark else GridColors.text
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ActionButtons(
    onCheck: () -> Unit,
    onHint: () -> Unit,
    onSolution: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        FilledTonalButton(onClick = onCheck) {
            Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(4.dp))
            Text(stringResource(R.string.check), fontSize = 12.sp)
        }

        FilledTonalButton(onClick = onHint) {
            Icon(Icons.Default.Lightbulb, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(4.dp))
            Text(stringResource(R.string.hint), fontSize = 12.sp)
        }

        FilledTonalButton(onClick = onSolution) {
            Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(4.dp))
            Text(stringResource(R.string.solution), fontSize = 12.sp)
        }
    }
}

@Composable
fun CluesList(
    horizontalClues: List<Clue>,
    verticalClues: List<Clue>,
    selectedDirection: Direction,
    onClueClick: (Clue) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(0) }

    Column(modifier = modifier) {
        TabRow(selectedTabIndex = selectedTab) {
            Tab(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                text = { Text(stringResource(R.string.horizontal)) }
            )
            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = { Text(stringResource(R.string.vertical)) }
            )
        }

        LazyColumn(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(vertical = 8.dp)
        ) {
            val clues = if (selectedTab == 0) horizontalClues else verticalClues
            items(clues) { clue ->
                ClueItem(
                    clue = clue,
                    onClick = { onClueClick(clue) }
                )
            }
        }
    }
}

@Composable
fun ClueItem(
    clue: Clue,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.Top
    ) {
        Text(
            text = "${clue.number}.",
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.width(32.dp)
        )
        Text(
            text = clue.text,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
fun CustomKeyboard(
    onKeyPress: (Char) -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    val rows = listOf(
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    )

    Column(
        modifier = modifier
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        rows.forEachIndexed { index, row ->
            Row(
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth()
            ) {
                row.forEach { letter ->
                    KeyboardKey(
                        letter = letter,
                        onClick = { onKeyPress(letter) }
                    )
                }

                // Add delete button on last row
                if (index == rows.lastIndex) {
                    Spacer(modifier = Modifier.width(4.dp))
                    Box(
                        modifier = Modifier
                            .size(width = 48.dp, height = 40.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(MaterialTheme.colorScheme.errorContainer)
                            .clickable(onClick = onDelete),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Backspace,
                            contentDescription = stringResource(R.string.clear),
                            tint = MaterialTheme.colorScheme.onErrorContainer,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
        }
    }
}

@Composable
fun KeyboardKey(
    letter: Char,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .padding(2.dp)
            .size(width = 32.dp, height = 40.dp)
            .clip(RoundedCornerShape(4.dp))
            .background(MaterialTheme.colorScheme.surface)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = letter.toString(),
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

@Composable
fun CompletionScoreRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.Bold,
            color = if (value.startsWith("-"))
                MaterialTheme.colorScheme.error
            else
                MaterialTheme.colorScheme.primary
        )
    }
}

// Extension function for Color luminance
fun Color.luminance(): Float {
    val r = red
    val g = green
    val b = blue
    return 0.299f * r + 0.587f * g + 0.114f * b
}
