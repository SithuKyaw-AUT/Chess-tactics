/**
 * Chess Tactics Trainer App
 * Interactive chess puzzle trainer for Chess Step exercises (Step 1-6 & Custom)
 */
import React, { useState, useMemo, useCallback } from 'react';
import { PUZZLES_DATA } from './data/puzzlesData';
import { Puzzle, PuzzleSolution, AppTab, BoardTheme, DeviceView } from './types/puzzle';
import {
  loadSolutions,
  loadUserProgress,
  loadBoardTheme,
  saveBoardTheme,
  loadDeviceView,
  saveDeviceView,
  toggleBookmark,
  loadStepFilter,
  saveStepFilter,
  loadCustomPuzzles
} from './utils/storage';
import { TopBar } from './components/Navigation/TopBar';
import { BottomTabBar } from './components/Navigation/BottomTabBar';
import { PuzzlePlayer } from './components/PuzzlePlayer/PuzzlePlayer';
import { CategoryList } from './components/CategoryList/CategoryList';
import { FavoritesList } from './components/FavoritesList/FavoritesList';
import { PWAInstallModal } from './components/Navigation/PWAInstallModal';

export default function App() {
  // Puzzles state (Built-in + Custom added)
  const [customPuzzles] = useState<Puzzle[]>(() => loadCustomPuzzles());
  const allPuzzles = useMemo(() => {
    return [...PUZZLES_DATA, ...customPuzzles];
  }, [customPuzzles]);

  const [solutions] = useState<Record<string, PuzzleSolution>>(() => loadSolutions());
  const [progress, setProgress] = useState(() => loadUserProgress());
  const [activeTab, setActiveTab] = useState<AppTab>('puzzles');
  const [activePuzzleId, setActivePuzzleId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<string>(() => loadStepFilter());
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  // Settings
  const [theme, setTheme] = useState<BoardTheme>(() => loadBoardTheme());
  const [deviceView, setDeviceView] = useState<DeviceView>(() => loadDeviceView());

  // Available steps list
  const availableSteps = useMemo(() => {
    const set = new Set<string>();
    allPuzzles.forEach((p) => {
      set.add(p.step || 'Step 4');
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [allPuzzles]);

  const orderedPuzzles = useMemo(() => {
    const stepOrder = new Map(availableSteps.map((step, index) => [step, index]));
    return [...allPuzzles].sort((a, b) =>
      (stepOrder.get(a.step || 'Step 4') ?? Number.MAX_SAFE_INTEGER) -
      (stepOrder.get(b.step || 'Step 4') ?? Number.MAX_SAFE_INTEGER)
    );
  }, [allPuzzles, availableSteps]);

  // Step-filtered puzzles for practice & browsing
  const stepFilteredPuzzles = useMemo(() => {
    if (selectedStep === 'All') return orderedPuzzles;
    return orderedPuzzles.filter((p) => (p.step || 'Step 4') === selectedStep);
  }, [orderedPuzzles, selectedStep]);

  // Current active puzzle
  const currentPuzzle = useMemo(() => {
    return orderedPuzzles.find((p) => p.id === activePuzzleId) || stepFilteredPuzzles[0] || orderedPuzzles[0];
  }, [orderedPuzzles, stepFilteredPuzzles, activePuzzleId]);

  const currentSolution = solutions[currentPuzzle.id];

  // Sync progress changes
  const refreshProgress = useCallback(() => {
    setProgress(loadUserProgress());
  }, []);

  // Theme changer
  const handleThemeChange = (newTheme: BoardTheme) => {
    setTheme(newTheme);
    saveBoardTheme(newTheme);
  };

  // Device view toggle
  const handleToggleDeviceView = () => {
    const next = deviceView === 'mobile' ? 'fluid' : 'mobile';
    setDeviceView(next);
    saveDeviceView(next);
  };

  // Step filter change
  const handleStepChange = (step: string) => {
    setSelectedStep(step);
    saveStepFilter(step);
    setCategoryFilter(null);
    const pool = step === 'All' ? orderedPuzzles : orderedPuzzles.filter((p) => (p.step || 'Step 4') === step);
    if (pool.length > 0) {
      setActivePuzzleId(pool[0].id);
    }
  };

  // Navigation handlers
  const handleNextPuzzle = () => {
    const activePool = categoryFilter
      ? stepFilteredPuzzles.filter((p) => p.categoryDutch === categoryFilter)
      : stepFilteredPuzzles;

    if (activePool.length === 0) return;
    const curIdx = activePool.findIndex((p) => p.id === currentPuzzle.id);
    const nextIdx = (curIdx + 1) % activePool.length;
    setActivePuzzleId(activePool[nextIdx].id);
    refreshProgress();
  };

  const handlePrevPuzzle = () => {
    const activePool = categoryFilter
      ? stepFilteredPuzzles.filter((p) => p.categoryDutch === categoryFilter)
      : stepFilteredPuzzles;

    if (activePool.length === 0) return;
    const curIdx = activePool.findIndex((p) => p.id === currentPuzzle.id);
    const prevIdx = (curIdx - 1 + activePool.length) % activePool.length;
    setActivePuzzleId(activePool[prevIdx].id);
    refreshProgress();
  };

  const handleRandomPuzzle = () => {
    const pool = categoryFilter
      ? stepFilteredPuzzles.filter((p) => p.categoryDutch === categoryFilter)
      : stepFilteredPuzzles;

    if (pool.length === 0) return;
    const unsolved = pool.filter((p) => !progress.solvedIds.includes(p.id));
    const targetPool = unsolved.length > 0 ? unsolved : pool;
    const randomItem = targetPool[Math.floor(Math.random() * targetPool.length)];
    setActivePuzzleId(randomItem.id);
    refreshProgress();
  };

  const handleSelectCategory = (catDutch: string) => {
    setCategoryFilter(catDutch);
    const firstInCat = stepFilteredPuzzles.find((p) => p.categoryDutch === catDutch);
    if (firstInCat) {
      setActivePuzzleId(firstInCat.id);
    }
    setActiveTab('puzzles');
  };

  const handleSelectPuzzle = (puzzle: Puzzle) => {
    setActivePuzzleId(puzzle.id);
    setActiveTab('puzzles');
  };

  const handleBookmarkToggle = () => {
    toggleBookmark(currentPuzzle.id);
    refreshProgress();
  };

  const isCurrentBookmarked = progress.bookmarkedIds.includes(currentPuzzle.id);
  const isCurrentSolved = progress.solvedIds.includes(currentPuzzle.id);

  // Content for current tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'puzzles':
        return (
          <PuzzlePlayer
            puzzle={currentPuzzle}
            solution={currentSolution}
            theme={theme}
            isBookmarked={isCurrentBookmarked}
            isSolved={isCurrentSolved}
            onBookmarkToggle={handleBookmarkToggle}
            onNextPuzzle={handleNextPuzzle}
            onPrevPuzzle={handlePrevPuzzle}
            onRandomPuzzle={handleRandomPuzzle}
          />
        );

      case 'categories':
        return (
          <CategoryList
            puzzles={stepFilteredPuzzles}
            solvedIds={progress.solvedIds}
            onSelectCategory={handleSelectCategory}
          />
        );

      case 'favorites':
        return (
          <FavoritesList
            puzzles={allPuzzles}
            bookmarkedIds={progress.bookmarkedIds}
            solvedIds={progress.solvedIds}
            onSelectPuzzle={handleSelectPuzzle}
            onRemoveBookmark={(id) => {
              toggleBookmark(id);
              refreshProgress();
            }}
          />
        );

      default:
        return null;
    }
  };

  const isMobileFrame = deviceView === 'mobile';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start">
      {/* Outer Shell for Phone Frame Simulation or Fluid View */}
      <div
        className={`w-full flex-1 flex flex-col transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[430px] my-0 sm:my-6 sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden bg-slate-950 relative min-h-[92vh]'
            : 'max-w-4xl'
        }`}
      >
        {/* Simulated iOS Dynamic Island / Speaker cutout on frame view */}
        {isMobileFrame && (
          <div className="hidden sm:flex justify-center pt-3 pb-1 bg-slate-950 select-none z-50">
            <div className="w-24 h-4 bg-slate-900 rounded-full border border-slate-800/80 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>
          </div>
        )}

        {/* Top App Bar */}
        <TopBar
          deviceView={deviceView}
          onToggleDeviceView={handleToggleDeviceView}
          theme={theme}
          onThemeChange={handleThemeChange}
          solvedCount={progress.solvedIds.length}
          totalPuzzles={stepFilteredPuzzles.length}
          streak={progress.currentStreak}
          selectedStep={selectedStep}
          onStepChange={handleStepChange}
          availableSteps={availableSteps}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />

        {/* Category Active Filter Banner (if filtering by category in Puzzles tab) */}
        {activeTab === 'puzzles' && categoryFilter && (
          <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs">
            <span className="text-amber-300 font-medium truncate">
              Practicing: <strong>{categoryFilter}</strong>
            </span>
            <button
              onClick={() => setCategoryFilter(null)}
              className="text-amber-400 font-semibold hover:underline text-[11px] shrink-0 ml-2"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Main Tab View */}
        <main className="flex-1 w-full pt-3">{renderTabContent()}</main>

        {/* Fixed Mobile Bottom Tab Bar */}
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          favoritesCount={progress.bookmarkedIds.length}
        />
      </div>

      {/* PWA / iOS Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
