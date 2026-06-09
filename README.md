# Huisbeheer

Een lichte Home Assistant-client als web-app, opgezet zodat je 'm later zonder herschrijven in een **native app** (Capacitor) kunt verpakken. Alle webcode staat los in `www/`.

```
ha-app/
├── www/                 ← alle web-assets (dit is de webDir van Capacitor)
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── ha-client.js ← Home Assistant WebSocket-client
│       └── app.js       ← UI-logica
├── package.json
├── capacitor.config.json
└── README.md
```

## Wat het doet
- Verbinden met je Home Assistant via URL + long-lived access token (over de WebSocket API).
- Alle entiteiten ophalen, gegroepeerd per domein, met live updates.
- Lampen, schakelaars, fans e.d. aan/uit tikken.
- Zoeken op naam of entity-id.
- URL + token worden lokaal op het toestel bewaard.

## 1. Nu testen in de browser
Geen build nodig. Vanuit de projectmap:

```bash
npm install          # eenmalig
npm run serve        # opent http://localhost:8080
```

Open het op je telefoon door naar het IP van je computer te gaan (bijv. `http://192.168.1.20:8080`), mits op hetzelfde netwerk.

> **Let op (CORS):** in de browser kan een verbinding met een `http://`-instance vanaf een `https://`-pagina geblokkeerd worden. Test daarom via `http://` of lokaal. In de Capacitor-app speelt dit niet, omdat de app vanaf het toestel zelf draait.

## 2. Later: omzetten naar native app (Capacitor)
Zorg dat Node.js geïnstalleerd is. Voor iOS heb je een Mac met Xcode nodig; voor Android: Android Studio.

```bash
npm install                    # installeert ook Capacitor

# (capacitor.config.json staat al klaar; init is dus optioneel)
npx cap add android            # voegt het Android-project toe
npx cap add ios                # voegt het iOS-project toe (alleen op Mac)

npx cap sync                   # kopieert www/ naar de native projecten
npx cap open android           # opent Android Studio  →  Run
npx cap open ios               # opent Xcode           →  Run
```

Wijzig je iets in `www/`? Draai dan opnieuw `npx cap sync`.

### App-id en naam aanpassen
Pas `appId` en `appName` aan in `capacitor.config.json` vóór de eerste `cap add`. Gebruik een eigen reverse-domein, bijv. `nl.marco.huisbeheer`.

## 3. Volgende stappen (optioneel)
- **Push-notificaties / camera / Bluetooth:** voeg de bijbehorende Capacitor-plugin toe (`@capacitor/push-notifications` enz.).
- **PWA-installatie:** een `manifest.json` + service worker toevoegen aan `www/`.
- **Detailbediening:** sliders voor helderheid (light) of thermostaat (climate) — nu is het aan/uit.

## Token aanmaken in Home Assistant
Profiel (linksonder) → tabblad **Beveiliging** → onderaan **Langlevende toegangstokens** → **Token aanmaken**. Direct kopiëren; het wordt maar één keer getoond.
