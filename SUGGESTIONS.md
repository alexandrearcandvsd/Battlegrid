# Battlegrid suggestions

Idea dump for what could be added after **v1.3**. Not a roadmap, not scheduled, not promised. Battlegrid stays a local-first mapsheet generator, not a VTT, unless a later decision says otherwise.

Ideas marked **out of current scope** contradict the product exclusions in [ROADMAP.md](ROADMAP.md) (tokens, initiative, combat, live damage, fog, multiplayer, runtime LOS, rules, force management). They are listed so they are not forgotten if scope ever changes.

---

## Generator

- North–south countryside roads, not only east–west
- Diagonal or forked road networks (T-junctions, loops around a town)
- Optional rail as a generated route, not only a stamp
- Optional pipeline / power-line corridors as generated paths
- Hedgerow / field-boundary generator for Agricultural
- Street-grid orientation picker (aligned to map edge vs rotated 30°)
- Urban block size slider (fine grain vs superblocks)
- Urban river / canal through a city
- Coastal settlement density (village on the shore vs empty beach)
- Island count / island size sliders for Oceanic Archipelago
- Canyon depth / floor-width sliders for Canyon Road and Badlands
- Snow-line elevation for Alpine and Taiga
- Tide level for Coastal and Mangrove (more beach vs more water)
- Oasis / waterhole count for Desert and Savanna
- Crater density for Lunar and Martian
- Lava coverage slider for Volcanic
- Spore-field / crystal-grove density for Alien Fungal and Crystal World
- Mixed-terrain “front” (woods on one half, open on the other) without 180° symmetry
- Asymmetric “attacker / defender” generation (one side more cover)
- Ridge-line / valley-line seeds the user can draw before generate
- “Keep these hexes, regenerate the rest” from a lasso (partial generate from a sketch)
- Named operation templates that store full generator settings (not just biome)
- Recent seeds list / favorite seeds
- Seed from a phrase (“Iron Mesa 1847”) with a shown hash so two people can match
- Lock individual sliders when randomizing the rest
- Generate N variants of the same settings, pick one
- Side-by-side compare two seeds
- “Reroll woods only” / “reroll water only” / “reroll elevation only”
- Elevation style: rolling vs mesa vs terraced pit vs cliff coast
- Water style: ponds vs one river vs braided channels vs sheet flood
- Woods style: clumps vs belts vs continuous canopy
- Rough style: scree fans vs boulder fields vs termite mounds vs slag
- Optional second river
- Optional lake plus river outlet
- Bridge auto-place where a generated road crosses water
- Ford / causeway marks on shallow crossings
- Dirt vs paved road skins as a generator choice
- Hidden / overgrown road option (jungle, ruins)
- No-road biomes stay no-road; add a “forced track” override for bases
- DropShip-pad clearing: flatten and clear a circle, then stamp
- Compound generator: wall ring + gate + 2–4 stamps inside
- Farmstead generator: house, barn, hedgerow, dirt track
- Village generator: a handful of houses on a lane
- Firebase generator: hangar, bunker, pad, radar
- Ruin field generator: rubble, craters, collapsed stamps
- Mine / pit generator for Open-Pit Extraction (benches, haul switchbacks)
- Star League cache: bunker + overgrown approach
- HPG compound: station + walls + approach road
- “Empty table” generate: almost all clear, for custom stamping
- “Dense mess” generate: max woods/rough/buildings for city fights
- Double-blind pair: generate two maps that share a seed family but are not mirrors
- Mirror across a chosen axis (N–S, E–W, or a drawn line), not only 180°
- Rotate generated result 60° / 120° after generate
- Invert elevation (high becomes low) as a one-shot
- Swap woods and rough as a one-shot
- Quota mode: “exactly 12 water hexes” instead of a percentage
- Minimum contiguous woods patch size
- Maximum water blob size (no inland seas unless asked)
- Edge constraints: “north edge is all water”, “south edge is a ridge”
- Protected-edge generate: lock the rim so two printed sheets can be taped
- Import a height sketch (PNG) as elevation
- Import a painted mask (PNG) as woods/water/rough
- Export the generator profile as a reusable preset file
- Import a preset file without replacing the open map
- Per-biome “advanced rules” panel (cluster radius, road style, district mix)
- Disable a biome’s special marks (no crevasses, no reefs) for a cleaner sheet
- Time-of-day / season as a colorway-like switch that also tweaks snow and water
- Wind direction mark that only affects print chrome (sand streaks, smoke)
- Weather overlay as editorial marks: fog banks, ash fall, ice storm (static)

