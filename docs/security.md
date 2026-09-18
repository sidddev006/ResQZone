# ResQZone — Security Architecture & RBAC

## 1. Authentication & Session Management
- **Algorithm:** JWT (JSON Web Token) with HMAC-SHA256 (`HS256`).
- **Token Expiry:** Configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` (Default: 24 hours).
- **Password Hashing:** Native `bcrypt` key derivation with 12 salt rounds.

---

## 2. Role-Based Access Control (RBAC) Hierarchy

Server-side RBAC is strictly enforced on all mutative endpoints using the `require_role()` dependency. The frontend role is never trusted.

| Role | Rank Weight | Authorized Capabilities |
| :--- | :--- | :--- |
| `ADMIN` | 100 | Full system configuration, user creation, data source resets. |
| `STATE_AUTHORITY` | 80 | Multi-district overview, inter-district relocation authorizations. |
| `DISTRICT_AUTHORITY` | 60 | Relocation plan execution, emergency alert broadcast, shelter closures. |
| `FIELD_SURVEYOR` | 40 | Submitting field observations, structural damage assessments. |
| `VILLAGE_ADMIN` | 30 | Local roster check-in, shelter occupancy updates. |
| `VIEWER` | 10 | Read-only access to public hazard warnings and safe zones. |

---

## 3. Tamper-Resistant Audit Logging
High-impact operations (e.g. `RELOCATION_PLAN_EXECUTED`, `ROAD_BLOCKED_SIMULATION`, `HUMAN_RISK_OVERRIDE`, `ALERT_DISPATCH`) automatically insert an immutable record into the `audit_logs` table containing:
- Authenticated User ID
- Exact action name
- Target resource ID
- Client IP address
- UTC Timestamp
- JSON diff / parameters snapshot
