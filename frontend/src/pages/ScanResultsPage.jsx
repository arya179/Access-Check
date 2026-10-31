import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, 
  ExternalLink, Sparkles, Download, Clock, Search, 
  ChevronDown, ChevronUp, Info, HelpCircle, Code2, 
  Layers, Filter, FileText, ArrowRight, SpellCheck, Check,
  BookOpen, AlignLeft
} from 'lucide-react';
import CircularGauge from '../components/CircularGauge';
import { SCORING_MODEL } from '../data/scoringModel';
import { useTheme } from '../context/ThemeContext';

export default function ScanResultsPage({ 
  auditData, 
  onNavigate, 
  onInspectAiFix 
}) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('accessibility'); // 'accessibility' | 'content_quality'
  const [filterImpact, setFilterImpact] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState({});
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  if (!auditData) {
    return (
      <div className={`p-16 rounded-3xl border text-center max-w-xl mx-auto my-12 ${
        theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <ShieldCheck className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold">No Audit Selected</h3>
        <p className="text-sm text-slate-400 mt-2">
          Run an accessibility scan or pick an entry from Scan History to inspect violations, scores, and code remediations.
        </p>
        <button
          onClick={() => onNavigate('new-scan')}
          className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
        >
          Launch New Scan
        </button>
      </div>
    );
  }

  const { 
    score, 
    metrics, 
    violations = [], 
    url, 
    timestamp, 
    duration_seconds, 
    passes_count = 0, 
    incomplete_count = 0, 
    ai_summary 
  } = auditData;

  const toggleNodeExpansion = (violationId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [violationId]: !prev[violationId]
    }));
  };

  // Filter violations by impact and query
  const filteredViolations = violations.filter(v => {
    const matchesImpact = filterImpact === 'all' || v.impact?.toLowerCase() === filterImpact.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      v.id.toLowerCase().includes(query) || 
      v.help.toLowerCase().includes(query) ||
      v.description.toLowerCase().includes(query) ||
      (v.tags && v.tags.some(t => t.toLowerCase().includes(query)));
    return matchesImpact && matchesSearch;
  });

  const getImpactBadge = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'critical':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">Critical</span>;
      case 'serious':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">Serious</span>;
      case 'moderate':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Moderate</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Minor</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Accessibility Audit Results</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">{auditData.id.slice(0, 8)}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1 flex items-center gap-2 truncate">
            <span className="truncate">{url}</span>
            <a href={url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white shrink-0">
              <ExternalLink className="w-4 h-4" />
            </a>
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Audited on {new Date(timestamp).toLocaleString()} ({duration_seconds}s execution)</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('reports')}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
          <button
            onClick={() => onNavigate('new-scan')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            Run New Scan
          </button>
        </div>
      </div>

      {/* Prominent Legal & Automated Disclaimer Banner */}
      <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
        theme === 'dark' ? 'bg-indigo-950/20 border-indigo-900/40 text-slate-300' : 'bg-indigo-50/70 border-indigo-200 text-slate-700'
      }`}>
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-slate-100 block">Automated Accessibility Audit Disclaimer:</span>
          <p className="leading-relaxed">
            The accessibility score is an <strong>algorithmic estimate</strong> based on automated axe-core DOM rule evaluation. 
            Automated tools typically evaluate approximately 30% to 50% of WCAG criteria. 
            Passing automated checks does <strong>not</strong> prove complete accessibility or guarantee legal compliance. 
            Human usability reviews and screen reader evaluations are essential.
          </p>
        </div>
      </div>

      {/* Main Score & Severity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Circular Score Gauge Card */}
        <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="w-full flex items-center justify-between pb-3 border-b border-inherit">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Estimated Accessibility Score
            </span>
            <button
              onClick={() => setShowFormulaModal(!showFormulaModal)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              title="View scoring methodology formula"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Formula</span>
            </button>
          </div>

          <div className="py-6">
            <CircularGauge score={score} />
          </div>

          <div className="w-full pt-3 border-t border-inherit flex items-center justify-between text-xs text-slate-400">
            <span>WCAG Pass Rate: <strong className="text-slate-200">{metrics.wcag_compliance_rate}%</strong></span>
            <span>Rules Tested: <strong className="text-slate-200">{passes_count + metrics.total_violations}</strong></span>
          </div>
        </div>

        {/* Right Column: Severity Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Critical */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Critical</span>
              <span className="h-2 w-2 rounded-full bg-red-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-red-400">{metrics.critical_count}</span>
              <p className="text-[11px] text-slate-400 mt-1">Severe blockers</p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">-15 pts each</span>
          </div>

          {/* Serious */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Serious</span>
              <span className="h-2 w-2 rounded-full bg-orange-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-orange-400">{metrics.serious_count}</span>
              <p className="text-[11px] text-slate-400 mt-1">High barrier issues</p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">-8 pts each</span>
          </div>

          {/* Moderate */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Moderate</span>
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-yellow-400">{metrics.moderate_count}</span>
              <p className="text-[11px] text-slate-400 mt-1">Impediments</p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">-4 pts each</span>
          </div>

          {/* Minor */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Minor</span>
              <span className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-blue-400">{metrics.minor_count}</span>
              <p className="text-[11px] text-slate-400 mt-1">Light enhancements</p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">-1 pt each</span>
          </div>

          {/* Passed Checks */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Passed Checks</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-emerald-400">{passes_count}</span>
              <p className="text-[11px] text-slate-400 mt-1">Rules satisfied</p>
            </div>
            <span className="text-[10px] text-emerald-500/80 mt-2 block">Verified in DOM</span>
          </div>

          {/* Incomplete Checks */}
          <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Needs Review</span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-amber-400">{incomplete_count}</span>
              <p className="text-[11px] text-slate-400 mt-1">Incomplete checks</p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">Requires manual audit</span>
          </div>
        </div>
      </div>

      {/* Transparent Scoring Formula Modal / Card */}
      {showFormulaModal && (
        <div className={`p-6 rounded-3xl border animate-fadeIn ${
          theme === 'dark' ? 'bg-slate-900 border-indigo-900/60' : 'bg-indigo-50/50 border-indigo-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-indigo-400 flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>Transparent Scoring Formula Documentation</span>
            </h4>
            <button 
              onClick={() => setShowFormulaModal(false)}
              className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
            >
              Close
            </button>
          </div>
          <div className="text-xs text-slate-300 font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <p>Score = max(0, 100 - (Critical × 15 + Serious × 8 + Moderate × 4 + Minor × 1))</p>
            <p className="text-slate-500 font-sans">
              * Current Audit Deduction = ({metrics.critical_count} × 15) + ({metrics.serious_count} × 8) + ({metrics.moderate_count} × 4) + ({metrics.minor_count} × 1) = {100 - score} points deducted.
            </p>
          </div>
        </div>
      )}

      {/* Section Switcher Tabs: Accessibility Audit vs Content Quality & Spell Check */}
      <div className="flex items-center gap-3 border-b border-inherit pb-4">
        <button
          onClick={() => setActiveTab('accessibility')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
            activeTab === 'accessibility'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/25'
              : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>WCAG Accessibility Violations ({violations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('content_quality')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
            activeTab === 'content_quality'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/25'
              : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <SpellCheck className="w-4 h-4 text-emerald-400" />
          <span>Spell & Content Quality ({auditData.content_quality?.total_content_issues || 0})</span>
        </button>
      </div>

      {/* Render Spell & Content Quality Tab */}
      {activeTab === 'content_quality' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quality Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Content Quality Score</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">{auditData.content_quality?.content_quality_score ?? 100}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Language: {auditData.content_quality?.language?.toUpperCase() || 'EN'}</p>
            </div>

            <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Misspelled Words</span>
              <div className="mt-2">
                <span className="text-3xl font-black text-rose-400">{auditData.content_quality?.findings_breakdown?.misspellings || 0}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Dictionary verified</p>
            </div>

            <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repeated Words & Spaces</span>
              <div className="mt-2">
                <span className="text-3xl font-black text-amber-400">
                  {(auditData.content_quality?.findings_breakdown?.repeated_words || 0) + (auditData.content_quality?.findings_breakdown?.spacing_and_punctuation || 0)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Syntax and spacing</p>
            </div>

            <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placeholder Texts</span>
              <div className="mt-2">
                <span className="text-3xl font-black text-violet-400">{auditData.content_quality?.findings_breakdown?.placeholder_text || 0}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Lorem ipsum / TODO</p>
            </div>
          </div>

          {/* Content Findings List */}
          <div className="space-y-4">
            {(!auditData.content_quality?.findings || auditData.content_quality.findings.length === 0) ? (
              <div className={`p-12 rounded-3xl border text-center ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-bold text-base">Zero Spelling or Content Quality Issues Found</h4>
                <p className="text-xs text-slate-400 mt-1">All visible headings, paragraphs, and labels passed spelling and grammar checks.</p>
              </div>
            ) : (
              auditData.content_quality.findings.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border flex flex-col gap-3 transition-all ${
                    theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.issue_type === 'misspelling' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        item.issue_type === 'repeated_word' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        item.issue_type === 'placeholder_text' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {item.issue_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">Confidence: <strong>{item.confidence}</strong></span>
                      {item.is_ai_assisted && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                          Gemma 4 Analysis
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Context sentence */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                    <p className="text-slate-300 font-sans italic">"{item.original_sentence}"</p>
                  </div>

                  {/* Issue details & suggestion */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Detected: </span>
                      <span className="font-mono text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40">
                        {item.incorrect_word}
                      </span>
                      <span className="mx-2 text-slate-500">➔</span>
                      <span className="text-slate-400">Suggested Correction: </span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                        {item.suggested_correction}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">{item.surrounding_context}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Render Accessibility Violations Tab */}
      {activeTab === 'accessibility' && (
        <>
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'critical', 'serious', 'moderate', 'minor'].map((impact) => (
            <button
              key={impact}
              onClick={() => setFilterImpact(impact)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                filterImpact === impact
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : theme === 'dark' ? 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {impact} ({
                impact === 'all' 
                  ? violations.length 
                  : violations.filter(v => v.impact?.toLowerCase() === impact).length
              })
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search rules, WCAG tags, or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        {filteredViolations.length === 0 ? (
          <div className={`p-16 rounded-3xl border text-center ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
            <h4 className="font-bold text-base">No Violations Found</h4>
            <p className="text-xs text-slate-400 mt-1">
              {violations.length === 0 
                ? "This page conforms to all tested automated axe-core rules." 
                : "No violations match your search and filter criteria."}
            </p>
          </div>
        ) : (
          filteredViolations.map((v, idx) => {
            const isExpanded = expandedNodes[v.id];
            const nodeCount = v.nodes?.length || 0;

            return (
              <div
                key={v.id || idx}
                className={`p-6 rounded-3xl border transition-all ${
                  theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-inherit pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    {getImpactBadge(v.impact)}
                    <h4 className="font-mono text-sm font-bold text-indigo-400">{v.id}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={v.helpUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
                    >
                      <span>Axe Documentation</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => {
                        onInspectAiFix(v);
                        onNavigate('ai-assistant');
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Remediation Fix</span>
                    </button>
                  </div>
                </div>

                {/* Violation Help & Description */}
                <p className="text-sm font-bold text-slate-100">{v.help}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{v.description}</p>

                {/* WCAG Reference Tags */}
                {v.tags && v.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {v.tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-900">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expandable HTML Details & Selectors */}
                {nodeCount > 0 && (
                  <div className="mt-4 pt-3 border-t border-inherit">
                    <button
                      onClick={() => toggleNodeExpansion(v.id)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white py-1"
                    >
                      <span className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-indigo-400" />
                        <span>Failing DOM Elements ({nodeCount})</span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-3">
                        {v.nodes.map((node, nodeIdx) => (
                          <div 
                            key={nodeIdx}
                            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2"
                          >
                            {/* CSS Selectors */}
                            {node.target && node.target.length > 0 && (
                              <div>
                                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                                  CSS Selector Target:
                                </span>
                                <div className="font-mono text-[11px] text-indigo-300 bg-slate-900/90 px-2.5 py-1.5 rounded border border-slate-800 overflow-x-auto">
                                  {node.target.join(' > ')}
                                </div>
                              </div>
                            )}

                            {/* HTML Snippet */}
                            <div>
                              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                                HTML Snippet:
                              </span>
                              <pre className="font-mono text-[11px] text-amber-300/90 bg-slate-900/90 p-2.5 rounded border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                                <code>{node.html}</code>
                              </pre>
                            </div>

                            {/* Failure summary */}
                            {node.failureSummary && (
                              <div className="text-[11px] text-slate-400 font-sans border-t border-slate-900 pt-1.5">
                                <strong className="text-red-400">Fix Guidance:</strong> {node.failureSummary}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </>
      )}
    </div>
  );
}
