# Battlegrid

Battlegrid is a local-first BattleTech hex-map generator and editor. It creates deterministic battlefields that can be edited, saved as JSON, and exported as PNG, SVG, PDF, or print-ready sheets for tabletop use.

Battlegrid is a map generator, not a virtual tabletop. It does not manage units, initiative, combat, fog of war, or multiplayer sessions.

## Current version

Version **1.3** is the current mapsheet release: generate a deterministic battlefield, paint it, stamp it, and print it.

- Thirty biomes, including Alien Fungal (caps, spore fields, organic pools) and Crystal World (crystal groves, mineral ridges, fissures)
- Remaining v2 building stamps (hardened shelter still waits on a later building-record bump)
- Path brush for contiguous roads and rivers; opt-in countryside **road network**
- Scatter and rubble brushes, on-map legend and elevation key, optional wheel zoom, keyboard hex cursor
- Compact print layout (tighter legend and shorter building sheet)
- Map sizes up to 48 × 34, including a 32 × 34 double-blind template
- Regional colorways (arid, lush, twilight) that recolour a biome without changing cells
- Sample maps in `samples/`
- North arrow and 1 hex ≈ 30 m scale on print and PDF sheets
- [USER_GUIDE.md](USER_GUIDE.md) for generate / edit / save / print

Canyon Road is a single east–west canyon with a floor road that always runs left to right, meandering from seed to seed.

See [ROADMAP.md](ROADMAP.md) for shipped 1.x work and what might come later.

## Previous releases

- **1.3** — Path brush, opt-in road network, remaining theaters and v2 stamps, compact print
- **1.0** — Table-ready release: user guide, samples, north arrow and scale
- **0.9** — HPG / Castle Brian / Star League bunker; Martian; scatter and rubble; editor polish
- **0.8.1** — Ten additional theaters plus Canyon Road
- **0.8** — PDF export; Mediterranean Scrub and Oceanic Archipelago
- **0.7** — Civilian, military, and infrastructure stamps; editorial damage states; construction metadata; wall marks
- **0.6** — Arctic Tundra, Badlands, Tropical Jungle, Coastal; ice, crevasse, dry-wash, canopy-gap, beach, and cliff marks
- **0.5** — Ten biomes, twelve structures, layered editing, print export, autosave recovery, CI
- **0.4** — Alpine, Wetlands, Volcanic, roads, lava, size templates, terrain presets
- **0.3** — Biome registry; Temperate Grasslands, Dense Forest, Hot Desert
- **0.2** — Fill, resize, partial regeneration, protected edits, product docs
- **0.1** — Seeded hex prototype with brushes, undo, autosave, JSON, and PNG

## Development

Requirements:

- Node.js 20 or later
- npm

Install and start:

```sh
npm install
npm run dev
```

Build and verify:

```sh
npm run lint
npm test
npm run build
```

## Generator

Configure:

- Biome (Temperate Grasslands, Dense Forest, Hot Desert, Alpine Mountains, Wetlands, Volcanic, Urban, Lunar, Agricultural, Industrial Wasteland, Arctic Tundra, Badlands, Tropical Jungle, Coastal, Mediterranean Scrub, Oceanic Archipelago, Boreal Taiga, Tropical Savanna, Temperate Rainforest, Mangrove Estuary, Glacial Icefield, Karst Highlands, Alkali Salt Flats, Fjord Shore, Open-Pit Extraction, Ice Moon, Canyon Road, Martian, Alien Fungal, Crystal World)
- A Generate panel for every shipping biome
- Map-size template (Skirmish, Standard, Mapsheet, Double, Grand, Double-blind, Theater) or custom dimensions up to 48 × 34
- Terrain preset (Biome balanced, Open plains, Wooded, Broken ground, Lake country, Frozen, Canyon country, Jungle, Tidal, Dry hills, Island sea, Muskeg, Veldt, Mossy, Estuary, Playa, Spore field, Crystal waste)
- Colorway (Default, Arid, Lush, Twilight) — visual only
- Seed
- Woods, water, and rough-terrain density
- **Road** chance (0–100%, default 100) for the east–west countryside road on biomes that generate one
- **Road network** (opt-in) adds extra east–west countryside roads besides the primary crossing
- Maximum generated elevation (0–4)
- **Symmetric terrain** (default on) mirrors the map 180° for fair opposing sides, with mirrored hills for cover and guaranteed cover at the center
- **River crossing** (default on) carves a river left-to-right or top-to-bottom on biomes that support it; roads cross it as causeways

Choosing a biome re-themes the current map immediately and seeds the density
sliders with that biome's defaults. The next **Generate battlefield** builds
terrain with the biome's weights and clustering rules.

Actions:

- **Generate battlefield** replaces the current map.
- **Resize, keep map** changes dimensions while preserving all overlapping cells.
- **Regenerate unprotected** creates new procedural terrain but keeps manually edited cells.
- **Clear protected hexes** allows every cell to be regenerated again.

Manual terrain and elevation edits are automatically protected.

## Editing

Terrain tools:

