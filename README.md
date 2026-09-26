# Svampeguiden

En mobil feltguide til svampe: **sted → observation → art → forskel → dokumentation → køkken.**
Den lærer dig at *se* svampe. Den bestemmer dem ikke.

Statisk side til GitHub Pages – ingen konti, ingen API-nøgler.

## Filer
- `index.html` – hele appen, samlet fra `src/` (må ikke redigeres direkte)
- `img/` – kontrollerede fotos (800×600) · `img/t/` – miniaturer (400×300)
- `sw.js` – service worker (offline) · `manifest.webmanifest`, `icons/` – hjemmeskærm

## Kilde
Rediger i `src/`, kør `python3 build.py` (kun standardbiblioteket), commit `src/`, `index.html` og `sw.js`.
- `shell.html` – sideskelet · `app.css` – farver, typografi, komponenter
- `data.js` – arter, status, nøglespørgsmål, forvekslingspar · `gastro.js` – køkkenet og smag/tekstur/tilberedning
- `views.js` – piktogrammer, start, lær at se, arter og filtre, artsside, forskel, undersøg, quiz
- `app_tail.js` – område og kort, fund (IndexedDB), køkkenside, info, router
- `geo.js` – udbredelsesgitter (0,5°) · `photos.json` – fotoliste med kreditering · `sw.tpl.js` – service worker

## Privatliv
Fund, fotos og valgt område gemmes kun på enheden (IndexedDB / localStorage). Intet uploades.
Kort: © OpenStreetMap-bidragydere (Leaflet via cdnjs). Stedsøgning: Nominatim.

## Sikkerhed
Fotos og digitale nøgler kan ikke afgøre, om en svamp er sikker at spise. Spis kun svampe, der er sikkert
bestemt af en person med den nødvendige viden. Giftlinjen: 82 12 12 12.

Fotos: iNaturalist-observationer (research grade) under Creative Commons – krediteret i appen under "Om guiden".
