import React from 'react';

interface PieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  className?: string;
}

export const ChessPiece: React.FC<PieceProps> = ({ type, color, className = 'w-full h-full' }) => (
  <img
    src={`/assets/pieces/cburnett/${color}${type.toUpperCase()}.svg`}
    alt=""
    draggable={false}
    className={`object-contain drop-shadow-sm ${className}`}
  />
);
