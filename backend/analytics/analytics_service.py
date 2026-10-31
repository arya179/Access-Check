import json
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from typing import Dict, Any, List, Optional
import aiosqlite
from backend.core.config import settings

def _fig_to_dict(fig: go.Figure) -> Dict[str, Any]:
    """Serializes a Plotly Figure safely to a native Python dictionary without numpy arrays."""
    return json.loads(fig.to_json())

DARK_THEME_LAYOUT = {
    "paper_bgcolor": "rgba(0,0,0,0)",
    "plot_bgcolor": "rgba(0,0,0,0)",
    "font": {"color": "#94a3b8", "family": "Inter, sans-serif"},
    "margin": {"l": 30, "r": 30, "t": 50, "b": 30},
}

class AnalyticsService:
    """
    Analytics engine powered by Pandas, NumPy, and Plotly.
    Calculates metrics and constructs interactive figures using actual SQLite records.
    Never generates fake data.
    """
    def __init__(self, db_path: str = None):
        self.db_path = db_path or settings.DATABASE_PATH

    async def _load_audits_df(self) -> pd.DataFrame:
        """Loads all completed audits from SQLite into a Pandas DataFrame."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM audits ORDER BY timestamp ASC")
            rows = await cursor.fetchall()
            
            if not rows:
                return pd.DataFrame()

            records = []
            for r in rows:
                row_dict = dict(r)
                metrics = json.loads(row_dict["metrics"]) if row_dict.get("metrics") else {}
                violations = json.loads(row_dict["violations"]) if row_dict.get("violations") else []
                
                records.append({
                    "id": row_dict["id"],
                    "url": row_dict["url"],
                    "timestamp": row_dict["timestamp"],
                    "duration_seconds": row_dict["duration_seconds"],
                    "score": row_dict["score"],
                    "total_violations": metrics.get("total_violations", len(violations)),
                    "critical_count": metrics.get("critical_count", 0),
                    "serious_count": metrics.get("serious_count", 0),
                    "moderate_count": metrics.get("moderate_count", 0),
                    "minor_count": metrics.get("minor_count", 0),
                    "wcag_compliance_rate": metrics.get("wcag_compliance_rate", 100.0),
                    "passes_count": row_dict.get("passes_count", 0),
                    "incomplete_count": row_dict.get("incomplete_count", 0),
                    "inapplicable_count": row_dict.get("inapplicable_count", 0),
                    "violations": violations
                })
            
            return pd.DataFrame(records)

    async def get_overview(self) -> Dict[str, Any]:
        """
        1. Accessibility Score Gauge (Plotly Indicator)
        6. Passed vs. Failed Checks (Plotly Bar/Donut)
        """
        df = await self._load_audits_df()
        if df.empty:
            return {"empty": True, "message": "No audit records available in SQLite."}

        avg_score = float(np.round(df["score"].mean(), 1))
        latest_score = int(df["score"].iloc[-1])
        total_audits = len(df)

        # 1. Accessibility Score Gauge
        gauge_fig = go.Figure(go.Indicator(
            mode="gauge+number+delta",
            value=latest_score,
            delta={"reference": avg_score, "increasing": {"color": "#10b981"}, "decreasing": {"color": "#ef4444"}},
            title={"text": "Latest Accessibility Score (vs Average)", "font": {"size": 18, "color": "#f1f5f9"}},
            gauge={
                "axis": {"range": [0, 100], "tickwidth": 1, "tickcolor": "#475569"},
                "bar": {"color": "#6366f1"},
                "bgcolor": "rgba(15, 23, 42, 0.6)",
                "borderwidth": 2,
                "bordercolor": "#334155",
                "steps": [
                    {"range": [0, 50], "color": "rgba(239, 68, 68, 0.25)"},
                    {"range": [50, 75], "color": "rgba(245, 158, 11, 0.25)"},
                    {"range": [75, 90], "color": "rgba(99, 102, 241, 0.25)"},
                    {"range": [90, 100], "color": "rgba(16, 185, 129, 0.25)"},
                ],
                "threshold": {
                    "line": {"color": "#10b981", "width": 4},
                    "thickness": 0.75,
                    "value": 90
                }
            }
        ))
        gauge_fig.update_layout(**DARK_THEME_LAYOUT, height=350)

        # 6. Passed vs Failed checks comparison
        total_passed = int(df["passes_count"].sum())
        total_failed = int(df["total_violations"].sum())
        total_incomplete = int(df["incomplete_count"].sum())

        passed_vs_failed_fig = go.Figure(data=[
            go.Bar(
                name="Rule Evaluations",
                x=["Passed Checks", "Violations (Failed)", "Needs Review (Incomplete)"],
                y=[total_passed, total_failed, total_incomplete],
                marker_color=["#10b981", "#ef4444", "#f59e0b"],
                text=[total_passed, total_failed, total_incomplete],
                textposition="auto"
            )
        ])
        passed_vs_failed_fig.update_layout(
            **DARK_THEME_LAYOUT,
            title={"text": "Passed vs Failed Rule Checks (Cumulative)", "font": {"size": 16, "color": "#f1f5f9"}},
            yaxis={"gridcolor": "#1e293b"},
            height=350
        )

        return {
            "empty": False,
            "total_scans": total_audits,
            "average_score": avg_score,
            "latest_score": latest_score,
            "gauge_chart": _fig_to_dict(gauge_fig),
            "passed_vs_failed_chart": _fig_to_dict(passed_vs_failed_fig)
        }

    async def get_severity_analytics(self) -> Dict[str, Any]:
        """
        2. Severity distribution donut chart
        5. Most common accessibility violations
        """
        df = await self._load_audits_df()
        if df.empty:
            return {"empty": True, "message": "No audit records available in SQLite."}

        # 2. Severity Donut
        crit = int(df["critical_count"].sum())
        ser = int(df["serious_count"].sum())
        mod = int(df["moderate_count"].sum())
        minr = int(df["minor_count"].sum())

        donut_fig = go.Figure(data=[go.Pie(
            labels=["Critical", "Serious", "Moderate", "Minor"],
            values=[crit, ser, mod, minr],
            hole=0.55,
            marker_colors=["#ef4444", "#f97316", "#eab308", "#3b82f6"],
            textinfo="label+value",
            hoverinfo="label+percent+value"
        )])
        donut_fig.update_layout(
            **DARK_THEME_LAYOUT,
            title={"text": "Violations Breakdown by Severity", "font": {"size": 16, "color": "#f1f5f9"}},
            legend={"orientation": "h", "yanchor": "bottom", "y": -0.2, "xanchor": "center", "x": 0.5},
            height=350
        )

        # 5. Most common accessibility violations
        all_violations = []
        for v_list in df["violations"]:
            for item in v_list:
                all_violations.append({
                    "rule_id": item.get("id"),
                    "impact": item.get("impact", "minor"),
                    "help": item.get("help", "")
                })

        if all_violations:
            v_df = pd.DataFrame(all_violations)
            top_v = v_df["rule_id"].value_counts().head(8).reset_index()
            top_v.columns = ["rule_id", "frequency"]

            common_fig = go.Figure(go.Bar(
                x=top_v["frequency"],
                y=top_v["rule_id"],
                orientation="h",
                marker_color="#6366f1",
                text=top_v["frequency"],
                textposition="auto"
            ))
            common_fig.update_layout(
                **DARK_THEME_LAYOUT,
                title={"text": "Top Failing Accessibility Rules", "font": {"size": 16, "color": "#f1f5f9"}},
                xaxis={"gridcolor": "#1e293b", "title": "Occurrence Count"},
                yaxis={"autorange": "reversed"},
                height=350
            )
            common_chart_data = _fig_to_dict(common_fig)
        else:
            common_chart_data = None

        return {
            "empty": False,
            "critical_total": crit,
            "serious_total": ser,
            "moderate_total": mod,
            "minor_total": minr,
            "severity_donut": _fig_to_dict(donut_fig),
            "common_violations_chart": common_chart_data
        }

    async def get_history_analytics(self) -> Dict[str, Any]:
        """
        4. Accessibility score history line chart (with duration and score trend)
        """
        df = await self._load_audits_df()
        if df.empty:
            return {"empty": True, "message": "No audit records available in SQLite."}

        df["formatted_time"] = pd.to_datetime(df["timestamp"]).dt.strftime("%b %d, %H:%M")
        
        # Calculate moving average using Pandas
        window = min(3, len(df))
        df["moving_avg"] = df["score"].rolling(window=window, min_periods=1).mean().round(1)

        history_fig = go.Figure()

        # Score line
        history_fig.add_trace(go.Scatter(
            x=df["formatted_time"],
            y=df["score"],
            mode="lines+markers",
            name="Accessibility Score",
            line={"color": "#6366f1", "width": 3},
            marker={"size": 8, "color": "#818cf8"},
            hovertemplate="<b>%{x}</b><br>Score: %{y}/100<extra></extra>"
        ))

        # Moving average trendline
        history_fig.add_trace(go.Scatter(
            x=df["formatted_time"],
            y=df["moving_avg"],
            mode="lines",
            name=f"{window}-Scan Moving Avg",
            line={"color": "#10b981", "width": 2, "dash": "dash"},
            hovertemplate="Moving Avg: %{y}<extra></extra>"
        ))

        # Violations area
        history_fig.add_trace(go.Bar(
            x=df["formatted_time"],
            y=df["total_violations"],
            name="Total Violations",
            marker_color="rgba(239, 68, 68, 0.4)",
            yaxis="y2",
            hovertemplate="Violations: %{y}<extra></extra>"
        ))

        history_fig.update_layout(
            **DARK_THEME_LAYOUT,
            title={"text": "Accessibility Score & Violation Trajectory Over Time", "font": {"size": 16, "color": "#f1f5f9"}},
            yaxis={"title": "Accessibility Score (0-100)", "range": [0, 105], "gridcolor": "#1e293b"},
            yaxis2={"title": "Violations Count", "overlaying": "y", "side": "right", "showgrid": False},
            legend={"orientation": "h", "yanchor": "bottom", "y": -0.25, "xanchor": "center", "x": 0.5},
            height=380
        )

        return {
            "empty": False,
            "data_points": len(df),
            "history_chart": _fig_to_dict(history_fig)
        }

    async def get_wcag_analytics(self) -> Dict[str, Any]:
        """
        3. WCAG category / principle bar chart
        Extracts WCAG categories from actual axe tags (cat.color, cat.aria, cat.text-alternatives, etc.)
        """
        df = await self._load_audits_df()
        if df.empty:
            return {"empty": True, "message": "No audit records available in SQLite."}

        category_counts = {
            "Text Alternatives (Perceivable)": 0,
            "Color & Contrast (Perceivable)": 0,
            "Keyboard & Nav (Operable)": 0,
            "Forms & Labels (Understandable)": 0,
            "ARIA & Structure (Robust)": 0,
            "Other WCAG Rules": 0
        }

        for v_list in df["violations"]:
            for v in v_list:
                tags = v.get("tags", [])
                rule_id = v.get("id", "")
                
                if any("cat.color" in t for t in tags) or "color" in rule_id or "contrast" in rule_id:
                    category_counts["Color & Contrast (Perceivable)"] += 1
                elif any("cat.text-alternatives" in t for t in tags) or "alt" in rule_id:
                    category_counts["Text Alternatives (Perceivable)"] += 1
                elif any("cat.keyboard" in t for t in tags) or "tabindex" in rule_id or "focus" in rule_id:
                    category_counts["Keyboard & Nav (Operable)"] += 1
                elif any("cat.forms" in t for t in tags) or "label" in rule_id or "input" in rule_id:
                    category_counts["Forms & Labels (Understandable)"] += 1
                elif any("cat.aria" in t for t in tags) or "aria" in rule_id or "landmark" in rule_id:
                    category_counts["ARIA & Structure (Robust)"] += 1
                else:
                    category_counts["Other WCAG Rules"] += 1

        wcag_fig = go.Figure(go.Bar(
            x=list(category_counts.keys()),
            y=list(category_counts.values()),
            marker_color=["#6366f1", "#f97316", "#10b981", "#eab308", "#8b5cf6", "#3b82f6"],
            text=list(category_counts.values()),
            textposition="auto"
        ))
        wcag_fig.update_layout(
            **DARK_THEME_LAYOUT,
            title={"text": "Violations Distribution by WCAG Principle & Category", "font": {"size": 16, "color": "#f1f5f9"}},
            yaxis={"gridcolor": "#1e293b", "title": "Violations Discovered"},
            height=350
        )

        return {
            "empty": False,
            "category_breakdown": category_counts,
            "wcag_chart": _fig_to_dict(wcag_fig)
        }

    async def get_comparison_analytics(self) -> Dict[str, Any]:
        """
        7. Website comparison chart
        Aggregates metrics grouped by unique website hostnames.
        """
        df = await self._load_audits_df()
        if df.empty:
            return {"empty": True, "message": "No audit records available in SQLite."}

        # Clean URL to domain host
        df["domain"] = df["url"].apply(lambda u: u.replace("https://", "").replace("http://", "").split("/")[0])
        
        # Aggregate by domain using Pandas
        comparison_df = df.groupby("domain").agg({
            "score": ["mean", "max"],
            "total_violations": "mean",
            "id": "count"
        }).reset_index()

        comparison_df.columns = ["domain", "avg_score", "max_score", "avg_violations", "scan_count"]
        comparison_df["avg_score"] = comparison_df["avg_score"].round(1)
        comparison_df["avg_violations"] = comparison_df["avg_violations"].round(1)

        comp_fig = go.Figure()

        comp_fig.add_trace(go.Bar(
            x=comparison_df["domain"],
            y=comparison_df["avg_score"],
            name="Average Score",
            marker_color="#6366f1",
            text=comparison_df["avg_score"],
            textposition="auto"
        ))

        comp_fig.add_trace(go.Bar(
            x=comparison_df["domain"],
            y=comparison_df["avg_violations"],
            name="Avg Violations",
            marker_color="#f43f5e",
            text=comparison_df["avg_violations"],
            textposition="auto"
        ))

        comp_fig.update_layout(
            **DARK_THEME_LAYOUT,
            barmode="group",
            title={"text": "Cross-Website Comparative Accessibility Standing", "font": {"size": 16, "color": "#f1f5f9"}},
            yaxis={"gridcolor": "#1e293b", "title": "Value"},
            legend={"orientation": "h", "yanchor": "bottom", "y": -0.25, "xanchor": "center", "x": 0.5},
            height=380
        )

        return {
            "empty": False,
            "compared_domains": len(comparison_df),
            "comparison_chart": _fig_to_dict(comp_fig),
            "table_data": comparison_df.to_dict(orient="records")
        }

analytics_service = AnalyticsService()

