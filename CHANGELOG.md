# Changelog

## v0.18.0
- Rewrote the "Problema & Ghid — Strategia PARU" section on the homepage for clarity and PACE plan accuracy.
- Card P: renamed from "Plan" to "Principal", updated description to emphasize everyday communication use.
- Card A: expanded description to clarify that the mesh network activates when mobile network degrades.
- Card R: updated description with DMR example; added `PMR` and `VHF` badges.
- Card U: expanded to explicitly state "without server, without internet, without operator".
- Introductory paragraph split into three paragraphs; "LoRa networks" now correctly attributed to Alternativ and Urgență layers.

## v0.17.0
- Implemented protocol-based dynamic color coding across the entire map. Each protocol is now assigned a distinct color: MeshCore (blue `#3498DB`), Meshtastic (green `#2ECC71`), Reticulum (purple `#9B59B6`), Unknown (gray `#95A5A6`).
- Replaced static accent-color county polygon fills with protocol-derived colors. Active counties are now tinted in the dominant (first) protocol's color.
- Introduced `L.circleMarker` rendering at geographic county centers (from `COUNTY_COORDS`). One circle marker is drawn per unique (county, protocol) pair, ensuring county-level granularity with clear visual differentiation between protocols.
- Updated inter-county connection polylines to use their respective protocol color instead of the global accent color.
- Added colored legend dots (`proto-dot`) next to each Protocol radio button in the toolbar for immediate visual mapping between filter options and map elements.
- Styled radio button inputs natively to match the compact toolbar aesthetic (custom circle appearance, no browser default).

## v0.16.0
- Refactored the "Protocol" filter in the map toolbar from multi-select checkboxes to mutually exclusive radio buttons. Users can now select exactly one protocol at a time (All, MeshCore, Meshtastic, or Reticulum).
- Simplified the internal filter state: `state.protocols` (object map) replaced by `state.protocol` (single string, default `'All'`). Downstream filter functions updated to perform a single string equality check instead of a hash lookup.
- Frequency/Transport and Connections overlay controls remain as multi-select checkboxes and are unaffected.

## v0.15.2
- Fixed case sensitivity in frequency filters by normalizing frequency strings (e.g. `'868Mhz'`/`'868MHz'`) during JSON parsing for both node networks and inter-county connections.

## v0.15.1
- Relocated the custom map filter toolbar from the bottom-center to the native Leaflet `bottomleft` corner.
- Removed the custom CSS position hack previously used for center alignment.
- Compacted the toolbar UI: reduced font sizes, padding, margins, and checkbox dimensions to minimize screen real estate usage while maintaining a clear vertical layout.

## v0.15.0
- Refactored JSON data architecture (`retele-judete.json` and `connections.json`) to store complex objects per node/connection rather than flat strings.
- Upgraded the Map component to parse protocol and frequency values from the newly structured JSON arrays, maintaining backwards compatibility.
- Seamlessly mapped the updated JSON objects into the existing state-based Master Data Array for robust multi-criteria filtering across all counties and links.

## v0.14.0
- Refactored map logic to support multi-criteria, state-based filtering combining both Protocols and Frequencies.
- Implemented a Master Data Array to persist all nodes and connection data securely in memory for dynamic filtering updates.
- Re-designed the interactive map toolbar into visually categorized groups (Protocols, Frequency/Transport, and Overlays).
- Added graceful data handling for missing node frequencies, defaulting them to 'Unknown' while safely bypassing rendering orphans.

## v0.13.0
- Added a custom Leaflet control toolbar mounted at the bottom-center of the interactive map for protocol filtering.
- Implemented independent visibility toggles for MeshCore, Meshtastic, Reticulum, and Connections.
- Refactored the map rendering logic to use a single dynamic GeoJSON layer, fixing opacity stacking issues while accurately filtering highlighted counties and connection polylines.
- Enhanced state resilience to gracefully handle missing layer initializations and coordinate mismatches without breaking map interactivity.

## v0.12.0
- Added inter-county connection routing on the interactive map using geographic center coordinates as anchor points.
- Implemented visual differentiation for connection protocols (e.g., solid lines for RF/LoRa, dashed lines for MQTT).
- Added interactive tooltips for network connections to display link endpoints and protocol details.
- Introduced robust error handling logic that logs clear warnings for missing coordinate data without disrupting map rendering.

## v0.11.0
- Added an interactive map of Romania using Leaflet.js, displaying active mesh networks per county populated via an external editable JSON file. Included an alphabetical county list and added a 'Map' link to the global footer.

## v0.10.1
- Updated the primary Hero CTA on the homepage to direct users to the interactive Protocol Quiz. Enabled smooth scrolling for anchor links.

## v0.10.0
- Added a dedicated 'Comunități' page to list active local groups, grouped by protocol. Added a global footer link to this new section.

## v0.9.0
- Implemented an interactive, modular 5-question protocol quiz on the homepage. Included a custom toggle switch to alternate between beginner-friendly (Simple) and technical (Advanced) question sets.

## v0.8.0
- Refactored global CSS. Extracted all internal <style> blocks and inline styles from HTML files, consolidating them into external modular stylesheets to reduce code duplication and improve PWA caching.

## v0.7.2
- Refactored global container CSS to modern UI standards. Set responsive max-width to 1200px with dynamic padding for optimal readability on mobile and ultrawide screens.

## v0.7.1
- Added a modern, subtle 'alpha' status badge to the main header branding.

## v0.7.0
- Added ESP and NRF definitions to dictionary.js. Automated global HTML text scanning to wrap 'LoRa', 'ESP', and 'NRF' in glossary tooltip components.
- Implemented a custom, non-intrusive PWA install banner. Added logic to intercept the 'beforeinstallprompt' event and handle Add to Home Screen functionality.

## v0.6.2
- Fixed fullscreen search modal close button (X). Resolved z-index and event listener issues to ensure the modal can be closed on mobile and desktop.

## v0.6.1
- Added a mobile-optimized close button ('X') in the top-right corner of the fullscreen search overlay with a larger touch target for better mobile UX.

## v0.6.0
- Replaced header search with a modern fullscreen search overlay. Added giant input UI and enhanced search results with URLs and text snippets.

## v0.5.0
- Implemented offline-first client-side search in the global header. Integrated dictionary terms and protocol routes into a unified search index.

## v0.4.1
- Refactored headers to be contextual. Moved cross-protocol navigation to the global footer. Added in-page anchor navigation to protocol-specific headers. Cleaned global header.

## v0.4.0
- Implemented global site footer and protocol-specific top-footer navigation sections across all landing pages. Rebuilt Docker environment.

## v0.3.2
- Integrated global Light/Dark mode functionality into dictionar.html. Styled dictionary-specific UI components (A-Z index, table) for dark theme compatibility.

## v0.3.1
- Added an alphabetical jump index (A-Z) at the top of dictionar.html with active/disabled states. Rebuilt and redeployed Docker containers to serve updated frontend assets.

## v0.3.0
- Added 'source' field to dictionary entries. Redesigned dictionar.html into an alphabetically sorted, responsive 3-column table (Denumire, Explicație, Sursă). Tooltips remain unchanged.

## v0.2.1
- Built and styled the dynamic Dictionar page. Implemented JavaScript rendering logic to extract definitions directly from dictionary.js.

## v0.2.0
- Added global dictionary system. Implemented click-triggered tooltips for technical terms (desktop and mobile) and a centralized offline-ready Dictionary page.

## v0.1.1
- Updated index.html to clarify the PARU communication strategy, accurately distinguishing the RO-MESH community from the LoRa network technology.

## v0.1.0
- Initial stub release.
