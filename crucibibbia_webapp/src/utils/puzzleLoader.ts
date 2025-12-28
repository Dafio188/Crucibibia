import type { PuzzleData, PuzzleSummary, YearInfo } from '../types';
import { toonParser } from './toonParser';

// Import puzzle index
import puzzleIndex from '../data/puzzles/index.json';

interface PuzzleIndexEntry {
  id: string;
  year: number;
  month: number;
  number: number;
  title: string;
  source: string;
  gridSize: number;
  isCompleted: boolean;
}

/**
 * Get all available years with puzzle counts
 */
export function getAvailableYears(): YearInfo[] {
  const yearMap = new Map<number, number>();

  (puzzleIndex as PuzzleIndexEntry[]).forEach((entry) => {
    const count = yearMap.get(entry.year) || 0;
    yearMap.set(entry.year, count + 1);
  });

  return Array.from(yearMap.entries())
    .map(([year, puzzleCount]) => ({
      year,
      puzzleCount,
      completedCount: 0, // TODO: Load from localStorage
    }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Get puzzles for a specific year
 */
export function getPuzzlesForYear(year: number): PuzzleSummary[] {
  return (puzzleIndex as PuzzleIndexEntry[])
    .filter((entry) => entry.year === year)
    .map((entry) => ({
      id: entry.id,
      date: `${entry.year}-${entry.month.toString().padStart(2, '0')}-08`,
      year: entry.year,
      month: entry.month,
      completed: false, // TODO: Load from localStorage
      inProgress: false, // TODO: Load from localStorage
    }))
    .sort((a, b) => a.month - b.month);
}

/**
 * Load a specific puzzle
 */
export async function loadPuzzle(
  year: number,
  month: number
): Promise<PuzzleData | null> {
  const puzzleId = `${year}_${month.toString().padStart(2, '0')}_08`;

  try {
    // Dynamically import the puzzle file
    const response = await fetch(
      `/src/data/puzzles/${year}/${month.toString().padStart(2, '0')}/${puzzleId}.toon`
    );

    if (!response.ok) {
      console.error(`Failed to load puzzle: ${response.statusText}`);
      return null;
    }

    const content = await response.text();
    const parsedData = toonParser.parse(content);
    return toonParser.toPuzzleData(parsedData, puzzleId, year, month);
  } catch (error) {
    console.error('Error loading puzzle:', error);
    return null;
  }
}

/**
 * Get Italian month name
 */
export function getMonthName(month: number): string {
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  return months[month - 1] || '';
}
