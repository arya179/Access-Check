import React, { useState } from 'react';
import { 
  History, Trash2, ExternalLink, Search, Clock, 
  ShieldCheck, AlertTriangle, ArrowRight, RefreshCw, 
  Calendar, GitCompare, CheckCircle2, XCircle, ArrowUpRight, 
  ChevronRight, Sparkles 
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function ScanHistoryPage({ 
  history = [], 
  onViewAudit, 
  onDeleteAudit, 
  onRefresh, 
  onNavigate 
}) {
  const { theme } = useTheme();
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [clearingAll, setClearingAll] = useState(false);

  // Compare mode state
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [comparisonModal, setComparisonModal] = useState(null);
  const [comparingLoading, setComparingLoading] = useState(false);

  // Filter history client-side or trigger api refresh
  const filtered = history.filter(item => {
    const matchesSearch = !search || 
      item.url.toLowerCase().includes(search.toLowerCase()) ||
      (item.domain && item.domain.toLowerCase().includes(search.toLowerCase()));

    const itemDate = new Date(item.timestamp);
    const matchesStart = !startDate || itemDate >= new Date(startDate);
    const matchesEnd = !endDate || itemDate <= new Date(endDate + 'T23:59:59');

    return matchesSearch && matchesStart && matchesEnd;
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this scan record permanently from SQLite storage?")) return;
    setDeletingId(id);
    await onDeleteAudit(id);
    setDeletingId(null);
  };

  const handleClearAll = async () => {
    if (!window.confirm("WARNING: Clear all audit records and history from SQLite? This cannot be undone.")) return;
    setClearingAll(true);
    try {
      await api.clearAllHistory();
      await onRefresh();
      setSelectedForCompare([]);
    } catch (err) {
      alert("Failed to clear history: " + err.message);
    } finally {
      setClearingAll(false);
    }
  };

  const toggleSelectForCompare = (id, e) => {
    e.stopPropagation();
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(x => x !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const handleExecuteCompare = async () => {
    if (selectedForCompare.length !== 2) return;
    setComparingLoading(true);
    try {
      const data = await api.compareScans(selectedForCompare[0], selectedForCompare[1]);
      setComparisonModal(data);
    } catch (err) {
      alert("Comparison failed: " + err.message);
    } finally {
      setComparingLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <History className="w-4 h-4" />
            <span>Local & Device Storage</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">Audit Records Database</h2>
          <p className="text-sm text-slate-400 mt-1">
            Search past website audits, filter by date ranges, compare side-by-side progression, or export compliance logs.
          </p>
          <p className="text-xs text-slate-400 mt-2 bg-slate-800/40 border border-slate-700/50 rounded-xl px-3 py-1.5 inline-block">
            ℹ️ <strong>Privacy Notice:</strong> AccessCheck AI requires no accounts or login. Scans are preserved locally on this device. Clearing your browser storage or using the "Clear All" button permanently removes this history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedForCompare.length === 2 && (
            <button
              onClick={handleExecuteCompare}
              disabled={comparingLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare Selected (2)</span>
            </button>
          )}

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearingAll}
              className="px-3 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold flex items-center gap-1"
              title="Clear all records from database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            className={`p-2.5 rounded-xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
            }`}
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('new-scan')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            New Scan
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-stretch md:items-center gap-3 ${
        theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Search URL */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by URL or domain host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-2xl pl-11 pr-4 py-2.5 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>

        {/* Date Filter Range */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`rounded-xl px-3 py-2 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
              title="Start Date"
            />
          </div>
          <span className="text-xs text-slate-500">to</span>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`rounded-xl px-3 py-2 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
              title="End Date"
            />
          </div>

          {(startDate || endDate || search) && (
            <button
              onClick={() => {
                setSearch('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 px-2 font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Comparison Helper Bar */}
      {selectedForCompare.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            <span>Select 2 scans to run differential comparison ({selectedForCompare.length}/2 selected)</span>
          </div>
          <button
            onClick={() => setSelectedForCompare([])}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* History Cards */}
      {filtered.length === 0 ? (
        <div className={`p-16 rounded-3xl border text-center max-w-xl mx-auto my-8 ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <History className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold">No Audit Records Matching Filter</h3>
          <p className="text-sm text-slate-400 mt-2">
            {search || startDate || endDate 
              ? "No audits match the selected query or date interval." 
              : "No historical audits stored in SQLite yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isChecked = selectedForCompare.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => onViewAudit(item.id)}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition-all hover:scale-[1.008] ${
                  isChecked
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : theme === 'dark' 
                      ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/50' 
                      : 'bg-white border-slate-200 hover:border-indigo-400 shadow-sm'
                }`}
              >
                {/* Left Select & Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => toggleSelectForCompare(item.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                    title="Select to compare"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100 truncate">{item.url}</h4>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-500 hover:text-slate-300 shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span className="text-amber-400 font-semibold">{item.total_violations} violations</span>
                      {item.critical_count > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-red-400 font-bold">{item.critical_count} critical</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-slate-500">{item.duration_seconds}s</span>
                    </div>
                  </div>
                </div>

                {/* Right Score & Actions */}
                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className={`text-xl font-black ${
                      item.score >= 80 ? 'text-emerald-400' : item.score >= 60 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {item.score}
                    </span>
                    <span className="text-slate-500 text-xs">/100</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete audit record from SQLite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onViewAudit(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-indigo-600/20"
                    >
                      <span>Open Results</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Modal Dialog */}
      {comparisonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`max-w-4xl w-full p-6 sm:p-8 rounded-3xl border shadow-2xl max-h-[90vh] overflow-y-auto ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-inherit mb-6">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                  Differential Scan Comparison
                </span>
                <h3 className="text-xl font-bold mt-1">Cross-Scan Accessibility Delta</h3>
              </div>
              <button
                onClick={() => setComparisonModal(null)}
                className="p-2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>

            {/* Score & Violation Difference Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block">Score Difference</span>
                <span className={`text-3xl font-black ${
                  comparisonModal.comparison.score_diff >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {comparisonModal.comparison.score_diff > 0 ? `+${comparisonModal.comparison.score_diff}` : comparisonModal.comparison.score_diff} pts
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {comparisonModal.scan_a.score} → {comparisonModal.scan_b.score}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block">Violations Delta</span>
                <span className={`text-3xl font-black ${
                  comparisonModal.comparison.violation_diff <= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {comparisonModal.comparison.violation_diff}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {comparisonModal.scan_a.metrics.total_violations} → {comparisonModal.scan_b.metrics.total_violations}
                </span>
              </div>
            </div>

            {/* Fixed vs New rules */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-emerald-400 block mb-2">
                  Fixed Rules Resolved ({comparisonModal.comparison.fixed_rules.length}):
                </span>
                {comparisonModal.comparison.fixed_rules.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {comparisonModal.comparison.fixed_rules.map(r => (
                      <span key={r} className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-900 font-mono">
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No previously failing rules were resolved.</p>
                )}
              </div>

              <div>
                <span className="font-bold text-red-400 block mb-2">
                  New Violations Introduced ({comparisonModal.comparison.new_rules.length}):
                </span>
                {comparisonModal.comparison.new_rules.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {comparisonModal.comparison.new_rules.map(r => (
                      <span key={r} className="px-2.5 py-1 rounded bg-red-950 text-red-300 border border-red-900 font-mono">
                        + {r}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No new violations detected in second scan.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
