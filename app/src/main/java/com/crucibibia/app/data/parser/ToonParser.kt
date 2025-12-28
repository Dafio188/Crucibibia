package com.crucibibia.app.data.parser

import com.crucibibia.app.data.model.*

/**
 * Parser per il formato TOON (Token-Oriented Object Notation)
 * Specifico per i file puzzle di CruciBibbia
 */
class ToonParser {

    data class ToonPuzzleData(
        val gridSize: Int,
        val structure: List<List<Int>>,
        val numberedCells: List<ToonNumberedCell>,
        val horizontalClues: List<ToonClue>,
        val verticalClues: List<ToonClue>,
        val placements: List<ToonPlacement>
    )

    data class ToonNumberedCell(
        val row: Int,
        val col: Int,
        val num: Int,
        val hasH: Boolean,
        val hasV: Boolean
    )

    data class ToonClue(
        val num: Int,
        val word: String,
        val clue: String
    )

    data class ToonPlacement(
        val num: Int,
        val word: String,
        val clue: String,
        val type: String, // "H" or "V"
        val start: String,
        val positions: List<ToonPosition>
    )

    data class ToonPosition(
        val row: Int,
        val col: Int,
        val letter: Char
    )

    fun parse(content: String): ToonPuzzleData {
        val lines = content.lines()
        var index = 0

        var gridSize = 15
        val structure = mutableListOf<List<Int>>()
        val numberedCells = mutableListOf<ToonNumberedCell>()
        val horizontalClues = mutableListOf<ToonClue>()
        val verticalClues = mutableListOf<ToonClue>()
        val placements = mutableListOf<ToonPlacement>()

        while (index < lines.size) {
            val line = lines[index].trim()

            when {
                line.startsWith("gridSize:") -> {
                    gridSize = line.substringAfter(":").trim().toInt()
                    index++
                }

                line.startsWith("structure[") -> {
                    index++
                    // Parse structure rows
                    while (index < lines.size) {
                        val rowLine = lines[index].trim()
                        if (rowLine.startsWith("- [")) {
                            val values = rowLine
                                .substringAfter("]:").trim()
                                .split(",")
                                .map { it.trim().toInt() }
                            structure.add(values)
                            index++
                        } else {
                            break
                        }
                    }
                }

                line.startsWith("numberedCells[") -> {
                    index++
                    // Parse numbered cells (tabular format)
                    while (index < lines.size) {
                        val cellLine = lines[index].trim()
                        if (cellLine.isNotEmpty() && !cellLine.contains(":") &&
                            cellLine[0].isDigit()) {
                            val parts = cellLine.split(",").map { it.trim() }
                            if (parts.size >= 5) {
                                numberedCells.add(ToonNumberedCell(
                                    row = parts[0].toInt(),
                                    col = parts[1].toInt(),
                                    num = parts[2].toInt(),
                                    hasH = parts[3].toBoolean(),
                                    hasV = parts[4].toBoolean()
                                ))
                            }
                            index++
                        } else {
                            break
                        }
                    }
                }

                line.startsWith("orizzontali[") || line.contains("orizzontali[") -> {
                    index++
                    // Parse horizontal clues
                    while (index < lines.size) {
                        val clueLine = lines[index].trim()
                        if (clueLine.isNotEmpty() && clueLine[0].isDigit()) {
                            parseClue(clueLine)?.let { horizontalClues.add(it) }
                            index++
                        } else {
                            break
                        }
                    }
                }

                line.startsWith("verticali[") || line.contains("verticali[") -> {
                    index++
                    // Parse vertical clues
                    while (index < lines.size) {
                        val clueLine = lines[index].trim()
                        if (clueLine.isNotEmpty() && clueLine[0].isDigit()) {
                            parseClue(clueLine)?.let { verticalClues.add(it) }
                            index++
                        } else {
                            break
                        }
                    }
                }

                line.startsWith("placements[") -> {
                    index++
                    // Parse placements
                    while (index < lines.size) {
                        val placementResult = parsePlacement(lines, index)
                        if (placementResult != null) {
                            placements.add(placementResult.first)
                            index = placementResult.second
                        } else {
                            break
                        }
                    }
                }

                else -> index++
            }
        }

        return ToonPuzzleData(
            gridSize = gridSize,
            structure = structure,
            numberedCells = numberedCells,
            horizontalClues = horizontalClues,
            verticalClues = verticalClues,
            placements = placements
        )
    }

    private fun parseClue(line: String): ToonClue? {
        // Format: num,word,"clue text"
        val firstComma = line.indexOf(',')
        if (firstComma == -1) return null

        val num = line.substring(0, firstComma).toIntOrNull() ?: return null
        val rest = line.substring(firstComma + 1)

        val secondComma = rest.indexOf(',')
        if (secondComma == -1) return null

        val word = rest.substring(0, secondComma).trim()
        var clue = rest.substring(secondComma + 1).trim()

        // Remove quotes if present
        if (clue.startsWith("\"") && clue.endsWith("\"")) {
            clue = clue.substring(1, clue.length - 1)
        }

        return ToonClue(num, word, clue)
    }

