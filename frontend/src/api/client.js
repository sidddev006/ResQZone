/**
 * ResQZone Frontend API Client
 * Connects to FastAPI backend with graceful fallbacks and consistent error handling.
 */

const API_BASE = '/api/v1';

async function fetchJSON(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Dashboard
  getKPIs: () => fetchJSON('/dashboard/kpis'),

  // Hazards
  getHazardZones: () => fetchJSON('/hazards/zones'),

  // Habitations
  getHabitations: (riskCategory = null) => {
    const query = riskCategory ? `?risk_category=${riskCategory}` : '';
    return fetchJSON(`/habitations${query}`);
  },
  getHabitationDetail: (id) => fetchJSON(`/habitations/${id}`),

  // Capacity & Shelters
  getSheltersCapacity: () => fetchJSON('/capacity/shelters'),

  // Routing
  getRoadNetwork: () => fetchJSON('/routes/network'),
  calculateRoute: (originNode, destinationNode, blockedRoadIds = []) =>
    fetchJSON('/routes/calculate', {
      method: 'POST',
      body: JSON.stringify({
        origin_node: originNode,
        destination_node: destinationNode,
        blocked_road_ids: blockedRoadIds,
      }),
    }),

  // Relocation Optimization
  optimizeRelocation: (strategy = 'BALANCED', blockedRoads = [], disabledShelters = []) =>
    fetchJSON('/relocation/optimize', {
      method: 'POST',
      body: JSON.stringify({
        strategy,
        blocked_road_ids: blockedRoads,
        disabled_shelter_ids: disabledShelters,
      }),
    }),

  // ResQ Twin Simulator
  simulateResQTwin: (params) =>
    fetchJSON('/scenarios/resq-twin/simulate', {
      method: 'POST',
      body: JSON.stringify({
        blocked_road_ids: params.blocked_road_ids || [],
        disabled_shelter_ids: params.disabled_shelter_ids || [],
        capacity_reduction_factors: params.capacity_reduction_factors || {},
        rainfall_spike_pct: params.rainfall_spike_pct || 0.0,
        strategy: params.strategy || 'BALANCED',
      }),
    }),

  // Alerts
  getAlerts: () => fetchJSON('/alerts'),
  createAlert: (alertData) =>
    fetchJSON('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    }),
  acknowledgeAlert: (alertId) =>
    fetchJSON(`/alerts/${alertId}/acknowledge`, {
      method: 'PATCH',
    }),

  // Copilot
  askCopilot: (query) =>
    fetchJSON('/copilot/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // Reports
  getDistrictBrief: () => fetchJSON('/reports/district-brief'),
  getReportsList: () => fetchJSON('/reports'),

  // Data Sources & Audits
  getDataSources: () => fetchJSON('/data-sources'),
  getAuditLogs: () => fetchJSON('/audit-logs'),
};
