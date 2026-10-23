export interface Puzzle {
  id: string;
  page: number;
  diagram: number;
  title: string;
  categoryRaw: string;
  categoryDutch: string;
  categoryEnglish: string;
  categoryDescription: string;
  categoryIcon: string;
  fen: string;
  sideToMove: 'w' | 'b';
  difficulty: string;
  step?: string; // e.g. "Step 4", "Step 1", "Step 2", "Step 3", "Step 5", "Step 6"
}

export interface PuzzleSolution {
  puzzleId: string;
  moves: string[]; // List of SAN moves, e.g. ["e6", "fxe6", "Rxd7"]
  hints: string[];
  explanation: string;
  updatedAt: string;
  verified: boolean;
}

export interface UserProgress {
  solvedIds: string[];
  attemptedIds: string[];
  bookmarkedIds: string[];
  currentStreak: number;
  bestStreak: number;
  lastSolvedDate: string;
}

export interface CategorySummary {
  dutch: string;
  english: string;
  description: string;
  icon: string;
  pages: number[];
  totalPuzzles: number;
  solvedCount: number;
}

export type BoardTheme = 'tournament' | 'wood' | 'slate' | 'classic';
export type AppTab = 'puzzles' | 'categories' | 'favorites' | 'admin';
export type DeviceView = 'mobile' | 'fluid';
