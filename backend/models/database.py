import aiosqlite
import json
import logging
from typing import List, Optional, Dict, Any
from backend.core.config import settings

logger = logging.getLogger(__name__)

class Database:
    """
    Persistent relational SQLite database manager for AccessCheck AI.
    Features normalized tables:
    - scans: stores core scan metadata, score, metrics, and full scan JSON.
    - violations: stores individual axe-core violations with CSS selectors and HTML.
    - ai_recommendations: stores structured Gemini AI fixes per scan and rule.
    """
    def __init__(self, db_path: str = None):
        self.db_path = db_path or settings.DATABASE_PATH
        self._initialized = False

    async def init_db(self):
        """Initializes tables and indexes for persistent storage."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("PRAGMA foreign_keys = ON;")

            # 1. Scans Table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS scans (
                    id TEXT PRIMARY KEY,
                    url TEXT NOT NULL,
                    domain TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    duration_seconds REAL NOT NULL,
                    score INTEGER NOT NULL,
                    total_violations INTEGER DEFAULT 0,
                    critical_count INTEGER DEFAULT 0,
                    serious_count INTEGER DEFAULT 0,
                    moderate_count INTEGER DEFAULT 0,
                    minor_count INTEGER DEFAULT 0,
                    passes_count INTEGER DEFAULT 0,
                    incomplete_count INTEGER DEFAULT 0,
                    inapplicable_count INTEGER DEFAULT 0,
                    wcag_compliance_rate REAL DEFAULT 100.0,
                    metrics_json TEXT NOT NULL,
                    full_scan_json TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # 2. Violations Table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS violations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    scan_id TEXT NOT NULL,
                    rule_id TEXT NOT NULL,
                    impact TEXT NOT NULL,
                    description TEXT,
                    help TEXT,
                    help_url TEXT,
                    tags_json TEXT,
                    nodes_json TEXT,
                    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
                );
            """)

            # 3. AI Recommendations Table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS ai_recommendations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    scan_id TEXT NOT NULL,
                    rule_id TEXT NOT NULL,
                    recommendation_text TEXT NOT NULL,
                    structured_json TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
                );
            """)

            # Backward-compatible audits table
            await db.execute("""
                CREATE TABLE IF NOT EXISTS audits (
                    id TEXT PRIMARY KEY,
                    url TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    duration_seconds REAL NOT NULL,
                    score INTEGER NOT NULL,
                    metrics TEXT NOT NULL,
                    violations TEXT NOT NULL,
                    passes_count INTEGER DEFAULT 0,
                    incomplete_count INTEGER DEFAULT 0,
                    inapplicable_count INTEGER DEFAULT 0,
                    ai_summary TEXT,
                    ai_remediations TEXT,
                    graph_data TEXT
                );
            """)

            # Performance indexes
            await db.execute("CREATE INDEX IF NOT EXISTS idx_scans_url ON scans(url);")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_scans_timestamp ON scans(timestamp DESC);")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_violations_scan_id ON violations(scan_id);")
            await db.execute("CREATE INDEX IF NOT EXISTS idx_ai_rec_scan_id ON ai_recommendations(scan_id);")

            await db.commit()
            self._initialized = True

    async def _ensure_init(self):
        if not self._initialized:
            await self.init_db()

    async def save_audit(self, audit_dict: Dict[str, Any]):
        """Saves scan data into persistent SQLite storage."""
        await self._ensure_init()

        scan_id = audit_dict["id"]
        url = audit_dict["url"]
        domain = url.replace("https://", "").replace("http://", "").split("/")[0]
        timestamp = audit_dict["timestamp"]
        duration = audit_dict.get("duration_seconds", 0.0)
        score = audit_dict.get("score", 100)
        metrics = audit_dict.get("metrics", {})
        violations = audit_dict.get("violations", [])
        passes = audit_dict.get("passes_count", 0)
        incomplete = audit_dict.get("incomplete_count", 0)
        inapplicable = audit_dict.get("inapplicable_count", 0)
        ai_remediations = audit_dict.get("ai_remediations", {})

        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("PRAGMA foreign_keys = ON;")

            # 1. Save to scans table
            await db.execute("""
                INSERT OR REPLACE INTO scans (
                    id, url, domain, timestamp, duration_seconds, score,
                    total_violations, critical_count, serious_count, moderate_count, minor_count,
                    passes_count, incomplete_count, inapplicable_count, wcag_compliance_rate,
                    metrics_json, full_scan_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                scan_id, url, domain, timestamp, duration, score,
                metrics.get("total_violations", len(violations)),
                metrics.get("critical_count", 0),
                metrics.get("serious_count", 0),
                metrics.get("moderate_count", 0),
                metrics.get("minor_count", 0),
                passes, incomplete, inapplicable,
                metrics.get("wcag_compliance_rate", 100.0),
                json.dumps(metrics),
                json.dumps(audit_dict)
            ))

            # 2. Save to violations table
            await db.execute("DELETE FROM violations WHERE scan_id = ?", (scan_id,))
            for v in violations:
                await db.execute("""
                    INSERT INTO violations (scan_id, rule_id, impact, description, help, help_url, tags_json, nodes_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    scan_id,
                    v.get("id"),
                    v.get("impact", "minor"),
                    v.get("description", ""),
                    v.get("help", ""),
                    v.get("helpUrl", ""),
                    json.dumps(v.get("tags", [])),
                    json.dumps(v.get("nodes", []))
                ))

            # 3. Save to ai_recommendations table
            await db.execute("DELETE FROM ai_recommendations WHERE scan_id = ?", (scan_id,))
            for rule_id, rec in ai_remediations.items():
                await db.execute("""
                    INSERT INTO ai_recommendations (scan_id, rule_id, recommendation_text)
                    VALUES (?, ?, ?)
                """, (scan_id, rule_id, str(rec)))

            # 4. Save to audits table
            await db.execute("""
                INSERT OR REPLACE INTO audits (
                    id, url, timestamp, duration_seconds, score,
                    metrics, violations, passes_count, incomplete_count,
                    inapplicable_count, ai_summary, ai_remediations, graph_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                scan_id, url, timestamp, duration, score,
                json.dumps(metrics),
                json.dumps(violations),
                passes, incomplete, inapplicable,
                audit_dict.get("ai_summary", ""),
                json.dumps(ai_remediations),
                json.dumps(audit_dict.get("graph_data", {}))
            ))

            await db.commit()

    async def get_audit(self, scan_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves full scan JSON by ID."""
        await self._ensure_init()
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT full_scan_json FROM scans WHERE id = ?", (scan_id,))
            row = await cursor.fetchone()
            if row and row["full_scan_json"]:
                return json.loads(row["full_scan_json"])
            
            cursor = await db.execute("SELECT * FROM audits WHERE id = ?", (scan_id,))
            audit_row = await cursor.fetchone()
            if not audit_row:
                return None
            data = dict(audit_row)
            data["metrics"] = json.loads(data["metrics"]) if data["metrics"] else {}
            data["violations"] = json.loads(data["violations"]) if data["violations"] else []
            data["ai_remediations"] = json.loads(data["ai_remediations"]) if data["ai_remediations"] else {}
            data["graph_data"] = json.loads(data["graph_data"]) if data["graph_data"] else {}
            return data

    async def list_audits(
        self,
        search: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Queries scans with optional search and date filters."""
        await self._ensure_init()
        query = """
            SELECT id, url, domain, timestamp, score, duration_seconds,
                   total_violations, critical_count, serious_count, moderate_count, minor_count,
                   passes_count, incomplete_count, wcag_compliance_rate
            FROM scans
            WHERE 1=1
        """
        params = []

        if search:
            query += " AND (url LIKE ? OR domain LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%"])

        if start_date:
            query += " AND timestamp >= ?"
            params.append(start_date)

        if end_date:
            query += " AND timestamp <= ?"
            params.append(end_date)

        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)

        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(query, tuple(params))
            rows = await cursor.fetchall()
            
            if rows:
                return [dict(r) for r in rows]

            # Fallback
            cursor = await db.execute("SELECT id, url, timestamp, score, metrics, duration_seconds, passes_count FROM audits ORDER BY timestamp DESC LIMIT ?", (limit,))
            audit_rows = await cursor.fetchall()
            results = []
            for item in audit_rows:
                r = dict(item)
                metrics = json.loads(r["metrics"]) if r.get("metrics") else {}
                results.append({
                    "id": r["id"],
                    "url": r["url"],
                    "domain": r["url"].replace("https://", "").replace("http://", "").split("/")[0],
                    "timestamp": r["timestamp"],
                    "score": r["score"],
                    "duration_seconds": r.get("duration_seconds", 0),
                    "total_violations": metrics.get("total_violations", 0),
                    "critical_count": metrics.get("critical_count", 0),
                    "serious_count": metrics.get("serious_count", 0),
                    "moderate_count": metrics.get("moderate_count", 0),
                    "minor_count": metrics.get("minor_count", 0),
                    "passes_count": r.get("passes_count", 0),
                    "wcag_compliance_rate": metrics.get("wcag_compliance_rate", 100.0)
                })
            return results

    async def delete_audit(self, scan_id: str) -> bool:
        """Deletes an individual scan and cascading records."""
        await self._ensure_init()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("PRAGMA foreign_keys = ON;")
            cursor1 = await db.execute("DELETE FROM scans WHERE id = ?", (scan_id,))
            cursor2 = await db.execute("DELETE FROM audits WHERE id = ?", (scan_id,))
            await db.commit()
            return cursor1.rowcount > 0 or cursor2.rowcount > 0

    async def clear_all_history(self) -> int:
        """Clears all audit records from SQLite."""
        await self._ensure_init()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("PRAGMA foreign_keys = ON;")
            cursor = await db.execute("DELETE FROM scans;")
            await db.execute("DELETE FROM audits;")
            await db.commit()
            return cursor.rowcount

    async def compare_scans(self, scan_id_a: str, scan_id_b: str) -> Optional[Dict[str, Any]]:
        """Compares two historical scans side-by-side."""
        await self._ensure_init()
        scan_a = await self.get_audit(scan_id_a)
        scan_b = await self.get_audit(scan_id_b)

        if not scan_a or not scan_b:
            return None

        score_diff = scan_b["score"] - scan_a["score"]
        violation_diff = scan_b["metrics"]["total_violations"] - scan_a["metrics"]["total_violations"]

        rules_a = set(v["id"] for v in scan_a.get("violations", []))
        rules_b = set(v["id"] for v in scan_b.get("violations", []))

        fixed_rules = list(rules_a - rules_b)
        new_rules = list(rules_b - rules_a)
        persistent_rules = list(rules_a & rules_b)

        return {
            "scan_a": scan_a,
            "scan_b": scan_b,
            "comparison": {
                "score_diff": score_diff,
                "violation_diff": violation_diff,
                "fixed_rules": fixed_rules,
                "new_rules": new_rules,
                "persistent_rules": persistent_rules
            }
        }

    async def get_analytics_summary(self) -> Dict[str, Any]:
        """Calculates live aggregate statistics directly from SQLite records."""
        await self._ensure_init()
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT id, url, timestamp, score, metrics_json, full_scan_json FROM scans ORDER BY timestamp ASC")
            rows = await cursor.fetchall()
            
            if not rows:
                cursor = await db.execute("SELECT id, url, timestamp, score, metrics FROM audits ORDER BY timestamp ASC")
                rows = await cursor.fetchall()

            total_scans = len(rows)
            if total_scans == 0:
                return {
                    "total_scans": 0,
                    "avg_score": 0,
                    "total_violations": 0,
                    "critical_issues": 0,
                    "serious_issues": 0,
                    "moderate_issues": 0,
                    "minor_issues": 0,
                    "timeline": [],
                    "score_distribution": {"excellent": 0, "good": 0, "needs_work": 0, "poor": 0}
                }

            total_score = 0
            total_violations = 0
            critical = 0
            serious = 0
            moderate = 0
            minor = 0
            timeline = []
            distribution = {"excellent": 0, "good": 0, "needs_work": 0, "poor": 0}

            for row in rows:
                score = row["score"]
                total_score += score
                metrics_raw = row["metrics_json"] if "metrics_json" in row.keys() else row["metrics"]
                metrics = json.loads(metrics_raw) if metrics_raw else {}
                
                v_count = metrics.get("total_violations", 0)
                total_violations += v_count
                critical += metrics.get("critical_count", 0)
                serious += metrics.get("serious_count", 0)
                moderate += metrics.get("moderate_count", 0)
                minor += metrics.get("minor_count", 0)

                if score >= 90:
                    distribution["excellent"] += 1
                elif score >= 75:
                    distribution["good"] += 1
                elif score >= 50:
                    distribution["needs_work"] += 1
                else:
                    distribution["poor"] += 1

                timeline.append({
                    "id": row["id"],
                    "url": row["url"],
                    "timestamp": row["timestamp"],
                    "score": score,
                    "violations": v_count
                })

            return {
                "total_scans": total_scans,
                "avg_score": round(total_score / total_scans, 1),
                "total_violations": total_violations,
                "critical_issues": critical,
                "serious_issues": serious,
                "moderate_issues": moderate,
                "minor_issues": minor,
                "timeline": timeline,
                "score_distribution": distribution
            }

    async def check_connection(self) -> bool:
        """Verifies database connectivity and readiness."""
        try:
            async with aiosqlite.connect(self.db_path) as conn:
                cursor = await conn.execute("SELECT 1;")
                row = await cursor.fetchone()
                return bool(row and row[0] == 1)
        except Exception as e:
            logger.error(f"Database availability check failed: {e}")
            return False

db = Database()
