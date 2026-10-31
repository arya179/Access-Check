import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { 
  BarChart3, RefreshCw, Download, Layers, ShieldCheck, 
  TrendingUp, PieChart as PieIcon, ArrowRight, Activity, 
  HelpCircle, Eye, AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function AnalyticsPage({ stats, auditData, onNavigate }) {
  const { theme } = useTheme();
  
  // Tab state for categories
  const [activeTab, setActiveTab] = useState('overview'); // overview | severity | history | wcag | comparison
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Plotly data states directly from FastAPI backend
  const [overviewData, setOverviewData] = useState(null);
  const [severityData, setSeverityData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [wcagData, setWcagData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, sev, hist, wc, comp] = await Promise.all([
        api.getAnalyticsOverview().catch(() => null),
        api.getAnalyticsSeverity().catch(() => null),
        api.getAnalyticsHistory().catch(() => null),
        api.getAnalyticsWcag().catch(() => null),
        api.getAnalyticsComparison().catch(() => null)
      ]);

      setOverviewData(ov);
      setSeverityData(sev);
      setHistoryData(hist);
      setWcagData(wc);
      setComparisonData(comp);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = overviewData?.empty || (!overviewData && !loading);

  const plotConfig = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: 'accesscheck_analytics_chart',
      height: 500,
      width: 800,
      scale: 2
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Enterprise Analytics</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Powered by Plotly, Pandas & NumPy</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">Accessibility Intelligence Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real data distributions, moving averages, cross-domain comparisons, and WCAG category breakdown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllAnalytics}
            disabled={loading}
            className={`p-2.5 rounded-xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
            }`}
            title="Refresh analytics from SQLite"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('new-scan')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
          >
            New Scan
          </button>
        </div>
      </div>

      {/* Analytics Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto space-x-2 pb-1">
        {[
          { id: 'overview', label: '1 & 6. Overview & Ratio' },
          { id: 'severity', label: '2 & 5. Severity & Top Violations' },
          { id: 'history', label: '4. Score Trajectory & Trends' },
          { id: 'wcag', label: '3. WCAG Category Distribution' },
          { id: 'comparison', label: '7. Cross-Domain Comparison' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State Banner if no scans exist */}
      {isEmpty && !loading ? (
        <div className={`p-16 rounded-3xl border text-center max-w-xl mx-auto my-12 ${
          theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <BarChart3 className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold">No Audit History Recorded</h3>
          <p className="text-sm text-slate-400 mt-2">
            Execute real website scans to generate interactive Plotly graphs, compliance trends, and comparative benchmarks.
          </p>
          <button
            onClick={() => onNavigate('new-scan')}
            className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
          >
            Start First Scan
          </button>
        </div>
      ) : loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw className="w-10 h-10 animate-spin text-indigo-400" />
          <p className="text-sm font-semibold text-slate-200">Loading Plotly Analytics Pipeline...</p>
          <p className="text-xs text-slate-400">Processing dataframes with Pandas & NumPy.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* TAB 1: Overview & Passed vs Failed */}
          {activeTab === 'overview' && overviewData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. Score Gauge */}
              <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between ${
                theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-full flex items-center justify-between pb-3 border-b border-inherit mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    1. Accessibility Score Gauge
                  </h3>
                  <span className="text-xs text-slate-500">Plotly Indicator</span>
                </div>
                {overviewData.gauge_chart && (
                  <div className="w-full flex justify-center py-2">
                    <Plot
                      data={overviewData.gauge_chart.data}
                      layout={{
                        ...overviewData.gauge_chart.layout,
                        autosize: true,
                        width: undefined,
                        height: 350
                      }}
                      useResizeHandler={true}
                      style={{ width: '100%', height: '100%' }}
                      config={plotConfig}
                    />
                  </div>
                )}
                <p className="text-xs text-slate-500 text-center mt-2">
                  Delta compares latest audit against total mean of all recorded scans ({overviewData.average_score}/100).
                </p>
              </div>

              {/* 6. Passed vs Failed Checks */}
              <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between ${
                theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-full flex items-center justify-between pb-3 border-b border-inherit mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    6. Passed vs. Failed Rule Checks
                  </h3>
                  <span className="text-xs text-slate-500">Cumulative Ratio</span>
                </div>
                {overviewData.passed_vs_failed_chart && (
                  <div className="w-full flex justify-center py-2">
                    <Plot
                      data={overviewData.passed_vs_failed_chart.data}
                      layout={{
                        ...overviewData.passed_vs_failed_chart.layout,
                        autosize: true,
                        width: undefined,
                        height: 350
                      }}
                      useResizeHandler={true}
                      style={{ width: '100%', height: '100%' }}
                      config={plotConfig}
                    />
                  </div>
                )}
                <p className="text-xs text-slate-500 text-center mt-2">
                  Sum of verified pass outcomes versus failing DOM violations.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Severity Donut & Most Common Violations */}
          {activeTab === 'severity' && severityData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 2. Severity Donut */}
              <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between ${
                theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-full flex items-center justify-between pb-3 border-b border-inherit mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    2. Severity Distribution Donut
                  </h3>
                  <span className="text-xs text-slate-500">Plotly Pie</span>
                </div>
                {severityData.severity_donut && (
                  <div className="w-full flex justify-center py-2">
                    <Plot
                      data={severityData.severity_donut.data}
                      layout={{
                        ...severityData.severity_donut.layout,
                        autosize: true,
                        width: undefined,
                        height: 350
                      }}
                      useResizeHandler={true}
                      style={{ width: '100%', height: '100%' }}
                      config={plotConfig}
                    />
                  </div>
                )}
                <div className="w-full pt-3 border-t border-inherit flex items-center justify-around text-xs text-slate-400">
                  <span className="text-red-400">{severityData.critical_total} Critical</span>
                  <span className="text-orange-400">{severityData.serious_total} Serious</span>
                  <span className="text-yellow-400">{severityData.moderate_total} Moderate</span>
                  <span className="text-blue-400">{severityData.minor_total} Minor</span>
                </div>
              </div>

              {/* 5. Most Common Violations */}
              <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between ${
                theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="w-full flex items-center justify-between pb-3 border-b border-inherit mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    5. Most Common Rule Violations
                  </h3>
                  <span className="text-xs text-slate-500">Horizontal Ranking</span>
                </div>
                {severityData.common_violations_chart ? (
                  <div className="w-full flex justify-center py-2">
                    <Plot
                      data={severityData.common_violations_chart.data}
                      layout={{
                        ...severityData.common_violations_chart.layout,
                        autosize: true,
                        width: undefined,
                        height: 350
                      }}
                      useResizeHandler={true}
                      style={{ width: '100%', height: '100%' }}
                      config={plotConfig}
                    />
                  </div>
                ) : (
                  <div className="py-24 text-xs text-slate-500 text-center">
                    No violation occurrences to rank.
                  </div>
                )}
                <p className="text-xs text-slate-500 text-center mt-2">
                  Frequent failing rules aggregated across all tested domains.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: History Line Chart & Moving Average */}
          {activeTab === 'history' && historyData && (
            <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between ${
              theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-full flex items-center justify-between pb-3 border-b border-inherit mb-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    4. Accessibility Score History & Moving Average
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Calculated using NumPy and Pandas rolling statistics</p>
                </div>
                <span className="text-xs text-slate-500">{historyData.data_points} Audit Events</span>
              </div>
              {historyData.history_chart && (
                <div className="w-full py-2">
                  <Plot
                    data={historyData.history_chart.data}
                    layout={{
                      ...historyData.history_chart.layout,
                      autosize: true,
                      width: undefined,
                      height: 380
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={plotConfig}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WCAG Principle Category Bar Chart */}
          {activeTab === 'wcag' && wcagData && (
            <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between ${
              theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-full flex items-center justify-between pb-3 border-b border-inherit mb-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    3. WCAG Category & Principle Distribution
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Failing rules categorized by Perceivable, Operable, Understandable, and Robust</p>
                </div>
                <span className="text-xs text-slate-500">Axe Rule Tags</span>
              </div>
              {wcagData.wcag_chart && (
                <div className="w-full py-2">
                  <Plot
                    data={wcagData.wcag_chart.data}
                    layout={{
                      ...wcagData.wcag_chart.layout,
                      autosize: true,
                      width: undefined,
                      height: 360
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={plotConfig}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Website Comparison Chart */}
          {activeTab === 'comparison' && comparisonData && (
            <div className={`p-6 rounded-3xl border flex flex-col items-center justify-between ${
              theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-full flex items-center justify-between pb-3 border-b border-inherit mb-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    7. Cross-Website Comparative Benchmark
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Compares average score and average violations per unique domain host</p>
                </div>
                <span className="text-xs text-slate-500">{comparisonData.compared_domains} Unique Domains</span>
              </div>
              {comparisonData.comparison_chart && (
                <div className="w-full py-2">
                  <Plot
                    data={comparisonData.comparison_chart.data}
                    layout={{
                      ...comparisonData.comparison_chart.layout,
                      autosize: true,
                      width: undefined,
                      height: 380
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={plotConfig}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
