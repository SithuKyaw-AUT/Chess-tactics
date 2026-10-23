import React from 'react';

interface PieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  className?: string;
}

/**
 * Neo / Classic Chess Pieces matching the standard Chess.com tournament style
 * Clean, bold, high-contrast vector pieces with soft depth highlights
 */
export const ChessPiece: React.FC<PieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';

  // Palette matching the reference image:
  // White: Pure white (#ffffff) with soft cool-gray gradient/shadow (#e2e8f0 / #cbd5e1)
  // Black: Warm dark charcoal (#3b3936 / #302e2b) with subtle dark gray accents (#524e49)
  // Outlines: Crisp solid dark (#262421)
  const pieceColor = isWhite ? '#ffffff' : '#3a3835';
  const shadowColor = isWhite ? '#dce1e8' : '#282725';
  const highlightColor = isWhite ? '#f8fafc' : '#4d4a46';
  const outlineColor = '#262421';

  switch (type.toLowerCase()) {
    case 'p': // PAWN
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <g>
            {/* Base */}
            <path
              d="M 22 84 C 22 80, 26 77, 36 76 L 64 76 C 74 77, 78 80, 78 84 C 78 87, 73 89, 66 90 L 34 90 C 27 89, 22 87, 22 84 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Body */}
            <path
              d="M 33 76 C 36 60, 40 48, 43 42 C 41 42, 38 41, 38 39 C 38 37, 43 36, 50 36 C 57 36, 62 37, 62 39 C 62 41, 59 42, 57 42 C 60 48, 64 60, 67 76 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Subtle shadow arc on body */}
            <path
              d="M 37 73 C 44 75, 56 75, 63 73 C 60 62, 57 52, 54 44 C 52 44, 48 44, 46 44 C 43 52, 40 62, 37 73 Z"
              fill={shadowColor}
              opacity={isWhite ? "0.45" : "0.35"}
            />
            {/* Head */}
            <circle
              cx="50"
              cy="25"
              r="15"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
            />
            {/* Head highlight shine */}
            <path
              d="M 44 17 C 47 14, 53 14, 56 16 C 53 17, 47 18, 44 17 Z"
              fill={highlightColor}
              opacity={isWhite ? "0.9" : "0.4"}
            />
          </g>
        </svg>
      );

    case 'n': // KNIGHT
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <g>
            {/* Base */}
            <path
              d="M 23 85 C 23 81, 28 78, 38 77 L 62 77 C 72 78, 77 81, 77 85 C 77 88, 72 90, 64 91 L 36 91 C 28 90, 23 88, 23 85 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Knight Head & Mane Profile */}
            <path
              d="M 34 77 C 32 68, 31 58, 26 53 C 21 48, 22 41, 28 41 C 28 41, 31 43, 33 41 C 35 39, 32 32, 35 25 C 38 18, 46 13, 56 13 C 67 13, 76 18, 78 28 C 80 37, 78 47, 73 57 C 70 63, 68 70, 66 77 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Mane & Jaw contours */}
            <path
              d="M 64 22 C 60 27, 61 36, 68 40 C 65 47, 63 56, 65 67"
              fill="none"
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Snout & Chin */}
            <path
              d="M 26 41 C 24 45, 25 50, 31 52 C 37 54, 43 49, 44 45"
              fill="none"
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Eye */}
            <ellipse
              cx="45"
              cy="28"
              rx="3"
              ry="4"
              transform="rotate(-15 45 28)"
              fill={outlineColor}
            />
            {/* Nostril */}
            <circle cx="28" cy="45" r="1.5" fill={outlineColor} />
            {/* Ear */}
            <path
              d="M 52 13 L 56 21 L 48 19 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      );

    case 'b': // BISHOP
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <g>
            {/* Base */}
            <path
              d="M 24 85 C 24 81, 29 78, 38 77 L 62 77 C 71 78, 76 81, 76 85 C 76 88, 71 90, 64 91 L 36 91 C 29 90, 24 88, 24 85 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Mitre Body */}
            <path
              d="M 33 77 C 36 67, 39 56, 42 47 C 39 47, 36 45, 36 42 C 36 39, 41 38, 50 38 C 59 38, 64 39, 64 42 C 64 45, 61 47, 58 47 C 61 56, 64 67, 67 77 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Upper Oval Head */}
            <path
              d="M 34 38 C 31 31, 33 21, 41 16 C 45 13, 55 13, 59 16 C 67 21, 69 31, 66 38 C 62 43, 38 43, 34 38 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Finial / Cross on Top */}
            <circle
              cx="50"
              cy="11"
              r="3.5"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="3"
            />
            {/* Bishop Cleft / Cut */}
            <path
              d="M 46 20 C 44 26, 42 32, 49 35"
              fill="none"
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Subtle collar highlight */}
            <path
              d="M 40 40 L 60 40"
              stroke={outlineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 'r': // ROOK
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <g>
            {/* Base */}
            <path
              d="M 20 85 C 20 81, 26 78, 36 77 L 64 77 C 74 78, 80 81, 80 85 C 80 88, 74 91, 64 91 L 36 91 C 26 91, 20 88, 20 85 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Tower Wall */}
            <path
              d="M 32 77 L 35 41 L 65 41 L 68 77 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Tower Parapet with 3 Crenellations */}
            <path
              d="M 27 41 L 27 23 L 37 23 L 37 29 L 45 29 L 45 23 L 55 23 L 55 29 L 63 29 L 63 23 L 73 23 L 73 41 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Center Window / Slit */}
            <path
              d="M 50 49 L 50 63"
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Ledge rim line */}
            <path
              d="M 28 41 L 72 41"
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 'q': // QUEEN
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <g>
            {/* Base */}
            <path
              d="M 21 86 C 21 81, 27 78, 37 77 L 63 77 C 73 78, 79 81, 79 86 C 79 89, 73 92, 64 92 L 36 92 C 27 92, 21 89, 21 86 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Waist */}
            <path
              d="M 33 77 C 36 67, 39 57, 43 47 L 57 47 C 61 57, 64 67, 67 77 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Crown with 5 points */}
            <path
              d="M 25 32 L 32 47 L 68 47 L 75 32 L 63 41 L 50 25 L 37 41 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Crown pearls on points */}
            <circle cx="23" cy="30" r="3" fill={pieceColor} stroke={outlineColor} strokeWidth="3" />
            <circle cx="36" cy="22" r="3" fill={pieceColor} stroke={outlineColor} strokeWidth="3" />
            <circle cx="50" cy="18" r="3.5" fill={pieceColor} stroke={outlineColor} strokeWidth="3" />
            <circle cx="64" cy="22" r="3" fill={pieceColor} stroke={outlineColor} strokeWidth="3" />
            <circle cx="77" cy="30" r="3" fill={pieceColor} stroke={outlineColor} strokeWidth="3" />
            {/* Waist band */}
            <path
              d="M 36 47 L 64 47"
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 'k': // KING
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <g>
            {/* Base */}
            <path
              d="M 21 86 C 21 81, 27 78, 37 77 L 63 77 C 73 78, 79 81, 79 86 C 79 89, 73 92, 64 92 L 36 92 C 27 92, 21 89, 21 86 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Waist & Shoulders */}
            <path
              d="M 33 77 C 36 67, 39 56, 42 47 L 58 47 C 61 56, 64 67, 67 77 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* King Crown Dome */}
            <path
              d="M 28 47 C 23 37, 28 27, 38 24 C 44 22, 56 22, 62 24 C 72 27, 77 37, 72 47 Z"
              fill={pieceColor}
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* King Crown Cross */}
            <path
              d="M 50 10 L 50 22 M 44 14 L 56 14"
              stroke={outlineColor}
              strokeWidth="4"
              strokeLinecap="square"
            />
            {/* Inner Crown Cross/Folds */}
            <path
              d="M 40 31 C 46 36, 54 36, 60 31"
              fill="none"
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Collar Band */}
            <path
              d="M 35 47 L 65 47"
              stroke={outlineColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
