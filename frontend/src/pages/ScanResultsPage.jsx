import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, 
  ExternalLink, Sparkles, Download, Clock, Search, 
  ChevronDown, ChevronUp, Info, HelpCircle, Code2, 
  Layers, Filter, FileText, ArrowRight, SpellCheck, Check,
  BookOpen, AlignLeft, Layout, Smartphone, Tablet, Monitor,
  Type, Palette, MoveHorizontal, AlertOctagon
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
  // Section tabs: 'accessibility' | 'design_intelligence' | 'content_quality'
  const [activeTab, setActiveTab] = useState('accessibility');
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
          Run an accessibility scan or pick an entry from Scan History to inspect violations, design analysis, and content quality.
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
    ai_summary,
    content_quality = {},
    design_analysis = {}
  } = auditData;

  const toggleNodeExpansion = (violationId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [violationId]: !prev[violationId]
    }));
  };

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

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">Critical</span>;
      case 'serious':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">Serious</span>;
      case 'moderate':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Moderate</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">Minor</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Complete Website Audit & Intelligence</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">{auditData.id.slice(0, 8)}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1 flex items-center gap-2 truncate">
            <span className="truncate">{url}</span>
            <a href={url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white" title="Open target website">
              <ExternalLink className="w-4 h-4" />
            </a>
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(timestamp).toLocaleString()}</span>
            <span>Duration: <strong>{duration_seconds}s</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (PDF / CSV)</span>
          </button>
        </div>
      </div>

      {/* 3 Pillar Summary Cards: Accessibility, Design Quality, Content Quality */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Accessibility Score */}
        <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="w-full flex items-center justify-between pb-3 border-b border-inherit">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Accessibility Score</span>
            </span>
            <button
              onClick={() => setShowFormulaModal(!showFormulaModal)}
              className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1"
              title="Formula"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="py-4">
            <CircularGauge score={score} />
          </div>
          <div className="w-full pt-3 border-t border-inherit flex items-center justify-between text-xs text-slate-400">
            <span>Violations: <strong className="text-rose-400">{violations.length}</strong></span>
            <span>Pass Rate: <strong className="text-emerald-400">{metrics.wcag_compliance_rate}%</strong></span>
          </div>
        </div>

        {/* 2. Design Quality Score */}
        <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="w-full flex items-center justify-between pb-3 border-b border-inherit">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Layout className="w-4 h-4" />
              <span>Design Quality</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">Desktop + Mobile</span>
          </div>
          <div className="py-4 text-center">
            <div className="text-5xl font-black text-amber-400">
              {design_analysis?.design_quality_score ?? 95}
              <span className="text-lg text-slate-500 font-normal">/100</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {design_analysis?.total_design_findings || 0} layout & responsive observations
            </p>
          </div>
          <div className="w-full pt-3 border-t border-inherit flex items-center justify-between text-xs text-slate-400">
            <span>Mobile Overflow: <strong className={design_analysis?.measurements_summary?.has_mobile_overflow ? "text-rose-400" : "text-emerald-400"}>
              {design_analysis?.measurements_summary?.has_mobile_overflow ? "Yes" : "None"}
            </strong></span>
            <span>Headings: <strong className="text-slate-200">{design_analysis?.measurements_summary?.heading_count || 0}</strong></span>
          </div>
        </div>

        {/* 3. Content Quality Score */}
        <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="w-full flex items-center justify-between pb-3 border-b border-inherit">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <SpellCheck className="w-4 h-4" />
              <span>Content Quality</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">Language: {content_quality?.language?.toUpperCase() || 'EN'}</span>
          </div>
          <div className="py-4 text-center">
            <div className="text-5xl font-black text-emerald-400">
              {content_quality?.content_quality_score ?? 100}
              <span className="text-lg text-slate-500 font-normal">/100</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              {content_quality?.total_content_issues || 0} spelling & phrasing items
            </p>
          </div>
          <div className="w-full pt-3 border-t border-inherit flex items-center justify-between text-xs text-slate-400">
            <span>Misspellings: <strong className="text-rose-400">{content_quality?.findings_breakdown?.misspellings || 0}</strong></span>
            <span>Placeholders: <strong className="text-violet-400">{content_quality?.findings_breakdown?.placeholder_text || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Formula Modal */}
      {showFormulaModal && (
        <div className={`p-6 rounded-3xl border animate-fadeIn ${
          theme === 'dark' ? 'bg-slate-900 border-indigo-900/60' : 'bg-indigo-50/50 border-indigo-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm text-indigo-400 flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>Objective Scoring Formulas Documentation</span>
            </h4>
            <button onClick={() => setShowFormulaModal(false)} className="text-xs text-slate-400 hover:text-slate-200 font-semibold">
              Close
            </button>
          </div>
          <div className="text-xs text-slate-300 font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <p><strong>Accessibility Score:</strong> max(0, 100 - (Critical × 15 + Serious × 8 + Moderate × 4 + Minor × 1))</p>
            <p><strong>Design Quality Score:</strong> max(0, 100 - (Critical [e.g. mobile overflow] × 15 + Serious × 10 + Moderate × 5 + Minor × 2))</p>
            <p><strong>Content Quality Score:</strong> max(0, 100 - (Placeholders/Repeated × 5 + Misspellings × 3 + Syntax/Spacing × 2))</p>
          </div>
        </div>
      )}

      {/* Section Switcher Tabs: 1. Accessibility, 2. Design Intelligence, 3. Content Quality */}
      <div className="flex items-center gap-3 border-b border-inherit pb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('accessibility')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
            activeTab === 'accessibility'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/25'
              : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>WCAG Accessibility ({violations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('design_intelligence')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
            activeTab === 'design_intelligence'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/25'
              : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <Layout className="w-4 h-4 text-amber-400" />
          <span>Website Design Analysis ({design_analysis?.total_design_findings || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('content_quality')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all border shrink-0 ${
            activeTab === 'content_quality'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-600/25'
              : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <SpellCheck className="w-4 h-4 text-emerald-400" />
          <span>Content Quality & Consistency ({content_quality?.total_content_issues || 0})</span>
        </button>
      </div>

      {/* ================= TAB 1: DESIGN INTELLIGENCE & RESPONSIVE ================= */}
      {activeTab === 'design_intelligence' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Viewport & Measurement Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Desktop Viewport</span>
                <span className="text-sm font-bold text-slate-200">1440 × 900</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Overflow: {design_analysis?.measurements_summary?.has_desktop_overflow ? <span className="text-red-400 font-bold">Detected</span> : <span className="text-emerald-400 font-bold">Pass</span>}
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Tablet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tablet Viewport</span>
                <span className="text-sm font-bold text-slate-200">768 × 1024</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Overflow: {design_analysis?.measurements_summary?.has_tablet_overflow ? <span className="text-red-400 font-bold">Detected</span> : <span className="text-emerald-400 font-bold">Pass</span>}
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Viewport</span>
                <span className="text-sm font-bold text-slate-200">375 × 667</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Overflow: {design_analysis?.measurements_summary?.has_mobile_overflow ? <span className="text-red-400 font-bold">Detected</span> : <span className="text-emerald-400 font-bold">Pass</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Design Findings Cards */}
          <div className="space-y-4">
            {(!design_analysis?.findings || design_analysis.findings.length === 0) ? (
              <div className={`p-12 rounded-3xl border text-center ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-bold text-base">Exceptional Design & Responsive Layout</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Browser measurements confirmed clean heading hierarchy, consistent typography, sufficient interactive target sizing, and zero horizontal overflow across Desktop, Tablet, and Mobile viewports.
                </p>
              </div>
            ) : (
              design_analysis.findings.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border flex flex-col gap-3 transition-all ${
                    theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-inherit pb-3">
                    <div className="flex items-center gap-2.5">
                      {getSeverityBadge(item.severity)}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-300 border border-slate-700">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100">{item.finding_label}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.is_ai_assisted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Gemma 4 Evaluated
                        </span>
                      )}
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        item.requires_human_verification ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {item.requires_human_verification ? 'Requires Human Review' : 'Automated Measurement'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.description}</p>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
                    <strong className="text-indigo-400 font-sans">Browser Evidence:</strong> {item.evidence}
                  </div>

                  <div className="text-xs text-emerald-400/90 bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/40">
                    <strong className="text-emerald-300">Actionable Suggestion:</strong> {item.suggested_correction}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: CONTENT QUALITY & CORRECTNESS ================= */}
      {activeTab === 'content_quality' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Content Breakdown Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Spelling Errors</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">
                {content_quality?.findings_breakdown?.misspellings || 0}
              </span>
              <span className="text-[10px] text-slate-500">Dictionary verified</span>
            </div>

            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Repeated Words</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">
                {content_quality?.findings_breakdown?.repeated_words || 0}
              </span>
              <span className="text-[10px] text-slate-500">Consecutive duplicates</span>
            </div>

            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Grammar & Phrasing</span>
              <span className="text-2xl font-black text-indigo-400 mt-1 block">
                {content_quality?.findings_breakdown?.grammar_and_syntax || 0}
              </span>
              <span className="text-[10px] text-slate-500">Gemma 4 contextual</span>
            </div>

            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Placeholders</span>
              <span className="text-2xl font-black text-violet-400 mt-1 block">
                {content_quality?.findings_breakdown?.placeholder_text || 0}
              </span>
              <span className="text-[10px] text-slate-500">Lorem ipsum / TODO</span>
            </div>
          </div>

          {/* Content Findings List */}
          <div className="space-y-4">
            {(!content_quality?.findings || content_quality.findings.length === 0) ? (
              <div className={`p-12 rounded-3xl border text-center ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="font-bold text-base">Zero Spelling or Content Quality Issues Found</h4>
                <p className="text-xs text-slate-400 mt-1">All visible headings, paragraphs, and buttons passed spelling, grammar, and consistency checks.</p>
              </div>
            ) : (
              content_quality.findings.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border flex flex-col gap-3 transition-all ${
                    theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-inherit pb-3">
                    <div className="flex items-center gap-2.5">
                      {getSeverityBadge(item.severity)}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-emerald-300 border border-slate-700">
                        {item.category || item.issue_type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100">{item.finding_label || item.issue_type}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.is_ai_assisted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Gemma 4 Verified
                        </span>
                      )}
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        item.requires_human_verification ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {item.requires_human_verification ? 'Requires Human Review' : 'Confirmed Match'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.description}</p>

                  {/* Context sentence */}
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1">Visible Website Text:</span>
                    <p className="text-slate-300 font-sans italic">"{item.evidence || item.original_sentence}"</p>
                  </div>

                  {/* Suggestion */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-emerald-950/20 p-3 rounded-xl border border-emerald-900/30">
                    <div>
                      {item.incorrect_word && (
                        <>
                          <span className="text-slate-400">Issue: </span>
                          <span className="font-mono text-rose-400 font-bold bg-rose-950/50 px-2 py-0.5 rounded border border-rose-900/40">
                            {item.incorrect_word}
                          </span>
                          <span className="mx-2 text-slate-500">➔</span>
                        </>
                      )}
                      <span className="text-slate-300 font-semibold">Suggested Correction: </span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {item.suggested_correction}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: WCAG ACCESSIBILITY ================= */}
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

                                <div>
                                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                                    HTML Snippet:
                                  </span>
                                  <pre className="font-mono text-[11px] text-amber-300/90 bg-slate-900/90 p-2.5 rounded border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                                    <code>{node.html}</code>
                                  </pre>
                                </div>

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
