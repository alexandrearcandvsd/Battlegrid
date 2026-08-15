---
marp: true
paginate: true
title: Battlegrid 1.3
description: Major features of the local-first BattleTech hex-map generator
---

# Battlegrid

Local-first BattleTech hex-map generator and editor

**v1.3** · maps format **v2** · not a VTT

Generate a deterministic mapsheet, paint it, stamp it, save JSON, and print it for the table.

---

# What it is

- Seeded procedural battlefields on a hex grid
- Manual terrain, elevation, roads, marks, and structures
- Thirty distinct theaters, not recolors of one map
- Print-ready PNG, SVG, PDF, and browser sheets
- Files that live on disk and in the browser — no account, no server

Same seed + same settings = the same cells, every time.

---

# What it is not

Battlegrid does **not**:

- Place unit tokens
- Track initiative or resolve combat
- Calculate line of sight or fog of war
- Host multiplayer sessions
- Enforce BattleTech rules
- Manage characters or forces

Building damage is **editorial scenery**, not live game state.

---

# The table loop

1. **Generate** a theater from a seed
2. **Edit** terrain, elevation, paths, and stamps
3. **Save** JSON (format v2)
4. **Print** a mapsheet the group can use without reopening the editor

JSON is the source of truth. PNG, SVG, PDF, and print sheets are derived.

---

# Generate

One panel to configure the battlefield:

- **Biome** — the theater (palette, textures, generation rules)
- **Map size** — Skirmish through Theater, or custom up to **48 × 34**
- **Terrain preset** — woods / water / rough weights
- **Seed** — the operation name; randomize or type your own
- Woods, water, rough, and max elevation (0–4)

Choosing a biome re-themes the current map immediately and loads that biome’s defaults.

---

# Generator actions

| Action | What it does |
| --- | --- |
| **Generate battlefield** | Replace the current map |
| **Resize, keep map** | Change dimensions; overlapping hexes stay |
| **Regenerate unprotected** | New terrain; painted hexes stay |
| **Clear protected hexes** | Allow full regeneration again |

Manual terrain and elevation edits are protected automatically.

---

# Fairness and routes

- **Symmetric terrain** (default on) — 180° mirror for opposing sides, mirrored hills, cover at center
- **River crossing** (default on) — left-to-right or top-to-bottom; roads cross as causeways
- **Road chance** (0–100%, default 100) — east–west countryside road, where the biome allows it
- **Road network** (opt-in) — extra east–west countryside roads besides the primary crossing

Canyon Road is a special case: one canyon, floor road always left to right, a different meander each generate.

---

# Thirty theaters

**Natural worlds**
Temperate Grasslands · Dense Forest · Hot Desert · Alpine Mountains · Wetlands · Arctic Tundra · Badlands · Tropical Jungle · Coastal · Mediterranean Scrub · Boreal Taiga · Tropical Savanna · Temperate Rainforest · Mangrove Estuary · Glacial Icefield · Karst Highlands · Alkali Salt Flats · Fjord Shore

**Constructed and damaged**
Urban (settlement → city center, military base, ruins) · Agricultural · Industrial Wasteland · Open-Pit Extraction · Volcanic · Canyon Road

**Off-world**
Lunar · Martian · Ice Moon · Alien Fungal · Crystal World

Each biome has its own palette, textures, generation weights, and a unique lava **label and color**.

---

# Sizes, presets, colorways

**Sizes**
Skirmish 12×10 · Standard 18×14 · Mapsheet 16×17 · Double 32×17 · Grand 40×30 · Double-blind 32×34 · Theater 48×34

**Terrain presets**
Biome balanced · Open plains · Wooded · Broken ground · Lake country · Frozen · Canyon country · Jungle · Tidal · Dry hills · Island sea · Muskeg · Veldt · Mossy · Estuary · Playa · Spore field · Crystal waste

**Colorway** (visual only — does not change cells)
Default · Arid · Lush · Twilight

---

# Terrain tools

| Tool | Use |
| --- | --- |
| **Brush** | Paint a hex or cluster; drag to paint |
| **Path** | Contiguous hex line as you drag — roads and rivers |
| **Scatter** | Deterministic subset of hexes in the radius |
| **Rubble** | Buildings → rubble; empty hexes → rough |
| **Fill region** | Flood a connected patch of matching terrain |
| **Select / Lasso** | Copy, cut, crop, protect, or clear a region |

Number keys **1–7** pick terrain types. All seven types are always paintable in every biome.

---

# Terrain identity

Universal types (biome flavor is a subtitle):

Clear · Light Woods · Heavy Woods · Rough · Water · Road · Lava

- Generation follows biome rules (volcanic never *grows* water — moisture becomes lava)
- Painting is never restricted
- Roads and lava connect across touching hexes
- Rivers are water cells — paint water, or use **Path**

Biome **skins** let you stamp another theater’s look onto a hex without changing what the hex *is*.

