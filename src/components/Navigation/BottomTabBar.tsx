import React from 'react';
import { Swords, LayoutGrid, Bookmark } from 'lucide-react';
import { AppTab } from '../../types/puzzle';

interface BottomTabBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  favoritesCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  favoritesCount
}) => {
  const tabs = [
    { id: 'puzzles' as AppTab, label: 'Puzzles', icon: Swords },
    { id: 'categories' as AppTab, label: 'Categories', icon: LayoutGrid },
    { id: 'favorites' as AppTab, label: 'Favorites', icon: Bookmark, badge: favoritesCount > 0 ? favoritesCount : null }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 max-w-xl mx-auto">
      <div className="grid grid-cols-3 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center h-full min-h-[48px] transition-colors ${
                isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-teal-500 text-slate-950 font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
