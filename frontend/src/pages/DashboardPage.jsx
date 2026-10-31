import React, { useState } from 'react';
import { 
  ShieldCheck, ScanSearch, AlertTriangle, AlertCircle, 
  ArrowRight, Activity, TrendingUp, Sparkles, ExternalLink, 
  Clock, CheckCircle, BarChart3, ChevronRight, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

export default function DashboardPage({ 
  stats, 
  history, 
  loading = false,
  scanStatus = '',
  scanError = null,
  onStartScan, 
  onViewAudit, 
  onNavigate 
}) {
  const { theme } = useTheme();
  const [quickUrl, setQuickUrl] = useState('');

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    if (quickUrl.trim()) {
      onStartScan(quickUrl.trim());
    }
  };

  const hasScans = stats && stats.total_scans > 0;

  // Chart data from real past scans (no fake data)
  const chartData = [
    { name: 'Critical', count: stats?.critical_issues || 0, color: '#ef4444' },
    { name: 'Serious', count: stats?.serious_issues || 0, color: '#f97316' },
    { name: 'Moderate', count: stats?.moderate_issues || 0, color: '#eab308' },
    { name: 'Minor', count: stats?.minor_issues || 0, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Quick Scan Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-8 border ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-slate-800' 
          : 'bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 border-slate-200'
      } shadow-2xl`}>
        {/* Glow accent */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>AI-Powered Automated WCAG 2.1 Audits</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>No Account or Sign-In Required</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Audit, Remediate & Comply with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
              AccessCheck AI
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Run genuine Chromium and Deque Axe-core tests against web applications, uncover exact failing HTML nodes, and receive instantaneous Google Gemma 4 code fixes.
          </p>

          <form onSubmit={handleQuickSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <label htmlFor="dashboard-scan-url" className="sr-only">Target website URL to audit</label>
              <ScanSearch className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" aria-hidden="true" />
              <input
                id="dashboard-scan-url"
                type="text"
                disabled={loading}
                placeholder="https://yourwebsite.com"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                className={`w-full rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border disabled:opacity-60 disabled:cursor-not-allowed ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-700/80 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-sm'
                }`}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Scan Website</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Running Scan Status Indicator */}
          {loading && (
            <div className="mt-4 p-4 rounded-2xl border border-indigo-500/40 bg-indigo-950/40 backdrop-blur-md flex items-center gap-3.5 text-indigo-200 text-sm animate-pulse" role="status" aria-live="polite">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold text-white">Accessibility Audit In Progress</p>
                <p className="text-xs text-indigo-300">{scanStatus || 'Launching Google Chrome, evaluating WCAG rules...'}</p>
              </div>
            </div>
          )}

          {scanError && !loading && (
            <div className="mt-4 p-3.5 rounded-2xl border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs flex items-center gap-2.5" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" aria-hidden="true" />
              <span>{scanError}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Core KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Scans */}
        <div className={`p-6 rounded-2xl border transition-all hover:border-indigo-500/50 ${
          theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <span>Total Scans</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <ScanSearch className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{stats?.total_scans || 0}</span>
            <span className="text-xs text-slate-400">audits completed</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Live counts from persistent SQLite records</p>
        </div>

        {/* Average Score */}
        <div className={`p-6 rounded-2xl border transition-all hover:border-emerald-500/50 ${
          theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <span>Average Accessibility Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tracking-tight ${
              stats?.avg_score >= 80 ? 'text-emerald-400' : stats?.avg_score >= 60 ? 'text-amber-400' : 'text-slate-200'
            }`}>
              {stats?.avg_score ? `${stats.avg_score}` : '--'}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Mean weighted compliance across sites</p>
        </div>

        {/* Total Violations */}
        <div className={`p-6 rounded-2xl border transition-all hover:border-amber-500/50 ${
          theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <span>WCAG Violations</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-amber-400">{stats?.total_violations || 0}</span>
            <span className="text-xs text-slate-400">detected issues</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Total failures across all WCAG rules</p>
        </div>

        {/* Critical Issues */}
        <div className={`p-6 rounded-2xl border transition-all hover:border-red-500/50 ${
          theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <span>Critical Issues</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-red-400">{stats?.critical_issues || 0}</span>
            <span className="text-xs text-slate-400">blockers</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Severe assistive tech incompatibilities</p>
        </div>
      </div>

      {/* Two Column Layout: Analytics Preview & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Analytics Preview Card */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base">Violations Severity Breakdown</h3>
                <p className="text-xs text-slate-400">Aggregate distribution from all recorded scans</p>
              </div>
              <button
                onClick={() => onNavigate('analytics')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                aria-label="View complete analytics dashboard"
              >
                <span>Full Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {hasScans ? (
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                        borderColor: '#334155', 
                        borderRadius: '0.75rem', 
                        color: theme === 'dark' ? '#fff' : '#000' 
                      }} 
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/80 rounded-2xl">
                <BarChart3 className="w-10 h-10 text-slate-500 mb-2" aria-hidden="true" />
                <p className="text-sm font-semibold text-slate-200">No Analytics Yet</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Run your first website audit above to generate real accessibility distribution charts.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>WCAG 2.1 (A, AA) Compliance</span>
            <span className="font-semibold text-indigo-400">Standard Rule Set</span>
          </div>
        </div>

        {/* Recent Scans Card */}
        <div className={`p-6 rounded-3xl border flex flex-col justify-between ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base">Recent Audit History</h3>
                <p className="text-xs text-slate-400">Latest website evaluations stored in SQLite</p>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                aria-label="View all scan history records"
              >
                <span>View All ({history.length})</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {history && history.length > 0 ? (
              <div className="space-y-3">
                {history.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.01] ${
                      theme === 'dark' 
                        ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700' 
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <h4 className="text-xs font-bold truncate text-slate-200">{item.url}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span className="text-amber-400">{item.total_violations} violations</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${
                        item.score >= 80 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : item.score >= 60 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {item.score}/100
                      </span>
                      <button
                        onClick={() => onViewAudit(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/80 rounded-2xl">
                <Clock className="w-10 h-10 text-slate-500 mb-2" aria-hidden="true" />
                <p className="text-sm font-semibold text-slate-200">No Audits Recorded</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  You haven't scanned any websites yet. Enter a URL above to start your first evaluation.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Historical Log</span>
            <span className="text-slate-400">Persisted locally in SQLite</span>
          </div>
        </div>
      </div>
    </div>
  );
}