---

## Theaters (new biomes)

Each should be a distinct generator, not a recolor. Colorways already cover arid / lush / twilight.

- Steppe / high plains (wind, almost no woods, long sight lines)
- Flooded paddy / rice terrace
- Monsoon river delta (different from Mangrove and Wetlands)
- Peat bog / blanket bog (different from Taiga muskeg)
- Cloud forest
- Bamboo hills
- Eucalyptus / fire-prone woodland
- Chaparral (different from Mediterranean Scrub)
- Oasis basin (different from Hot Desert dunes)
- Erg (pure dune sea)
- Hamada (stone desert)
- Wadi network
- Mesa country (different from Badlands washes and Canyon Road)
- Lava tube / shield-volcano flats (different from Volcanic fissures)
- Geyser basin / sinter terraces
- Black-sand volcanic beach
- Atoll / lagoon (different from Archipelago)
- Sea ice / pack ice (different from Glacial Icefield)
- Permafrost sink / thermokarst
- Underground / cavern mapsheet (stalagmites as rough, no sky)
- Castle Brian interior levels (corridors as “roads”, blast doors as stamps)
- Space-station / grav-deck interior
- DropShip cargo bay interior
- Urban undercity / sewer
- Arcology roof
- Hive city stacks
- Shanty sprawl
- Glass-and-steel downtown (different from current Urban blocks)
- Suburb / tract housing
- Company town
- Prison / internment compound
- Spaceport field (pads, taxiways, not a city)
- Naval yard / drydock
- Oil-platform topside
- Refinery island
- Scrapyard mega-field
- Irradiated exclusion zone (different from Industrial Wasteland)
- Terraforming worksite (different from the stamp)
- ComStar / Word of Blake compound biome
- Clan enclave
- Periphery dirt-town
- Combine castle-town
- Confederation canal city
- Lyran industrial park
- Federated Suns county seat
- Free Worlds League port
- Capellan agro-commune
- Rasalhague winter town
- Outworlds landing strip
- Circinus pirate hold
- Venusian hell (pressure, acid, almost no structures)
- Titan / hydrocarbon lakes
- Asteroid surface (micro-g, hard shadows)
- Mercury / tidally locked terminator
- Gas-giant moon sulfur flats
- Ruined Star League city overgrown
- Battlefield after a recent fight (craters, wrecks as stamps, burning)
- Night-only palette biome (not just Twilight colorway)
- Underwater / aquatic (if the table ever wants a submerged fight)
- Vertical cliff-face mapsheet (elevation is the whole game)
- Two-biome blend on one sheet (coastal + jungle, alpine + glacier) without a planet

---

## Marks and cell features

- Ford, bridge-hex, causeway, jetty, pier
- Hedge, stone wall (linear, not only compound wall), fence, berm
- Trench, foxhole, bunker slit, minefield (editorial), wire
- Shell hole vs crater (scale)
- Smoke column, ash drift, oil slick
- Crop row, orchard, vineyard, paddy bund
- Boardwalk, pontoon, sandbag
- Billboard, wreck, civilian vehicle hulk (static scenery)
- ’Mech wreck / vehicle wreck stamps that are marks, not buildings
- Landing-beacon, nav-buoy, survey stake
- Cave mouth, sinkhole (karst already implies this — make it a mark)
- Hot spring, geyser, fumarole
- Graveyard, shrine, standing stone
- Billboard / neon (urban)
- Graffiti / wanted poster (print-only flavor)
- Hex tags the user types (beyond the current note)
- Custom mark pack (user-drawn SVG icons)
- Mark legend that only lists marks present on this map
- Toggle “military marks” vs “civilian marks” in the Marks tab
- Linear marks that span hex edges (fence along a row)
- Area marks (contaminated zone wash) that are not terrain

