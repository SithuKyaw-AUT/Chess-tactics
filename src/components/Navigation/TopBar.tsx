import React, { useState } from 'react';
import { Smartphone, Monitor, Palette, Flame, Download, ChevronDown, Crown } from 'lucide-react';
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
    <header className="sticky top-0 z-30 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 pt-7 pb-3 sm:pt-6 sm:pb-3 shadow-md">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 min-h-9">
          <div className="flex items-center gap-2 min-w-0">
            <Crown className="w-6 h-6 shrink-0 text-amber-400" aria-hidden="true" />
            <span className="font-bold text-sm sm:text-base text-slate-100 whitespace-nowrap">
              Marama - Chess Tactics Trainer
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
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
                  {availableSteps.map((step) => (
                    <button
                      key={step}
                      onClick={() => {
                        onStepChange(step);
                        setShowStepMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        selectedStep === step ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {step}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-300 shrink-0">
              {streak > 0 && (
                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-mono tabular-nums">{streak}d</span>
                </div>
              )}
              <span className="font-mono text-slate-400 tabular-nums">
                {solvedCount}/{totalPuzzles}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 relative">
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium transition-colors min-h-[38px]"
              title="Install on iPhone / Android"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline text-[11px]">Install</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Change board theme"
              >
                <Palette className="w-4 h-4" />
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-2xl z-50">
                  <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 block">
                    Board Theme
                  </span>
                  {themes.map((boardTheme) => (
                    <button
                      key={boardTheme.id}
                      onClick={() => {
                        onThemeChange(boardTheme.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                        theme === boardTheme.id ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${boardTheme.preview}`} />
                      <span>{boardTheme.label}</span>
                    </button>
                  ))}

                </div>
              )}
            </div>

            <button
              onClick={onToggleDeviceView}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              title={deviceView === 'mobile' ? 'Switch to Fluid Desktop View' : 'Switch to Phone Frame View'}
            >
              {deviceView === 'mobile' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
