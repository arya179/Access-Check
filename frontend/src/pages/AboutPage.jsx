import React, { useState, useEffect } from 'react';
import { 
  Info, ShieldCheck, Cpu, Code2, Globe, Heart, 
  Layers, ExternalLink, GitBranch, RefreshCw 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AboutPage() {
  const { theme } = useTheme();
  const [graphifyData, setGraphifyData] = useState(null);
  const [loadingGraph, setLoadingGraph] = useState(false);

  useEffect(() => {
    fetchGraphify();
  }, []);

  const fetchGraphify = async () => {
    setLoadingGraph(true);
    try {
      const data = await api.getSystemGraph();
      if (data) {
        setGraphifyData(data);
      }
    } catch (err) {
      console.error("Failed to load graphify data:", err);
    } finally {
      setLoadingGraph(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero / About Brand */}
      <div className={`p-8 rounded-3xl border relative overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-900/40' 
          : 'bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 border-slate-200'
      } shadow-xl`}>
        <div className="flex items-center gap-3.5 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">AccessCheck AI</h2>
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              Autonomous Accessibility Intelligence Platform
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          AccessCheck AI is engineered to automate and demystify WCAG 2.1 Level AA web accessibility compliance. 
          By combining headless Chromium automation through Playwright with Deque's trusted Axe-core engine and 
          Google Gemma 4's code generation, developers receive immediate, verified remediation solutions.
        </p>
      </div>

      {/* Technology Stack Grid */}
      <div>
        <h3 className="text-base font-bold mb-4">Core Technology Stack</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { title: "Frontend Architecture", desc: "React + Vite, Tailwind CSS, Recharts, Plotly.js, Lucide Icons", icon: Globe },
            { title: "Backend Engine", desc: "FastAPI, Uvicorn, Pydantic, Python AsyncIO", icon: Cpu },
            { title: "Auditing Core", desc: "Playwright Chromium + Deque Axe-core (WCAG 2.1 AA)", icon: ShieldCheck },
            { title: "AI Remediation", desc: "Google GenAI SDK (Gemma 4 26B A4B IT)", icon: Code2 },
            { title: "Persistence Layer", desc: "SQLite via aiosqlite asynchronous driver", icon: Layers },
            { title: "Architecture Mapping", desc: "Graphify System Topology & Artifact Tracker", icon: GitBranch },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${
                  theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-100">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graphify Architecture Visual Card */}
      <div className={`p-6 rounded-3xl border ${
        theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-400" />
              <span>Graphify System Architecture</span>
            </h3>
            <p className="text-xs text-slate-400">Topology mapped to /graphify-out/graph_architecture.json</p>
          </div>
          <button
            onClick={fetchGraphify}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            title="Refresh graph"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingGraph ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {graphifyData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {graphifyData.nodes.map((node) => (
                <div key={node.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-900">
                    {node.group}
                  </span>
                  <span className="font-bold text-xs block text-slate-200 mt-1">{node.label}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Interaction Pipeline:
              </span>
              {graphifyData.links.map((link, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-400">
                  <span className="text-indigo-400 font-semibold">{link.source}</span>
                  <span>→</span>
                  <span className="text-emerald-400 font-semibold">{link.target}</span>
                  <span className="text-slate-600 font-mono text-[11px]">({link.relationship})</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">Loading system architecture...</div>
        )}
      </div>

      {/* Footer credits */}
      <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-800/60">
        AccessCheck AI • Open Source Hackathon Edition • WCAG 2.1 Level AA Standard Compliant
      </div>
    </div>
  );
}