---

## Elevation and relief

- Cliff-only brush (steep drop without raising a plateau)
- Terrace / bench brush for pits and paddies
- Smooth / erode elevation (soften spikes)
- Terrace-ize (quantize to 2–3 levels)
- Raise/lower a whole selection by 1
- Elevation from a drawn ridgeline
- Contour-line overlay on the live map (not only print)
- Slope arrows / “this hex is a cliff face” glyph
- Sub-level / basement hexes (needs a format bump)
- Depth for water (shallow / deep) as a first-class field
- Pavement height vs ground (overpasses)
- Printable contour interval picker
- Elevation histogram in the Generate or Terrain panel
- “No cliffs” generate (max adjacent delta 1)

---

## Structures

- Hardened shelter (blocked on armor on the building record)
- Basement type, rooftop access, landing pads on roofs
- Occupancy / infantry capacity (static metadata for the reference sheet)
- Armor value, CF already exists — show armor when the record can hold it
- Explosive / flammable contents flag on the reference sheet
- Construction type already exists — add Fortified as a used value
- Per-hex footprint editor (draw the stamp shape)
- Custom stamp from a selected region
- User stamp library (local folder of JSON stamps)
- Building height paint after stamp
- Align stamp to road / wall
- Snap stamp to street grid
- Multi-stamp “campus” (HQ + barracks + pad) as one drop
- Copy building properties onto another stamp
- Building search / filter by name, CF, height, category
- Favorite stamps
- Recently used stamps
- Hide stamps that do not fit the current biome (optional)
- Auto-label from type + hex (“Hangar 14Q”)
- Sequential labels (House 1, House 2)
- Entrance arrows on the live map, not only metadata
- Printable door / access diagram
- Rubble footprint different from intact footprint
- Partial-collapse state that occupies fewer hexes
- On-fire radius mark (editorial, not live)
- Interior floor plans as a second sheet (still static)
- Parking / hardstand stamp
- Helipad / VTOL pad distinct from DropShip pad
- Gatehouse, blast door, airlock
- Watchtower, pillbox, dragon’s teeth
- Civilian car park, bus depot, market stalls
- Church / temple / mosque / shrine (generic “place of worship”)
- Stadium, arena, parade ground
- Grain silo, greenhouse, feedlot
- Shipyard crane, drydock
- Maglev guideway as a linear stamp
- Monorail, elevated rail already exists — add at-grade tram
- Billboard tower, water-treatment already exists — add sewage plant
- Prison block, courthouse, embassy
- Hotel already exists — add casino, resort
- School already exists — add university, academy
- Hospital already exists — add clinic, field hospital
- More Clan / SLDF flavor stamps that still fit v2
- “Unknown structure” generic stamp for homemade sites
- Building color override (paint a hangar desert-tan)
- Building scale preview in the panel (hex outline)
- Ghost of invalid placement explains why (water, overlap, edge)

---

## Editor and tools