---

# Elevation and marks

**Elevation** (0–4)
Lower · Set · Raise

**Feature marks**
Crater · Scree · Ice · Crevasse · Dry wash · Canopy gap · Beach · Cliff · Wall · Reef · Spore field · Crystal

Click a marked hex again to clear it. Marks print as shapes, so they stay readable in grayscale.

---

# Structures

Stamp buildings from the **Structures** panel, grouped:

- Civilian — houses, hospital, school, government, spaceport terminal, …
- Industrial — factory, refinery, fusion reactor, mining facility, …
- Military — hangars, bunkers, HPG, Castle Brian, Star League bunker, …
- Infrastructure — bridge, rail, dam, substation, water tower, …

Each stamp has footprint, 60° rotation, height, construction type, construction factor (CF), entrances, and an optional label. Select a stamp to replace its graphic with a PNG, JPEG, or WebP; **Use for every…** copies that image onto the rest of the type.

`R` rotate · `D` duplicate · Delete remove · arrows nudge one hex

---

# Damage is scenery

Editorial states, not combat:

Intact · Lightly damaged · Heavily damaged · Burning · Collapsed · Rubble

(`damaged` in old files still reads as heavily damaged.)

Urban density includes **Post-apocalyptic ruins** — wrecked stamps and scattered rough. The **Rubble** brush does the same by hand.

---

# Selection, layers, notes

- **Select** and **Lasso** regions
- Copy / cut / paste (`⌘/Ctrl C X V`) — paste arms, then click to place
- Flip horizontal, flip vertical, rotate 180°
- Crop / expand with resize-while-keeping
- Four layers: **terrain · elevation · structures · annotations** — each can be hidden or locked
- Hex **notes** for objectives and reminders (map content, not a VTT overlay)

---

# View and keyboard

- Shift-drag, middle-drag, or right-drag to pan
- Zoom slider; optional **Wheel** zoom (off by default)
- **Fit map** resets the view
- Overlays: **Grid · Coords · Levels · Legend · Elev key**
- Coords cycles the same numbering as print: offset, row/col, axial, or off
- Click the map (or Tab to it); arrows move a hex cursor; Enter / Space paints

Undo / redo · `⌘/Ctrl G` regenerate

---

# Save and files

- Autosave in the browser, plus a last-good backup if the current copy is corrupt
- **Save JSON** — editable `.battlemap.json`
- **Import** — compatible maps; unknown biomes, skins, features, and buildings are dropped with a notice instead of rejecting the file
- Version-1 files open with an empty building list
- Format **v2** is frozen for the 1.x line (new biome ids, optional fields, and building types only)

Product version **1.3**. Map-file version **2**. Those are different numbers.

---

# Export and print

**PNG** 1×–4× or 10× fine print · **SVG** (still editable) · **PDF** · browser **Print**

Chrome sheets include:

- Title block · crop marks · tiling on large maps
- Legend and elevation key
- **North arrow**
- Scale: **1 hex = 1.25 in ≈ 30 m** (tabletop print; or fit-to-page)
- Hex numbers (same modes as the live map)
- Optional **building reference** (hex, type, height, CF, state)

Paper: letter, A4, tabloid, A3, A2, A1 · landscape or portrait · colour or grayscale · terrain hatches for colour-blind / B&W copies

**Sheet layout:** Standard or **Compact** (tighter legend, shorter building sheet).

---

# Sample maps

Starter files in `samples/` — open with Import, or copy the seed and `generatorProfile`.

| File | Theater |
| --- | --- |
| `grasslands.json` | Temperate Grasslands |
| `urban-base.json` | Urban military base |
| `alpine.json` | Alpine Mountains |
| `coastal.json` | Coastal |
| `lunar.json` | Lunar |
| `martian.json` | Martian |

Every other theater is on the **Biome** list (including **Fungal** and **Crystal**).

---

# Built for the table

A group can generate, revise, save, and print a mapsheet **without a VTT**.

- Deterministic — recreate the same map from the seed
- Local-first — no cloud, no login
- Print packs a printer can use
- Distinct theaters, not palette swaps
- Stamps a campaign actually names: HPG, Castle Brian, DropShip pad, refinery, dam

---

# What’s next

Not scheduled. Candidates, not promises:

- A campaign atlas of linked mapsheets
- Construction-combat fields on buildings (armor, basement, rooftop)
- Scenario overlays (deployment edges, objective hexes) as static sheet content

VTT functionality stays off the roadmap.

---

# Try it

```sh
npm install
npm run dev
```

Docs: [USER_GUIDE.md](USER_GUIDE.md) · [README.md](README.md) · [BIOMES.md](BIOMES.md) · [BUILDINGS.md](BUILDINGS.md) · [ROADMAP.md](ROADMAP.md)

**Battlegrid 1.3** — generate a map, stamp it, print the sheet. Leave the VTT at home.
