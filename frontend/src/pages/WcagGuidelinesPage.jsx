import React, { useState } from 'react';
import { 
  BookOpen, Search, Sparkles, Check, Copy, ArrowRight, 
  ExternalLink, Layers, Eye, Keyboard, Palette, FileText, 
  Code2, Volume2, Heading, MousePointer, Link as LinkIcon, 
  CheckCircle2, XCircle, AlertCircle, Info, ChevronRight 
} from 'lucide-react';
import { WCAG_POUR_PRINCIPLES, WCAG_LEARNING_TOPICS } from '../data/wcagLearningData';
import { useTheme } from '../context/ThemeContext';

export default function WcagGuidelinesPage({ onNavigate, onAskAi }) {
  const { theme } = useTheme();
  
  // State
  const [selectedPrinciple, setSelectedPrinciple] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopicId, setActiveTopicId] = useState('image-alt-text');
  const [copiedKey, setCopiedKey] = useState(null);

  // Icon mapping for learning topics
  const getTopicIcon = (id) => {
    switch (id) {
      case 'image-alt-text': return Eye;
      case 'keyboard-navigation': return Keyboard;
      case 'color-contrast': return Palette;
      case 'form-labels': return FileText;
      case 'semantic-html': return Code2;
      case 'screen-reader-support': return Volume2;
      case 'heading-hierarchy': return Heading;
      case 'accessible-buttons': return MousePointer;
      case 'accessible-links': return LinkIcon;
      default: return BookOpen;
    }
  };

  const filteredTopics = WCAG_LEARNING_TOPICS.filter(topic => {
    const matchesPrinciple = selectedPrinciple === 'all' || topic.principle === selectedPrinciple;
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      topic.title.toLowerCase().includes(query) ||
      topic.explanation.toLowerCase().includes(query) ||
      topic.wcag_reference.toLowerCase().includes(query);
    return matchesPrinciple && matchesQuery;
  });

  const activeTopic = WCAG_LEARNING_TOPICS.find(t => t.id === activeTopicId) || WCAG_LEARNING_TOPICS[0];

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <BookOpen className="w-4 h-4" />
            <span>Interactive Educational Hub</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">WCAG 2.1 Learning Center</h2>
          <p className="text-sm text-slate-400 mt-1">
            Beginner-friendly explanations, POUR principles breakdown, common anti-patterns, and verified code remediations.
          </p>
        </div>

        <button
          onClick={() => onNavigate('ai-assistant')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
        >
          <Sparkles className="w-4 h-4" />
          <span>Gemma 4 AI Assistant</span>
        </button>
      </div>

      {/* POUR 4 Core Principles Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {WCAG_POUR_PRINCIPLES.map((p) => {
          const isSelected = selectedPrinciple === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPrinciple(selectedPrinciple === p.id ? 'all' : p.id)}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                isSelected 
                  ? 'border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/30' 
                  : theme === 'dark'
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: p.color }}>
                  {p.title}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isSelected ? 'Active' : 'Filter'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200 mt-2">{p.tagline}</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-3">
                {p.summary}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search & Principle Filter Bar */}
      <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
        theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedPrinciple('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              selectedPrinciple === 'all'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Topics ({WCAG_LEARNING_TOPICS.length})
          </button>
          {['perceivable', 'operable', 'understandable', 'robust'].map((principle) => (
            <button
              key={principle}
              onClick={() => setSelectedPrinciple(principle)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all border ${
                selectedPrinciple === principle
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {principle}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search topics, tags, rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>
      </div>

      {/* Main 2-Column Learning Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Topics Navigation List (4 cols) */}
        <div className={`lg:col-span-4 p-5 rounded-3xl border flex flex-col h-[750px] ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="pb-3 border-b border-inherit mb-3">
            <h3 className="font-bold text-sm">Essential Topics ({filteredTopics.length})</h3>
            <p className="text-xs text-slate-400">Click to explore guidelines and code examples</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredTopics.map((topic) => {
              const Icon = getTopicIcon(topic.id);
              const isSelected = topic.id === activeTopic?.id;

              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopicId(topic.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : theme === 'dark'
                        ? 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs truncate">{topic.title}</span>
                      <span className={`text-[10px] capitalize px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {topic.principle}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 line-clamp-1 ${
                      isSelected ? 'text-white/80' : 'text-slate-400'
                    }`}>
                      {topic.explanation}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Topic Detail Pane (8 cols) */}
        <div className={`lg:col-span-8 p-6 rounded-3xl border flex flex-col justify-between overflow-hidden ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {activeTopic ? (
            <div className="space-y-6 overflow-y-auto pr-1">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-inherit">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                      Principle: {activeTopic.principle}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{activeTopic.wcag_reference}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-100 mt-1">{activeTopic.title}</h3>
                </div>

                <button
                  onClick={() => onNavigate('ai-assistant')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ask Gemma 4 Fix Assistant</span>
                </button>
              </div>

              {/* Explanation & Why it matters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>What Is It?</span>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeTopic.explanation}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Why It Matters</span>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeTopic.why_it_matters}</p>
                </div>
              </div>

              {/* Common Mistakes */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Common Pitfalls to Avoid:</span>
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {activeTopic.common_mistakes.map((mistake, i) => (
                    <li key={i} className="leading-relaxed">{mistake}</li>
                  ))}
                </ul>
              </div>

              {/* Code Comparison (Incorrect vs Correct) */}
              <div className="space-y-4">
                {/* Incorrect Code */}
                <div className="rounded-2xl border border-red-900/40 bg-slate-950 overflow-hidden">
                  <div className="px-4 py-2.5 bg-red-950/30 border-b border-red-900/40 flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 font-mono">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>INCORRECT (Accessibility Violation)</span>
                    </span>
                    <button
                      onClick={() => handleCopy('incorrect', activeTopic.incorrect_code)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1 border border-slate-800"
                    >
                      {copiedKey === 'incorrect' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'incorrect' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-xs text-red-300/90 overflow-x-auto whitespace-pre-wrap">
                    <code>{activeTopic.incorrect_code}</code>
                  </pre>
                </div>

                {/* Correct Code */}
                <div className="rounded-2xl border border-emerald-900/40 bg-slate-950 overflow-hidden">
                  <div className="px-4 py-2.5 bg-emerald-950/30 border-b border-emerald-900/40 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>CORRECT (Accessible Best Practice)</span>
                    </span>
                    <button
                      onClick={() => handleCopy('correct', activeTopic.correct_code)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1 border border-slate-800"
                    >
                      {copiedKey === 'correct' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'correct' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 font-mono text-xs text-emerald-300/90 overflow-x-auto whitespace-pre-wrap">
                    <code>{activeTopic.correct_code}</code>
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-slate-500">
              Select a topic from the left sidebar to inspect details.
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-inherit flex items-center justify-between text-xs text-slate-400">
            <span>Official Specification: {activeTopic?.wcag_reference}</span>
            <button
              onClick={() => onNavigate('new-scan')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Audit your site for this rule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
