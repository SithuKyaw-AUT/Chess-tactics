import React from 'react';
import {
  ShieldAlert,
  Crosshair,
  ShieldBan,
  Target,
  ArrowDownToLine,
  Sliders,
  Crown,
  Zap,
  Magnet,
  Compass,
  Focus,
  Layers,
  DoorOpen,
  Flame,
  Swords,
  ChevronsRight,
  Sparkles,
  Scan,
  FastForward,
  Grid,
  Coins,
  ShieldCheck,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { Puzzle, CategorySummary } from '../../types/puzzle';

interface CategoryListProps {
  puzzles: Puzzle[];
  solvedIds: string[];
  onSelectCategory: (categoryDutch: string) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldAlert,
  Crosshair,
  ShieldBan,
  Target,
  ArrowDownToLine,
  Sliders,
  Crown,
  Zap,
  Magnet,
  Compass,
  Focus,
  Layers,
  DoorOpen,
  Flame,
  Swords,
  ChevronsRight,
  Sparkles,
  Scan,
  FastForward,
  Grid,
  Coins,
  ShieldCheck,
  HelpCircle
};

export const CategoryList: React.FC<CategoryListProps> = ({
  puzzles,
  solvedIds,
  onSelectCategory
}) => {
  // Aggregate categories
  const categories: CategorySummary[] = React.useMemo(() => {
    const map = new Map<string, CategorySummary>();

    puzzles.forEach((p) => {
      const existing = map.get(p.categoryDutch);
      const isSolved = solvedIds.includes(p.id);

      if (existing) {
        existing.totalPuzzles += 1;
        if (isSolved) existing.solvedCount += 1;
        const step = p.step || 'Step 4';
        if (!existing.steps.includes(step)) {
          existing.steps.push(step);
        }
        if (!existing.pages.includes(p.page)) {
          existing.pages.push(p.page);
        }
      } else {
        map.set(p.categoryDutch, {
          dutch: p.categoryDutch,
          english: p.categoryEnglish,
          description: p.categoryDescription,
          icon: p.categoryIcon,
          steps: [p.step || 'Step 4'],
          pages: [p.page],
          totalPuzzles: 1,
          solvedCount: isSolved ? 1 : 0
        });
      }
    });

    return Array.from(map.values());
  }, [puzzles, solvedIds]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-24">
      {/* Category List */}
      <div className="space-y-2.5">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || HelpCircle;
          const percent = Math.round((cat.solvedCount / cat.totalPuzzles) * 100);
          const isComplete = cat.solvedCount === cat.totalPuzzles && cat.totalPuzzles > 0;

          return (
            <button
              key={cat.dutch}
              onClick={() => onSelectCategory(cat.dutch)}
              className="w-full text-left bg-slate-900/80 hover:bg-slate-800/90 active:scale-[0.99] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-150 flex items-center justify-between gap-3 group min-h-[64px]"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isComplete
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-teal-400 border border-slate-700'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-400 mb-0.5">
                    {cat.steps.join(', ')}
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-teal-400 transition-colors truncate">
                    {cat.dutch}
                  </h3>

                  {/* Progress bar */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isComplete ? 'bg-emerald-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
                      {cat.solvedCount}/{cat.totalPuzzles}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
