import React, { useState } from 'react';
import { 
  ScanSearch, Shield, Sparkles, AlertCircle, RefreshCw, 
  ArrowRight, CheckCircle2, Globe, Cpu, AlertTriangle, 
  Check, RotateCcw, Lock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function NewScanPage({ 
  onRunScan, 
  loading, 
  error, 
  scanStatus, 
  selectedModel, 
  setSelectedModel,
  lastFailedPayload,
  onRetry
}) {
  const { theme } = useTheme();
  const [url, setUrl] = useState('');
  const [urlValidationError, setUrlValidationError] = useState('');
  const [tags, setTags] = useState({
    wcag2a: true,
    wcag2aa: true,
    wcag21a: true,
    wcag21aa: true,
    bestPractice: false
  });
  const [enableAI, setEnableAI] = useState(true);
  const [contentLanguage, setContentLanguage] = useState('en');
  const [enableGrammarAI, setEnableGrammarAI] = useState(true);

  // Client-side URL validation
  const validateUrlInput = (input) => {
    setUrlValidationError('');
    if (!input.trim()) return false;

    let testUrl = input.trim();
    if (!/^https?:\/\//i.test(testUrl)) {
      testUrl = 'https://' + testUrl;
    }

    try {
      const parsed = new URL(testUrl);
      const host = parsed.hostname.toLowerCase();

      // Client-side check against localhost & internal addresses
      if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local') || host.endsWith('.internal')) {
        setUrlValidationError('Localhost and private IP destinations are blocked for security.');
        return false;
      }
      return true;
    } catch (e) {
      setUrlValidationError('Please enter a valid website URL (e.g. https://example.com).');
      return false;
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    if (urlValidationError) {
      setUrlValidationError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setUrlValidationError('Target URL is required.');
      return;
    }

    if (!validateUrlInput(url)) {
      return;
    }

    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
    }

    const activeTags = Object.keys(tags).filter(k => tags[k]);
    onRunScan({
      url: target,
      tags: activeTags,
      generate_ai_remediation: enableAI,
      model_override: selectedModel,
      content_language: contentLanguage,
      enable_ai_grammar: enableGrammarAI
    });
  };

  const toggleTag = (key) => {
    setTags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Launch Website Accessibility Audit</h2>
        <p className="text-sm text-slate-400 mt-1">
          Initiates a headless Google Chrome session using Playwright and evaluates real WCAG rules via bundled local axe-core.
        </p>
      </div>

      {/* Real-time Scanning Progress Indicator (Visible when loading) */}
      {loading && (
        <div className={`p-8 rounded-3xl border shadow-2xl relative overflow-hidden animate-pulse ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-indigo-700/50' 
            : 'bg-gradient-to-r from-indigo-50 via-violet-50 to-indigo-50 border-indigo-200'
        }`}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Audit Engine Active</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">{scanStatus || 'Initiating Chromium Instance...'}</h3>
              <p className="text-xs text-slate-400">
                Executing axe.run() across DOM nodes, evaluating color contrast, ARIA landmarks, and generating AI code fixes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Scan Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Target URL Input */}
        <div className={`p-6 rounded-3xl border ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Target Website URL
          </label>
          <div className="relative">
            <Globe className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={handleUrlChange}
              disabled={loading}
              className={`w-full rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 transition-all border ${
                urlValidationError 
                  ? 'border-red-500 ring-1 ring-red-500/50' 
                  : 'focus:ring-indigo-500'
              } ${
                theme === 'dark' 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {urlValidationError ? (
            <p className="text-xs text-red-400 mt-2 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{urlValidationError}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Protected against SSRF, internal redirects, and private subnets.</span>
            </p>
          )}
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Standards */}
          <div className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>WCAG Target Rule Groups</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Toggle rule groups to evaluate during testing.</p>

            <div className="space-y-2">
              {[
                { id: 'wcag2a', label: 'WCAG 2.0 Level A' },
                { id: 'wcag2aa', label: 'WCAG 2.0 Level AA' },
                { id: 'wcag21a', label: 'WCAG 2.1 Level A' },
                { id: 'wcag21aa', label: 'WCAG 2.1 Level AA (Recommended)' },
                { id: 'bestPractice', label: 'Axe Best Practices' },
              ].map((item) => (
                <label 
                  key={item.id}
                  onClick={() => !loading && toggleTag(item.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    tags[item.id]
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-slate-200'
                      : theme === 'dark' ? 'bg-slate-950/40 border-slate-800/80 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="text-xs font-semibold">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={tags[item.id]}
                    onChange={() => {}}
                    disabled={loading}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* AI Settings */}
          <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Automated Remediation</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Google Gemini generates code fixes directly for discovered Axe violations.
              </p>

              <div className="space-y-4">
                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer ${
                  enableAI 
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-slate-200' 
                    : theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <span className="text-xs font-semibold">Enable Gemini Fix Engine</span>
                  <input
                    type="checkbox"
                    checked={enableAI}
                    onChange={(e) => setEnableAI(e.target.checked)}
                    disabled={loading}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">
                    Configured Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={loading}
                    className={`w-full rounded-xl px-4 py-3 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      theme === 'dark' 
                        ? 'bg-slate-950 border-slate-800 text-white' 
                        : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="gemma-4-26b-a4b-it">Gemma 4 (26B Open Model)</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </select>
                </div>

                {/* Content Quality & Spell Checker Options */}
                <div className="pt-2 border-t border-inherit space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Content Language</span>
                    <select
                      value={contentLanguage}
                      onChange={(e) => setContentLanguage(e.target.value)}
                      disabled={loading}
                      className={`rounded-lg px-2.5 py-1 text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                      }`}
                    >
                      <option value="en">English (US/UK)</option>
                      <option value="es">Spanish (Español)</option>
                      <option value="fr">French (Français)</option>
                      <option value="de">German (Deutsch)</option>
                    </select>
                  </div>

                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                    <span>Gemma 4 Grammar Audit</span>
                    <input
                      type="checkbox"
                      checked={enableGrammarAI}
                      onChange={(e) => setEnableGrammarAI(e.target.checked)}
                      disabled={loading}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 mt-6">
              <span className="font-semibold block">Axe-Core Local Bundle:</span>
              <span>Evaluated directly in memory without depending on target site external CDNs.</span>
            </div>
          </div>
        </div>

        {/* Error Notification with Retry */}
        {error && (
          <div className="p-4 bg-red-950/60 border border-red-800 text-red-300 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            {lastFailedPayload && (
              <button
                type="button"
                onClick={onRetry}
                className="px-3 py-1.5 rounded-xl bg-red-900/60 hover:bg-red-900 text-red-200 border border-red-700 flex items-center gap-1.5 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Scan</span>
              </button>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Auditing Target Website...</span>
            </>
          ) : (
            <>
              <ScanSearch className="w-5 h-5" />
              <span>Start Comprehensive Audit</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
