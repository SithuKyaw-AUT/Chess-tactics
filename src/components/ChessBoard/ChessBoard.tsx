import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPieces';
import { BoardTheme } from '../../types/puzzle';

export interface MoveEvent {
  from: Square;
  to: Square;
  promotion?: 'q' | 'r' | 'b' | 'n';
}

interface ChessBoardProps {
  fen: string;
  flipped?: boolean;
  theme?: BoardTheme;
  interactive?: boolean;
  lastMove?: { from: Square; to: Square } | null;
  hintSquare?: Square | null;
  onMove?: (move: MoveEvent) => boolean | void;
  className?: string;
}

const THEME_COLORS: Record<BoardTheme, { light: string; dark: string; lightBorder?: string }> = {
  tournament: {
    light: 'bg-[#ebecd0] text-[#779556]',
    dark: 'bg-[#779556] text-[#ebecd0]'
  },
  wood: {
    light: 'bg-[#f0d9b5] text-[#b58863]',
    dark: 'bg-[#b58863] text-[#f0d9b5]'
  },
  slate: {
    light: 'bg-[#e2e8f0] text-[#475569]',
    dark: 'bg-[#475569] text-[#e2e8f0]'
  },
  classic: {
    light: 'bg-[#eae9d2] text-[#4b7399]',
    dark: 'bg-[#4b7399] text-[#eae9d2]'
  }
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  flipped = false,
  theme = 'tournament',
  interactive = true,
  lastMove = null,
  hintSquare = null,
  onMove,
  className = ''
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Set<Square>>(new Set());
  const [captureTargets, setCaptureTargets] = useState<Set<Square>>(new Set());
  const [inCheckSquare, setInCheckSquare] = useState<Square | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Compute chess instance state from fen
  const chessInstance = React.useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  // Check if king is in check
  useEffect(() => {
    if (chessInstance.inCheck()) {
      const turn = chessInstance.turn();
      const board = chessInstance.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.type === 'k' && piece.color === turn) {
            const file = FILES[c];
            const rank = (8 - r).toString();
            setInCheckSquare(`${file}${rank}` as Square);
            return;
          }
        }
      }
    } else {
      setInCheckSquare(null);
    }
  }, [chessInstance, fen]);

  // Reset selection on FEN change
  useEffect(() => {
    setSelectedSquare(null);
    setLegalTargets(new Set());
    setCaptureTargets(new Set());
  }, [fen]);

  const calculateMovesForSquare = useCallback(
    (sq: Square) => {
      const moves = chessInstance.moves({ square: sq, verbose: true });
      const targets = new Set<Square>();
      const captures = new Set<Square>();

      moves.forEach((m) => {
        targets.add(m.to as Square);
        if (m.captured) {
          captures.add(m.to as Square);
        }
      });

      setLegalTargets(targets);
      setCaptureTargets(captures);
    },
    [chessInstance]
  );

  const handleSquareClick = (sq: Square) => {
    if (!interactive) return;

    const piece = chessInstance.get(sq);

    // If already selected the same square, deselect
    if (selectedSquare === sq) {
      setSelectedSquare(null);
      setLegalTargets(new Set());
      setCaptureTargets(new Set());
      return;
    }

    // If square is an allowed move destination from selectedSquare
    if (selectedSquare && legalTargets.has(sq)) {
      const movingPiece = chessInstance.get(selectedSquare);
      // Auto-promote to queen in puzzles unless specialized
      const isPromotion =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && sq.endsWith('8')) || (movingPiece.color === 'b' && sq.endsWith('1')));

      const moveObj: MoveEvent = {
        from: selectedSquare,
        to: sq,
        promotion: isPromotion ? 'q' : undefined
      };

      if (onMove) {
        onMove(moveObj);
      }

      setSelectedSquare(null);
      setLegalTargets(new Set());
      setCaptureTargets(new Set());
      return;
    }

    // Otherwise, check if clicking on own piece to select
    if (piece && piece.color === chessInstance.turn()) {
      setSelectedSquare(sq);
      calculateMovesForSquare(sq);
    } else {
      setSelectedSquare(null);
      setLegalTargets(new Set());
      setCaptureTargets(new Set());
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, sq: Square) => {
    if (!interactive) return;
    const piece = chessInstance.get(sq);
    if (!piece || piece.color !== chessInstance.turn()) {
      e.preventDefault();
      return;
    }
    setDraggedSquare(sq);
    setSelectedSquare(sq);
    calculateMovesForSquare(sq);
    e.dataTransfer.setData('text/plain', sq);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSq: Square) => {
    e.preventDefault();
    if (!draggedSquare) return;

    if (legalTargets.has(targetSq) && onMove) {
      const movingPiece = chessInstance.get(draggedSquare);
      const isPromotion =
        movingPiece?.type === 'p' &&
        ((movingPiece.color === 'w' && targetSq.endsWith('8')) ||
          (movingPiece.color === 'b' && targetSq.endsWith('1')));

      onMove({
        from: draggedSquare,
        to: targetSq,
        promotion: isPromotion ? 'q' : undefined
      });
    }

    setDraggedSquare(null);
    setSelectedSquare(null);
    setLegalTargets(new Set());
    setCaptureTargets(new Set());
  };

  const ranksDisplay = flipped ? [...RANKS].reverse() : RANKS;
  const filesDisplay = flipped ? [...FILES].reverse() : FILES;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Board Container */}
      <div
        ref={boardRef}
        className="w-full max-w-[min(90vw,440px)] aspect-square rounded-xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900 touch-manipulation relative"
      >
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {ranksDisplay.map((rank, rankIdx) =>
            filesDisplay.map((file, fileIdx) => {
              const sq = `${file}${rank}` as Square;
              const isLight = (fileIdx + rankIdx) % 2 === 0;
              const isSelected = selectedSquare === sq;
              const isLegal = legalTargets.has(sq);
              const isCapture = captureTargets.has(sq);
              const isLastMove = lastMove?.from === sq || lastMove?.to === sq;
              const isInCheck = inCheckSquare === sq;
              const isHint = hintSquare === sq;

              const piece = chessInstance.get(sq);

              // Coordinates display flags
              const showFileLabel = rankIdx === 7;
              const showRankLabel = fileIdx === 0;

              return (
                <div
                  key={sq}
                  onClick={() => handleSquareClick(sq)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, sq)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                    isLight ? THEME_COLORS[theme].light : THEME_COLORS[theme].dark
                  }`}
                  data-square={sq}
                >
                  {/* Last Move Highlight */}
                  {isLastMove && <div className="absolute inset-0 bg-teal-400/35 pointer-events-none" />}

                  {/* Selected Square Highlight */}
                  {isSelected && <div className="absolute inset-0 bg-teal-300/40 ring-2 ring-teal-400 inset-0 pointer-events-none z-10" />}

                  {/* King in Check Highlight */}
                  {isInCheck && (
                    <div className="absolute inset-0 bg-red-600/50 animate-pulse ring-2 ring-red-500 pointer-events-none z-10" />
                  )}

                  {/* Hint Highlight */}
                  {isHint && (
                    <div className="absolute inset-0 ring-4 ring-teal-400 ring-offset-1 animate-ping pointer-events-none z-15 opacity-75" />
                  )}

                  {/* Piece */}
                  {piece && (
                    <div
                      draggable={interactive && piece.color === chessInstance.turn()}
                      onDragStart={(e) => handleDragStart(e, sq)}
                      className={`w-[84%] h-[84%] z-20 flex items-center justify-center active:scale-95 transition-transform ${
                        piece.color === chessInstance.turn() && interactive ? 'cursor-grab active:cursor-grabbing' : ''
                      }`}
                    >
                      <ChessPiece
                        type={piece.type as PieceSymbol}
                        color={piece.color as Color}
                      />
                    </div>
                  )}

                  {/* Move Target Indicator Dot (Empty Square) */}
                  {isLegal && !isCapture && !piece && (
                    <div className="absolute w-3.5 h-3.5 rounded-full bg-slate-900/25 dark:bg-emerald-400/50 pointer-events-none z-30" />
                  )}

                  {/* Move Target Indicator Ring (Capture Square) */}
                  {isLegal && (isCapture || piece) && (
                    <div className="absolute inset-1 rounded-full border-4 border-slate-900/30 dark:border-rose-500/60 pointer-events-none z-30" />
                  )}

                  {/* Rank Coordinate (Left edge) */}
                  {showRankLabel && (
                    <span
                      className={`absolute top-0.5 left-1 text-[10px] font-bold leading-none pointer-events-none opacity-60 ${
                        isLight ? 'text-slate-800' : 'text-slate-200'
                      }`}
                    >
                      {rank}
                    </span>
                  )}

                  {/* File Coordinate (Bottom edge) */}
                  {showFileLabel && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[10px] font-bold leading-none pointer-events-none opacity-60 ${
                        isLight ? 'text-slate-800' : 'text-slate-200'
                      }`}
                    >
                      {file}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