- Undo stack visible (named steps)
- Repeat last stamp / last brush
- Eyedropper for terrain, mark, elevation, building type
- Measure tool (hexes and ~meters) that does not resolve LOS
- Ruler that snaps to hex centers
- Angle / facing widget for teaching hex facings (not units)
- Hex-range ring overlay (2 / 3 / 4 / 7) as a static aid
- Print that ring as an optional overlay sheet
- Snap-to-hex notes with leader lines
- Text boxes that are not tied to a hex (title, briefing blurb)
- North-of-map briefing field stored in JSON
- Layer for “GM only” notes that omit from player print
- Two print roles: player sheet vs referee sheet
- Bookmark hexes
- Jump to hex by coordinate
- Minimap
- Overview at 25% always visible
- Split view: two maps (for double-blind prep) — still no play
- Dark / light editor chrome (map palettes stay biome-true)
- High-contrast editor chrome
- Larger click targets / color-blind patterns already exist — add a deuteranopia preview
- Grayscale preview in the editor, not only at export
- Brush strength / opacity for scatter
- Square / hex / circle brush shapes
- Spray that avoids water or avoids roads
- Replace terrain type globally (“all light woods → heavy”)
- Replace one building type with another
- Select by terrain / by mark / by elevation / by building type
- Invert selection
- Grow / shrink selection
- Save selection as a named region
- Lock individual hexes from the keyboard
- Hex inspector panel (all fields of one cell)
- Multi-cell inspector (mixed values shown as “—”)
- Copy hex style (terrain+elev+mark) without a region
- Paste in place / paste centered
- Rotate selection 60° (hard on hexes — worth a prototype)
- Flip selection N–S or E–W, not only the whole map
- Expand map from a chosen edge only
- Crop to content (trim empty clear rim)
- Wrap-aware crop warnings
- Grid density / hex-size on screen independent of print
- Custom hex size in meters (still 30 m default)
- Coordinate systems: offset, axial, numbered 0101, letter-number
- Match a published mapsheet’s numbering scheme
- Keyboard shortcuts cheat sheet in the app
- Rebind shortcuts
- Tablet / Apple Pencil: pressure = brush size
- Two-finger pan always; wheel zoom stays optional
- Fullscreen map
- Zen mode (hide sidebar)
- Focus mode (dim unselected layers)
- Autosave interval picker
- Autosave to a chosen folder (File System Access) not only localStorage
- Multiple local slots (“Iron Mesa”, “Sunday game”)
- Map library window (thumbnails of recent JSON)
- Duplicate this map as a new file
- Dirty-state title (unsaved •)
- Warn on generate if the map has unsaved stamps
- Recovered-file banner that is harder to miss
- Import several JSON files into the library at once
- Drag-and-drop JSON onto the window
- Watch a folder and offer to reload
- Compare two JSON files (diff terrain / buildings)
- Validate a file and list dropped fields
- “Why is this hex protected?” tooltip
- Layer solo (alt-click visibility)
- Structures locked by default after generate (optional)
- Paint-through-buildings toggle
- Snap path brush to existing roads
- Path brush width (1 / 2 hex boulevard)
- Straight-line constraint (shift) already for pan — add for path
- Click-click polyline (not only drag)
- Close a loop (compound wall)
- Offset a path (parallel road)
- Smooth a jagged painted river
- Thin a fat woods blob

---

## Print and export

- More paper sizes (A2, 11×17 already tabloid — add 13×19, A1 tiles)
- Poster mode (one huge page if the printer allows)
- Hex size on paper picker (10 mm, 12 mm, 1 inch)
- Bleed / no-bleed
- Cut marks vs fold marks
- Registration marks for double-sided (player / referee)
- Optional hex-edge darkening for table visibility
- Optional white-stroke on terrain for cheap printers
- Pattern fills that survive photocopy better
- Printable dry-erase friendly (less ink in clear hexes)
- Laminate-safe margins
- Page 1 = map, page 2 = building sheet, page 3 = briefing (optional)
- QR code on the sheet that points at nothing online — encodes the seed
- QR that encodes the whole JSON (size limits — maybe seed + profile only)
- Scannable seed line in a bigger font
- Campaign header (force names, date, location) as chrome only
- Hidden hex numbers (every nth)
- Numbers only on the rim
- Letter-number on rows, digits on cols
- Match CGL / old FASA numbering if a scheme is documented
- Overlay a second PDF (scenario text) — merge locally
- Export buildings CSV
- Export hex CSV (col, row, terrain, elev, mark)
- Export GeoJSON-like hex collection
- Export a Godot / Foundry-friendly JSON **without** becoming a VTT
- Export SVG with layers named for Illustrator
- Export PNG per layer (terrain, structures, chrome)
- 2× / 4× already — add 8× for huge posters
- WebP / print-TIFF
- Color profile note (sRGB)
- Proof: “this page is 1:1 at 12 mm hexes”
- Tile overlap (1 hex shared) so taped sheets meet
- Back-print: same map mirrored for a see-through setup
- Blind-setup kit: two PDFs, shared seed, no common buildings
- Printer calibration sheet (hex, swatches, 30 m bar)
- Legend in a side column vs bottom strip vs separate card
- Pocket legend card (A6 / 4×6)
- Building cards (one stamp per card) for the referee
- Terrain key poster
- Foldable hex-map (show fold lines)
- Zine / digest layout
- “No chrome” export (just hexes) for pasting into a VTT the user already has
- Watermark (“PLAYTEST”, “DRAFT”)
- Filename from seed + biome + size
- Batch export the sample set
- Batch export every biome at the current seed
- Print queue: several open maps (library) to one PDF

