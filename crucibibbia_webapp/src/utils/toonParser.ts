import type { Cell, Clue, Direction, PuzzleData } from '../types';

interface ToonPlacement {
  num: number;
  word: string;
  clue: string;
  type: 'H' | 'V';
  start: string;
  positions: { row: number; col: number; letter: string }[];
}

interface ToonNumberedCell {
  row: number;
  col: number;
  num: number;
  hasH: boolean;
  hasV: boolean;
}

interface ParsedToonData {
  gridSize: number;
  structure: number[][];
  numberedCells: ToonNumberedCell[];
  placements: ToonPlacement[];
}

/**
 * Parser for TOON (Token-Oriented Object Notation) puzzle files
 */
export class ToonParser {
  /**
   * Parse a TOON file content
   */
  parse(content: string): ParsedToonData {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let gridSize = 0;
    const structure: number[][] = [];
    const numberedCells: ToonNumberedCell[] = [];
    const placements: ToonPlacement[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith('gridSize:')) {
        gridSize = parseInt(line.split(':')[1].trim());
        i++;
      } else if (line.startsWith('structure[')) {
        i++;
        while (i < lines.length && lines[i].startsWith('- [')) {
          const rowData = lines[i].match(/\[(.*?)\]:\s*(.*)/);
          if (rowData) {
            const cells = rowData[2].split(',').map(c => parseInt(c.trim()));
            structure.push(cells);
          }
          i++;
        }
      } else if (line.startsWith('numberedCells[')) {
        i++;
        while (i < lines.length && /^\d+,\d+,\d+/.test(lines[i])) {
          const parts = lines[i].split(',').map(p => p.trim());
          if (parts.length >= 5) {
            numberedCells.push({
              row: parseInt(parts[0]),
              col: parseInt(parts[1]),
              num: parseInt(parts[2]),
              hasH: parts[3] === 'true',
              hasV: parts[4] === 'true',
            });
          }
          i++;
        }
      } else if (line.startsWith('placements[')) {
        i++;
        while (i < lines.length && !lines[i].startsWith('metadata:')) {
          const placement = this.parsePlacement(lines, i);
          if (placement) {
            placements.push(placement.placement);
            i = placement.nextIndex;
          } else {
            i++;
          }
        }
      } else {
        i++;
      }
    }

    return { gridSize, structure, numberedCells, placements };
  }

  private parsePlacement(
    lines: string[],
    startIndex: number
  ): { placement: ToonPlacement; nextIndex: number } | null {
    let i = startIndex;
    const line = lines[i]?.trim();

    if (!line?.startsWith('- num:')) return null;

    let num = 0;
    let word = '';
    let clue = '';
    let type: 'H' | 'V' = 'H';
    let start = '';
    const positions: { row: number; col: number; letter: string }[] = [];

    while (i < lines.length) {
      const currentLine = lines[i].trim();

      // Check if we've reached the next placement
      if (currentLine.startsWith('- num:') && positions.length > 0) {
        break;
      }

      if (currentLine.startsWith('- num:')) {
        num = parseInt(currentLine.split(':')[1].trim());
        i++;
      } else if (currentLine.startsWith('word:')) {
        word = currentLine.split(':')[1].trim();
        i++;
      } else if (currentLine.startsWith('clue:')) {
        clue = currentLine.substring(currentLine.indexOf(':') + 1).trim();
        // Remove surrounding quotes
        if (clue.startsWith('"') && clue.endsWith('"')) {
          clue = clue.slice(1, -1);
        }
        i++;
      } else if (currentLine.startsWith('type:')) {
        type = currentLine.split(':')[1].trim() as 'H' | 'V';
        i++;
      } else if (currentLine.startsWith('start:')) {
        start = currentLine.split(':')[1].trim();
        i++;
      } else if (currentLine.startsWith('positions[')) {
        i++;
        while (i < lines.length) {
          const posLine = lines[i].trim();
          if (posLine && /^\d+,\d+,.+$/.test(posLine)) {
            const parts = posLine.split(',').map(p => p.trim());
            positions.push({
              row: parseInt(parts[0]),
              col: parseInt(parts[1]),
              letter: parts[2],
            });
            i++;
          } else {
            break;
          }
        }
      } else if (currentLine.startsWith('metadata:')) {
        break;
      } else {
        i++;
      }
    }

    if (num === 0 && word === '') return null;

    return {
      placement: { num, word, clue, type, start, positions },
      nextIndex: i,
    };
  }

  /**
   * Convert parsed TOON data to PuzzleData
   */
  toPuzzleData(
    parsedData: ParsedToonData,
    puzzleId: string,
    year: number,
    month: number
  ): PuzzleData {
    const { gridSize, structure, numberedCells, placements } = parsedData;

    // Create grid
    const grid: Cell[][] = [];
    for (let row = 0; row < gridSize; row++) {
      const rowCells: Cell[] = [];
      for (let col = 0; col < gridSize; col++) {
        const isBlack = structure[row]?.[col] === 0;
        const numberedCell = numberedCells.find(nc => nc.row === row && nc.col === col);

        rowCells.push({
          row,
          col,
          letter: '',
          isBlack,
          number: numberedCell?.num,
          hasHorizontal: numberedCell?.hasH,
          hasVertical: numberedCell?.hasV,
        });
      }
      grid.push(rowCells);
    }

    // Fill in letters from placements
    for (const placement of placements) {
      for (const pos of placement.positions) {
        if (grid[pos.row]?.[pos.col]) {
          grid[pos.row][pos.col].letter = pos.letter;
        }
      }
    }

    // Create clues
    const horizontalClues: Clue[] = [];
    const verticalClues: Clue[] = [];

    for (const placement of placements) {
      const direction: Direction = placement.type === 'H' ? 'horizontal' : 'vertical';
      const startPos = placement.positions[0];

      const clue: Clue = {
        number: placement.num,
        text: placement.clue,
        answer: placement.word,
        direction,
        startRow: startPos?.row ?? 0,
        startCol: startPos?.col ?? 0,
        length: placement.positions.length,
        positions: placement.positions.map(p => ({ row: p.row, col: p.col })),
      };

      if (direction === 'horizontal') {
        // Avoid duplicates
        if (!horizontalClues.some(c => c.number === clue.number)) {
          horizontalClues.push(clue);
        }
      } else {
        if (!verticalClues.some(c => c.number === clue.number)) {
          verticalClues.push(clue);
        }
      }
    }

    // Sort clues by number
    horizontalClues.sort((a, b) => a.number - b.number);
    verticalClues.sort((a, b) => a.number - b.number);

    const date = `${year}-${month.toString().padStart(2, '0')}-08`;

    return {
      id: puzzleId,
      date,
      year,
      month,
      gridSize,
      grid,
      horizontalClues,
      verticalClues,
    };
  }
}

export const toonParser = new ToonParser();
