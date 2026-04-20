# Champions Tracker

> Battle log, team builder, and scouting dashboard for **Pokémon Champions**.

[![Version](https://img.shields.io/badge/version-1.0.0-DC2626)]()
[![License](https://img.shields.io/badge/license-MIT-informational)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF)](https://vitejs.dev/)

A local-first tool for tracking your Pokémon Champions matches, building teams, and scouting common threats — with zero account required and zero data leaving your browser.

## Screenshots

> _Add screenshots to `/screenshots` and reference them here:_
>
> ![Home](screenshots/home.png)
> ![Battle log](screenshots/battle-log.png)
> ![Global stats](screenshots/stats.png)

## Features

### Team Management
- Build unlimited teams of 6 Pokémon with held items
- **Per-slot shiny toggle** — mix shiny and non-shiny Pokémon on the same team
- Full Champions-available roster (~215 entries) including Megas and regional forms (Alolan / Galarian / Hisuian / Paldean)
- Complete Champions item list from Serebii — Hold Items (30), Mega Stones (59), Berries (28) — with official item sprites

### Battle Logging
- Record date, opponent, W/L, and free-form notes
- Track what you brought (4 of 6) and **who you led with** (2 of 4)
- Track what the opponent brought and their 2 leads
- Toggle opponent items between **revealed** (seen in-battle) and **guessed** (your prediction)

### Scouting
- **Per-team dashboard** — most-brought-against-you, most-common-opponent-leads, your bring frequency, opponents most seen in team preview — all with win rate
- **Global stats** across all teams: Pokémon you used most, your most common leads, Pokémon that beat you (losses), Pokémon you beat (wins), opponent's most common leads

### XLSX Export
- One-click export produces a workbook with **7 sheets**: `Battles`, `Teams`, `You Used`, `Your Leads`, `Lost To`, `You Beat`, `Opp Leads`
- Stats sheets use Excel's `IMAGE()` formula — **Excel 365 and Google Sheets render sprites inline**
- Header rows frozen, column widths tuned, sortable/filterable across all 7 sheets

## Tech Stack

- **React 18** + **Vite** (single-file component, no router)
- **lucide-react** for icons
- **xlsx** (SheetJS community edition) for spreadsheet export
- Pokémon sprites: [Pokémon Showdown](https://play.pokemonshowdown.com/) (gen5)
- Item sprites: [Serebii ItemDex](https://www.serebii.net/itemdex/)
- Typography: Instrument Serif, DM Sans, JetBrains Mono (Google Fonts)
- All styling is plain CSS with custom properties — no Tailwind, no CSS-in-JS runtime

All state lives in browser `localStorage`. No backend. No account. No tracking. No analytics.

## Getting Started

```bash
git clone https://github.com/YOUR-USERNAME/champions-tracker.git
cd champions-tracker
npm install
npm run dev
```

Then open the Vite dev URL (typically `http://localhost:5173`).

### Dependencies

```bash
npm install react react-dom lucide-react xlsx
```

Requires **Node 18+** and React 18.

## Usage Guide

### 1. Build a team
Click **+ New Team**, give it a name, click each slot to pick a Pokémon, tap the item row to assign a held item. Click the ✨ icon in the slot header to mark that Pokémon as shiny.

### 2. Log a battle
On a team's page, click **Log Battle**. Fill in the opponent's 6 Pokémon and their items (best guess is fine). In the match summary:
- Tap 4 of your 6 to mark who you **brought**
- Tap 2 of those to mark who you **led with**
- Tap up to 4 of the opponent's 6 to mark who you **saw**
- Tap 2 of those to mark their **leads**
- Toggle opponent items to **revealed** if you actually saw them in-battle
- Set W/L and add any notes

### 3. Review stats
Open any team to see battle history + scouting panels. Click **Stats** on the home page for global aggregates across every team you've built.

### 4. Export
Click **Export XLSX** on the home page or the global stats page.

## Data & Privacy

All data is stored client-side in `localStorage` under these keys:
- `champions:teams` — your team definitions
- `champions:battles` — your match log

Clearing your browser data will clear the app's data. **Export an XLSX periodically** if you care about keeping long-term records — the export is both a spreadsheet and a backup.

## Project Structure

```
champions-tracker/
├── src/
│   ├── ChampionsTracker.jsx    # The entire app (single-file component)
│   ├── main.jsx                # Vite entry point
│   └── ...
├── package.json
├── vite.config.js
└── README.md
```

The app is intentionally a single file — easy to read, easy to fork, easy to embed.

## Contributing

Pull requests welcome. Keep the single-file architecture and the "no backend, no account" constraint.

Good first-issue ideas:
- Cloud-sync backend (opt-in)
- Team sharing via URL hash
- More stat breakdowns (matchup win-rate matrix, time-of-day patterns)
- Mobile polish pass

## Credits

- **Pokémon** and all associated trademarks are property of Nintendo / Game Freak / The Pokémon Company.
- Sprite assets courtesy of [Pokémon Showdown](https://play.pokemonshowdown.com/) and [Serebii.net](https://www.serebii.net/).
- Champions-specific roster and item data sourced from [Serebii's Pokémon Champions section](https://www.serebii.net/pokemonchampions/).

This is an unofficial fan-made tool. Not affiliated with Nintendo, Game Freak, The Pokémon Company, or Serebii.

## License

[MIT](LICENSE)