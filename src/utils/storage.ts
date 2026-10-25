import { Puzzle, PuzzleSolution, UserProgress, BoardTheme, DeviceView } from '../types/puzzle';
import { INITIAL_SOLUTIONS } from '../data/puzzlesData';

const SOLUTIONS_KEY = 'step4_chess_solutions_v1';
const PROGRESS_KEY = 'step4_chess_progress_v1';
const THEME_KEY = 'step4_chess_board_theme_v1';
const SOUND_KEY = 'step4_chess_sound_enabled_v1';
const VIEW_KEY = 'step4_chess_device_view_v1';

/**
 * Load all puzzle solutions, merging initial starter solutions with local overrides
 */
export const loadSolutions = (): Record<string, PuzzleSolution> => {
  if (typeof window === 'undefined') return INITIAL_SOLUTIONS;
  try {
    const raw = localStorage.getItem(SOLUTIONS_KEY);
    if (!raw) {
      localStorage.setItem(SOLUTIONS_KEY, JSON.stringify(INITIAL_SOLUTIONS));
      return { ...INITIAL_SOLUTIONS };
    }
    const saved = JSON.parse(raw);
    const merged = { ...INITIAL_SOLUTIONS, ...saved };
    Object.entries(INITIAL_SOLUTIONS).forEach(([id, initial]) => {
      if (initial.variations && initial.variations.length > 0) {
        merged[id] = { ...merged[id], variations: initial.variations };
      }
    });
    return merged;
  } catch (e) {
    console.error('Failed to load solutions from storage:', e);
    return { ...INITIAL_SOLUTIONS };
  }
};

/**
 * Save or update a single puzzle solution
 */
export const savePuzzleSolution = (solution: PuzzleSolution): void => {
  try {
    const current = loadSolutions();
    current[solution.puzzleId] = {
      ...solution,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(SOLUTIONS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save puzzle solution:', e);
  }
};

/**
 * Delete a puzzle solution
 */
export const deletePuzzleSolution = (puzzleId: string): void => {
  try {
    const current = loadSolutions();
    delete current[puzzleId];
    localStorage.setItem(SOLUTIONS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to delete puzzle solution:', e);
  }
};

/**
 * Export all solutions as downloadable JSON
 */
export const exportSolutionsToJson = (): string => {
  const all = loadSolutions();
  return JSON.stringify(all, null, 2);
};

/**
 * Import solutions from JSON string
 */
export const importSolutionsFromJson = (jsonStr: string): { success: boolean; count: number; error?: string } => {
  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed !== 'object' || parsed === null) {
      return { success: false, count: 0, error: 'Invalid JSON format' };
    }
    const current = loadSolutions();
    let count = 0;
    for (const [id, sol] of Object.entries(parsed)) {
      if (sol && typeof sol === 'object' && Array.isArray((sol as PuzzleSolution).moves)) {
        current[id] = sol as PuzzleSolution;
        count++;
      }
    }
    localStorage.setItem(SOLUTIONS_KEY, JSON.stringify(current));
    return { success: true, count };
  } catch (e: unknown) {
    const err = e as Error;
    return { success: false, count: 0, error: err.message || 'Failed to parse JSON' };
  }
};

/**
 * Reset solutions to initial built-in dataset
 */
export const resetSolutionsToDefault = (): void => {
  localStorage.setItem(SOLUTIONS_KEY, JSON.stringify(INITIAL_SOLUTIONS));
};

const defaultProgress: UserProgress = {
  solvedIds: [],
  attemptedIds: [],
  bookmarkedIds: [],
  currentStreak: 0,
  bestStreak: 0,
  lastSolvedDate: ''
};

/**
 * Load user practice progress
 */
export const loadUserProgress = (): UserProgress => {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return defaultProgress;
  }
};

/**
 * Mark a puzzle as solved
 */
