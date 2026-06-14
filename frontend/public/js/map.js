/**
 * map.js — RO-MESH Interactive County Map
 * Leaflet.js initialization + GeoJSON county overlay
 */

(function () {
  'use strict';

  // ── Detect current theme ────────────────────────────────────────────────
  function isDark() {
    const stored = localStorage.getItem('ro-mesh-theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // ── Tile layers ─────────────────────────────────────────────────────────
  const TILE_DARK = {
    url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
  };
  const TILE_LIGHT = {
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
  };

  // ── Accent color (matches CSS --color-accent) ───────────────────────────
  const ACCENT = '#2DC653';
  const ACCENT_FILL = 'rgba(45, 198, 83, 0.25)';
  const INACTIVE_FILL = 'rgba(100, 116, 139, 0.08)';
  const INACTIVE_STROKE = 'rgba(100, 116, 139, 0.4)';

  // ── Protocol color palette ────────────────────────────────────────────────
  const PROTOCOL_COLORS = {
    MeshCore:   '#3498DB', // Blue
    Meshtastic: '#2ECC71', // Green
    Reticulum:  '#9B59B6', // Purple
    Unknown:    '#95A5A6'  // Gray
  };

  function getProtocolColor(protocol) {
    return PROTOCOL_COLORS[protocol] || PROTOCOL_COLORS.Unknown;
  }

  // ── Init map ────────────────────────────────────────────────────────────
  const map = L.map('romania-map', {
    center: [45.9, 24.9],
    zoom: 7,
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: false
  });

  const tileConf = isDark() ? TILE_DARK : TILE_LIGHT;
  L.tileLayer(tileConf.url, {
    attribution: tileConf.attr,
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  // Re-apply tile if theme toggle changes
  const observer = new MutationObserver(() => {
    map.eachLayer(l => { if (l._url) map.removeLayer(l); });
    const t = isDark() ? TILE_DARK : TILE_LIGHT;
    L.tileLayer(t.url, { attribution: t.attr, subdomains: 'abcd', maxZoom: 19 }).addTo(map);
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ── County Coordinates (Lat/Lng) ──────────────────────────────────────────
  const COUNTY_COORDS = {
    "botosani": [47.853894999999994, 26.714354],
    "satu mare": [47.733380499999996, 22.914803],
    "maramures": [47.6633505, 24.010826],
    "suceava": [47.530789999999996, 25.8168655],
    "bihor": [46.996748999999994, 22.1235895],
    "iasi": [47.206049500000006, 27.311443500000003],
    "bistrita-nasaud": [47.178894, 24.5088005],
    "salaj": [47.157422999999994, 23.1585085],
    "cluj": [46.8844725, 23.434854],
    "neamt": [46.990283500000004, 26.4552385],
    "mures": [46.6055355, 24.638781],
    "harghita": [46.62704, 25.568749500000003],
    "vaslui": [46.497033, 27.724663999999997],
    "bacau": [46.4268385, 26.7389515],
    "arad": [46.2942775, 21.7263255],
    "alba": [46.029316, 23.462893],
    "hunedoara": [45.7884835, 22.9706895],
    "covasna": [45.89975750000001, 25.9460555],
    "sibiu": [45.873339, 24.269229000000003],
    "timis": [45.6914125, 21.4047935],
    "vrancea": [45.786094, 26.969164],
    "galati": [45.774797, 27.721884],
    "brasov": [45.7780055, 25.3685875],
    "buzau": [45.2658855, 26.7456295],
    "caras-severin": [45.128712, 22.0326065],
    "arges": [44.992590500000006, 24.883124000000002],
    "valcea": [45.0413655, 24.049306],
    "braila": [45.1182595, 27.631329],
    "prahova": [45.1060095, 26.029716999999998],
    "dambovita": [44.938908, 25.540885],
    "gorj": [44.96197, 23.21045],
    "mehedinti": [44.603210000000004, 22.729692999999997],
    "olt": [44.2888475, 24.3607335],
    "ialomita": [44.540822500000004, 27.1808955],
    "constanta": [44.2684345, 28.1005715],
    "ilfov": [44.4815165, 26.059676000000003],
    "dolj": [44.20575650000001, 23.5400565],
    "calarasi": [44.297134, 27.004676500000002],
    "giurgiu": [44.123697, 25.949813],
    "teleorman": [44.068944, 25.161462999999998],
    "tulcea": [44.963685999999996, 28.8573025],
    "bucuresti": [44.441431, 26.1088685]
  };

  // Normalize helper: strip diacritics for fuzzy matching
  function norm(s) {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  // ── Fetch all data files ────────────────────────────────────────────────
  Promise.all([
    fetch('/data/romania-judete.geojson').then(r => r.json()),
    fetch('/data/retele-judete.json').then(r => r.json()),
    fetch('/data/connections.json').then(r => r.json()).catch(() => []) // Optional connections
  ])
    .then(([geojson, retele, connections]) => {
      renderMap(geojson, retele, connections);
      renderList(retele);
    })
    .catch(err => {
      console.error('[RO-MESH Map] Failed to load data:', err);
      document.getElementById('romania-map').innerHTML =
        '<p style="text-align:center;padding:2rem;color:var(--color-text-secondary)">⚠️ Harta nu poate fi încărcată. Verificați că fișierul <code>romania-judete.geojson</code> există în <code>/data/</code>.</p>';
    });

  // ── Render GeoJSON and Connections on map ───────────────────────────────
  function renderMap(geojson, retele, connections) {
    // 1. State Management & Data Architecture
    // protocol: single string — 'All' | 'MeshCore' | 'Meshtastic' | 'Reticulum'
    const state = {
      protocol: 'All',
      frequencies: {
        '433MHz': true,
        '868MHz': true,
        'MQTT': true
      },
      connections: true
    };

    const MasterData = {
      nodes: [],
      connections: []
    };

    // Parse nodes
    Object.keys(retele).forEach(county => {
      const networks = retele[county];
      networks.forEach(net => {
        const protocol = typeof net === 'string' ? net : (net.protocol || 'Unknown');
        let frequency = typeof net === 'string' ? 'Unknown' : (net.frequency || 'Unknown');
        if (frequency.toUpperCase() === '868MHZ') frequency = '868MHz';
        if (frequency.toUpperCase() === '433MHZ') frequency = '433MHz';
        if (frequency.toUpperCase() === 'MQTT') frequency = 'MQTT';
        MasterData.nodes.push({
          county: norm(county),
          countyRaw: county,
          protocol: protocol,
          frequency: frequency
        });
      });
    });

    // Parse connections
    (connections || []).forEach(conn => {
      const protocol = conn.protocol || 'Unknown';
      let frequency = conn.frequency || 'Unknown';
      if (frequency.toUpperCase() === '868MHZ') frequency = '868MHz';
      if (frequency.toUpperCase() === '433MHZ') frequency = '433MHz';
      if (frequency.toUpperCase() === 'MQTT') frequency = 'MQTT';
      MasterData.connections.push({
        source: norm(conn.source),
        sourceRaw: conn.source,
        destination: norm(conn.destination),
        destinationRaw: conn.destination,
        protocol: protocol,
        frequency: frequency
      });
    });

    // Filtering logic helper
    function passesFreqFilter(freq) {
      if (!freq || freq === 'Unknown') return true; // Graceful fallback to avoid orphaning
      return state.frequencies[freq] === true;
    }

    function getActiveNodesForCounty(countyNorm) {
      return MasterData.nodes.filter(n => {
        if (n.county !== countyNorm) return false;
        // Single-string protocol filter: 'All' shows every protocol
        if (state.protocol !== 'All' && state.protocol !== n.protocol) return false;
        if (!passesFreqFilter(n.frequency)) return false;
        return true;
      });
    }

    function getFeatureStyle(feature) {
      const name = feature.properties.name || feature.properties.NAME || feature.properties.JUDET || '';
      const activeNodes = getActiveNodesForCounty(norm(name));
      const active = activeNodes.length > 0;
      // Use dominant (first) active node's protocol color for the county polygon
      const dominantColor = active ? getProtocolColor(activeNodes[0].protocol) : null;
      return {
        fillColor: active ? dominantColor : INACTIVE_FILL,
        fillOpacity: active ? 0.18 : 1,
        color: active ? dominantColor : INACTIVE_STROKE,
        weight: active ? 1.5 : 1,
      };
    }

    // 2. Draw Counties
    const geojsonLayer = L.geoJSON(geojson, {
      style: getFeatureStyle,
      onEachFeature: (feature, layer) => {
        const name = feature.properties.name || feature.properties.NAME || feature.properties.JUDET || 'Județ necunoscut';

        layer.on({
          mouseover: e => {
            const l = e.target;
            const activeNodes = getActiveNodesForCounty(norm(name));
            if (activeNodes.length === 0) {
              l.setStyle({ fillOpacity: 0.15, color: ACCENT, weight: 1.2 });
            }

            // Build dynamic popup based on ACTIVE filtered nodes, not all raw nodes
            let popupHtml = `<div class="map-popup"><strong>${name}</strong>`;
            if (activeNodes.length > 0) {
              popupHtml += '<ul>' + activeNodes.map(n => {
                const freqStr = n.frequency !== 'Unknown' ? ` <span style="font-size:0.8em;opacity:0.8">(${n.frequency})</span>` : '';
                return `<li>${n.protocol}${freqStr}</li>`;
              }).join('') + '</ul>';
            } else {
              popupHtml += '<p class="map-popup-empty">Nicio rețea activă conform filtrelor.</p>';
            }
            popupHtml += '</div>';
            
            l.bindPopup(popupHtml, { className: 'ro-mesh-popup' }).openPopup();
          },
          mouseout: e => {
            e.target.closePopup();
            geojsonLayer.resetStyle(e.target);
          },
          click: e => {
            map.fitBounds(e.target.getBounds(), { padding: [40, 40] });
            e.target.openPopup();
          }
        });
      }
    }).addTo(map);

    // 3. Setup Connections Layer
    let connectionsLayerGroup = L.layerGroup();

    function drawConnections() {
      map.removeLayer(connectionsLayerGroup);
      connectionsLayerGroup.clearLayers();

      if (!state.connections) return;

      const activeConnections = MasterData.connections.filter(c => {
        // Single-string protocol filter: 'All' shows every protocol
        if (state.protocol !== 'All' && state.protocol !== c.protocol) return false;
        if (!passesFreqFilter(c.frequency)) return false;
        return true;
      });

      activeConnections.forEach(conn => {
        const sourceCoords = COUNTY_COORDS[conn.source];
        const destCoords = COUNTY_COORDS[conn.destination];

        if (!sourceCoords || !destCoords) {
          console.warn(`Warning: Missing coordinates for link: ${conn.sourceRaw} - ${conn.destinationRaw}`);
          return;
        }

        const lineColor = getProtocolColor(conn.protocol);
        const isMqtt = conn.protocol.toLowerCase() === 'mqtt' || conn.frequency === 'MQTT';
        const lineStyle = {
          color: lineColor,
          weight: 2.5,
          opacity: 0.85,
          dashArray: isMqtt ? '6, 5' : null
        };

        const polyline = L.polyline([sourceCoords, destCoords], lineStyle);
        const freqStr = conn.frequency !== 'Unknown' ? ` | Freq: ${conn.frequency}` : '';
        const tooltipText = `Link: ${conn.sourceRaw} ↔️ ${conn.destinationRaw} | Protocol: ${conn.protocol}${freqStr}`;

        polyline.bindTooltip(tooltipText, {
          sticky: true,
          className: 'ro-mesh-tooltip'
        });

        connectionsLayerGroup.addLayer(polyline);
      });

      connectionsLayerGroup.addTo(map);
    }

    // 4. County Markers Layer — one L.circleMarker per unique (county, protocol)
    let countyMarkersLayer = L.layerGroup();

    function drawCountyMarkers() {
      countyMarkersLayer.clearLayers();

      // Track rendered (county, protocol) pairs to avoid duplicates
      const seen = new Set();

      MasterData.nodes.forEach(n => {
        if (state.protocol !== 'All' && state.protocol !== n.protocol) return;
        if (!passesFreqFilter(n.frequency)) return;

        const key = `${n.county}|${n.protocol}`;
        if (seen.has(key)) return;
        seen.add(key);

        const coords = COUNTY_COORDS[n.county];
        if (!coords) {
          console.warn(`Warning: No center coords for county: ${n.countyRaw}`);
          return;
        }

        const color = getProtocolColor(n.protocol);
        const marker = L.circleMarker(coords, {
          radius: 7,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          fillOpacity: 0.92,
          opacity: 1
        });

        marker.bindTooltip(`${n.countyRaw} — ${n.protocol}`, {
          sticky: false,
          className: 'ro-mesh-tooltip'
        });

        countyMarkersLayer.addLayer(marker);
      });

      countyMarkersLayer.addTo(map);
    }

    drawConnections();      // Initial draw
    drawCountyMarkers();   // Initial draw

    // 5. Custom Toolbar Control (Bottom-Left, native Leaflet position)
    const MapToolbarControl = L.Control.extend({
      options: { position: 'bottomleft' },
      onAdd: function () {
        const container = L.DomUtil.create('div', 'ro-mesh-map-toolbar leaflet-bar leaflet-control');
        L.DomEvent.disableClickPropagation(container);

        container.innerHTML = `
          <div class="toolbar-section">
            <div class="toolbar-header">Protocol</div>
            <label class="map-toolbar-toggle"><input type="radio" name="protocol_filter" data-cat="protocol" value="All" checked> <span class="proto-dot" style="background:#95A5A6"></span> All</label>
            <label class="map-toolbar-toggle"><input type="radio" name="protocol_filter" data-cat="protocol" value="MeshCore"> <span class="proto-dot" style="background:#3498DB"></span> MeshCore</label>
            <label class="map-toolbar-toggle"><input type="radio" name="protocol_filter" data-cat="protocol" value="Meshtastic"> <span class="proto-dot" style="background:#2ECC71"></span> Meshtastic</label>
            <label class="map-toolbar-toggle"><input type="radio" name="protocol_filter" data-cat="protocol" value="Reticulum"> <span class="proto-dot" style="background:#9B59B6"></span> Reticulum</label>
          </div>
          <div class="toolbar-section">
            <div class="toolbar-header">Frequency / Transport</div>
            <label class="map-toolbar-toggle"><input type="checkbox" data-cat="frequencies" value="433MHz" checked> 433MHz</label>
            <label class="map-toolbar-toggle"><input type="checkbox" data-cat="frequencies" value="868MHz" checked> 868MHz</label>
            <label class="map-toolbar-toggle"><input type="checkbox" data-cat="frequencies" value="MQTT" checked> MQTT</label>
          </div>
          <div class="toolbar-section">
            <div class="toolbar-header">Overlay</div>
            <label class="map-toolbar-toggle"><input type="checkbox" data-cat="connections" value="Connections" checked> Connections</label>
          </div>
        `;

        // Bind events
        setTimeout(() => {
          // Protocol radio buttons — mutually exclusive, update single string
          const radios = container.querySelectorAll('input[type="radio"]');
          radios.forEach(rb => {
            rb.addEventListener('change', (e) => {
              if (e.target.getAttribute('data-cat') === 'protocol') {
                state.protocol = e.target.value;
              }
              // Trigger Master Render Cycle
              geojsonLayer.eachLayer(layer => { geojsonLayer.resetStyle(layer); });
              drawConnections();
              drawCountyMarkers();
            });
          });

          // Frequency / Connections checkboxes — multi-select, unchanged
          const checkboxes = container.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach(cb => {
            cb.addEventListener('change', (e) => {
              const cat = e.target.getAttribute('data-cat');
              const val = e.target.value;
              if (cat === 'connections') {
                state.connections = e.target.checked;
              } else if (cat === 'frequencies') {
                state.frequencies[val] = e.target.checked;
              }
              // Trigger Master Render Cycle
              geojsonLayer.eachLayer(layer => { geojsonLayer.resetStyle(layer); });
              drawConnections();
              drawCountyMarkers();
            });
          });
        }, 0);

        return container;
      }
    });

    try {
      new MapToolbarControl().addTo(map);
    } catch (err) {
      console.warn("Warning: Failed to mount categorized map toolbar control", err);
    }
  }

  // ── Render alphabetical county list ────────────────────────────────────
  function renderList(retele) {
    const container = document.getElementById('county-list-container');
    if (!container) return;

    const sorted = Object.keys(retele).sort((a, b) => a.localeCompare(b, 'ro'));

    const active = sorted.filter(k => retele[k].length > 0);
    const inactive = sorted.filter(k => retele[k].length === 0);

    let html = `<p class="map-list-meta">${active.length} județe cu rețele active din ${sorted.length} total</p><ul class="county-list-grid">`;

    sorted.forEach(judet => {
      const nets = retele[judet];
      const hasNets = nets.length > 0;
      html += `<li class="county-list-item ${hasNets ? 'county-active' : 'county-inactive'}">
        <span class="county-dot"></span>
        <span class="county-name">${judet}</span>
        ${hasNets ? `<span class="county-nets">${nets.map(n => typeof n === 'string' ? n : n.protocol).join(', ')}</span>` : ''}
      </li>`;
    });

    html += '</ul>';
    container.innerHTML = html;
  }

})();
