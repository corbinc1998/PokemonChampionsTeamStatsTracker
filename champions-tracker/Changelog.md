# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-04-19

Initial public release.

### Added
- **Team builder** with 6 slots per team, held items, and per-slot shiny toggle.
- Full Pokémon Champions roster (~215 entries) including Mega Evolutions and regional forms (Alolan, Galarian, Hisuian, Paldean).
- Full Champions item list sourced from Serebii: 30 Hold Items, 59 Mega Stones, 28 Berries — with official sprite rendering.
- **Battle logging** with date, opponent name, W/L result, and free-form notes.
- **2v2 lead tracking** — mark 2 of your 4 brought Pokémon as leads, and 2 of their 4 seen Pokémon as opponent leads.
- **Opponent item tracking** with revealed-vs-guessed toggle per Pokémon.
- **Per-team scouting dashboard**: most brought against you, most common opponent leads, opponent's most seen in team preview, your bring frequency — all with win rate breakdowns.
- **Global stats view** across all teams: Pokémon you used most, your most common leads, Pokémon that beat you (losses), Pokémon you beat (wins), opponent's most common leads.
- **XLSX export** powered by SheetJS producing a 7-sheet workbook:
  - `Battles` — flat match log with leads split from back-line
  - `Teams` — team roster + record + win rate per team
  - `You Used`, `Your Leads`, `Lost To`, `You Beat`, `Opp Leads` — stats breakdowns
  - Stats sheets use Excel's `IMAGE()` formula for inline sprite rendering in Excel 365 / Google Sheets
- 100% client-side persistence via `localStorage` — no backend, no account, no tracking.
- Dark dossier aesthetic with Instrument Serif + JetBrains Mono + DM Sans typography and a crimson / gold / emerald accent palette.

### Tech
- React 18, Vite 5
- `lucide-react` for icons
- `xlsx` (SheetJS community edition) for spreadsheet export
- Pokémon sprites via Pokémon Showdown (gen5 + gen5-shiny folders)
- Item sprites via Serebii ItemDex