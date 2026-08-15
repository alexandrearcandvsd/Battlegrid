# Biome Implementation Roadmap

Biomes define the map palette, procedural generation settings, terrain textures, and biome-specific features. All biomes should remain compatible with the common hex terrain and elevation systems.

## Initial biomes

Status: Temperate Grasslands, Dense Forest, Hot Desert (v0.3), Alpine
Mountains, Wetlands, Volcanic (v0.4), Urban, Lunar, Agricultural,
Industrial Wasteland (v0.5), Arctic Tundra, Badlands, Tropical Jungle,
and Coastal (v0.6) are implemented — registry in `src/lib/biomes/`.
Mediterranean Scrub and Oceanic Archipelago shipped in v0.8.
The ten additional theaters listed below shipped in v0.8.1.
Canyon Road is an extra east–west canyon theater (not the Badlands scene).
Martian shipped in v0.9. Alien Fungal and Crystal World shipped in v1.1.

### Temperate Grasslands (implemented)
- Tan and green grass with seasonal color variation
- Light and heavy woods, streams, ponds, and rolling hills
- Optional fields, dirt roads, and hedgerows

### Dense Forest (implemented)
- Continuous tree canopy with scattered clearings
- Light woods, heavy woods, streams, and logging roads
- Fallen trees, rocky outcrops, and elevation-covered ridges

### Hot Desert (implemented)
- Sand, dunes, exposed stone, and dry riverbeds
- Rocky mesas, canyons, scrub, and rare oases
- Wind-shaped textures and strong elevation contrast

### Alpine Mountains (implemented)
- Rock, scree, steep ridges, and snow at higher elevations
- Mountain woods, frozen ponds, cliffs, and narrow passes
- Strong contour definition and elevation-dependent textures

### Wetlands (implemented)
- Marsh, mud, reeds, shallow water, and small islands
- Meandering channels and partially flooded woods
- Variable movement depth and soft, saturated ground textures

### Volcanic (implemented)
- Basalt, ash fields, lava flows, craters, and fissures
- Sparse vegetation and heat-scorched ground
- Bright emissive lava bordered by dark cooled rock

### Urban (implemented)
- Streets, blocks, parks, plazas, and industrial districts
- Buildings, rubble, walls, bridges, and rail lines
- Density presets ranging from small settlements to city centers

### Lunar (implemented)
- Grey regolith, impact craters, ridges, and ejecta fields
- Strong directional shadows and minimal vegetation
- Optional ice deposits, mining sites, and constructed roads

## Additional natural biomes

### Arctic Tundra (implemented)
- Snow, ice sheets, exposed rock, and frozen water
- Crevasses, low scrub, and wind-scoured ridges

### Badlands (implemented)
- Eroded ridges, canyons, dust, and sparse scrub
- Layered sediment colors and winding dry washes

### Canyon Road (implemented)
- One large east–west canyon with a road on the floor
- The road always runs left to right, never north to south
- The floor road meanders from seed to seed; not the same S-curve every generate
- Floor width and cliff walls wander; not a ruler-straight trench
- Cliff walls and a high plateau; not the winding dry washes of Badlands

### Tropical Jungle (implemented)
- Dense vegetation, rivers, swamps, and overgrown ruins
- Broadleaf canopy with irregular clearings

### Coastal (implemented)
- Beaches, dunes, cliffs, tidal flats, and ocean
- Estuaries, rocky coves, and coastal settlements

### Mediterranean Scrub (implemented)
- Dry grass, rocky hills, scattered light woods, and gullies
- Warm soil colors and low, patchy vegetation

### Agricultural (implemented)
- Crop fields, hedgerows, irrigation channels, and villages
- Dirt roads, orchards, barns, and field boundaries

### Oceanic Archipelago (implemented)
- Islands, beaches, reefs, shallow water, and deep ocean
- Volcanic peaks and narrow coastal routes

### Boreal Taiga (implemented)
- Dark conifer woods, muskeg bogs, and snow in the clearings
- Frozen ponds, fallen timber, and low rocky ridges
- Colder and needle-leafed versus Dense Forest; far more canopy than Arctic Tundra