export const markPuzzleSolved = (puzzleId: string): UserProgress => {
  const current = loadUserProgress();
  const today = new Date().toISOString().split('T')[0];

  const solvedSet = new Set(current.solvedIds);
  const isNew = !solvedSet.has(puzzleId);
  solvedSet.add(puzzleId);

  let streak = current.currentStreak;
  if (current.lastSolvedDate !== today) {
    if (isYesterday(current.lastSolvedDate)) {
      streak += 1;
    } else {
      streak = 1;
    }
  }

  const updated: UserProgress = {
    ...current,
    solvedIds: Array.from(solvedSet),
    currentStreak: streak,
    bestStreak: Math.max(current.bestStreak, streak),
    lastSolvedDate: today
  };

  localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
  return updated;
};

const isYesterday = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0] === dateStr;
};

/**
 * Toggle bookmark/favorite for a puzzle
 */
export const toggleBookmark = (puzzleId: string): boolean => {
  const current = loadUserProgress();
  const set = new Set(current.bookmarkedIds);
  let isBookmarked = false;
  if (set.has(puzzleId)) {
    set.delete(puzzleId);
    isBookmarked = false;
  } else {
    set.add(puzzleId);
    isBookmarked = true;
  }
  current.bookmarkedIds = Array.from(set);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
  return isBookmarked;
};

/**
 * Board theme preference
 */
export const loadBoardTheme = (): BoardTheme => {
  if (typeof window === 'undefined') return 'tournament';
  return (localStorage.getItem(THEME_KEY) as BoardTheme) || 'tournament';
};

export const saveBoardTheme = (theme: BoardTheme): void => {
  localStorage.setItem(THEME_KEY, theme);
};

/**
 * Sound preference
 */
export const loadSoundPref = (): boolean => {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem(SOUND_KEY);
  return val === null ? true : val === 'true';
};

export const saveSoundPref = (enabled: boolean): void => {
  localStorage.setItem(SOUND_KEY, enabled.toString());
};

/**
 * View device preference (mobile container frame vs responsive fluid layout)
 */
export const loadDeviceView = (): DeviceView => {
  if (typeof window === 'undefined') return 'mobile';
  return (localStorage.getItem(VIEW_KEY) as DeviceView) || 'mobile';
};

export const saveDeviceView = (view: DeviceView): void => {
  localStorage.setItem(VIEW_KEY, view);
};

const CUSTOM_PUZZLES_KEY = 'step_chess_custom_puzzles_v1';
const STEP_FILTER_KEY = 'step_chess_selected_step_v1';

/**
 * Load user-added custom puzzles
 */
export const loadCustomPuzzles = (): Puzzle[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PUZZLES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Save custom puzzles
 */
export const saveCustomPuzzles = (puzzles: Puzzle[]): void => {
  try {
    localStorage.setItem(CUSTOM_PUZZLES_KEY, JSON.stringify(puzzles));
  } catch (e) {
    console.error('Failed to save custom puzzles:', e);
  }
};

/**
 * Add custom puzzles to storage
 */
export const addCustomPuzzles = (newPuzzles: Puzzle[]): { added: number } => {
  const current = loadCustomPuzzles();
  const existingIds = new Set(current.map((p) => p.id));
  let added = 0;
  for (const p of newPuzzles) {
    if (!existingIds.has(p.id)) {
      current.push(p);
      existingIds.add(p.id);
      added++;
    }
  }
  saveCustomPuzzles(current);
  return { added };
};

/**
 * Delete a custom puzzle
 */
export const deleteCustomPuzzle = (id: string): void => {
  const current = loadCustomPuzzles();
  const filtered = current.filter((p) => p.id !== id);
  saveCustomPuzzles(filtered);
};

/**
 * Active step filter preference
 */
export const loadStepFilter = (): string => {
  if (typeof window === 'undefined') return 'All';
  const savedStep = localStorage.getItem(STEP_FILTER_KEY);
  if (savedStep === 'Step 1') return 'Step 1 Workbook';
  return savedStep || 'All';
};

export const saveStepFilter = (step: string): void => {
  localStorage.setItem(STEP_FILTER_KEY, step);
};
