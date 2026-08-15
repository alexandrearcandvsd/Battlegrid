# Battlegrid Roadmap

This is the Battlegrid roadmap. **v1.3** is the current release: a local-first BattleTech mapsheet generator. Still not a VTT.

Battlegrid is not a virtual tabletop.

Product version and file version are different: the app is v1.3; maps are format **v2**.

## Numbering

Roadmap v1 used 0.5–0.9 as internal milestones (buildings, urban, editing, print, hardening). Those shipped as **v0.5**. Versions 0.6–1.3 below are shipped work. A hex-planet experiment was withdrawn; it is not on the path to v2.0.

## Product scope

### Included

- Seeded procedural map generation
- Manual terrain, elevation, road, and structure editing
- Biome-specific palettes and generation rules
- Static building placement and printable building metadata
- Local JSON save files
- PNG, SVG, PDF, and print-ready exports
- Map templates, legends, labels, and reference sheets

### Excluded

- Unit tokens
- Initiative tracking
- Combat resolution
- Live building damage
- Fog of war
- Multiplayer sessions
- Runtime line-of-sight calculations
- Rules enforcement
- Character or force management

Buildings and damage variants are static map content selected while editing. They do not represent live game state.

## Path to v1.0

### v0.5 — Complete generator

Everything from the prototype through print export and release hardening, shipped as one version:

- Seeded hex generation, brushes, undo, autosave, JSON, PNG
- Biome registry with ten environments: Temperate Grasslands, Dense Forest, Hot Desert, Alpine Mountains, Wetlands, Volcanic, Urban, Lunar, Agricultural, Industrial Wasteland
- Map format v2: buildings stored separately from cells; v1 files migrate
- Twelve structures with footprints, rotation, height, CF, labels, intact/damaged states
- Urban streets, rails, districts, and density presets (settlement, industrial, city center, military base, ruins)
- Layered editing: selection, clipboard, crop/expand, flip/rotate 180°, protected regeneration
- Print-ready PNG/SVG sheets with tiling, legends, hex numbering, and optional building reference
- Scene templates, last-good autosave recovery, tolerant import, CI

### Completion target

Users can generate, revise, save, and print a battlefield without leaving the editor. **Met.**

### v0.6 — Natural worlds

Fill out the Inner Sphere and Periphery tables that grasslands, desert, and alpine do not cover.

- ~~Implement Arctic Tundra~~
- ~~Implement Badlands~~
- ~~Implement Tropical Jungle~~
- ~~Implement Coastal~~
- ~~Add ice, crevasse, dry-wash, canopy-gap, beach, and cliff cues as cell features or biome skins~~
- ~~Add scene templates: tundra, canyon, jungle, shoreline~~
- ~~Add terrain presets: frozen, canyon country, jungle, tidal~~
- ~~Keep generation deterministic per seed; keep print marks readable in grayscale~~

### Completion target

Four new biomes produce maps that read as distinct theaters, not recolors of existing ones. **Met:** tundra ice and crevasses, badlands dry washes, jungle canopy gaps, and a coastal ocean edge with beach and cliff marks.

### v0.7 — Structures and destruction

Give urban, base, and industrial maps more things worth fighting over, still as static scenery.

- ~~Add static visual states: lightly damaged, heavily damaged, burning, collapsed, rubble~~
- ~~Add civilian structures: hospital, government building~~
- ~~Add military structures: infantry barracks, vehicle garage, repair bay~~
- ~~Add infrastructure: power plant, rail station, water tower~~
- ~~Place the new types from urban, military, and industrial district generators~~
- ~~Show construction type, height, and CF on the selected structure~~
- ~~Add a wall / fortification hex feature for compounds and city blocks~~
- ~~Keep damage states editorial — never live combat state~~

### Completion target

A city, factory, or base map can be dressed with table-relevant buildings and a readable damage story without extra types from [BUILDINGS.md](BUILDINGS.md). **Met:** eight new stamps, six editorial damage states (`damaged` still reads as heavily damaged), construction metadata on the selected structure, and wall marks on urban and industrial maps.

### v0.8 — PDF export and coastal worlds

Ship a printable PDF and two biomes that need water and dry hills the current set does not cover.

- ~~Export a multi-page PDF from the existing print layout (title block, crop marks, legend, tiling)~~
- ~~Support letter, A4, and tabloid paper in that PDF~~
- ~~Implement Mediterranean Scrub~~
- ~~Implement Oceanic Archipelago~~
- ~~Keep generation deterministic per seed; keep PDF pages readable in grayscale~~

### Completion target

A map downloads as a PDF a printer can use, and scrub and island maps are distinct from desert, wetlands, and coastal. **Met:** one multi-page PDF from the print layout on letter, A4, and tabloid; Mediterranean Scrub with dry grass, rocky hills, and gullies; Oceanic Archipelago with islands, beaches, and reefs.

### v0.9 — Strategic sites and editor polish

Cover the maps people name in a campaign, and remove the sharp edges in the editor.

- ~~Add HPG station, Castle Brian entrance, and Star League bunker~~
- ~~Implement Martian~~
- ~~Add scatter and rubble brushes for ruined districts~~
- ~~Show hex numbering on the live map using the same modes as print~~
- ~~Optional on-map legend and elevation key~~
- ~~Optional mouse-wheel zoom~~
- ~~Keyboard focus and movement on the hex map~~
- ~~Raise or speed the 40 × 30 cap so double-blind mapsheets stay fluid~~
- ~~Regional palette variants (same biome, different world colorway)~~
- ~~Accessibility and performance pass on the new content~~