### Tropical Savanna (implemented)
- Open golden grass, scattered tree islands, and seasonal waterholes
- Thorn scrub, termite-mound rough, and wide dirt tracks
- Clumpier than Temperate Grasslands; greener and more wooded than Hot Desert or Mediterranean Scrub

### Temperate Rainforest (implemented)
- Mossy conifers, fern understory, steep drainages, and nurse-log gaps
- Persistent streams, dark wet ground, and few roads
- Wetter and more vertical than Dense Forest; cooler than Tropical Jungle

### Mangrove Estuary (implemented)
- Brackish channels, root mats, and tidal mudflats
- Tangled light woods standing in shallow water; little dry high ground
- Not inland marsh (Wetlands) and not a sandy ocean edge (Coastal)

### Glacial Icefield (implemented)
- Bare ice as the ground, moraine rubble, meltwater, and serac fields
- Crevasses and almost no vegetation
- Harder and more open than Arctic Tundra — ice is the hex, not a mark on a pond

### Karst Highlands (implemented)
- Limestone pavement, sinkholes, disappearing streams, and dry valleys
- Cliffs, cave-mouth rough, and sparse scrub
- No alpine snow line; not the layered red sediment of Badlands

### Alkali Salt Flats (implemented)
- White crust, brine pools, and razor-level playas
- Rim hills at the edge and almost no woods
- Terrestrial and blinding-open, not Lunar regolith and not dune desert

### Fjord Shore (implemented)
- Deep water fingers between steep wooded walls
- Talus, hanging valleys, and narrow coastal tracks
- Not one flooded map edge (Coastal) and not scattered ocean islands (Oceanic Archipelago)

## Constructed and damaged biomes

### Industrial Wasteland (implemented)
- Factories, slag heaps, pipelines, railways, and toxic pools
- Concrete, rusted metal, smoke damage, and contaminated soil

### Post-Apocalyptic Ruins (Urban variant, implemented)
- Rubble, craters, abandoned structures, and broken roads
- Burned vegetation and partially collapsed urban blocks
- Select **Post-apocalyptic ruins** under Urban density

### Open-Pit Extraction (implemented)
- Terraced cuts, spoil heaps, haul roads, and flooded pits
- Benches, sparse pad structures, and contaminated ponds
- The earthworks are the map — not factory blocks (Industrial Wasteland) and not city streets (Urban)

## Extraterrestrial biomes

### Martian (implemented)
- Iron dust, rocky ridgelines, impact craters, and buried ice
- Haul tracks between isolated installations; dry washes as dust channels
- Not grey Lunar regolith and not tan Hot Desert sand

### Alien Fungal (implemented)
- Giant fungi, spore fields, organic pools, and fibrous ground
- Bioluminescent accents and dense fungal forests
- Ichor (not magma) as the lava treatment

### Crystal World (implemented)
- Crystal forests, reflective flats, mineral ridges, and fissures
- Translucent textures and strongly colored formations
- Prismatic Melt as the lava treatment; Glass Flats, not lunar grey

### Ice Moon (implemented)
- Fractured ice crust, cryovolcanic stains, and hard directional shadow
- Buried-ocean seeps and almost no atmosphere or vegetation
- Not grey regolith (Lunar) and not red dust (Martian)

## Shared implementation requirements

Each biome should provide:

- A base color palette for every supported terrain type
- Seamless textures for clear ground, woods, rough terrain, roads, and water
- Elevation colors that become lighter at higher levels
- Generator weights and clustering rules
- Biome-specific terrain features and decoration
- A deterministic result for a given map seed
- Readable print and PNG export output
- Accessible visual distinction beyond color alone

## Recommended implementation order

Shipped through v1.3: Temperate Grasslands, Dense Forest, Hot Desert, Alpine
Mountains, Wetlands, Volcanic, Urban, Lunar, Agricultural, Industrial Wasteland,
Arctic Tundra, Badlands, Tropical Jungle, Coastal, Mediterranean Scrub,
Oceanic Archipelago, Boreal Taiga, Tropical Savanna, Temperate Rainforest,
Mangrove Estuary, Glacial Icefield, Karst Highlands, Alkali Salt Flats,
Fjord Shore, Open-Pit Extraction, Ice Moon, Canyon Road, Martian,
Alien Fungal, Crystal World.

Further theaters are not scheduled. See [ROADMAP.md](ROADMAP.md).
