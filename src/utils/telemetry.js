export const TELEMETRY_PAYLOAD = {
  system: 'demand_letter_generator',
  version: '1.1.0',
  environment: import.meta.env?.MODE || 'production'
};

export const logSystemEvent = (event_name, severity = 'info', payload = {}) => {
  try {
    const url = typeof window !== 'undefined' ? window.location.href : 'edge_worker';
    // Fire and forget - do not await or block the main thread
    fetch('/api/v1/telemetry/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...TELEMETRY_PAYLOAD,
        event: event_name,
        severity: severity,
        timestamp: new Date().toISOString(),
        url,
        ...payload
      })
    }).catch(() => {});
  } catch (e) {
    // Silent fail to protect UX
  }
};
