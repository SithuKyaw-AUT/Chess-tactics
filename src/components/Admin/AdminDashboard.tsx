import React, { useState, useMemo } from 'react';
import { Chess, Square } from 'chess.js';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Play,
  Trash2,
  Eye,
  FileCode,
  Zap,
  Check,
  X,
  Plus,
  BookOpen
} from 'lucide-react';
import { Puzzle, PuzzleSolution, BoardTheme } from '../../types/puzzle';
import { ChessBoard, MoveEvent } from '../ChessBoard/ChessBoard';
import {
  ADMIN_HARDCODED_PASSWORD,
  savePuzzleSolution,
  deletePuzzleSolution,
  exportSolutionsToJson,
  importSolutionsFromJson,
  resetSolutionsToDefault,
  addCustomPuzzles,
  deleteCustomPuzzle
} from '../../utils/storage';
import { playMoveSound, playCaptureSound, playCheckSound, playSolvedSound } from '../../utils/soundEffects';
import { parseFenText } from '../../utils/fenParser';
import { parseStep3Extra } from '../../utils/step3Extra';

interface AdminDashboardProps {
  puzzles: Puzzle[];
  solutions: Record<string, PuzzleSolution>;
  isAdmin: boolean;
  onLogin: (password: string) => boolean;
  onLogout: () => void;
  onSolutionSaved: (solution: PuzzleSolution) => void;
  onSolutionsImported: () => void;
  onSelectPuzzleToPlay: (puzzle: Puzzle) => void;
  onPuzzlesUpdated: () => void;
  theme: BoardTheme;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  puzzles,
  solutions,
  isAdmin,
  onLogin,
  onLogout,
  onSolutionSaved,
  onSolutionsImported,
  onSelectPuzzleToPlay,
  onPuzzlesUpdated,
  theme
}) => {
  // Login form state
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Selected puzzle for solving/editing
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string>(puzzles[0]?.id || 'p3_d1');
  const selectedPuzzle = useMemo(() => puzzles.find((p) => p.id === selectedPuzzleId) || puzzles[0], [puzzles, selectedPuzzleId]);

  // Solver board state for admin
  const currentSolution = solutions[selectedPuzzle?.id];
  const [boardFen, setBoardFen] = useState<string>(selectedPuzzle?.fen || '8/8/8/8/8/8/8/8 w - - 0 1');
  const [recordedMoves, setRecordedMoves] = useState<string[]>(currentSolution?.moves || []);
  const [hintInput, setHintInput] = useState<string>(currentSolution?.hints?.[0] || '');
  const [explanationInput, setExplanationInput] = useState<string>(currentSolution?.explanation || '');
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string>('');

  // Filters & search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [stepFilter, setStepFilter] = useState<string>('all');
  const [pageFilter, setPageFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Import solutions modal state
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');

  // Add new FENs modal state
  const [showAddFensModal, setShowAddFensModal] = useState<boolean>(false);
  const [addStep, setAddStep] = useState<string>('Step 4');
  const [customStepText, setCustomStepText] = useState<string>('');
  const [addCategory, setAddCategory] = useState<string>('Tactics Exercise');
  const [rawFenInput, setRawFenInput] = useState<string>('');
  const [addStatusMessage, setAddStatusMessage] = useState<string>('');

  // Available steps list
  const availableSteps = useMemo(() => {
    const set = new Set<string>();
    puzzles.forEach((p) => {
      set.add(p.step || 'Step 4');
    });
    return Array.from(set).sort();
  }, [puzzles]);

  // Update board when selected puzzle changes
  React.useEffect(() => {
    if (!selectedPuzzle) return;
    setBoardFen(selectedPuzzle.fen);
    const sol = solutions[selectedPuzzle.id];
    setRecordedMoves(sol?.moves || []);
    setHintInput(sol?.hints?.[0] || '');
    setExplanationInput(sol?.explanation || '');
    setLastMove(null);
    setSaveSuccessNotice('');
  }, [selectedPuzzleId, selectedPuzzle?.fen, solutions]);

  // Handle move on admin board to record solution
  const handleAdminMove = (moveEvt: MoveEvent) => {
    try {
      const chess = new Chess(boardFen);
      const res = chess.move({
        from: moveEvt.from,
        to: moveEvt.to,
        promotion: moveEvt.promotion || 'q'
      });

      if (res) {
        setBoardFen(chess.fen());
        setLastMove({ from: moveEvt.from, to: moveEvt.to });
        setRecordedMoves((prev) => [...prev, res.san]);

        if (res.captured) playCaptureSound();
        else if (chess.inCheck()) playCheckSound();
        else playMoveSound();
      }
    } catch (e) {
      console.error('Invalid move in admin board:', e);
    }
  };

  const resetAdminBoard = () => {
    if (!selectedPuzzle) return;
    setBoardFen(selectedPuzzle.fen);
    setRecordedMoves([]);
    setLastMove(null);
  };

  const handleSave = () => {
    if (!selectedPuzzle) return;
    if (recordedMoves.length === 0) {
      alert('Please make at least one move on the board to record a solution.');
      return;
    }

    const updated: PuzzleSolution = {
      puzzleId: selectedPuzzle.id,
      moves: recordedMoves,
      hints: hintInput.trim()
        ? [hintInput.trim()]
        : [`Focus on ${selectedPuzzle.categoryEnglish}`, `Look at ${recordedMoves[0]}`],
      explanation:
        explanationInput.trim() ||
        `${selectedPuzzle.title}: ${recordedMoves.join(' ')} exploits the theme of ${selectedPuzzle.categoryEnglish}.`,
      updatedAt: new Date().toISOString(),
      verified: true
    };

    savePuzzleSolution(updated);
    onSolutionSaved(updated);
    playSolvedSound();
    setSaveSuccessNotice('Solution saved and verified!');
    setTimeout(() => setSaveSuccessNotice(''), 3000);
  };

  const handleDelete = () => {
    if (!selectedPuzzle) return;
    if (confirm(`Are you sure you want to delete the solution for ${selectedPuzzle.title}?`)) {
      deletePuzzleSolution(selectedPuzzle.id);
      setRecordedMoves([]);
      setHintInput('');
      setExplanationInput('');
      resetAdminBoard();
    }
  };

  // Find candidate checks & captures to help admin solve quickly
  const candidateMoves = useMemo(() => {
    try {
      const c = new Chess(boardFen);
      const moves = c.moves({ verbose: true });
      return moves.filter((m) => m.captured || m.san.includes('+') || m.san.includes('#'));
    } catch {
      return [];
    }
  }, [boardFen]);

  // Export JSON file
  const handleExport = () => {
    const jsonStr = exportSolutionsToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `step_chess_solutions_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;

    try {
      const parsedJson: unknown = JSON.parse(importJsonText);
      if (
        parsedJson &&
        typeof parsedJson === 'object' &&
        'diagrams' in parsedJson &&
        Array.isArray(parsedJson.diagrams)
      ) {
        const parsedStep3Extra = parseStep3Extra(parsedJson);
        if (parsedStep3Extra.puzzles.length === 0) {
          setImportStatus(`Error: ${parsedStep3Extra.errors.join(' ') || 'No valid puzzles found.'}`);
          return;
        }

        const existingIds = new Set(puzzles.map((puzzle) => puzzle.id));
        const newPuzzles = parsedStep3Extra.puzzles.filter((puzzle) => !existingIds.has(puzzle.id));
        const { added } = addCustomPuzzles(newPuzzles);
        let importedSolutions = 0;
        newPuzzles.forEach((puzzle) => {
          const solution = parsedStep3Extra.solutions[puzzle.id];
          if (solution) {
            savePuzzleSolution(solution);
            importedSolutions++;
          }
        });

        onPuzzlesUpdated();
        onSolutionsImported();
        const issueMessage = parsedStep3Extra.errors.length
          ? ` ${parsedStep3Extra.errors.length} item(s) need attention.`
          : '';
        setImportStatus(`Imported ${added} puzzle(s) and ${importedSolutions} solution(s).${issueMessage}`);
        setTimeout(() => {
          setShowImportModal(false);
          setImportStatus('');
          setImportJsonText('');
        }, 1800);
        return;
      }
    } catch (error) {
      setImportStatus(`Error: ${(error as Error).message || 'Failed to parse JSON'}`);
      return;
    }

    const res = importSolutionsFromJson(importJsonText);
    if (res.success) {
      setImportStatus(`Successfully imported ${res.count} solutions!`);
      onSolutionsImported();
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus('');
        setImportJsonText('');
      }, 1500);
    } else {
      setImportStatus(`Error: ${res.error}`);
    }
  };

  // Parse new FEN preview
  const parsePreview = useMemo(() => {
    if (!rawFenInput.trim()) return { puzzles: [], errors: [] };
    const stepName = addStep === 'custom' ? (customStepText.trim() || 'Step Custom') : addStep;
    return parseFenText(rawFenInput, stepName, addCategory.trim() || 'General Tactics');
  }, [rawFenInput, addStep, customStepText, addCategory]);

  const handleAddFensSubmit = () => {
    if (parsePreview.puzzles.length === 0) {
      alert('No valid FEN positions found to add. Please check your text.');
      return;
    }

    const { added } = addCustomPuzzles(parsePreview.puzzles);
    onPuzzlesUpdated();
    setAddStatusMessage(`Added ${added} new puzzle(s) successfully!`);

    setTimeout(() => {
      setShowAddFensModal(false);
      setRawFenInput('');
      setAddStatusMessage('');
    }, 1500);
  };

  // Filtered puzzle list
  const filteredPuzzles = useMemo(() => {
    return puzzles.filter((p) => {
      const sol = solutions[p.id];
      const hasSol = sol && sol.moves && sol.moves.length > 0;

      const pStep = p.step || 'Step 4';
      if (stepFilter !== 'all' && pStep !== stepFilter) return false;

      if (statusFilter === 'solved' && !hasSol) return false;
      if (statusFilter === 'unsolved' && hasSol) return false;
      if (pageFilter !== 'all' && p.page.toString() !== pageFilter) return false;
      if (categoryFilter !== 'all' && p.categoryDutch !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.categoryDutch.toLowerCase().includes(q) ||
          p.categoryEnglish.toLowerCase().includes(q) ||
          (p.step && p.step.toLowerCase().includes(q)) ||
          `page ${p.page}`.includes(q) ||
          `diagram ${p.diagram}`.includes(q) ||
          p.fen.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [puzzles, solutions, stepFilter, statusFilter, pageFilter, categoryFilter, searchQuery]);

  // Stats
  const solvedCount = Object.values(solutions).filter((s) => s.moves && s.moves.length > 0).length;
  const totalCount = puzzles.length;

  // Pages list for filter
  const pagesList = useMemo(() => {
    const set = new Set<number>();
    filteredPuzzles.forEach((p) => set.add(p.page));
    return Array.from(set).sort((a, b) => a - b);
  }, [filteredPuzzles]);

  // If NOT logged in, show clean admin login card
  if (!isAdmin) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-100">Admin Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Log in to manage puzzles, add new FEN positions for any Step, and record official solutions.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const success = onLogin(passwordInput);
              if (!success) {
                setLoginError('Incorrect password. Default password is: step4admin');
              } else {
                setLoginError('');
              }
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setLoginError('');
                }}
                placeholder="Enter password..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 min-h-[44px]"
              />
              {loginError && <p className="text-xs text-rose-400 mt-1.5">{loginError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold py-3 rounded-xl text-sm transition-all min-h-[44px] shadow-lg shadow-amber-500/20"
            >
              Sign In to Management
            </button>
          </form>

          {/* Quick Demo Autofill Helper */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span>Default Admin Password: </span>
            <button
              onClick={() => {
                setPasswordInput(ADMIN_HARDCODED_PASSWORD);
                onLogin(ADMIN_HARDCODED_PASSWORD);
              }}
              className="text-amber-400 font-mono font-semibold underline hover:text-amber-300 ml-1 min-h-[36px]"
            >
              step4admin (Click to Autofill & Enter)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Logged-In View
  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-28">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between py-4 border-b border-slate-800 mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Chess Puzzle Manager</h1>
            <p className="text-xs text-slate-400">
              {solvedCount} of {totalCount} puzzles solved across {availableSteps.length} Step(s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Add / Import FEN Strings Button */}
          <button
            onClick={() => setShowAddFensModal(true)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 min-h-[38px] transition-all shadow-md shadow-amber-500/20"
            title="Add more FEN strings for any Step"
          >
            <Plus className="w-4 h-4" />
            <span>Add FENs</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExport}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 min-h-[38px] transition-colors"
            title="Export all solutions as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => setShowImportModal(true)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 min-h-[38px] transition-colors"
            title="Import solutions or puzzle JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-medium flex items-center gap-1.5 min-h-[38px] transition-colors"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Side Workspace Solver / Right Side Puzzle Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Solver & Solution Recorder */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          {selectedPuzzle ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase tracking-wider">
                    <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px]">
                      {selectedPuzzle.step || 'Step 4'}
                    </span>
                    <span>Page {selectedPuzzle.page} · Diagram {selectedPuzzle.diagram}</span>
                    <span className="text-slate-600">/</span>
                    <span>{selectedPuzzle.sideToMove === 'w' ? 'White' : 'Black'} to move</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-100 mt-0.5">{selectedPuzzle.categoryDutch}</h2>
                </div>

                <button
                  onClick={() => onSelectPuzzleToPlay(selectedPuzzle)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors min-h-[36px]"
                  title="Test in practice player"
                >
                  <Play className="w-3.5 h-3.5" /> Test Play
                </button>
              </div>

              {/* Interactive Chessboard for recording moves */}
              <div className="flex justify-center mb-4">
                <ChessBoard
                  fen={boardFen}
                  flipped={selectedPuzzle.sideToMove === 'b'}
                  theme={theme}
                  interactive={true}
                  lastMove={lastMove}
                  onMove={handleAdminMove}
                />
              </div>

              {/* Candidate tactical moves helper */}
              {candidateMoves.length > 0 && (
                <div className="mb-3 px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Candidate Checks & Captures:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {candidateMoves.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          handleAdminMove({
                            from: m.from as Square,
                            to: m.to as Square,
                            promotion: m.promotion as 'q' | 'r' | 'b' | 'n'
                          });
                        }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 rounded font-mono text-xs transition-colors"
                      >
                        {m.san}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recorded Solution Moves List */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-300">
                    Recorded Solution Line:
                  </span>
                  <button
                    onClick={resetAdminBoard}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 min-h-[32px]"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Board
                  </button>
                </div>

                <div className="font-mono text-sm py-1.5 text-amber-300 min-h-[28px]">
                  {recordedMoves.length > 0 ? (
                    recordedMoves.map((m, idx) => (
                      <span key={idx} className="mr-2">
                        {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}. ` : ''}
                        <strong className="text-white">{m}</strong>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic text-xs">
                      Make the winning move sequence on the board above to record it...
                    </span>
                  )}
                </div>
              </div>

              {/* Hints & Explanation Inputs */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={hintInput}
                    onChange={(e) => setHintInput(e.target.value)}
                    placeholder="e.g. Cut off the queen with a pawn advance"
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 min-h-[38px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tactical Explanation (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={explanationInput}
                    onChange={(e) => setExplanationInput(e.target.value)}
                    placeholder="e.g. 1. c4! interrupts the queen on d5, and after 1... Qc6 White wins d4."
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
                {currentSolution?.moves?.length > 0 && (
                  <button
                    onClick={handleDelete}
                    className="px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[44px]"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Solution
                  </button>
                )}

                <button
                  onClick={handleSave}
                  className="ml-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all min-h-[44px] shadow-lg shadow-emerald-950/40"
                >
                  <Save className="w-4 h-4" /> Save Official Solution
                </button>
              </div>

              {saveSuccessNotice && (
                <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-medium text-center">
                  {saveSuccessNotice}
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              No puzzle matches your active filter.
            </div>
          )}
        </div>

        {/* Right Column: Puzzle Selector & Filters */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[680px]">
          <h2 className="text-sm font-bold text-slate-100 mb-3">All Puzzles ({filteredPuzzles.length})</h2>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by step, theme, FEN..."
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 min-h-[38px]"
            />
          </div>

          {/* Filters Row 1: Step Filter & Status Filter */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Step Filter */}
            <select
              value={stepFilter}
              onChange={(e) => setStepFilter(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-400 min-h-[36px]"
            >
              <option value="all">Step: All Steps</option>
              {availableSteps.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'solved' | 'unsolved')}
              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-400 min-h-[36px]"
            >
              <option value="all">Status: All</option>
              <option value="unsolved">Needs Solution</option>
              <option value="solved">Solved / Ready</option>
            </select>
          </div>

          {/* Page Filter */}
          <div className="mb-3">
            <select
              value={pageFilter}
              onChange={(e) => setPageFilter(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-400 min-h-[36px]"
            >
              <option value="all">Page: All Pages</option>
              {pagesList.map((p) => (
                <option key={p} value={p.toString()}>
                  Page {p}
                </option>
              ))}
            </select>
          </div>

          {/* Scrollable list of puzzles */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredPuzzles.map((p) => {
              const sol = solutions[p.id];
              const isSolved = sol && sol.moves && sol.moves.length > 0;
              const isSelected = p.id === selectedPuzzleId;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPuzzleId(p.id)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 text-slate-100 ring-1 ring-amber-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-semibold text-amber-400">{p.step || 'Step 4'}</span>
                      <span aria-hidden="true">·</span>
                      <span>P{p.page}·#{p.diagram}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{p.categoryDutch}</span>
                    </div>

                    <div className="text-xs font-mono text-slate-400 truncate mt-0.5">
                      {isSolved ? (
                        <span className="text-emerald-400 font-semibold">{sol.moves.join(' ')}</span>
                      ) : (
                        <span className="text-slate-500 italic">No solution recorded</span>
                      )}
                    </div>
                  </div>

                  {isSolved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add New FEN Positions Modal */}
      {showAddFensModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" /> Add FEN Positions (Any Step)
              </h3>
              <button
                onClick={() => setShowAddFensModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 shrink-0">
              Add new exercises for Step 1, 2, 3, 4, 5, or 6. Paste your FEN text below (single FEN, list of FENs, or workbook Page/Diagram format).
            </p>

            <div className="space-y-3.5 overflow-y-auto flex-1 pr-1">
              {/* Step Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Select Target Step
                  </label>
                  <select
                    value={addStep}
                    onChange={(e) => setAddStep(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 min-h-[38px]"
                  >
                    <option value="Step 1">Step 1</option>
                    <option value="Step 2">Step 2</option>
                    <option value="Step 3">Step 3</option>
                    <option value="Step 4">Step 4</option>
                    <option value="Step 5">Step 5</option>
                    <option value="Step 6">Step 6</option>
                    <option value="custom">Custom Step Name...</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Category / Theme Name
                  </label>
                  <input
                    type="text"
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    placeholder="e.g. Pinning or Mat: Magneet"
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 min-h-[38px]"
                  />
                </div>
              </div>

              {addStep === 'custom' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Custom Step Name
                  </label>
                  <input
                    type="text"
                    value={customStepText}
                    onChange={(e) => setCustomStepText(e.target.value)}
                    placeholder="e.g. Step 2 Plus, Step 3 Extra, etc."
                    className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 min-h-[38px]"
                  />
                </div>
              )}

              {/* FEN Textarea */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  FEN Positions Text
                </label>
                <textarea
                  rows={6}
                  value={rawFenInput}
                  onChange={(e) => setRawFenInput(e.target.value)}
                  placeholder={`Paste FEN positions here, for example:\nPage 1, Diagram 1: 8/1p1k4/2P5/3K4/8/8/8/8 b - - 0 1\nPage 1, Diagram 2: 8/1p6/1P1k4/8/3K4/8/8/8 w - - 0 1`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Live Validation Preview Box */}
              {rawFenInput.trim() && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-300">Validation Preview:</span>
                    <span className="font-mono text-amber-400">
                      {parsePreview.puzzles.length} valid position(s) detected
                    </span>
                  </div>

                  {parsePreview.errors.length > 0 && (
                    <div className="text-rose-400 space-y-0.5 mt-1 font-mono text-[11px]">
                      {parsePreview.errors.slice(0, 3).map((err, i) => (
                        <div key={i}>{err}</div>
                      ))}
                      {parsePreview.errors.length > 3 && (
                        <div>...and {parsePreview.errors.length - 3} more issue(s)</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {addStatusMessage && (
                <p className="text-xs font-semibold text-emerald-400 text-center">
                  {addStatusMessage}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800 shrink-0">
              <button
                onClick={() => setShowAddFensModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFensSubmit}
                disabled={parsePreview.puzzles.length === 0}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-xs rounded-xl transition-all min-h-[44px]"
              >
                Add {parsePreview.puzzles.length > 0 ? `${parsePreview.puzzles.length} Puzzles` : 'Puzzles'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Solutions Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" /> Import JSON
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Choose a Step 3 Extra puzzle JSON file or paste exported solutions JSON below:
            </p>

            <input
              type="file"
              accept=".json,application/json"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  setImportJsonText(await file.text());
                  setImportStatus('');
                } catch {
                  setImportStatus('Error: Could not read the selected file.');
                }
              }}
              className="w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-200 hover:file:bg-slate-700 mb-3"
            />

            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400 mb-3"
            />

            {importStatus && (
              <p
                className={`text-xs font-medium mb-3 ${
                  importStatus.startsWith('Error') ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {importStatus}
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
              >
                Import JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
