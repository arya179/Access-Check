import React, { useState } from 'react';
import { 
  FileSpreadsheet, Download, Copy, Check, FileText, 
  ExternalLink, Sparkles, Printer, CheckCircle2, ShieldCheck, 
  Clock, FileDown, Layers, Info, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function ReportsPage({ auditData, onNavigate }) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  if (!auditData) {
    return (
      <div className={`p-16 rounded-3xl border text-center max-w-xl mx-auto my-12 ${
        theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <FileSpreadsheet className="w-16 h-16 text-indigo-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-bold">No Audit Selected for Export</h3>
        <p className="text-sm text-slate-400 mt-2">
          Run an accessibility audit or pick a scan from history to generate compliance certificates, ReportLab PDFs, and CSV datasets.
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

  const { score, metrics = {}, violations = [], url, timestamp, duration_seconds, passes_count = 0, ai_summary } = auditData;

  const handleDownloadPdf = () => {
    setDownloadingFormat('pdf');
    const downloadUrl = api.getPdfDownloadUrl(auditData.id);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `AccessCheck_Audit_${auditData.id.slice(0, 8)}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingFormat(null), 1500);
  };

  const handleDownloadCsv = () => {
    setDownloadingFormat('csv');
    const downloadUrl = api.getCsvDownloadUrl(auditData.id);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `AccessCheck_Violations_${auditData.id.slice(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingFormat(null), 1500);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `AccessCheck_Audit_${auditData.id.slice(0, 8)}.json`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# Accessibility Audit Report: ${url}
Date: ${timestamp}
Overall Score: ${score}/100
WCAG Pass Rate: ${metrics.wcag_compliance_rate}%
Total Violations: ${metrics.total_violations} (Critical: ${metrics.critical_count}, Serious: ${metrics.serious_count})

## AI Summary
${ai_summary || 'Audit completed.'}

## Violations
${violations.map((v, i) => `${i + 1}. [${v.impact?.toUpperCase()}] ${v.id}: ${v.help} (${v.helpUrl})`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Enterprise Reporting Engine</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">Audit Reports & Export</h2>
          <p className="text-sm text-slate-400 mt-1">
            Generate auditor-grade ReportLab PDF certificates, Pandas CSV data, printable views, and JSON records.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingFormat === 'pdf'}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingFormat === 'pdf' ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          {/* Download CSV */}
          <button
            onClick={handleDownloadCsv}
            disabled={downloadingFormat === 'csv'}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
            }`}
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>{downloadingFormat === 'csv' ? 'Exporting...' : 'Download CSV'}</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className={`p-2.5 rounded-xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
            }`}
            title="Print report preview"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* JSON */}
          <button
            onClick={handleDownloadJson}
            className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm'
            }`}
            title="Export raw JSON"
          >
            <FileText className="w-4 h-4" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Printable Report Certificate Card */}
      <div className={`p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
        theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-inherit">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                Official AccessCheck AI Report
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">ID: {auditData.id.slice(0, 8)}</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight mt-1">{url}</h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Audited on {new Date(timestamp).toUTCString()} ({duration_seconds}s execution)</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Accessibility Score</span>
            <span className={`text-4xl font-black ${
              score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {score}
            </span>
            <span className="text-slate-500 text-sm">/ 100</span>
          </div>
        </div>

        {/* 4 Core Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-inherit">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block">WCAG Pass Rate</span>
            <span className="text-xl font-bold text-indigo-400 mt-0.5 block">{metrics.wcag_compliance_rate}%</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block">Total Violations</span>
            <span className="text-xl font-bold text-red-400 mt-0.5 block">{metrics.total_violations}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block">Passed Checks</span>
            <span className="text-xl font-bold text-emerald-400 mt-0.5 block">{passes_count} rules</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 block">Severity Breakdown</span>
            <span className="text-xs font-semibold text-slate-200 mt-1 block">
              {metrics.critical_count} crit • {metrics.serious_count} ser
            </span>
          </div>
        </div>

        {/* AI Executive Summary Block */}
        {ai_summary && (
          <div className="py-6 border-b border-inherit">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Google Gemini AI Executive Evaluation:</span>
            </span>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-indigo-950/60 font-mono">
              {ai_summary}
            </p>
          </div>
        )}

        {/* Violations Preview List */}
        <div className="py-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Discovered Violations ({violations.length})
            </span>
            <button
              onClick={() => onNavigate('results')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>Interactive View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {violations.slice(0, 5).map((v, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                  v.impact === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {v.impact || 'minor'}
                </span>
                <span className="font-mono text-indigo-300 font-bold">{v.id}</span>
                <span className="text-slate-400 truncate">{v.help}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono shrink-0">
                {v.nodes?.length || 0} nodes
              </span>
            </div>
          ))}

          {violations.length > 5 && (
            <p className="text-xs text-slate-500 text-center pt-2">
              + {violations.length - 5} additional violations included in full PDF and CSV exports.
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <div className="pt-4 border-t border-inherit flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            This report represents automated compliance testing under axe-core and Google Gemini. 
            Automated tools discover 30% - 50% of WCAG barriers. 
            Passing automated checks does not constitute official legal compliance certification.
          </span>
        </div>
      </div>
    </div>
  );
}
