import React, { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, Code2, Copy, Check, ArrowRight, 
  ExternalLink, ShieldCheck, AlertCircle, RefreshCw, 
  Eye, HeartHandshake, Wrench, CheckCircle, Lightbulb, 
  Terminal, Layers, BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function AiFixAssistantPage({ 
  auditData, 
  selectedViolation, 
  onNavigate,
  selectedModel 
}) {
  const { theme } = useTheme();
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeViolationId, setActiveViolationId] = useState(
    selectedViolation?.id || auditData?.violations?.[0]?.id || null
  );

  // Deep AI explanation response state
  const [explanation, setExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(null);

  const violations = auditData?.violations || [];
  const currentViolation = violations.find(v => v.id === activeViolationId) || violations[0];

  useEffect(() => {
    if (currentViolation) {
      loadDetailedExplanation(currentViolation);
    }
  }, [activeViolationId]);

  const loadDetailedExplanation = async (violation) => {
    if (!violation) return;
    setLoadingAi(true);
    setAiError(null);

    const firstNode = violation.nodes?.[0] || {};
    const payload = {
      rule_id: violation.id,
      impact: violation.impact || "minor",
      help: violation.help,
      description: violation.description,
      help_url: violation.helpUrl || "",
      tags: violation.tags || [],
      sample_html: firstNode.html || "",
      css_selector: Array.isArray(firstNode.target) ? firstNode.target.join(' > ') : (firstNode.target || ""),
      failure_summary: firstNode.failureSummary || "",
      model_override: selectedModel
    };

    try {
      const data = await api.explainViolation(payload);
      setExplanation(data);
    } catch (err) {
      console.warn("AI explain request fallback triggered:", err.message);
      setAiError(err.message);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopy = (key, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!auditData) {
    return (
      <div className={`p-16 rounded-3xl border text-center max-w-xl mx-auto my-12 ${
        theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <Bot className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold">No Audit Data for Remediation</h3>
        <p className="text-sm text-slate-400 mt-2">
          Run an accessibility scan to activate the Google Gemini AI code remediation assistant.
        </p>
        <button
          onClick={() => onNavigate('new-scan')}
          className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
        >
          Start New Scan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Banner */}
      <div className={`p-8 rounded-3xl border relative overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-900/40' 
          : 'bg-gradient-to-r from-indigo-50 via-white to-violet-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Google Gemini AI Remediation Suite</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">AI Fix Assistant</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Provides structured before/after code fixes, disability impact assessments, and step-by-step developer implementation instructions.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-1 text-xs">
            <span className="text-slate-400">Model Engine:</span>
            <span className="font-mono text-indigo-400 font-semibold px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-900">
              {selectedModel}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Discovered Violations list (4 cols) */}
        <div className={`lg:col-span-4 p-5 rounded-3xl border flex flex-col h-[750px] ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="pb-3 border-b border-inherit mb-3">
            <h3 className="font-bold text-sm">Discovered Issues ({violations.length})</h3>
            <p className="text-xs text-slate-400">Select any violation to generate AI remediation</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {violations.map((v) => {
              const isSelected = v.id === currentViolation?.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveViolationId(v.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20' 
                      : theme === 'dark'
                        ? 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-bold truncate">{v.id}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : v.impact === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {v.impact || 'minor'}
                    </span>
                  </div>
                  <p className={`text-xs line-clamp-2 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {v.help}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Structured AI Explanation (8 cols) */}
        <div className={`lg:col-span-8 p-6 rounded-3xl border flex flex-col justify-between overflow-hidden ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {currentViolation ? (
            <div className="space-y-6 overflow-y-auto pr-1">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-inherit">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">{currentViolation.id}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400 capitalize">{currentViolation.impact} Severity</span>
                    {explanation?.is_fallback && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Axe Documentation Fallback
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">{currentViolation.help}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadDetailedExplanation(currentViolation)}
                    disabled={loadingAi}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Regenerate explanation"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingAi ? 'animate-spin' : ''}`} />
                  </button>
                  <a
                    href={currentViolation.helpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
                    title="Open official Deque documentation"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {loadingAi ? (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-10 h-10 animate-spin text-indigo-400" />
                  <p className="text-sm font-semibold text-slate-200">Generating Structured Gemini Remediation...</p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Synthesizing disability impact, semantic HTML before/after snippets, and WCAG criteria.
                  </p>
                </div>
              ) : explanation ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Issue Explanation & Why It Matters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Technical Explanation</span>
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{explanation.issue_explanation}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Why It Matters</span>
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{explanation.why_it_matters}</p>
                    </div>
                  </div>

                  {/* Disability Impact & Technical Cause */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>Disability Impact</span>
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{explanation.disability_impact}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Root Cause & Defect</span>
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{explanation.technical_cause}</p>
                    </div>
                  </div>

                  {/* Before / After HTML Code Blocks with Copy Buttons */}
                  <div className="space-y-4">
                    {/* Before HTML */}
                    <div className="rounded-2xl border border-red-900/40 bg-slate-950 overflow-hidden">
                      <div className="px-4 py-2.5 bg-red-950/30 border-b border-red-900/40 flex items-center justify-between">
                        <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 font-mono">
                          <span>❌ BEFORE (Failing DOM Element)</span>
                        </span>
                        <button
                          onClick={() => handleCopy('before', explanation.before_html)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1 border border-slate-800"
                        >
                          {copiedKey === 'before' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 font-mono text-xs text-red-300/90 overflow-x-auto whitespace-pre-wrap">
                        <code>{explanation.before_html}</code>
                      </pre>
                    </div>

                    {/* After HTML */}
                    <div className="rounded-2xl border border-emerald-900/40 bg-slate-950 overflow-hidden">
                      <div className="px-4 py-2.5 bg-emerald-950/30 border-b border-emerald-900/40 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                          <span>✅ AFTER (Remediated Accessible Code)</span>
                        </span>
                        <button
                          onClick={() => handleCopy('after', explanation.after_html)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1 border border-slate-800"
                        >
                          {copiedKey === 'after' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 font-mono text-xs text-emerald-300/90 overflow-x-auto whitespace-pre-wrap">
                        <code>{explanation.after_html}</code>
                      </pre>
                    </div>

                    {/* Optional CSS Fix if provided */}
                    {explanation.css_fix && (
                      <div className="rounded-2xl border border-indigo-900/40 bg-slate-950 overflow-hidden">
                        <div className="px-4 py-2.5 bg-indigo-950/30 border-b border-indigo-900/40 flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 font-mono">
                            <span>🎨 CSS Fix Snippet</span>
                          </span>
                          <button
                            onClick={() => handleCopy('css', explanation.css_fix)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1 border border-slate-800"
                          >
                            {copiedKey === 'css' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy CSS</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 font-mono text-xs text-indigo-200 overflow-x-auto whitespace-pre-wrap">
                          <code>{explanation.css_fix}</code>
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Step-by-Step Implementation Steps */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
                      Implementation Checklist:
                    </span>
                    <ol className="space-y-2 text-xs text-slate-400 list-decimal list-inside">
                      {explanation.implementation_steps?.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <span className="text-slate-200">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* WCAG Reference Pill */}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Reference Standard:</span>
                    <span className="font-semibold text-slate-200">{explanation.wcag_reference}</span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-center py-24 text-slate-500">
              Select an issue from the left column to view AI remediation guidance.
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-inherit flex items-center justify-between text-xs text-slate-400">
            <span>Powered by official Google GenAI SDK</span>
            <button
              onClick={() => onNavigate('results')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Back to Audit Results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
