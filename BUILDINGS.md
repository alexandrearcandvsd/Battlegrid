# BattleTech Building Implementation Roadmap

Buildings should support BattleTech-scale combat, clear hex footprints, destruction states, and meaningful tactical objectives.

Status: the building layer shipped in v0.5 with format v2. v0.7 adds the
table-relevant types and editorial destruction states. v0.9 adds HPG station,
Castle Brian entrance, and Star League bunker. v1.2 adds the remaining stamps
that fit the v2 building record (`type`, footprint, height, CF, label,
editorial damage). Implemented: residential house, apartment block, high-rise
tower, office tower, shopping center, hotel, hospital, school, government
building, police station, fire station, spaceport terminal, warehouse, factory,
heavy assembly plant, BattleMech factory, vehicle factory, munitions plant,
refinery, chemical plant, steel mill, automated storage depot, power plant,
fusion reactor, mining facility, water-treatment plant, command headquarters,
fortified bunker, infantry barracks, BattleMech hangar, vehicle garage,
aerospace hangar, repair bay, ammunition depot, fuel depot, radar station,
communications array, air-defense emplacement, turret control building,
training facility, mech bay, repair gantry, deployment hangar, DropShip landing
pad, DropShip service facility, OmniMech configuration bay, salvage yard,
coolant station, munitions loading station, MechWarrior ready room, bridge,
elevated highway, rail station, maglev terminal, communications tower, sensor
tower, pipeline junction, electrical substation, water tower, dam, tunnel
entrance, spaceport control tower, HPG station, planetary command center,
Castle Brian entrance, Star League bunker, data center, intelligence facility,
research laboratory, prototype storage facility, noble estate, governor's
palace, orbital-defense control center, and terraforming station — with
footprints, rotation, height, construction type, construction
factor, entrances, labels, and intact / lightly damaged / heavily damaged /
burning / collapsed / rubble states. Saved `damaged` remains an alias of
heavily damaged. Wall hex marks dress compounds and city blocks.

Hardened shelter still waits on construction-combat fields (armor) that need
a later building-record bump. Types that need basement, rooftop, or occupancy
fields wait with it. See [ROADMAP.md](ROADMAP.md).

## Civilian buildings

- Residential house
- Apartment block
- High-rise tower
- Commercial office
- Shopping center
- Hotel
- Hospital
- School
- Government building
- Police station
- Fire station
- Spaceport terminal

## Industrial buildings

- Factory
- Heavy assembly plant
- BattleMech factory
- Vehicle factory
- Munitions plant
- Refinery
- Chemical plant
- Steel mill
- Warehouse
- Automated storage depot
- Power plant
- Fusion reactor
- Mining facility
- Water-treatment plant

## Military buildings

- Command headquarters
- Fortified bunker
- Infantry barracks
- BattleMech hangar
- Vehicle garage
- Aerospace hangar
- Repair bay
- Ammunition depot
- Fuel depot
- Radar station
- Communications array
- Air-defense emplacement
- Turret control building
- Hardened shelter (later — needs armor on the building record)
- Training facility

## BattleMech support buildings

- Mech bay
- Repair gantry
- Deployment hangar
- DropShip landing pad
- DropShip service facility
- OmniMech configuration bay
- Salvage yard
- Coolant station
- Munitions loading station
- MechWarrior ready room

## Infrastructure

- Bridge
- Elevated highway
- Rail station
- Maglev terminal
- Communications tower
- Sensor tower
- Pipeline junction
- Electrical substation
- Water tower
- Dam
- Tunnel entrance
- Spaceport control tower

## Strategic objectives

- HPG station
- Planetary command center
- Castle Brian entrance
- Star League bunker
- Data center
- Intelligence facility
- Research laboratory
- Prototype storage facility
- Noble estate
- Governor's palace
- Orbital-defense control center
- Terraforming station

## Shared building properties

Every building definition should support:

- Display name and building category
- One-hex or multi-hex footprint
- Construction type
- Building height in levels
- Construction factor
- Armor value where applicable
- Basement type
- Entrance and access hexes
- Rooftop access and landing capability
- Movement restrictions
- Line-of-sight blocking
- Cover provided to adjacent units
- Occupancy and infantry capacity
- Flammable or explosive contents
- Destruction and rubble states
- Optional objective value

## Construction types

- Light
- Medium
- Heavy
- Hardened
- Fortified

## Visual states

Each building should provide:

- Intact
- Lightly damaged
- Heavily damaged
- Burning
- Collapsed
- Rubble

## Recommended initial implementation

1. Residential house
2. Apartment block
3. Warehouse
4. Factory
5. Office tower
6. BattleMech hangar
7. Fortified bunker
8. Command headquarters
9. Bridge
10. Communications tower
11. Fuel depot
12. DropShip landing pad

This initial set covers urban combat, industrial maps, military bases, tactical objectives, and BattleMech support facilities.