---

## Files, format, and packs

- Optional fields on v2: armor, basement, rooftop, occupancy, water depth
- Format bump only when a field cannot be optional
- Map pack manifest (folder of JSON + a contents list)
- Pack installer from a local zip
- Pack version / author / license in the manifest
- Community pack = local folder, no store
- Biome pack: palette + textures + generator rules as JSON/SVG
- In-editor biome authoring (the roadmap candidate)
- Colorway authoring
- Stamp pack
- Mark pack
- Print-chrome pack (title block style)
- “Official-looking” vs “notebook” chrome themes
- Embed textures in the JSON (large) vs sidecar folder
- Compress autosave
- Export a “replay” of generate + edits as a list of commands
- Apply a command list to a blank map (deterministic rebuild)
- Schema / JSON Schema for v2
- CLI: `battlegrid generate --biome coastal --seed X --out map.json`
- CLI: print to PDF headless
- Headless PNG for sample regeneration in CI (already have some of this)
- Fuzz import of broken files
- Migration notes when a biome id is renamed
- Unknown biome already falls back — offer “keep unknown id”
- Attach a short briefing markdown file beside the JSON
- Sidecar `.notes.md` for the referee
- Checksum in the file so two groups can verify they have the same map

---

## Atlas and multi-sheet (not a planet)

The hex-planet experiment was withdrawn. These are sheet-linking ideas that do not wrap a globe.

- Named atlas: a list of mapsheet files and how they touch
- Edge join: “this map’s east rim = that map’s west rim”
- Manual stitch: copy a rim onto the neighbor (user-approved)
- Shared-edge generate: like the withdrawn planet stitch, but for two files you choose
- March / travel: an ordered list of sheets to print
- Atlas index page (names, seeds, biomes, thumbnails)
- Drop a handmade v2 file into an atlas slot
- Atlas is just a folder + `atlas.json`
- No world hex grid required
- Optional 2×2 or 3×3 sheet wall for a big table
- Warn if neighbor rims do not match
- “Make neighbor” button: new file, shared rim locked, rest generated
- Campaign folder: several atlases, still one open map
- Recents for atlases
- Print the index only
- Print a path of sheets
- Labels on the index (“LZ”, “town”, “ridge”) as editorial marks
- Still not units, still not a living world simulation

---

## Samples, docs, and teaching

- Sample per remaining theater (not only the six core files)
- “How this seed was built” comment in each sample
- Before / after edit samples (generated vs stamped)
- Double-blind sample pair
- Print-pack sample PDF in `samples/`
- Short video or GIF of path brush, scatter, protect
- In-app tour
- Empty-state tips
- “First map in five clicks” card
- Scenario-writing tips (still static objectives)
- Hex-facing primer
- Elevation primer (what +2 means at the table)
- CF / height primer for the building sheet
- Accessibility notes (what survives grayscale)
- Translator-friendly UI strings (no art-in-text)
- French / German UI (optional)
- Metric / US customary scale toggle (30 m vs ~100 ft)
- More user-guide screenshots
- One-page cheat sheet PDF
- CONTRIBUTING / how to add a biome
- How to add a stamp
- How to add a mark
- Texture authoring notes
- Print shop notes (what to ask a copy center)

---

## Quality, performance, and robustness

