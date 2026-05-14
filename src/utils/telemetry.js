export const logSystemEvent = (event_name, severity = 'info', payload = {}) => {
  try {
    // Fire and forget - do not await or block the main thread
    fetch('/api/v1/telemetry/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: 'demand_letter_generator',
        event: event_name,
        severity: severity,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...payload
      })
    }).catch(() => {});
  } catch (e) {
    // Silent fail to protect UX
  }
};
