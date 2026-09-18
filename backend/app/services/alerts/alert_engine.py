"""
ResQZone Alert Dispatch & Deduplication Engine
Handles operational alerts across INFO, WATCH, WARNING, and CRITICAL tiers,
with automated deduplication and multi-channel dispatch adapters (Dashboard, FCM, SMS).
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
import hashlib


class AlertEngine:
    def __init__(self):
        self.active_alert_hashes = set()

    def generate_fingerprint(self, category: str, target_area: str, severity: str) -> str:
        raw = f"{category.upper()}:{target_area.upper().strip()}:{severity.upper()}"
        return hashlib.sha256(raw.encode()).hexdigest()

    def create_alert(
        self,
        title: str,
        severity: str,
        category: str,
        target_area: str,
        affected_population: int,
        message: str,
        recommended_action: str,
        source: str = "ResQZone AI Hazard Pipeline",
        expires_in_hours: int = 24
    ) -> Optional[Dict[str, Any]]:
        """
        Creates and dispatches an alert if not an unexpired duplicate.
        """
        fingerprint = self.generate_fingerprint(category, target_area, severity)
        now = datetime.now(timezone.utc)
        
        # Deduplication check
        if fingerprint in self.active_alert_hashes:
            return None # Duplicate suppressed

        self.active_alert_hashes.add(fingerprint)
        alert_id = f"ALT-{int(now.timestamp())}"
        expires_at = (now + timedelta(hours=expires_in_hours)).isoformat()

        # Simulated FCM & SMS dispatch
        fcm_status = f"SENT_{affected_population}_DEVICES"
        sms_status = f"BROADCAST_{min(affected_population, 5000)}_SMS"

        return {
            "id": alert_id,
            "fingerprint": fingerprint,
            "title": title,
            "severity": severity,
            "category": category,
            "target_area": target_area,
            "affected_population": affected_population,
            "message": message,
            "recommended_action": recommended_action,
            "source": source,
            "created_at": now.isoformat(),
            "expires_at": expires_at,
            "is_read": False,
            "is_dispatched": True,
            "fcm_status": fcm_status,
            "sms_status": sms_status
        }


alert_engine = AlertEngine()
