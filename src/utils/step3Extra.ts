import { Chess } from 'chess.js';
import { Puzzle, PuzzleSolution } from '../types/puzzle';

interface Step3ExtraDiagram {
  diagram_number: number;
  page_title: string;
  fen: string;
  side_to_move?: 'w' | 'b';
  solution_san?: string[];
  hint?: string;
  explanation?: string;
}

interface Step3ExtraFile {
  series: string;
  diagrams: Step3ExtraDiagram[];
}

export interface Step3ExtraParseResult {
  puzzles: Puzzle[];
  solutions: Record<string, PuzzleSolution>;
  errors: string[];
}

const cleanMoveNumber = (move: string): string =>
  move.replace(/^\d+\.(?:\.\.)?\s*/, '').trim();

export function parseStep3Extra(input: unknown): Step3ExtraParseResult {
  const puzzles: Puzzle[] = [];
  const solutions: Record<string, PuzzleSolution> = {};
  const errors: string[] = [];

  if (
    !input ||
    typeof input !== 'object' ||
    !('series' in input) ||
    typeof input.series !== 'string' ||
    !('diagrams' in input) ||
    !Array.isArray(input.diagrams)
  ) {
    return { puzzles, solutions, errors: ['Expected a JSON object with series and diagrams.'] };
  }

  const file = input as Step3ExtraFile;
  const series = file.series.endsWith('Workbook')
    ? file.series.slice(0, -'Workbook'.length)
    : file.series;
  const step = series
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(\d)([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .trim();
  const stepSlug = step.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  file.diagrams.forEach((diagram, index) => {
    const diagramNumber = Number(diagram?.diagram_number);
    const title = typeof diagram?.page_title === 'string' ? diagram.page_title.trim() : '';
    const fen = typeof diagram?.fen === 'string' ? diagram.fen.trim() : '';

    if (!Number.isInteger(diagramNumber) || diagramNumber < 1 || !title || !fen) {
      errors.push(`Diagram ${index + 1}: missing a valid diagram_number, page_title, or fen.`);
      return;
    }

    let chess: Chess;
    try {
      chess = new Chess(fen);
    } catch (error) {
      errors.push(`Diagram ${diagramNumber}: ${(error as Error).message || 'invalid FEN'}.`);
      return;
    }

    const id = `${stepSlug}_d${diagramNumber}`;
    const puzzle: Puzzle = {
      id,
      page: 1,
      diagram: diagramNumber,
      title: `${title} #${diagramNumber}`,
      categoryRaw: title,
      categoryDutch: title,
      categoryEnglish: title,
      categoryDescription: `Tactical exercise from ${step}.`,
      categoryIcon: 'Target',
      fen,
      sideToMove: chess.turn(),
      difficulty: `${step} Exercise`,
      step
    };
    puzzles.push(puzzle);

    if (!Array.isArray(diagram.solution_san) || diagram.solution_san.length === 0) return;

    const solutionChess = new Chess(fen);
    const moves: string[] = [];
    try {
      for (const rawMove of diagram.solution_san) {
        const move = cleanMoveNumber(rawMove);
        const result = solutionChess.move(move);
        moves.push(result.san);
      }
    } catch (error) {
      errors.push(`Diagram ${diagramNumber}: solution was not imported (${(error as Error).message || 'invalid SAN'}).`);
      return;
    }

    solutions[id] = {
      puzzleId: id,
      moves,
      hints: diagram.hint?.trim() ? [diagram.hint.trim()] : [],
      explanation: diagram.explanation?.trim() || `${title} solution.`,
      updatedAt: new Date().toISOString(),
      verified: false
    };
  });

  return { puzzles, solutions, errors };
}