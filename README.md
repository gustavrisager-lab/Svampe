# Svampe – en visuel feltguide

En mobil feltguide til svampe: **sted → observation → art → forskel → dokumentation → køkken.**
Den lærer dig at *se* svampe. Den bestemmer dem ikke.

Statisk side til GitHub Pages – ingen build, ingen konti, ingen API-nøgler.

## Filer
- `index.html` – hele appen (HTML, CSS, JS, artsdata, gastronomi, udbredelsesgitter)
- `img/` – kontrollerede fotos (800×600) · `img/t/` – miniaturer (400×300)
- `sw.js` – service worker (offline) · `manifest.webmanifest`, `icons/` – hjemmeskærm

## Privatliv
Fund, fotos og valgt område gemmes kun på enheden (IndexedDB / localStorage). Intet uploades.
Kort: © OpenStreetMap-bidragydere (Leaflet via cdnjs). Stedsøgning: Nominatim.

## Sikkerhed
Fotos og digitale nøgler kan ikke afgøre, om en svamp er sikker at spise. Spis kun svampe, der er sikkert
bestemt af en person med den nødvendige viden. Giftlinjen: 82 12 12 12.

Fotos: iNaturalist-observationer (research grade) under Creative Commons – krediteret i appen under "Om guiden".
