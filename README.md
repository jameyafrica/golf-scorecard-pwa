# Golf Scorecard & History Tracker (PWA)

## Project Overview
A lightweight, mobile-first Progressive Web App (PWA) golf utility built for friends. The app functions offline on the golf course to record live scores, club selection, shot direction, and photos per hole, while persisting historical rounds locally.

## Tech Stack & Architecture
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Database:** `IndexedDB` (Local client-side binary storage)
- **Media API:** Native HTML5 Camera API (`<input type="file" accept="image/*" capture="camera">`)
- **App Shell:** PWA (`manifest.json` + Service Worker `sw.js` for offline caching)

## Directory Structure
golf-scorecard-pwa/
├── index.html        # Main app shell & screen views
├── styles.css        # Mobile-first high-contrast CSS
├── app.js            # App logic & IndexedDB handlers
├── manifest.json     # PWA manifest
├── sw.js             # Service worker for offline caching
└── README.md         # Project documentation & architect guidelines