/**
 * RO-MESH Backend — Utility Service Stub
 *
 * This is the initial stub for the RO-MESH backend service.
 * It provides:
 *   - GET /api/health    — Container health check endpoint
 *   - GET /api/stats     — Mock mesh network statistics (replace with real data source)
 *
 * Future expansion areas (TODOs):
 *   - WebSocket server for real-time node telemetry
 *   - Mesh node registry (node name, position, last-seen, RSSI)
 *   - Flasher configuration API (return current Romanian channel settings)
 *   - User-submitted node reports
 *   - Integration with MeshCore API or MQTT broker
 */

'use strict';

const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;
const ENV  = process.env.NODE_ENV || 'development';

/* ── Middleware ─────────────────────────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS: allow frontend origin (Nginx on port 8080, or any localhost in dev)
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    'https://ro-mesh.ro',
    /^http:\/\/localhost(:\d+)?$/,
  ],
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
}));

// Basic request logging
app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.path}`);
  next();
});

/* ── Routes ─────────────────────────────────────────────────────────────────── */

/**
 * GET /api/health
 * Used by Docker HEALTHCHECK and frontend for service availability detection.
 */
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'ok',
    service:   'ro-mesh-backend',
    version:   '0.1.0',
    env:       ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/stats
 * Returns mesh network statistics.
 *
 * TODO: Replace stub data with real data sources:
 *   - MQTT broker subscription for live telemetry
 *   - Database query for node registry
 *   - MeshCore REST API integration
 */
app.get('/api/stats', (_req, res) => {
  // ── Stub data with realistic-looking values ────────────────────────────────
  // In production, this would be fetched from a real mesh telemetry system.
  const stubStats = {
    // Network overview
    activeNodes:      generateStubCount(18, 35),
    relayCount:       generateStubCount(4, 12),
    messagesLast24h:  generateStubCount(120, 480),
    countiesReached:  generateStubCount(6, 15),

    // Timestamp
    lastUpdated: new Date().toISOString(),
    dataSource:  'stub',  // Replace with 'live' when connected to real data

    // Top active nodes (stub — replace with real data)
    topNodes: [
      { id: 'RO2CJ-01',  name: 'Releu Cluj-Napoca',    county: 'Cluj',    status: 'online',  snr: 9.5 },
      { id: 'RO7B-03',   name: 'Releu București-Nord', county: 'Ilfov',   status: 'online',  snr: 8.2 },
      { id: 'RO3BR-02',  name: 'Releu Brașov-Tâmpa',  county: 'Brașov',  status: 'online',  snr: 11.0 },
      { id: 'RO4TM-01',  name: 'Releu Timișoara',      county: 'Timiș',   status: 'online',  snr: 7.8 },
      { id: 'RO5IS-01',  name: 'Releu Iași-Copou',     county: 'Iași',    status: 'online',  snr: 6.5 },
    ],

    // Romanian frequency configuration (static — community standard)
    channelConfig: {
      frequency:     '869.525 MHz',
      bandwidth:     '250 kHz',
      spreadFactor:  9,
      codingRate:    8,
      channel:       'RO-MESH-PUBLIC',
    },
  };

  // Simulate minor API latency (remove in production)
  const delay = ENV === 'development' ? Math.random() * 200 : 0;
  setTimeout(() => {
    res.json(stubStats);
  }, delay);
});

/**
 * GET /api/nodes
 * Future: Return all known nodes from a real registry
 */
app.get('/api/nodes', (_req, res) => {
  res.json({
    nodes: [],
    total: 0,
    message: 'Registrul de noduri este în curs de implementare. Reveniți curând.',
    placeholder: true,
  });
});

/**
 * GET /api/config/romania
 * Returns the current recommended configuration for Romanian MeshCore deployments.
 * This is safe to serve offline via SW cache.
 */
app.get('/api/config/romania', (_req, res) => {
  res.json({
    region:       'România',
    frequency:    869.525,
    frequencyUnit:'MHz',
    bandwidth:    250,
    bandwidthUnit:'kHz',
    spreadFactor: 9,
    codingRate:   8,
    txPower:      27,
    txPowerUnit:  'dBm',
    channel:      'RO-MESH-PUBLIC',
    notes:        'Configurație comunitară standard. Verificați mereu canalul comunitar pentru actualizări.',
    updatedAt:    '2025-06-01',
  });
});

/* ── 404 handler ────────────────────────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({
    error:   'Not Found',
    message: 'Endpoint indisponibil',
  });
});

/* ── Error handler ──────────────────────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('[RO-MESH Backend] Eroare:', err.message);
  res.status(500).json({
    error:   'Internal Server Error',
    message: ENV === 'development' ? err.message : 'Eroare internă a serverului',
  });
});

/* ── Start server ───────────────────────────────────────────────────────────── */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════╗
║  RO-MESH Backend v0.1.0              ║
║  Running on port: ${PORT}                 ║
║  Environment:     ${ENV.padEnd(12)}  ║
╚═══════════════════════════════════════╝
  `);
});

/* ── Utilities ──────────────────────────────────────────────────────────────── */
function generateStubCount(min, max) {
  // Deterministic-ish based on time-of-day to avoid jarring jumps on refresh
  const hour  = new Date().getHours();
  const seed  = (hour * 137 + min) % (max - min);
  return min + seed;
}

module.exports = app; // Export for testing
