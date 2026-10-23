import React, { useState, useEffect, useRef } from 'react';
import { Chess, Square } from 'chess.js';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  RotateCw,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  Volume2,
  VolumeX,
  Shuffle,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { ChessBoard, MoveEvent } from '../ChessBoard/ChessBoard';
import { Puzzle, PuzzleSolution, BoardTheme } from '../../types/puzzle';
import {
  playMoveSound,
  playCaptureSound,
  playCheckSound,
  playSolvedSound,
  playErrorSound,
  triggerHaptic,
  isSoundEnabled,
  setSoundEnabled
} from '../../utils/soundEffects';
import { markPuzzleSolved } from '../../utils/storage';

interface PuzzlePlayerProps {
  puzzle: Puzzle;
  solution?: PuzzleSolution;
  theme: BoardTheme;
  isBookmarked: boolean;
  isSolved: boolean;
  onBookmarkToggle: () => void;
  onNextPuzzle: () => void;
  onPrevPuzzle: () => void;
  onRandomPuzzle: () => void;
}

export const PuzzlePlayer: React.FC<PuzzlePlayerProps> = ({
  puzzle,
  solution,
  theme,
  isBookmarked,
  isSolved: initialSolved,
  onBookmarkToggle,
  onNextPuzzle,
  onPrevPuzzle,
  onRandomPuzzle
}) => {
  // Game state
  const [chess, setChess] = useState<Chess>(() => new Chess(puzzle.fen));
  const [currentFen, setCurrentFen] = useState<string>(puzzle.fen);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [hintSquare, setHintSquare] = useState<Square | null>(null);

  // Solving workflow state
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [status, setStatus] = useState<'playing' | 'wrong' | 'solved' | 'waiting_opponent'>('playing');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [hintTier, setHintTier] = useState<number>(0);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<boolean>(puzzle.sideToMove === 'b');
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const opponentTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset when puzzle changes
  useEffect(() => {
    if (opponentTimeoutRef.current) {
      clearTimeout(opponentTimeoutRef.current);
    }
    const newChess = new Chess(puzzle.fen);
    setChess(newChess);
    setCurrentFen(puzzle.fen);
    setLastMove(null);
    setHintSquare(null);
    setStepIndex(0);
    setStatus('playing');
    setStatusMessage('');
    setHintTier(0);
    setMoveHistory([]);
    setFlipped(puzzle.sideToMove === 'b');
  }, [puzzle.id, puzzle.fen, solution]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  const resetPuzzle = () => {
    if (opponentTimeoutRef.current) {
      clearTimeout(opponentTimeoutRef.current);
    }
    const resetChess = new Chess(puzzle.fen);
    setChess(resetChess);
    setCurrentFen(puzzle.fen);
    setLastMove(null);
    setHintSquare(null);
    setStepIndex(0);
    setStatus('playing');
    setStatusMessage('');
    setHintTier(0);
    setMoveHistory([]);
  };

  // Handle a move made on the board
  const handleBoardMove = (moveEvt: MoveEvent) => {
    if (status === 'solved' || status === 'waiting_opponent') return;

    try {
      const copy = new Chess(currentFen);
      const moveResult = copy.move({
        from: moveEvt.from,
        to: moveEvt.to,
        promotion: moveEvt.promotion || 'q'
      });

      if (!moveResult) return;

      const san = moveResult.san;

      // Check against solution if available
      if (solution && solution.moves.length > 0) {
        const expectedMove = solution.moves[stepIndex];

        // Match SAN notation (or strip checks/captures if loose match needed)
        const isMatch =
          san === expectedMove ||
          san.replace(/[+#x]/g, '') === expectedMove.replace(/[+#x]/g, '') ||
          `${moveEvt.from}${moveEvt.to}` === expectedMove;

        if (isMatch) {
          // Correct move
          setChess(copy);
          setCurrentFen(copy.fen());
          setLastMove({ from: moveEvt.from, to: moveEvt.to });
          setHintSquare(null);

          if (moveResult.captured) {
            playCaptureSound();
          } else if (copy.inCheck()) {
            playCheckSound();
          } else {
            playMoveSound();
          }

          triggerHaptic('success');
          const newHistory = [...moveHistory, san];
          setMoveHistory(newHistory);

          const nextStep = stepIndex + 1;

          // Check if puzzle is fully solved
          if (nextStep >= solution.moves.length) {
            setStatus('solved');
            setStatusMessage('Excellent! Puzzle solved correctly.');
            playSolvedSound();
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 }
            });
            markPuzzleSolved(puzzle.id);
            return;
          }

          // Opponent has a canned response move
          const opponentMove = solution.moves[nextStep];
          setStepIndex(nextStep + 1);
          setStatus('waiting_opponent');
          setStatusMessage('Opponent responding...');

          opponentTimeoutRef.current = setTimeout(() => {
            try {
              const oppCopy = new Chess(copy.fen());
              const oppResult = oppCopy.move(opponentMove);
              if (oppResult) {
                setChess(oppCopy);
                setCurrentFen(oppCopy.fen());
                setLastMove({ from: oppResult.from as Square, to: oppResult.to as Square });
                setMoveHistory([...newHistory, oppResult.san]);

                if (oppResult.captured) {
                  playCaptureSound();
                } else if (oppCopy.inCheck()) {
                  playCheckSound();
                } else {
                  playMoveSound();
                }

                // Check if opponent move ended puzzle or awaiting next player move
                if (nextStep + 1 >= solution.moves.length) {
                  setStatus('solved');
                  setStatusMessage('Brilliant tactical solution!');
                  playSolvedSound();
                  confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { y: 0.7 }
                  });
                  markPuzzleSolved(puzzle.id);
                } else {
                  setStatus('playing');
                  setStatusMessage('Your turn: find the next move!');
                }
              }
            } catch (err) {
              console.error('Error playing opponent move:', err);
              setStatus('playing');
            }
          }, 450);
        } else {
          // Incorrect move
          playErrorSound();
          triggerHaptic('warning');
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 400);

          setStatus('wrong');
          setStatusMessage('Incorrect move. Try another approach!');
        }
      } else {
        // No solution recorded yet - allow free play
        setChess(copy);
        setCurrentFen(copy.fen());
        setLastMove({ from: moveEvt.from, to: moveEvt.to });
        setMoveHistory((prev) => [...prev, san]);
        playMoveSound();
      }
    } catch {
      // Illegal move rejected by chess.js
    }
  };

  // Provide progressive hints
  const handleRequestHint = () => {
    if (!solution || solution.moves.length === 0) {
      setStatusMessage('No solution is available for this puzzle yet.');
      return;
    }

    const nextTier = Math.min(hintTier + 1, 3);
    setHintTier(nextTier);

    const currentExpectedMove = solution.moves[stepIndex] || solution.moves[0];

    if (nextTier === 1) {
      setStatusMessage(`💡 Hint: ${solution.hints?.[0] || puzzle.categoryDescription}`);
    } else if (nextTier === 2) {
      // Find source square of expected move
      try {
        const dummyChess = new Chess(currentFen);
        const moves = dummyChess.moves({ verbose: true });
        const matching = moves.find(
          (m) => m.san === currentExpectedMove || m.san.replace(/[+#x]/g, '') === currentExpectedMove.replace(/[+#x]/g, '')
        );
        if (matching) {
          setHintSquare(matching.from as Square);
          setStatusMessage(`💡 Piece hint: Look at the piece on ${matching.from.toUpperCase()}`);
        } else {
          setStatusMessage(`💡 Hint: Look closely at your most active tactical piece.`);
        }
      } catch {
        setStatusMessage(`💡 Hint: Focus on ${puzzle.categoryEnglish}.`);
      }
    } else if (nextTier === 3) {
      setStatusMessage(`💡 Solution Move: Play ${currentExpectedMove}!`);
    }
  };

  const isWhiteTurn = puzzle.sideToMove === 'w';

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto px-3 sm:px-4 pb-20">
      {/* Turn Indicator and puzzle controls */}
      <div className="w-full flex items-center justify-between bg-slate-900/70 border border-slate-800/80 rounded-xl px-3.5 py-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-3.5 h-3.5 rounded-full border shadow-sm ${
              isWhiteTurn ? 'bg-white border-slate-400' : 'bg-slate-950 border-slate-600'
            }`}
          />
          <span className="text-xs font-semibold text-slate-200">
            {isWhiteTurn ? 'White to move' : 'Black to move'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onBookmarkToggle}
            title={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
              isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={toggleSound}
            title={soundOn ? 'Mute sound' : 'Unmute sound'}
            aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Flip Board button on White to move line */}
          <button
            onClick={() => setFlipped(!flipped)}
            title="Flip board orientation"
            aria-label="Flip board orientation"
            className="px-2 py-1 text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors min-h-[36px]"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Flip</span>
          </button>

          {/* Status indicator */}
          <div className="flex items-center gap-1 text-xs">
            {status === 'solved' || initialSolved ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solved
              </span>
            ) : solution && solution.moves.length > 0 ? (
              <span className="text-slate-400 font-medium">Practice</span>
            ) : (
              <span className="text-amber-400/90 font-medium text-[11px]">Pending</span>
            )}
          </div>
        </div>
      </div>

      {/* Chessboard Container with shake animation on error */}
      <div className={`w-full transition-transform duration-200 ${isShaking ? 'animate-shake' : ''}`}>
        <ChessBoard
          fen={currentFen}
          flipped={flipped}
          theme={theme}
          interactive={status !== 'waiting_opponent'}
          lastMove={lastMove}
          hintSquare={hintSquare}
          onMove={handleBoardMove}
        />
      </div>

      {/* Moves History & Feedback Strip */}
      <div className="w-full mt-3 bg-slate-900/80 border border-slate-800 rounded-xl p-3 min-h-[58px] flex flex-col justify-center">
        {statusMessage ? (
          <p
            className={`text-xs font-medium text-center ${
              status === 'solved'
                ? 'text-emerald-400'
                : status === 'wrong'
                ? 'text-rose-400'
                : status === 'waiting_opponent'
                ? 'text-amber-400 animate-pulse'
                : 'text-slate-200'
            }`}
          >
            {statusMessage}
          </p>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Find the winning Step 4 tactical combination</span>
            {moveHistory.length > 0 && (
              <span className="font-mono text-amber-300 font-semibold">{moveHistory.join(' ')}</span>
            )}
          </div>
        )}

        {/* Solved Explanation reveal */}
        {status === 'solved' && solution?.explanation && (
          <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 leading-relaxed">
            <span className="font-semibold text-emerald-400 mr-1">Tactical Key:</span>
            {solution.explanation}
          </div>
        )}
      </div>

      {/* Main Touch Action Bar (Thumb ergonomic zone) */}
      <div className="w-full grid grid-cols-5 gap-2 mt-3">
        {/* Previous Puzzle */}
        <button
          onClick={onPrevPuzzle}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all min-h-[48px]"
          title="Previous puzzle"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Prev</span>
        </button>

        {/* Reset / Restart */}
        <button
          onClick={resetPuzzle}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all min-h-[48px]"
          title="Reset position"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Reset</span>
        </button>

        {/* Hint button */}
        <button
          onClick={handleRequestHint}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 active:scale-95 transition-all min-h-[48px]"
          title="Get a hint"
        >
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] font-medium mt-0.5">Hint {hintTier > 0 ? `(${hintTier}/3)` : ''}</span>
        </button>

        {/* Random Puzzle */}
        <button
          onClick={onRandomPuzzle}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all min-h-[48px]"
          title="Random puzzle"
        >
          <Shuffle className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Random</span>
        </button>

        {/* Next Puzzle */}
        <button
          onClick={onNextPuzzle}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 active:scale-95 transition-all min-h-[48px] shadow-lg shadow-emerald-950/40"
          title="Next puzzle"
        >
          <ChevronRight className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Next</span>
        </button>
      </div>
    </div>
  );
};