### Completion target

Strategic objectives exist as stamps; the editor stays usable on large maps and with a keyboard. **Met:** HPG station, Castle Brian entrance, and Star League bunker; Martian; scatter and rubble brushes; on-map legend and elevation key; optional wheel zoom; keyboard hex cursor; 48 × 34 cap with a 32 × 34 double-blind template; arid / lush / twilight colorways.

### v1.0 — Table-ready release

- ~~User guide and map-format documentation complete~~
- ~~Sample maps and scene templates cover every shipping biome~~
- ~~North arrow and scale on print and PDF sheets~~
- ~~Map format v2 frozen for the 1.x line (new biomes, optional fields, and building types only)~~
- ~~Migration support for v1 map files~~
- ~~Determinism, print, PDF, accessibility, and export checks on the full biome and building set~~
- ~~Explicit non-VTT scope in the user-facing docs~~

### Completion target

A group can generate, edit, save, and print a mapsheet for any shipping biome without opening a VTT. **Met:** [USER_GUIDE.md](USER_GUIDE.md), sample maps in `samples/`, a scene template per biome, north arrow and 30 m hex scale on chrome sheets, format v2 frozen for 1.x.

### Release commitments

- Stable map format v2 throughout the 1.x release line
- Ten v0.5 biomes plus the v0.6–v0.9 additions
- Initial building set plus the v0.7–v0.9 structures
- Sample maps, templates, and print packs

## After v1.0 — still format v2

v1.x keeps map format **v2**. New biome ids, optional fields, and building types are allowed. No planet file.

### v1.1 — Remaining theaters

Ship the two biomes that do not belong on Inner Sphere tables.

- ~~Implement Alien Fungal~~
- ~~Implement Crystal World~~
- ~~Keep generation deterministic; keep print marks readable in grayscale~~

**Done when:** every biome in [BIOMES.md](BIOMES.md) generates a distinct theater and has a one-click scene. **Met:** Alien Fungal (caps, spore fields, organic pools) and Crystal World (crystal forests, mineral ridges, fissures); scenes `fungal` and `crystal`.

### v1.2 — Table packs

Fill the stamp list that still fits the v2 building record (`type`, footprint, height, CF, label, editorial damage).

- ~~Remaining civilian / industrial / military / infrastructure stamps from [BUILDINGS.md](BUILDINGS.md) that do **not** need armor, basement, rooftop, or occupancy fields~~
- ~~Sample maps for the core theaters (grasslands, urban, alpine, coastal, lunar)~~
- ~~Additional print layouts that still use the v2 sheet (building reference variants, tighter legends)~~
- ~~User-guide gaps found after v1.0~~

**Done when:** a group can print a starter pack of maps and stamps without inventing missing building types at the table. **Met:** remaining v2 stamps (hardened shelter still waits on a later building-record bump); compact sheet layout; core sample maps.

### v1.3 — Generator depth on one map

Make a single mapsheet more interesting without linking maps together.

- ~~Road networks (more than one east–west crossing) as an opt-in generator mode~~
- ~~Scatter / rubble brushes if they missed v0.9~~
- ~~Path brush for painting contiguous roads and rivers~~
- ~~Optional mouse-wheel zoom and live hex numbering if they missed v0.9~~
- ~~Performance pass on 40 × 30 and double mapsheets~~

**Done when:** a dense urban or alpine map can be generated and then edited as paths, not only as hex fills. **Met:** opt-in road network, path brush, compositor pan/zoom.

## Path to v2.0

Not started. A hex-planet experiment (world of hexes, drill-down mapsheets, format v3) was withdrawn.

Candidates, not promises:

- A campaign atlas of arbitrary linked mapsheets
- Construction-combat fields on buildings (armor, basement, rooftop, occupancy) and the remaining [BUILDINGS.md](BUILDINGS.md) types that need them
- Scenario overlays (deployment edges, objective hexes) as static sheet content
- In-editor biome authoring (palette + generator rules as a pack)
- Further print pack styles
- Community map-pack install from a local folder

VTT functionality remains outside the product roadmap.

## Shipped history (roadmap v1)

Kept so older notes still resolve. These versions are complete.

### v0.1 — Prototype

- Seeded hex-map generation
- Map sizes from 6 × 6 to 40 × 30
- Clear, light woods, heavy woods, rough, water, and road terrain
- Elevation generation and editing
- Single-hex and cluster brushes
- Pan, zoom, and fit-to-map controls
- Undo and redo
- Local autosave
- JSON import and export
- PNG export
- Terrain statistics

### v0.2 — Stable editor foundation

- Product documentation
- Fill tool, elevation-level painting, coordinate and grid toggles
- Non-destructive resize and partial regeneration
- Protected manual edits
- Command-based editing actions and tests

### v0.3 — Biome framework

Temperate Grasslands, Dense Forest, Hot Desert, and a biome registry for palettes, textures, and generation rules.

### v0.4 — Advanced natural maps

Alpine Mountains, Wetlands, Volcanic, snow lines, scree, marsh channels, lava, roads, size templates, and terrain presets.
