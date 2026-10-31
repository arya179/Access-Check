import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { api } from './services/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import NewScanPage from './pages/NewScanPage';
import ScanResultsPage from './pages/ScanResultsPage';
import AiFixAssistantPage from './pages/AiFixAssistantPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ScanHistoryPage from './pages/ScanHistoryPage';
import WcagGuidelinesPage from './pages/WcagGuidelinesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';

function MainApp() {
  const { theme } = useTheme();
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemma-4-26b-a4b-it');
  
  // Connection & Health status state machine
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connected' | 'disconnected' | 'connecting'
  const [healthStatus, setHealthStatus] = useState(null);
  
  // Real scanner state machine
  const [loading, setLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [error, setError] = useState(null);
  const [lastFailedPayload, setLastFailedPayload] = useState(null);
  
  // Persistent data state
  const [auditData, setAuditData] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedViolationForFix, setSelectedViolationForFix] = useState(null);

  useEffect(() => {
    initAppConnection();

    // Browser back/forward navigation support via popstate
    const handlePopState = (e) => {
      if (e.state && e.state.page) {
        setActivePage(e.state.page);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page) => {
    setActivePage(page);
    window.history.pushState({ page }, '', `#${page}`);
  };

  const initAppConnection = async () => {
    setConnectionStatus('connecting');
    const isHealthy = await checkHealth();
    if (isHealthy) {
      await Promise.all([fetchHistory(), fetchAnalytics()]);
    }
  };

  const checkHealth = async () => {
    try {
      const data = await api.checkHealth();
      setHealthStatus(data);
      setConnectionStatus('connected');
      return true;
    } catch (err) {
      setConnectionStatus('disconnected');
      setHealthStatus(null);
      return false;
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await api.getHistory();
      setHistory(data || []);
    } catch (err) {
      // If disconnected, don't flood console
      if (connectionStatus !== 'disconnected') {
        console.warn("Failed to load audit history:", err.message);
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await api.getAnalyticsSummary();
      setStats(data || null);
    } catch (err) {
      if (connectionStatus !== 'disconnected') {
        console.warn("Failed to load analytics summary:", err.message);
      }
    }
  };

  const handleRunScan = async (scanPayload) => {
    setLoading(true);
    setError(null);
    setLastFailedPayload(scanPayload);
    setScanStatus('Launching Google Chrome & Navigating to URL...');

    try {
      const timer = setTimeout(() => {
        setScanStatus('Injecting local axe-core & evaluating WCAG 2.1 rules...');
      }, 4000);

      const timer2 = setTimeout(() => {
        setScanStatus('Awaiting axe results & executing Gemma 4 AI remediation...');
      }, 10000);

      const data = await api.scanWebsite(scanPayload);
      clearTimeout(timer);
      clearTimeout(timer2);

      setAuditData(data);
      setLastFailedPayload(null);
      setScanStatus('');
      navigateTo('results');

      await Promise.all([fetchHistory(), fetchAnalytics()]);
    } catch (err) {
      setScanStatus('');
      setError(err.message || 'Scan failed to complete');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryScan = () => {
    if (lastFailedPayload) {
      handleRunScan(lastFailedPayload);
    }
  };

  const handleViewAudit = async (id) => {
    setLoading(true);
    try {
      const data = await api.getAuditById(id);
      setAuditData(data);
      setActivePage('results');
    } catch (err) {
      console.error("Failed to fetch audit details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAudit = async (id) => {
    try {
      await api.deleteAudit(id);
      if (auditData?.id === id) {
        setAuditData(null);
      }
      await Promise.all([fetchHistory(), fetchAnalytics()]);
    } catch (err) {
      console.error("Failed to delete audit:", err);
    }
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Dashboard';
      case 'new-scan': return 'Website Scanner';
      case 'results': return 'Accessibility Audit Findings';
      case 'ai-assistant': return 'AI Fix Assistant';
      case 'analytics': return 'Accessibility Analytics';
      case 'history': return 'Scan History';
      case 'wcag': return 'WCAG Learning Center';
      case 'reports': return 'Compliance Reports';
      case 'settings': return 'Platform Settings';
      case 'about': return 'About AccessCheck AI';
      default: return 'Dashboard';
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors ${
      theme === 'dark' ? 'bg-[#0a0e17] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={navigateTo}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setIsMobileOpen(true)}
          connectionStatus={connectionStatus}
          healthStatus={healthStatus}
          activePageTitle={getPageTitle()}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onRetryConnection={initAppConnection}
        />

        {connectionStatus === 'disconnected' && (
          <div className="mx-6 mt-4 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-sm flex items-center justify-between text-rose-300 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>
                <strong>Backend Unreachable:</strong> FastAPI is currently offline or refusing connections at <code className="text-rose-200 bg-rose-950/60 px-1.5 py-0.5 rounded">http://localhost:8000</code>. Please check that uvicorn is running.
              </span>
            </div>
            <button
              onClick={initAppConnection}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              Retry Connection
            </button>
          </div>
        )}

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {activePage === 'dashboard' && (
            <DashboardPage
              stats={stats}
              history={history}
              loading={loading}
              scanStatus={scanStatus}
              scanError={error}
              onStartScan={(url) => {
                handleRunScan({
                  url,
                  tags: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
                  generate_ai_remediation: true,
                  model_override: selectedModel
                });
              }}
              onViewAudit={handleViewAudit}
              onNavigate={navigateTo}
            />
          )}

          {activePage === 'new-scan' && (
            <NewScanPage
              onRunScan={handleRunScan}
              loading={loading}
              error={error}
              scanStatus={scanStatus}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              lastFailedPayload={lastFailedPayload}
              onRetry={handleRetryScan}
            />
          )}

          {activePage === 'results' && (
            <ScanResultsPage
              auditData={auditData}
              onNavigate={navigateTo}
              onInspectAiFix={(violation) => {
                setSelectedViolationForFix(violation);
                navigateTo('ai-assistant');
              }}
            />
          )}

          {activePage === 'ai-assistant' && (
            <AiFixAssistantPage
              auditData={auditData}
              selectedViolation={selectedViolationForFix}
              onNavigate={setActivePage}
              selectedModel={selectedModel}
            />
          )}

          {activePage === 'analytics' && (
            <AnalyticsPage
              stats={stats}
              auditData={auditData}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'history' && (
            <ScanHistoryPage
              history={history}
              onViewAudit={handleViewAudit}
              onDeleteAudit={handleDeleteAudit}
              onRefresh={() => {
                fetchHistory();
                fetchAnalytics();
              }}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'wcag' && (
            <WcagGuidelinesPage
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'reports' && (
            <ReportsPage
              auditData={auditData}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              healthStatus={healthStatus}
            />
          )}

          {activePage === 'about' && <AboutPage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
