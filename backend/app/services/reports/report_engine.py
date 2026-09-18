"""
ResQZone Incident Report Generator
Compiles comprehensive, official disaster operational briefs with risk metrics,
shelter capacity bottlenecks, relocation plans, alerts, and audit provenance.
"""
from typing import Dict, Any, List
from datetime import datetime, timezone
import json
from sqlalchemy.orm import Session
from backend.app.models.entities import Habitation, Shelter, Alert, DataSourceHealth, IncidentReport


class IncidentReportEngine:
    @staticmethod
    def generate_district_brief(db: Session, author: str = "DEOC Duty Officer") -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        report_id = f"REP-{now.strftime('%Y%m%d')}-{int(now.timestamp()) % 10000:04d}"

        # 1. Habitations risk summary
        habs = db.query(Habitation).all()
        critical_habs = [h for h in habs if h.risk_category == "CRITICAL"]
        warning_habs = [h for h in habs if h.risk_category == "WARNING"]
        total_vuln_pop = sum(h.vulnerable_population for h in habs)
        crit_vuln_pop = sum(h.vulnerable_population for h in critical_habs)

        # 2. Shelters capacity & bottlenecks
        shelters = db.query(Shelter).all()
        total_capacity = sum(s.effective_safe_capacity for s in shelters)
        current_occ = sum(s.current_occupancy for s in shelters)
        available_cap = max(0, total_capacity - current_occ)

        shelter_summary = [
            {
                "id": s.id,
                "name": s.name,
                "type": s.shelter_type,
                "effective_safe_capacity": s.effective_safe_capacity,
                "current_occupancy": s.current_occupancy,
                "available_capacity": max(0, s.effective_safe_capacity - s.current_occupancy),
                "bottleneck_resource": s.bottleneck_resource,
                "status": s.capacity_status
            }
            for s in shelters
        ]

        # 3. Active alerts
        active_alerts = db.query(Alert).order_by(Alert.created_at.desc()).limit(5).all()
        alerts_summary = [
            {
                "id": a.id,
                "severity": a.severity,
                "title": a.title,
                "target_area": a.target_area,
                "affected_population": a.affected_population,
                "recommended_action": a.recommended_action
            }
            for a in active_alerts
        ]

        # 4. Data sources status
        data_sources = db.query(DataSourceHealth).all()
        sources_summary = [
            {"id": d.id, "provider": d.provider, "status": d.status, "mode": d.operational_mode}
            for d in data_sources
        ]

        report_payload = {
            "report_id": report_id,
            "title": "Comprehensive Disaster Vulnerability & Relocation Brief — Chamoli District",
            "district": "Chamoli",
            "sub_district": "Joshimath",
            "state": "Uttarakhand",
            "generated_at": now.isoformat(),
            "author": author,
            "is_synthetic_demo": True,
            "disclaimer": "DEMO DATA: Synthetic records calibrated against historical Chamoli-Joshimath events.",
            "executive_summary": (
                f"Multi-sensor satellite InSAR and meteorological monitoring indicates active ground subsidence "
                f"and elevated monsoonal saturation across Joshimath. {len(critical_habs)} habitations are categorized "
                f"as CRITICAL, encompassing {crit_vuln_pop:,} high-dependency residents requiring immediate relocation assistance. "
                f"District safe shelter capacity currently stands at {available_cap:,} available safe spots across {len(shelters)} relief centers."
            ),
            "kpis": {
                "total_habitations_monitored": len(habs),
                "critical_red_zones": len(critical_habs),
                "warning_zones": len(warning_habs),
                "total_vulnerable_population": total_vuln_pop,
                "critical_vulnerable_population": crit_vuln_pop,
                "total_safe_capacity": total_capacity,
                "total_current_occupancy": current_occ,
                "available_safe_capacity": available_cap,
                "capacity_utilization_pct": round((current_occ / total_capacity) * 100, 1) if total_capacity > 0 else 0
            },
            "priority_critical_habitations": [
                {
                    "id": h.id,
                    "name": h.name,
                    "risk_score": h.hazard_score,
                    "total_population": h.total_population,
                    "vulnerable_population": h.vulnerable_population,
                    "slope_degrees": h.slope_degrees,
                    "primary_hazard": h.primary_hazard_type
                }
                for h in critical_habs
            ],
            "shelter_carrying_capacities": shelter_summary,
            "active_alerts": alerts_summary,
            "data_sources_integrity": sources_summary
        }

        # Store in database
        db_rep = IncidentReport(
            id=report_id,
            title=report_payload["title"],
            district="Chamoli",
            author=author,
            summary=report_payload["executive_summary"],
            content_json=json.dumps(report_payload)
        )
        db.add(db_rep)
        db.commit()

        return report_payload


report_engine = IncidentReportEngine()
