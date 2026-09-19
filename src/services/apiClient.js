/**
 * UrbanTwin API Client
 * Routes all simulation requests through Spring Boot (port 8082)
 * Spring Boot internally calls the Flask simulation engine (port 5001)
 */

const SPRING_BOOT_URL = 'http://localhost:8082/api';

export const getBackendConfig = () => {
  const savedUrl = localStorage.getItem('urbantwin_backend_url');
  const isEnabled = localStorage.getItem('urbantwin_backend_enabled');
  return {
    baseUrl: savedUrl || SPRING_BOOT_URL,
    isEnabled: isEnabled !== null ? isEnabled === 'true' : true, // default ON now
  };
};

export const saveBackendConfig = (baseUrl, isEnabled) => {
  localStorage.setItem('urbantwin_backend_url', baseUrl);
  localStorage.setItem('urbantwin_backend_enabled', isEnabled ? 'true' : 'false');
};

// --- Health Check ---
export const checkBackendHealth = async (baseUrl) => {
  const url = baseUrl || SPRING_BOOT_URL;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json().catch(() => ({ status: 'online' }));
      return { online: true, details: data };
    }
    return { online: false, error: `HTTP ${response.status}: ${response.statusText}` };
  } catch (err) {
    return {
      online: false,
      error: err.name === 'AbortError' ? 'Timeout (4s)' : 'Network Error / Unreachable',
    };
  }
};

// --- Fetch all zones from DB ---
export const fetchZones = async () => {
  const config = getBackendConfig();
  try {
    const response = await fetch(`${config.baseUrl}/zones`);
    if (response.ok) {
      const json = await response.json();
      return { success: true, data: json.data || [] };
    }
    return { success: false, data: [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};

// --- Fetch zone by zoneId slug ---
export const fetchZone = async (zoneId) => {
  const config = getBackendConfig();
  try {
    const response = await fetch(`${config.baseUrl}/zones/${zoneId}`);
    if (response.ok) {
      const json = await response.json();
      return { success: true, data: json.data };
    }
    return { success: false, data: null };
  } catch (err) {
    return { success: false, data: null, error: err.message };
  }
};

// --- Run a full simulation (Spring Boot → Flask → DB) ---
export const runRemoteSimulation = async (payload) => {
  const config = getBackendConfig();
  if (!config.isEnabled) {
    return { success: false, fallbackToLocal: true, reason: 'Remote backend disabled' };
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(`${config.baseUrl}/simulations/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const json = await response.json();
      return { success: true, isRemote: true, data: json.data };
    }
    const errJson = await response.json().catch(() => ({}));
    return { success: false, fallbackToLocal: true, reason: errJson.message || `HTTP ${response.status}` };
  } catch (err) {
    return {
      success: false,
      fallbackToLocal: true,
      reason: err.name === 'AbortError' ? 'Simulation timeout (12s)' : err.message,
    };
  }
};

// --- Fetch past simulations for a zone ---
export const fetchSimulationHistory = async (zoneId) => {
  const config = getBackendConfig();
  try {
    const url = zoneId
      ? `${config.baseUrl}/simulations/zone/${zoneId}`
      : `${config.baseUrl}/simulations`;
    const response = await fetch(url);
    if (response.ok) {
      const json = await response.json();
      return { success: true, data: json.data || [] };
    }
    return { success: false, data: [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
};
