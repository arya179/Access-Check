import React from 'react';
import { 
  LayoutDashboard, ScanSearch, CheckCircle2, Bot, BarChart3, 
  History, BookOpen, FileSpreadsheet, Settings, Info,
  ShieldCheck, ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ activePage, setActivePage, isMobileOpen, setIsMobileOpen }) {
  const { theme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-scan', label: 'Website Scanner', icon: ScanSearch },
    { id: 'results', label: 'Scan Results', icon: CheckCircle2 },
    { id: 'ai-assistant', label: 'AI Fix Assistant', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'Scan History', icon: History },
    { id: 'wcag', label: 'WCAG Learning Center', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        ${theme === 'dark' 
          ? 'bg-slate-950 border-r border-slate-800/80 text-slate-200' 
          : 'bg-white border-r border-slate-200 text-slate-700 shadow-lg'}
        flex flex-col
      `}>
        {/* Brand header */}
        <div className="h-20 flex items-center px-6 gap-3.5 border-b border-inherit">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-300 bg-clip-text text-transparent">
                AccessCheck
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Enterprise Accessibility Suite</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Platform Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsMobileOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 ring-1 ring-white/10' 
                    : theme === 'dark'
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-white/70" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Footer Badge */}
        <div className="p-4 border-t border-inherit">
          <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            theme === 'dark' 
              ? 'bg-slate-900/60 border-slate-800 text-slate-400' 
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div>
              <span className="font-semibold block text-slate-200">Axe-core v4.10 + Playwright</span>
              <span className="text-[11px]">WCAG 2.1 Level AA Ready</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
}