    private fun parsePlacement(lines: List<String>, startIndex: Int): Pair<ToonPlacement, Int>? {
        var index = startIndex
        val line = lines.getOrNull(index)?.trim() ?: return null

        if (!line.startsWith("- num:")) return null

        var num = 0
        var word = ""
        var clue = ""
        var type = ""
        var start = ""
        val positions = mutableListOf<ToonPosition>()

        // Parse the placement block
        while (index < lines.size) {
            val currentLine = lines[index].trim()

            when {
                // If we encounter "- num:" after having parsed positions, it's the next placement
                currentLine.startsWith("- num:") && positions.isNotEmpty() -> {
                    // Don't increment index so next call to parsePlacement starts here
                    break
                }
                currentLine.startsWith("- num:") -> {
                    num = currentLine.substringAfter(":").trim().toIntOrNull() ?: 0
                    index++
                }
                currentLine.startsWith("word:") -> {
                    word = currentLine.substringAfter(":").trim()
                    index++
                }
                currentLine.startsWith("clue:") -> {
                    clue = currentLine.substringAfter(":").trim()
                        .removeSurrounding("\"")
                    index++
                }
                currentLine.startsWith("type:") -> {
                    type = currentLine.substringAfter(":").trim()
                    index++
                }
                currentLine.startsWith("start:") -> {
                    start = currentLine.substringAfter(":").trim()
                    index++
                }
                currentLine.startsWith("positions[") -> {
                    index++
                    // Parse positions
                    while (index < lines.size) {
                        val posLine = lines[index].trim()
                        if (posLine.isNotEmpty() && posLine[0].isDigit()) {
                            val parts = posLine.split(",").map { it.trim() }
                            if (parts.size >= 3) {
                                positions.add(ToonPosition(
                                    row = parts[0].toInt(),
                                    col = parts[1].toInt(),
                                    letter = parts[2].firstOrNull() ?: ' '
                                ))
                            }
                            index++
                        } else {
                            break
                        }
                    }
                }
                currentLine.startsWith("metadata:") -> {
                    // End of placements
                    break
                }
                else -> index++
            }

            // Check if we've reached the next placement or end
            if (index < lines.size) {
                val nextLine = lines[index].trim()
                if ((nextLine.startsWith("- num:") && positions.isNotEmpty()) ||
                    nextLine.startsWith("metadata:")) {
                    break
                }
            }
        }

        if (num == 0 && word.isEmpty()) return null

        return Pair(
            ToonPlacement(num, word, clue, type, start, positions),
            index
        )
    }

    /**
     * Converte i dati TOON nel formato Grid e Clue dell'app
     */
    fun toGridAndClues(toonData: ToonPuzzleData): Pair<Grid, Pair<List<Clue>, List<Clue>>> {
        // Crea la griglia dalle strutture
        val cells = mutableListOf<List<Cell>>()

        // Mappa per i numeri delle celle
        val numberMap = toonData.numberedCells.associateBy { Pair(it.row, it.col) }

        // Mappa per le lettere dai placements
        val letterMap = mutableMapOf<Pair<Int, Int>, Char>()
        toonData.placements.forEach { placement ->
            placement.positions.forEach { pos ->
                letterMap[Pair(pos.row, pos.col)] = pos.letter
            }
        }

        for (row in 0 until toonData.gridSize) {
            val rowCells = mutableListOf<Cell>()
            for (col in 0 until toonData.gridSize) {
                val structValue = toonData.structure.getOrNull(row)?.getOrNull(col) ?: 0
                val isBlocked = structValue == 0
                val number = numberMap[Pair(row, col)]?.num
                val solution = if (isBlocked) null else letterMap[Pair(row, col)]

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

        val grid = Grid(size = toonData.gridSize, cells = cells)

        // Crea le definizioni orizzontali
        val horizontalClues = toonData.placements
            .filter { it.type == "H" }
            .map { placement ->
                val startPos = placement.positions.firstOrNull()
                Clue(
                    number = placement.num,
                    direction = Direction.HORIZONTAL,
                    text = placement.clue,
                    answer = placement.word,
                    startRow = startPos?.row ?: 0,
                    startCol = startPos?.col ?: 0,
                    length = placement.word.length
                )
            }

        // Crea le definizioni verticali
        val verticalClues = toonData.placements
            .filter { it.type == "V" }
            .map { placement ->
                val startPos = placement.positions.firstOrNull()
                Clue(
                    number = placement.num,
                    direction = Direction.VERTICAL,
                    text = placement.clue,
                    answer = placement.word,
                    startRow = startPos?.row ?: 0,
                    startCol = startPos?.col ?: 0,
                    length = placement.word.length
                )
            }

        return Pair(grid, Pair(horizontalClues, verticalClues))
    }
}
