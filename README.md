# RO-MESH 📡

> **Portalul de prezentare și utilități pentru comunitatea mesh din România**
>
> O aplicație web progresivă (PWA) offline-first, servită prin Nginx, cu un backend Node.js modulat pentru utilități viitoare.

---

## Arhitectura Proiectului

```
ro-mesh/
├── docker-compose.yml          # Orchestrare servicii
├── README.md
│
├── frontend/                   # PWA Nginx
│   ├── Dockerfile              # Multi-stage: Alpine copy → Nginx:alpine serve
│   ├── nginx.conf              # Configurație Nginx cu gzip, cache headers, SPA fallback
│   └── public/
│       ├── index.html          # Pagina principală (StoryBrand, română)
│       ├── offline.html        # Fallback offline
│       ├── manifest.json       # PWA Web App Manifest
│       ├── sw.js               # Service Worker (Cache-First agresiv)
│       ├── css/
│       │   └── style.css       # Sistem de design "Alpine Mesh"
│       ├── js/
│       │   └── app.js          # Network detection, async widgets, SW reg
│       └── images/
│           ├── hero-mesh-romania.jpg
│           ├── icon-192.png
│           ├── icon-512.png
│           └── og-hero.jpg
│
└── backend/                    # Serviciu utilitar Node.js (stub)
    ├── Dockerfile
    ├── package.json
    └── server.js               # Express: /api/health, /api/stats, /api/config/romania
```

---

## Pornire Rapidă

### Cerințe
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/)

### Rulare

```bash
# Clonează și pornește
git clone https://github.com/your-org/ro-mesh.git
cd ro-mesh

# Build și pornire
docker compose up --build -d

# Verificare
curl http://localhost:8080        # Frontend PWA
curl http://localhost:3001/api/health  # Backend health
```

Accesează: **http://localhost:8080**

### Oprire

```bash
docker compose down
```

---

## Funcționalități

### Frontend PWA
- ✅ **Offline-First**: Service Worker cu Cache-First agresiv pentru toate asset-urile statice
- ✅ **StoryBrand**: Structură hero → problemă → soluție → CTA în română
- ✅ **Async Widgets**: Statistici live, cu fallback graceful când ești offline
- ✅ **Network Detection**: Banner offline + mesaje localizate în română
- ✅ **Instalabilă**: Web App Manifest + PWA install prompt
- ✅ **Accesibilă**: Semantic HTML, ARIA labels, focus vizibil, skip links
- ✅ **Responsive**: Mobile-first, funcțională pe toate ecranele

### Service Worker (`sw.js`)

| Tip de Request | Strategie | Fallback Offline |
|---|---|---|
| HTML, CSS, JS, imagini | Cache-First → Network | `/offline.html` din cache |
| `/api/stats`, `/api/health` | Network-First → Cached → Stub | JSON stub cu mesaj în română |
| Google Fonts | Stale-While-Revalidate | Din cache dinamic |

### Backend (Stub)
| Endpoint | Descriere |
|---|---|
| `GET /api/health` | Health check container |
| `GET /api/stats` | Statistici rețea (stub — de înlocuit cu date reale) |
| `GET /api/nodes` | Registru noduri (placeholder) |
| `GET /api/config/romania` | Configurație frecvență românească |

---

## Configurație Românească MeshCore

```
Frecvență:      869.525 MHz
Bandwidth:      250 kHz
Spreading:      SF9
Coding Rate:    CR8
Canal:          RO-MESH-PUBLIC
```

---

## Developement Local (fără Docker)

```bash
# Frontend — server static simplu
cd frontend/public
npx serve . -p 8080

# Backend
cd backend
npm install
npm run dev  # Node.js watch mode (Node 20+)
```

---

## Roadmap

- [ ] Integrare cu API-ul oficial MeshCore pentru date live
- [ ] Hartă interactivă a nodurilor (Leaflet.js + OpenStreetMap)
- [ ] Pagini de ghiduri offline (instalare, configurare, troubleshooting)
- [ ] Forum sau canal de rapoarte comunitare
- [ ] MQTT broker pentru telemetrie în timp real
- [ ] Pagini dedicate pe regiuni (Cluj, București, Timișoara, etc.)

---

## Contribuții

RO-MESH este un proiect comunitar open-source. Contribuțiile sunt binevenite!

1. Fork + branch
2. Modificări + teste
3. Pull Request cu descriere în română sau engleză

---

## Licență

MIT — Construit cu ❤️ de comunitatea mesh din România.

Inspirat de [ColoradoMesh.org](https://coloradomesh.org) și [meshcore.ch](https://meshcore.ch).
Bazat pe platforma [MeshCore](https://meshcore.io/).
