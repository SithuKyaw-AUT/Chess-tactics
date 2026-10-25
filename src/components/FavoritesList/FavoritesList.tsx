import React from 'react';
import { Bookmark, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { Puzzle } from '../../types/puzzle';

interface FavoritesListProps {
  puzzles: Puzzle[];
  bookmarkedIds: string[];
  solvedIds: string[];
  onSelectPuzzle: (puzzle: Puzzle) => void;
  onRemoveBookmark: (puzzleId: string) => void;
}

export const FavoritesList: React.FC<FavoritesListProps> = ({
  puzzles,
  bookmarkedIds,
  solvedIds,
  onSelectPuzzle,
  onRemoveBookmark
}) => {
  const favoritePuzzles = React.useMemo(() => {
    return puzzles.filter((p) => bookmarkedIds.includes(p.id));
  }, [puzzles, bookmarkedIds]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-24">
      {/* Header */}
      <div className="py-4">
        <h1 className="text-xl font-bold text-slate-100">Saved Favorites</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review and practice your bookmarked Step 4 tactical exercises ({favoritePuzzles.length})
        </p>
      </div>

      {favoritePuzzles.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
          <Bookmark className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No bookmarked puzzles yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            While solving puzzles, tap the bookmark icon in the top header to save challenging positions here for review.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {favoritePuzzles.map((p) => {
            const isSolved = solvedIds.includes(p.id);

            return (
              <div
                key={p.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div
                  onClick={() => onSelectPuzzle(p)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                    <span className="font-semibold text-teal-400">Page {p.page} · #{p.diagram}</span>
                    <span aria-hidden="true">·</span>
                    <span>{p.sideToMove === 'w' ? 'White' : 'Black'} to move</span>
                    {isSolved && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Solved
                        </span>
                      </>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 truncate">{p.categoryDutch}</h4>
                  <p className="text-xs text-slate-400 truncate">{p.categoryEnglish}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onRemoveBookmark(p.id)}
                    title="Remove from favorites"
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                  >
                    <Bookmark className="w-4 h-4 fill-teal-400 text-teal-400" />
                  </button>

                  <button
                    onClick={() => onSelectPuzzle(p)}
                    className="p-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                    title="Play puzzle"
                  >
                    <Play className="w-4 h-4 fill-teal-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
