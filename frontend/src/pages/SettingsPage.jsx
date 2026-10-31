import React, { useState } from 'react';
import { 
  Settings, Key, Database, Globe, Moon, Sun, 
  ShieldAlert, Sparkles, Check, RefreshCw 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage({ 
  selectedModel, 
  setSelectedModel, 
  healthStatus 
}) {
  const { theme, toggleTheme } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Configuration</h2>
        <p className="text-sm text-slate-400 mt-1">
          Manage AI model endpoints, Google GenAI credentials, themes, and persistence layers.
        </p>
      </div>

      <div className="space-y-6">
        {/* AI & Model Settings */}
        <div className={`p-6 rounded-3xl border ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">Google Gemma 4 AI Engine</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Active AI Model
              </label>
              <div className={`w-full rounded-2xl px-4 py-3 text-xs border font-medium ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}>
                gemma-4-26b-a4b-it (Google Gemma 4 Challenge Model)
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Configured as single source of truth via <code className="font-mono text-indigo-400">GEMMA_MODEL</code> on the backend.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Google GenAI API Authentication
              </label>
              <p className="text-[11px] text-slate-400">
                Managed securely on the backend via <code className="font-mono text-indigo-400">GEMINI_API_KEY</code>. Client-side key exposure is completely prevented.
              </p>
            </div>
          </div>
        </div>

        {/* System & Architecture Status */}
        <div className={`p-6 rounded-3xl border ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">System Status & Environment</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">FastAPI Server</span>
              <span className="font-semibold text-emerald-400 mt-0.5 block">
                {healthStatus?.service || 'AccessCheck AI Gateway'} ({healthStatus?.status || 'Active'})
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Database Storage</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">
                SQLite + aiosqlite (accesscheck.db)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Auditing Engine</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">
                Playwright Headless Chromium + Deque Axe-core
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Environment</span>
              <span className="font-semibold text-slate-200 mt-0.5 block">
                {healthStatus?.environment || 'development'}
              </span>
            </div>
          </div>
        </div>

        {/* Theme Preferences */}
        <div className={`p-6 rounded-3xl border flex items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <h3 className="text-base font-bold">Appearance Theme</h3>
            <p className="text-xs text-slate-400 mt-0.5">Toggle between Dark Navy and Modern Clean Light theme</p>
          </div>

          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-amber-300' : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

