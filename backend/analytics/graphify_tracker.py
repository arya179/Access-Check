import os
import json
from typing import Dict, Any, List

class GraphifyTracker:
    """
    Codebase and architecture visualization utility.
    Analyzes project modules, relationships, and writes graph visualization artifacts.
    """
    def __init__(self, root_dir: str, output_dir: str):
        self.root_dir = root_dir
        self.output_dir = output_dir

    def scan_project_structure(self) -> Dict[str, Any]:
        """
        Scans project hierarchy excluding virtual environments and node modules.
        """
        structure = {"name": "AccessCheck-AI", "type": "root", "children": []}
        ignore_dirs = {"venv", ".venv", "node_modules", ".git", "__pycache__", ".vite", "dist"}

        for item in os.listdir(self.root_dir):
            if item in ignore_dirs:
                continue
            item_path = os.path.join(self.root_dir, item)
            if os.path.isdir(item_path):
                sub_children = []
                for sub in os.listdir(item_path):
                    if sub in ignore_dirs:
                        continue
                    sub_children.append({"name": sub, "type": "directory" if os.path.isdir(os.path.join(item_path, sub)) else "file"})
                structure["children"].append({
                    "name": item,
                    "type": "directory",
                    "children": sub_children
                })
            else:
                structure["children"].append({"name": item, "type": "file"})

        return structure

    def generate_graph_data(self) -> Dict[str, Any]:
        """
        Creates node and link graph data of the AccessCheck AI architecture.
        """
        nodes = [
            {"id": "Client", "group": "frontend", "label": "React Vite UI", "description": "Interactive Web Auditor & Dashboard"},
            {"id": "FastAPI", "group": "backend", "label": "FastAPI Gateway", "description": "Asynchronous REST API"},
            {"id": "AxeScanner", "group": "backend", "label": "Playwright + Axe Scanner", "description": "Real Chromium Headless Engine"},
            {"id": "GeminiAI", "group": "ai", "label": "Google Gemini 2.5 Flash", "description": "Remediation & WCAG Code Generator"},
            {"id": "PlotlyAnalytics", "group": "analytics", "label": "Plotly Engine", "description": "Interactive Visualization Data"},
            {"id": "SQLite", "group": "storage", "label": "SQLite Store", "description": "Persistent Audit Logs & Compliance Records"},
            {"id": "Graphify", "group": "tooling", "label": "Graphify Module", "description": "Codebase Architecture & Dependency Mapper"}
        ]

        links = [
            {"source": "Client", "target": "FastAPI", "relationship": "POST /api/audit/scan"},
            {"source": "FastAPI", "target": "AxeScanner", "relationship": "dispatches URL"},
            {"source": "AxeScanner", "target": "GeminiAI", "relationship": "sends Axe violations"},
            {"source": "AxeScanner", "target": "PlotlyAnalytics", "relationship": "generates charts"},
            {"source": "FastAPI", "target": "SQLite", "relationship": "stores results"},
            {"source": "FastAPI", "target": "Graphify", "relationship": "reads project graph"}
        ]

        graph_payload = {
            "nodes": nodes,
            "links": links,
            "structure": self.scan_project_structure()
        }

        os.makedirs(self.output_dir, exist_ok=True)
        graph_file = os.path.join(self.output_dir, "graph_architecture.json")
        with open(graph_file, "w", encoding="utf-8") as f:
            json.dump(graph_payload, f, indent=2)

        return graph_payload