- **Brush** paints a single hex or cluster and supports drag painting.
- **Path** paints a contiguous hex line as you drag (roads, rivers).
- **Scatter** applies the current terrain or mark to a deterministic subset of hexes in the brush radius.
- **Rubble** sets overlapping buildings to rubble and roughs empty hexes.
- **Fill region** replaces a connected region of matching terrain.
- Number keys `1` through `7` select terrain types (including lava).
- **Feature marks** (None / Crater / Scree / Ice / Crevasse / Dry wash / Canopy gap / Beach / Cliff / Wall / Reef / Spore field / Crystal) place or clear cell decorations with the brush; clicking a marked hex again clears it.

All seven terrain types are always paintable in every biome, listed under
universal names (the biome's flavor name shows as a subtitle). Generation
respects biome rules instead: volcanic maps never grow water — high moisture
becomes lava — while painted terrain is never restricted.

Roads and lava flows connect automatically across touching hexes of the same
terrain. Rivers are simply water cells: paint water to draw them.

Elevation tools:

- **Lower** decreases elevation by one level.
- **Set** paints the selected elevation level directly.
- **Raise** increases elevation by one level.

View controls:

- Shift-drag, middle-drag, or right-drag to pan
- Zoom slider in the map corner; optional **Wheel** zoom (off by default)
- Click the map and use arrow keys to move a hex cursor; Enter or Space paints
- **Fit map** resets the view
- **Grid**, **Coords**, **Levels**, **Legend**, and **Elev key** toggle overlays

History shortcuts:

- `Cmd/Ctrl + Z` — undo
- `Cmd/Ctrl + Shift + Z` — redo
- `Cmd/Ctrl + G` — regenerate

Selection and clipboard:

- `Cmd/Ctrl + C` — copy selection
- `Cmd/Ctrl + X` — cut selection
- `Cmd/Ctrl + V` — arm paste, then click the map to place
- `Esc` — clear selection / cancel tools
- Arrow keys — nudge the selected structure one hex

Structure shortcuts: `R` rotate, `D` duplicate, `Delete` remove. The selected structure shows construction type, height, and CF. Damage states are editorial map content, not live combat.

## Saving and export

- Maps autosave to browser local storage. A last-good backup is kept; if the current copy is corrupt, the editor restores the backup.
- **Save JSON** downloads an editable `.battlemap.json` file.
- **Import** restores a compatible map file. Unknown biomes, skins, features, and buildings are dropped with a recovery notice instead of rejecting the file.
- **Export** opens the Export panel: PNG, SVG, PDF, or browser print.
- Print hexes at tabletop scale (1.25 in flat-to-flat) or fit the map on one page
- PNG resolution is selectable from 1× to 4×, plus 10× for fine print. SVG keeps the map editable.
- PDF uses the same print layout (title, legend, crop marks, tiling) on letter, A4, tabloid, A3, A2, or A1, including grayscale.
- Print sheets add a title block, north arrow, 1 hex ≈ 30 m scale, crop marks, legend, elevation key, and hex numbers. Large maps tile across pages. An optional building reference sheet lists hex, type, height, and construction factor. **Sheet layout** Compact shrinks the legend and the building sheet.

JSON is the editable source of truth. PNG, SVG, PDF, and print sheets are derived output.

## Map format v2

v2 is the mapsheet format. Unknown extras are ignored; unknown biomes fall back to Temperate Grasslands.

Every map contains:

- `version` — currently `2`; version-1 files migrate on import
- `name`
- `width` and `height`
- `seed`
- `biome` — one of the thirty biome ids
- Optional `colorway` — `default`, `arid`, `lush`, or `twilight`
- `generatorProfile` — the terrain weights, elevation cap, symmetric/river flags, road chance, and optional `roadNetwork` flag the map was generated with
- `updatedAt`
- `cells`
- `buildings`

Each building contains:

- `id`
- `type` — see [BUILDINGS.md](BUILDINGS.md); unknown types are dropped on import
- `anchor` — center hex (`col` and `row`); rotation pivots around it
- `rotation` — 0 through 5, in 60° steps
- `state` — `intact`, `lightlyDamaged`, `heavilyDamaged`, `burning`, `collapsed`, or `rubble` (`damaged` is still accepted and treated as heavily damaged)
- Optional `label`
- Optional `image` — a `data:image/png|jpeg|webp;base64,…` graphic that replaces the stock stamp. Invalid or remote URLs are stripped on import.

Optional `buildingArt` on the map is a type → data-URL table used when stamping a new building of that type.

Files saved before v0.3 omit `biome` and `generatorProfile`; they are imported
as Temperate Grasslands automatically. Version-1 files gain an empty building
list on import.

Each cell contains:

- `col` and `row`
- `terrain` — `clear`, `woods`, `heavyWoods`, `rough`, `water`, `road`, or `lava`
- `elevation` — 0 through 4 (higher legacy values are clamped on import)
- Optional `isProtected` flag for manually edited cells
- Optional `feature` — `crater`, `scree`, `ice`, `crevasse`, `dryWash`, `canopyGap`, `beach`, `cliff`, `wall`, `reef`, `spore`, or `crystal`

Version 0.2 remains backward-compatible with existing v1 map files.

## Project documents

- [PRESENTATION.md](PRESENTATION.md)
- [USER_GUIDE.md](USER_GUIDE.md)
- [ROADMAP.md](ROADMAP.md)
- [BIOMES.md](BIOMES.md)
- [BUILDINGS.md](BUILDINGS.md)
