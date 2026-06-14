const staticSearchRoutes = [
  { title: "Acasă - RO-MESH", url: "/", snippet: "Comunitatea rețelelor radio descentralizate din România." },
  { title: "Meshcore - Rețea Urbană", url: "/meshcore/", snippet: "Protocolul ideal pentru zone urbane, bazat pe repetoare și infrastructură fixă." },
  { title: "Meshtastic - Ad-Hoc", url: "/meshtastic/", snippet: "Protocol optimizat pentru dispozitive mobile, zone montane și rețele ad-hoc." },
  { title: "Reticulum - Privacy", url: "/reticulum/", snippet: "Criptografie puternică și privacy absolut pe orice mediu de transmisie." },
  { title: "Dicționar", url: "/dictionar.html", snippet: "Termeni tehnici și concepte explicate pe larg." }
];

function buildSearchIndex() {
  const index = [...staticSearchRoutes];
  
  if (typeof window !== 'undefined' && window.glossaryTerms) {
    for (const key in window.glossaryTerms) {
      if (Object.prototype.hasOwnProperty.call(window.glossaryTerms, key)) {
        index.push({
          title: `Dicționar: ${key}`,
          url: `/dictionar.html#${key}`,
          snippet: window.glossaryTerms[key].short || ""
        });
      }
    }
  }
  return index;
}

window.roMeshSearchIndex = buildSearchIndex();
