import json
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from typing import Dict, Any, List

def _fig_to_dict(fig: go.Figure) -> Dict[str, Any]:
    return json.loads(fig.to_json())

class AccessibilityAnalytics:
    """
    Generates interactive Plotly visualizations and metrics distribution
    for accessibility audit results.
    """
    @staticmethod
    def generate_impact_distribution_chart(metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a Plotly donut chart representing violations breakdown by severity.
        """
        labels = ["Critical", "Serious", "Moderate", "Minor"]
        values = [
            metrics.get("critical_count", 0),
            metrics.get("serious_count", 0),
            metrics.get("moderate_count", 0),
            metrics.get("minor_count", 0)
        ]
        colors = ["#ef4444", "#f97316", "#eab308", "#3b82f6"]

        fig = go.Figure(data=[go.Pie(
            labels=labels,
            values=values,
            hole=0.6,
            marker_colors=colors,
            textinfo="label+value",
            hoverinfo="label+percent"
        )])

        fig.update_layout(
            title_text="Violations by Impact Severity",
            showlegend=True,
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#94a3b8"),
            margin=dict(l=20, r=20, t=40, b=20)
        )

        return _fig_to_dict(fig)

    @staticmethod
    def generate_wcag_compliance_chart(passes: int, violations: int, incomplete: int) -> Dict[str, Any]:
        """
        Creates a bar chart comparing passing rules vs violations.
        """
        categories = ["Passed Rules", "Violations", "Needs Review"]
        counts = [passes, violations, incomplete]
        colors = ["#10b981", "#ef4444", "#f59e0b"]

        fig = go.Figure([go.Bar(
            x=categories,
            y=counts,
            marker_color=colors,
            text=counts,
            textposition="auto"
        )])

        fig.update_layout(
            title_text="Axe Rule Evaluation Status",
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(color="#94a3b8"),
            margin=dict(l=20, r=20, t=40, b=20),
            yaxis=dict(gridcolor="#334155")
        )

        return _fig_to_dict(fig)

