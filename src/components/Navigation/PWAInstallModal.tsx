import React from 'react';
import { Share, PlusSquare, Smartphone, X, Check, ArrowDown, Download } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold">Install on iPhone / Android</h3>
            <p className="text-xs text-slate-400">Use this app offline & full-screen on your phone</p>
          </div>
        </div>

        {/* If Chromium direct install button is ready */}
        {isInstallable && (
          <div className="mb-5 p-3.5 bg-teal-500/15 border border-teal-500/30 rounded-2xl">
            <p className="text-xs text-teal-300 font-medium mb-2.5">
              Instant 1-Click Install is available for your browser:
            </p>
            <button
              onClick={async () => {
                await install();
                onClose();
              }}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg min-h-[44px]"
            >
              <Download className="w-4 h-4" /> Install App to Device
            </button>
          </div>
        )}

        {/* iOS Step-by-Step Guide */}
        <div className="space-y-3.5">
          <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
            {isIOS ? 'iPhone & iPad (iOS Safari)' : 'Instructions for iOS (Safari)'}
          </div>

          {/* Step 1 */}
          <div className="flex items-start gap-3 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
              1
            </div>
            <div className="text-xs text-slate-300">
              Open this app URL in <strong className="text-white">Safari</strong> on your iPhone or iPad.
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
              2
            </div>
            <div className="text-xs text-slate-300">
              Tap the <strong className="text-white">Share</strong> button{' '}
              <Share className="w-3.5 h-3.5 inline mx-1 text-teal-400" /> in Safari's bottom toolbar.
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
              3
            </div>
            <div className="text-xs text-slate-300">
              Scroll down and tap <strong className="text-white">Add to Home Screen</strong>{' '}
              <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />.
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0 font-mono">
              4
            </div>
            <div className="text-xs text-slate-300">
              Tap <strong className="text-white">Add</strong> in the top right. The app will appear on your iPhone home screen with the app icon and run full-screen!
            </div>
          </div>
        </div>

        {/* Android alternative note */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">On Android (Chrome): </span>
          Tap the three dots (⋮) in the top right corner and tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors min-h-[44px]"
        >
          Got It
        </button>
      </div>
    </div>
  );
};
