# Battlegrid user guide

Battlegrid is a local-first BattleTech hex-map generator and editor. It builds a deterministic mapsheet from a seed, lets you paint and stamp it, and exports JSON, PNG, SVG, PDF, or print-ready sheets for the table.

Battlegrid is not a virtual tabletop. It does not place units, track initiative, resolve combat, calculate line of sight, hide fog of war, or host multiplayer sessions. Building damage states are editorial map marks, not live game state.

## Generate a map

1. Open the **Generate** panel.
2. Pick a **biome** (the theater). Every shipping biome is in the list, including **Fungal** and **Crystal**.
3. Choose a **map size**. Standard mapsheets are 16 × 17. Double-blind tables can use 32 × 34. The cap is 48 × 34.
4. Set the **seed**, woods / water / rough weights, **road** chance, and relief.
5. Optionally turn on **Road network** for extra east–west countryside roads (disabled on biomes that never generate a countryside road).
6. Click **Generate battlefield**.

The same seed and settings always produce the same cells. **Colorway** (Default, Arid, Lush, Twilight) only recolours the palette; it does not regenerate terrain.

## Edit the map

The **Terrain** panel splits **Tools**, **Marks**, and **Elevation** into sub-tabs.

- **Brush** paints terrain, marks, or elevation. **Scatter** applies the same stroke to a deterministic subset of hexes in the radius. **Rubble** knocks overlapping buildings to rubble and roughs empty hexes.
- **Path** paints a contiguous hex line as you drag — use it for roads and rivers instead of filling hexes one at a time.
- **Fill region** floods a contiguous terrain patch.
- **Select** and **Lasso** copy, cut, crop, protect, or clear a region.
- Stamp structures from the **Structures** panel (grouped by civilian, industrial, military, and infrastructure). Arrow keys nudge a selected building; `R` rotates, `D` duplicates, Delete removes it. Select a stamp and use **Replace graphic** to drop in a PNG, JPEG, or WebP; the image is clipped to the stamp, stored in the map file, and **Use for every…** copies it onto the rest of that type.
- Click the hex map (or Tab to it) and use arrow keys to move a hex cursor. Enter or Space paints the focused hex. Number keys 1–7 pick terrain types.

Feature marks include crater, scree, ice, crevasse, dry wash, canopy gap, beach, cliff, wall, reef, **spore field**, and **crystal**. Clicking a marked hex again clears it.

On-map **Legend** and **Elev key** overlays match the print legend. **Wheel** optionally zooms with the mouse wheel; the zoom slider always works. **Coords** cycles the same hex-numbering modes used on print sheets.

## Save and load

Maps save as JSON (format **v2**). Use **Save** / **Import** in the toolbar. The editor also autosaves locally. Version-1 files open with an empty building list. Unknown biomes fall back to Temperate Grasslands. Unknown extra fields are ignored.

## Print and export

The **Export** panel writes PNG, SVG, PDF, or a print sheet. **Hex size** defaults to **Tabletop · 1.25 in** (CGL / FASA flat-to-flat) so miniatures sit on the hexes; the map tiles across pages. Print at **100% / actual size** — do not scale to fit. **Fit to page** shrinks the whole map onto one sheet for an overview. Uncheck **Elevation**, **Buildings**, **Hex marks**, or **Notes** to leave those layers off the file; the editor map is unchanged. Chrome sheets include a title block, crop marks, legend, elevation key, **north arrow**, and **scale** (1 hex = 1.25 in ≈ 30 m). An optional building reference sheet lists hex, type, height, construction factor, and state.

**Sheet layout** can be Standard or Compact. Compact shrinks the legend and drops category / height / label columns from the building sheet so more of the page is map.

Grayscale print is a separate toggle. Leave it off for colour table copies.

## Sample maps

Starter JSON maps live in `samples/`. Open one from the editor, or copy the seed and settings from the file’s `generatorProfile` to regenerate.

See [README.md](README.md) for the map-format field list, [BIOMES.md](BIOMES.md) for theaters, and [BUILDINGS.md](BUILDINGS.md) for structure types.
