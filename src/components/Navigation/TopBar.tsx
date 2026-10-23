import React, { useState } from 'react';
import { Smartphone, Monitor, Palette, Flame, Download, ChevronDown } from 'lucide-react';
import { BoardTheme, DeviceView } from '../../types/puzzle';

interface TopBarProps {
  deviceView: DeviceView;
  onToggleDeviceView: () => void;
  theme: BoardTheme;
  onThemeChange: (theme: BoardTheme) => void;
  solvedCount: number;
  totalPuzzles: number;
  streak: number;
  selectedStep: string;
  onStepChange: (step: string) => void;
  availableSteps: string[];
  onOpenInstallModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  deviceView,
  onToggleDeviceView,
  theme,
  onThemeChange,
  solvedCount,
  totalPuzzles,
  streak,
  selectedStep,
  onStepChange,
  availableSteps,
  onOpenInstallModal
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showStepMenu, setShowStepMenu] = useState(false);

  const themes: { id: BoardTheme; label: string; preview: string }[] = [
    { id: 'tournament', label: 'Tournament Green', preview: 'bg-[#779556]' },
    { id: 'wood', label: 'Classic Wood', preview: 'bg-[#b58863]' },
    { id: 'slate', label: 'Modern Slate', preview: 'bg-[#475569]' },
    { id: 'classic', label: 'Classic Blue', preview: 'bg-[#4b7399]' }
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 pt-5 pb-3 sm:pt-4 sm:pb-3 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Wordmark & Step Selector Dropdown */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <button
              onClick={() => setShowStepMenu(!showStepMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white transition-colors min-h-[38px]"
              title="Switch Step level"
            >
              <span className="text-amber-400 font-extrabold">{selectedStep === 'All' ? 'All Steps' : selectedStep}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showStepMenu && (
              <div className="absolute left-0 mt-1 w-36 bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-2xl z-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 block">
                  Select Step
                </span>
                <button
                  onClick={() => {
                    onStepChange('All');
                    setShowStepMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedStep === 'All' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  All Steps
                </button>
                {availableSteps.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onStepChange(s);
                      setShowStepMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedStep === s ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="hidden sm:inline font-bold text-xs tracking-tight text-slate-300 whitespace-nowrap">
            Tactics Trainer
          </span>
        </div>

        {/* Zone 2: Streak & Stats */}
        <div className="flex items-center gap-2 text-xs text-slate-300 shrink-0">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-amber-400 font-semibold text-xs">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-mono tabular-nums">{streak}d</span>
            </div>
          )}

          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {solvedCount}/{totalPuzzles}
          </span>
        </div>

        {/* Zone 3: Actions (Install App, Theme selector, Device Frame Toggle) */}
        <div className="flex items-center gap-1 shrink-0 relative">
          {/* Install on Mobile (iOS / Android) button */}
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors min-h-[38px]"
            title="Install on iPhone / Android"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline text-[11px]">Install</span>
          </button>

          {/* Theme Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Change board theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 block">
                  Board Theme
                </span>
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onThemeChange(t.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                      theme === t.id ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${t.preview}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Device View Frame Toggle (Phone Frame vs Fluid Responsive) */}
          <button
            onClick={onToggleDeviceView}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
            title={deviceView === 'mobile' ? 'Switch to Fluid Desktop View' : 'Switch to Phone Frame View'}
          >
            {deviceView === 'mobile' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
