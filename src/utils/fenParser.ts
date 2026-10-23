import { Chess } from 'chess.js';
import { Puzzle } from '../types/puzzle';

export interface ParseResult {
  puzzles: Puzzle[];
  errors: string[];
}

/**
 * Parses raw text containing FEN strings into validated Puzzle objects
 * Supports:
 * 1. Formatted Step notebook text:
 *    ## Page 5 - Double attack: Decoy
 *    Page 5, Diagram 1: r4rk1/... w - - 0 1
 * 2. Bare FEN strings (one per line)
 * 3. Comma/tab separated FENs
 */
export function parseFenText(
  rawText: string,
  targetStep: string = 'Step 4',
  defaultCategory: string = 'General Tactics'
): ParseResult {
  const lines = rawText.split('\n');
  const puzzles: Puzzle[] = [];
  const errors: string[] = [];

  let currentPage = 1;
  let currentCategory = defaultCategory;
  let diagramCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Check for Section Header: e.g. "## Page 5 - Dubbele aanval: Lokken"
    if (rawLine.startsWith('#')) {
      const match = rawLine.match(/Page\s+(\d+)\s*[-:]?\s*(.*)/i);
      if (match) {
        currentPage = parseInt(match[1], 10);
        if (match[2].trim()) {
          currentCategory = match[2].trim();
        }
      } else {
        const catMatch = rawLine.replace(/^[#\s]+/, '').trim();
        if (catMatch) currentCategory = catMatch;
      }
      diagramCount = 0;
      continue;
    }

    let fenCandidate = rawLine;
    let pageNum = currentPage;
    let diagNum = diagramCount + 1;

    // Check for Page X, Diagram Y prefix:
    if (rawLine.includes(':')) {
      const colonIdx = rawLine.indexOf(':');
      const prefix = rawLine.substring(0, colonIdx).trim();
      fenCandidate = rawLine.substring(colonIdx + 1).trim();

      const pageDiagMatch = prefix.match(/Page\s+(\d+),\s*Diagram\s+(\d+)/i);
      if (pageDiagMatch) {
        pageNum = parseInt(pageDiagMatch[1], 10);
        diagNum = parseInt(pageDiagMatch[2], 10);
      }
    }

    // Check if FEN is wrapped in parentheses
    const parenMatch = fenCandidate.match(/\(([^)]+)\)/);
    if (parenMatch && parenMatch[1].includes('/')) {
      fenCandidate = parenMatch[1].trim();
    }

    // Clean stray spaces
    fenCandidate = fenCandidate.replace(/\s+/g, ' ').trim();

    // If FEN only has piece placement (e.g. "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"), add default turn
    if (fenCandidate.split('/').length === 8 && !fenCandidate.includes(' ')) {
      fenCandidate = `${fenCandidate} w - - 0 1`;
    }

    try {
      const chess = new Chess(fenCandidate);
      const turn = chess.turn();
      diagramCount++;

      const stepClean = targetStep.startsWith('Step') ? targetStep : `Step ${targetStep}`;
      const stepSlug = stepClean.toLowerCase().replace(/\s+/g, '');
      const puzzleId = `${stepSlug}_p${pageNum}_d${diagNum}_${Date.now().toString().slice(-4)}_${i}`;

      puzzles.push({
        id: puzzleId,
        page: pageNum,
        diagram: diagNum,
        title: `${currentCategory} #${diagNum}`,
        categoryRaw: currentCategory,
        categoryDutch: currentCategory,
        categoryEnglish: currentCategory,
        categoryDescription: `Tactical training position from ${stepClean}.`,
        categoryIcon: 'Target',
        fen: fenCandidate,
        sideToMove: turn,
        difficulty: `${stepClean} Exercise`,
        step: stepClean
      });
    } catch (e: unknown) {
      const err = e as Error;
      errors.push(`Line ${i + 1}: ${err.message || 'Invalid FEN'} ("${fenCandidate.slice(0, 30)}...")`);
    }
  }

  return { puzzles, errors };
}
