export const TELEMETRY_PAYLOAD = {
  system: 'demand_letter_generator',
  version: '1.1.0',
  environment: import.meta.env?.MODE || 'production'
};

let telemetryBatch = [];
let batchTimeout = null;

const flushBatch = () => {
  if (telemetryBatch.length === 0) return;
  const currentBatch = [...telemetryBatch];
  telemetryBatch = [];

  try {
    const payload = JSON.stringify({ events: currentBatch });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const success = navigator.sendBeacon('/api/telemetry', payload);
      if (!success) {
        fetch('/api/telemetry', {
          method: 'POST',
          body: payload,
          headers: { 'Content-Type': 'application/json' },
          keepalive: true
        }).catch(() => {});
      }
    } else {
      fetch('/api/telemetry', {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      }).catch(() => {});
    }
  } catch (e) {
    // Silent fail to protect UX
  }
};

export const logSystemEvent = (event_name, severity = 'info', payload = {}) => {
  try {
    const url = typeof window !== 'undefined' ? window.location.href : 'edge_worker';
    const event = {
      ...TELEMETRY_PAYLOAD,
      event: event_name,
      severity: severity,
      timestamp: new Date().toISOString(),
      url,
      ...payload
    };

    telemetryBatch.push(event);

    if (!batchTimeout && typeof window !== 'undefined') {
      batchTimeout = setTimeout(() => {
        batchTimeout = null;
        flushBatch();
      }, 500); // Batch for 500ms
    } else if (typeof window === 'undefined') {
        flushBatch();
    }
  } catch (e) {
    // Silent fail to protect UX
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (batchTimeout) clearTimeout(batchTimeout);
    flushBatch();
  });
}
