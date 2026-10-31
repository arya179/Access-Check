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
          Manage AI model endpoints, Google Gemini credentials, themes, and persistence layers.
        </p>
      </div>

      <div className="space-y-6">
        {/* AI & Model Settings */}
        <div className={`p-6 rounded-3xl border ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">Google Gemini AI Engine</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Active Gemini / Gemma Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={`w-full rounded-2xl px-4 py-3 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="gemma-4-26b-a4b-it">gemma-4-26b-a4b-it (Configured Gemma 4 Model)</option>
                <option value="gemini-2.5-flash">gemini-2.5-flash (Fast, Low Latency, Recommended)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (Complex Reasoning & Deep DOM Context)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Google Gemini API Key
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="password"
                  placeholder="AIzaSy... (configured in .env)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={`w-full rounded-2xl pl-11 pr-4 py-3 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Keys should be securely set in your backend <code className="font-mono text-indigo-400">.env</code> file.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Settings className="w-4 h-4" />}
                <span>{saved ? 'Preferences Updated' : 'Save AI Preferences'}</span>
              </button>
            </div>
          </form>
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