- Faster generate on 48 × 34
- Faster stamp of large footprints
- Virtualize the hex SVG or move hot path to canvas
- Web worker for generate
- Cancel generate
- Progress bar on generate
- Memory cap warning
- Stress test: 48 × 34 urban + 200 stamps
- Property tests: determinism across platforms
- Visual regression screenshots per biome
- Print golden SVGs
- Fuzz brushes
- A11y audit: every control has a name
- Keyboard-only stamp placement
- Screen-reader hex announcement
- Reduced-motion (skip texture animation if any)
- Contrast checker for a biome palette
- “This colorway fails grayscale” warning
- Better empty/error states on import
- Quota-full autosave message that is actionable
- Corrupt-file doctor (show which field failed)
- Telemetry-free by design — keep it that way
- Offline-only flag in the UI so it is obvious
- CSP / no remote calls audit
- Dependency pin / sbom for the web app

---

## UI chrome and information

- Seed + biome + size always in the title bar
- Mini legend that does not hide the zoom slider
- Collapsible Generate sections
- Presets at the top, sliders behind “Advanced”
- Urban density next to biome when relevant (already) — hide when not, more clearly
- Disable road sliders with a one-line why
- Map statistics: more than counts (largest woods blob, longest road)
- “Table time” estimate (joke or based on hex count)
- Building count by category
- Elevation min / max / mean
- Water connected to the map edge? (coastal check)
- Unlabeled stamps warning before print
- Overlapping stamps warning
- Stamps on water warning
- Protected-hex count already exists — show a map of them more clearly
- Layer chip tooltips
- Status line that does not vanish
- Notice history
- Copy notice (seed) to clipboard
- Share-as-text: biome, seed, size, sliders (for voice/chat)

---

## Scenario overlays (static sheet content)

Still not a rules engine.

- Deployment edge wash (north 2 rows = “Attacker”)
- Home-edge labels
- Objective hex marks (flag, extract, hold)
- Numbered objective list on the building / briefing sheet
- Suggested lance-size / BV as text only (user-typed)
- Turn-1 weather line (user-typed)
- Forced-withdrawal edge
- Hidden-objective layer for the referee print
- Scatter-arrow / landing-deviation ring (static)
- Minefield belts as marks
- Artillery-target numbers on hexes (static)
- Initiative is still out of scope — do not add a tracker

---

## Construction-combat metadata (static)

For the reference sheet and later stamps. Not live destruction.

- Armor on the building record
- Basement: none / crawl / level / parking
- Rooftop: access, VTOL, no landing
- Occupancy
- Explosive / fuel / ammo flags
- CF already shown — add a printable “to-rubble” reminder as text, not a calculator
- Construction type used consistently on every stamp
- Hardened / Fortified actually distinct on the sheet
- Per-hex CF for multi-hex stamps (optional)
- Entrance hex list printable
- Movement cost notes as text (not enforced)

---

## Out of current scope

Only if the product stops being “not a VTT.”

- Unit tokens
- Unit facing and stacking
- Initiative and phase trackers
- Heat, damage, crits
- Live building HP / armor ablation
- Fog of war
- Runtime line of sight
- Sensor / ECM bubbles
- Multiplayer / shared session
- Accounts, cloud sync, live cursors
- Rules enforcement
- Force builder / MUL import
- Record sheets
- Campaign logistics, repair, salvage as a game
- Chat, voice, video
- Animation, physics
- Hex-planet / globe world (withdrawn; do not revive without a new decision)
- Living-world climate simulation

---

## Wild / later

- Hexes that are not pointy-top
- Square-grid mode (not BattleTech)
- 3D paper craft (cut-out hills)
- CNC / laser-cut hex tiles from the JSON
- 3D-print STL of elevation
- Table projector mode (the map is the table)
- Phone as a private referee legend
- Seed from a photo of a real place (classifier → sliders) — novelty
- LLM “describe a fight, get sliders” — keep determinism, do not hide the seed
- Music / ambience — no
- NFT / marketplace — no
- Always-online DRM — no

---

## How to use this file

Pick a small handful. Promote those into [ROADMAP.md](ROADMAP.md) when they are actually next. Leave the rest here. If an idea needs a format bump, say so in the roadmap item and keep v2 maps opening.
