import React from 'react';
import { 
  Menu, Sun, Moon, Sparkles, Activity, ShieldCheck, 
  ExternalLink, Bell, RefreshCw, Wifi, WifiOff
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header({ 
  onMenuClick, 
  connectionStatus = 'connecting', // 'connected' | 'disconnected' | 'connecting'
  healthStatus, 
  activePageTitle,
  selectedModel,
  onModelChange,
  onRetryConnection
}) {
  const { theme, toggleTheme } = useTheme();

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          text: 'Connected',
          dotClass: 'bg-emerald-400 animate-pulse',
          bgClass: theme === 'dark' ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700',
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'disconnected':
        return {
          text: 'Disconnected',
          dotClass: 'bg-rose-500',
          bgClass: theme === 'dark' ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700',
          icon: <WifiOff className="w-3.5 h-3.5 text-rose-400" />
        };
      case 'connecting':
      default:
        return {
          text: 'Connecting',
          dotClass: 'bg-amber-400 animate-ping',
          bgClass: theme === 'dark' ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700',
          icon: <Activity className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <header className={`h-20 sticky top-0 z-30 flex items-center justify-between px-6 border-b transition-colors ${
      theme === 'dark' 
        ? 'bg-slate-950/90 border-slate-800 backdrop-blur-md text-white' 
        : 'bg-white/90 border-slate-200 backdrop-blur-md text-slate-800'
    }`} role="banner">
      {/* Left: Mobile menu toggle & page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className={`p-2 rounded-xl lg:hidden border ${
            theme === 'dark' 
              ? 'border-slate-800 hover:bg-slate-900 text-slate-200' 
              : 'border-slate-200 hover:bg-slate-100 text-slate-700'
          }`}
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            {activePageTitle}
          </h1>
          <span className="text-xs text-slate-400 hidden sm:inline-block">
            AccessCheck AI Enterprise Intelligence
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Backend Connection Indicator */}
        <div className="flex items-center gap-2">
          <div 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${statusBadge.bgClass}`}
            role="status"
            aria-live="polite"
          >
            <span className={`w-2 h-2 rounded-full ${statusBadge.dotClass}`} aria-hidden="true" />
            <span className="hidden sm:inline">{statusBadge.icon}</span>
            <span>{statusBadge.text}</span>
          </div>

          {connectionStatus === 'disconnected' && onRetryConnection && (
            <button
              onClick={onRetryConnection}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                theme === 'dark'
                  ? 'border-rose-800/80 bg-rose-950/50 hover:bg-rose-900/60 text-rose-200'
                  : 'border-rose-300 bg-rose-100 hover:bg-rose-200 text-rose-800'
              }`}
              title="Attempt to reconnect to FastAPI backend"
              aria-label="Retry connection to backend"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>

        {/* AI Model selector with accessible aria-label */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-300'
            : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}>
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            aria-label="Select Google Gemini Model"
            className="bg-transparent border-none text-xs focus:outline-none cursor-pointer pr-1 text-slate-200"
          >
            <option value="gemma-4-26b-a4b-it" className="bg-slate-900 text-slate-200">Gemma 4 (26B)</option>
            <option value="gemini-2.5-flash" className="bg-slate-900 text-slate-200">Gemini 2.5 Flash</option>
            <option value="gemini-1.5-pro" className="bg-slate-900 text-slate-200">Gemini 1.5 Pro</option>
          </select>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border transition-all ${
            theme === 'dark'
              ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-amber-300'
              : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
