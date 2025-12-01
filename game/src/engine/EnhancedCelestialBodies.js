/**
 * Enhanced Celestial Bodies
 *
 * Adds more planet types, moons, and special celestial objects:
 * - More planet varieties (ocean, volcanic, frozen, toxic, crystal)
 * - Enhanced moon types
 * - Comets with tails
 * - Ringed planets
 * - Binary star systems
 * - Dyson spheres (megastructures)
 * - Asteroid belts with density
 * - Space anomalies
 */

export const ENHANCED_PLANET_TYPES = {
  // Standard types (existing)
  terran_planet: {
    name: 'Terran Planet',
    colors: ['#2a5a3a', '#4a7a5a', '#3a6a4a'],
    atmosphere: 'breathable',
    resources: ['Water', 'Carbon', 'Silicon', 'Iron'],
    habitability: 0.9,
    description: 'Earth-like world with liquid water and breathable atmosphere'
  },

  rocky_planet: {
    name: 'Rocky Planet',
    colors: ['#8a6a4a', '#6a5a3a', '#5a4a2a'],
    atmosphere: 'thin',
    resources: ['Iron', 'Silicon', 'Titanium', 'Copper'],
    habitability: 0.3,
    description: 'Barren rocky world rich in minerals'
  },

  desert_planet: {
    name: 'Desert Planet',
    colors: ['#daa520', '#c4941f', '#b8860b'],
    atmosphere: 'dry',
    resources: ['Silicon', 'Rare Isotopes', 'Titanium'],
    habitability: 0.4,
    description: 'Arid wasteland with valuable mineral deposits'
  },

  ice_planet: {
    name: 'Ice Planet',
    colors: ['#b0e0e6', '#87ceeb', '#4682b4'],
    atmosphere: 'frozen',
    resources: ['Water', 'Deuterium', 'Rare Isotopes'],
    habitability: 0.2,
    description: 'Frozen world covered in ice and snow'
  },

  gas_giant: {
    name: 'Gas Giant',
    colors: ['#daa520', '#ff8c00', '#ffa500'],
    atmosphere: 'crushing',
    resources: ['Deuterium', 'Exotic Matter', 'Antimatter'],
    habitability: 0,
    description: 'Massive gas giant with swirling storms',
    hasRings: true
  },

  ice_giant: {
    name: 'Ice Giant',
    colors: ['#4682b4', '#5f9ea0', '#20b2aa'],
    atmosphere: 'frozen gas',
    resources: ['Deuterium', 'Water', 'Exotic Matter'],
    habitability: 0,
    description: 'Frozen gas giant',
    hasRings: true
  },

  // NEW Enhanced types
  ocean_planet: {
    name: 'Ocean Planet',
    colors: ['#1e90ff', '#4169e1', '#0066cc'],
    atmosphere: 'humid',
    resources: ['Water', 'Carbon', 'Platinum'],
    habitability: 0.7,
    description: 'World covered entirely in deep oceans',
    cloudPattern: 'swirling',
    animated: true
  },

  volcanic_planet: {
    name: 'Volcanic Planet',
    colors: ['#ff4500', '#8b0000', '#ff6347'],
    atmosphere: 'toxic',
    resources: ['Rare Isotopes', 'Titanium', 'Exotic Matter'],
    habitability: 0.1,
    description: 'Molten hellscape with rivers of lava',
    glow: true,
    animated: true
  },

  frozen_wasteland: {
    name: 'Frozen Wasteland',
    colors: ['#f0f8ff', '#e0f2f7', '#d0e8f0'],
    atmosphere: 'frozen',
    resources: ['Water', 'Crystalline Matrix', 'Deuterium'],
    habitability: 0.1,
    description: 'Completely frozen world in eternal winter'
  },

  toxic_planet: {
    name: 'Toxic Planet',
    colors: ['#9acd32', '#7cfc00', '#adff2f'],
    atmosphere: 'poisonous',
    resources: ['Silicon', 'Carbon', 'Rare Isotopes'],
    habitability: 0,
    description: 'Atmosphere filled with corrosive gases',
    glow: true
  },

  crystal_planet: {
    name: 'Crystal Planet',
    colors: ['#ff00ff', '#da70d6', '#ba55d3'],
    atmosphere: 'thin',
    resources: ['Crystalline Matrix', 'Platinum', 'Exotic Matter'],
    habitability: 0.2,
    description: 'Rare world with crystalline formations',
    sparkle: true
  },

  jungle_planet: {
    name: 'Jungle Planet',
    colors: ['#228b22', '#32cd32', '#00ff00'],
    atmosphere: 'thick',
    resources: ['Carbon', 'Water', 'Rare Isotopes'],
    habitability: 0.6,
    description: 'Dense jungle world teeming with life',
    cloudPattern: 'dense'
  },

  molten_planet: {
    name: 'Molten Core',
    colors: ['#ff8c00', '#ff4500', '#ffa500'],
    atmosphere: 'none',
    resources: ['Titanium', 'Platinum', 'Antimatter'],
    habitability: 0,
    description: 'Exposed planetary core, still molten',
    glow: true,
    animated: true
  },

  shattered_planet: {
    name: 'Shattered World',
    colors: ['#696969', '#808080', '#a9a9a9'],
    atmosphere: 'none',
    resources: ['Iron', 'Titanium', 'Rare Isotopes'],
    habitability: 0,
    description: 'Destroyed planet, broken into fragments',
    debris: true
  },

  hive_planet: {
    name: 'Hive World',
    colors: ['#8b4513', '#654321', '#a0522d'],
    atmosphere: 'organic',
    resources: ['Carbon', 'Silicon', 'Exotic Matter'],
    habitability: 0,
    description: 'Completely covered in alien hive structures',
    hostile: true
  },

  // REALISTIC UPGRADE: Additional planet types for variety
  carbon_planet: {
    name: 'Carbon Planet',
    colors: ['#2f2f2f', '#1a1a1a', '#3f3f3f'],
    atmosphere: 'methane',
    resources: ['Carbon', 'Diamond', 'Graphite', 'Silicon'],
    habitability: 0,
    description: 'Diamond-rich carbon world with graphite mountains',
    sparkle: true
  },

  lava_planet: {
    name: 'Lava Planet',
    colors: ['#ff2200', '#ff6600', '#ff9900'],
    atmosphere: 'superheated',
    resources: ['Rare Isotopes', 'Titanium', 'Platinum', 'Exotic Matter'],
    habitability: 0,
    description: 'Tidally locked planet with rivers of molten rock',
    glow: true,
    animated: true
  },

  super_earth: {
    name: 'Super-Earth',
    colors: ['#3a6a4a', '#2a8a5a', '#4a7a6a'],
    atmosphere: 'thick breathable',
    resources: ['Water', 'Carbon', 'Silicon', 'Iron', 'Rare Isotopes'],
    habitability: 0.8,
    description: 'Massive Earth-like planet with enhanced gravity',
    cloudPattern: 'banded'
  },

  mini_neptune: {
    name: 'Mini-Neptune',
    colors: ['#4a6aaa', '#5a7abb', '#6a8acc'],
    atmosphere: 'hydrogen-helium',
    resources: ['Deuterium', 'Water', 'Exotic Matter'],
    habitability: 0,
    description: 'Small gas planet with extensive atmosphere',
    hasRings: true
  },

  hot_jupiter: {
    name: 'Hot Jupiter',
    colors: ['#aa6a4a', '#bb7a5a', '#cc8a6a'],
    atmosphere: 'superheated gas',
    resources: ['Deuterium', 'Exotic Matter', 'Antimatter'],
    habitability: 0,
    description: 'Massive gas giant in close orbit to parent star',
    glow: true,
    animated: true
  },

  rogue_planet: {
    name: 'Rogue Planet',
    colors: ['#1a1a2a', '#2a2a3a', '#3a3a4a'],
    atmosphere: 'frozen',
    resources: ['Water', 'Deuterium', 'Rare Isotopes', 'Antimatter'],
    habitability: 0,
    description: 'Dark planet ejected from its star system',
    darkGlow: true
  },

  tidally_locked_planet: {
    name: 'Tidally Locked Planet',
    colors: ['#aa5544', '#5544aa', '#888888'],
    atmosphere: 'split',
    resources: ['Silicon', 'Iron', 'Rare Isotopes'],
    habitability: 0.3,
    description: 'Planet with permanent day and night sides',
    split: true
  },

  radioactive_planet: {
    name: 'Radioactive Planet',
    colors: ['#55aa55', '#66bb66', '#77cc77'],
    atmosphere: 'irradiated',
    resources: ['Uranium', 'Plutonium', 'Rare Isotopes', 'Antimatter'],
    habitability: 0,
    description: 'Highly radioactive world glowing with decay energy',
    glow: true,
    radiation: true
  },

  silicate_cloud_planet: {
    name: 'Silicate Cloud Planet',
    colors: ['#cc8855', '#dd9966', '#eeaa77'],
    atmosphere: 'molten rock vapor',
    resources: ['Silicon', 'Titanium', 'Exotic Matter'],
    habitability: 0,
    description: 'Ultra-hot planet with clouds of vaporized rock',
    glow: true,
    cloudPattern: 'turbulent'
  },

  eyeball_planet: {
    name: 'Eyeball Planet',
    colors: ['#ffffff', '#4488ff', '#2266dd'],
    atmosphere: 'breathable',
    resources: ['Water', 'Carbon', 'Silicon'],
    habitability: 0.6,
    description: 'Tidally locked planet with circular habitable zone',
    eyePattern: true
  },

  metal_planet: {
    name: 'Metal Planet',
    colors: ['#aaaaaa', '#cccccc', '#999999'],
    atmosphere: 'none',
    resources: ['Iron', 'Titanium', 'Platinum', 'Copper'],
    habitability: 0,
    description: 'Exposed metallic core of a destroyed planet',
    metallic: true
  },

  storm_giant: {
    name: 'Storm Giant',
    colors: ['#6655aa', '#7766bb', '#8877cc'],
    atmosphere: 'violent storms',
    resources: ['Deuterium', 'Exotic Matter', 'Antimatter'],
    habitability: 0,
    description: 'Gas giant with perpetual planet-wide mega-storms',
    hasRings: true,
    animated: true,
    stormy: true
  },

  // NEW EXOTIC TYPES - ULTRA ENHANCED VARIETY
  brown_dwarf: {
    name: 'Brown Dwarf',
    colors: ['#8b4513', '#a0522d', '#cd853f'],
    atmosphere: 'dense hydrogen',
    resources: ['Deuterium', 'Exotic Matter', 'Antimatter'],
    habitability: 0,
    description: 'Failed star - massive sub-stellar object',
    glow: true,
    animated: true,
    infrared: true
  },

  helium_planet: {
    name: 'Helium Planet',
    colors: ['#ffccff', '#ffaaff', '#ff88ff'],
    atmosphere: 'pure helium',
    resources: ['Helium-3', 'Deuterium', 'Exotic Matter'],
    habitability: 0,
    description: 'Rare planet with pure helium atmosphere',
    sparkle: true,
    hasRings: true
  },

  ammonia_world: {
    name: 'Ammonia World',
    colors: ['#ffaa00', '#ff8800', '#ffcc22'],
    atmosphere: 'ammonia clouds',
    resources: ['Ammonia', 'Water', 'Carbon', 'Rare Isotopes'],
    habitability: 0.3,
    description: 'Planet with ammonia-based biochemistry',
    cloudPattern: 'banded',
    animated: true
  },

  chthonian_planet: {
    name: 'Chthonian Planet',
    colors: ['#884444', '#aa5555', '#cc6666'],
    atmosphere: 'stripped',
    resources: ['Iron', 'Titanium', 'Platinum', 'Exotic Matter'],
    habitability: 0,
    description: 'Gas giant stripped down to its rocky core',
    glow: true,
    metallic: true
  },

  coreless_planet: {
    name: 'Coreless Planet',
    colors: ['#666699', '#7777aa', '#8888bb'],
    atmosphere: 'thin',
    resources: ['Silicon', 'Water', 'Carbon'],
    habitability: 0.2,
    description: 'Rare planet formed without a metallic core',
    anomaly: true
  },

  sub_neptune: {
    name: 'Sub-Neptune',
    colors: ['#5588aa', '#6699bb', '#77aacc'],
    atmosphere: 'thick hydrogen',
    resources: ['Deuterium', 'Water', 'Exotic Matter'],
    habitability: 0,
    description: 'Small ice giant between Earth and Neptune in size',
    hasRings: true,
    cloudPattern: 'swirling'
  },

  puffy_planet: {
    name: 'Puffy Planet',
    colors: ['#ffdd99', '#ffeeaa', '#ffffbb'],
    atmosphere: 'ultra-low density',
    resources: ['Deuterium', 'Helium-3', 'Exotic Matter'],
    habitability: 0,
    description: 'Extremely low-density hot gas giant',
    glow: true,
    animated: true,
    expanded: true
  },

  ocean_moon_planet: {
    name: 'Ocean Moon',
    colors: ['#3366aa', '#4477bb', '#5588cc'],
    atmosphere: 'thin icy',
    resources: ['Water', 'Carbon', 'Rare Isotopes'],
    habitability: 0.5,
    description: 'Large moon with subsurface ocean',
    cloudPattern: 'wispy',
    icy: true
  },

  trojan_planet: {
    name: 'Trojan Planet',
    colors: ['#aa6633', '#bb7744', '#cc8855'],
    atmosphere: 'thin',
    resources: ['Iron', 'Silicon', 'Titanium'],
    habitability: 0.3,
    description: 'Planet trapped in Lagrange point of larger body',
    orbital_resonance: true
  },

  magnetar_orbiter: {
    name: 'Magnetar Orbiter',
    colors: ['#4488aa', '#5599bb', '#66aacc'],
    atmosphere: 'irradiated',
    resources: ['Iron', 'Rare Isotopes', 'Antimatter'],
    habitability: 0,
    description: 'Planet bathed in extreme magnetic radiation',
    glow: true,
    radiation: true,
    magnetic: true
  }
};

export const ENHANCED_MOON_TYPES = {
  rocky_moon: {
    name: 'Rocky Moon',
    colors: ['#999999', '#888888', '#777777'],
    resources: ['Iron', 'Silicon'],
    description: 'Standard rocky moon'
  },

  ice_moon: {
    name: 'Ice Moon',
    colors: ['#e0ffff', '#c0e0ff', '#a0d0ff'],
    resources: ['Water', 'Deuterium'],
    description: 'Frozen moon covered in ice',
    sparkle: true
  },

  volcanic_moon: {
    name: 'Volcanic Moon',
    colors: ['#ff4500', '#cd5c5c', '#8b0000'],
    resources: ['Rare Isotopes', 'Titanium'],
    description: 'Volcanically active moon',
    glow: true
  },

  tidal_moon: {
    name: 'Tidal Moon',
    colors: ['#4682b4', '#5f9ea0', '#6495ed'],
    resources: ['Water', 'Carbon'],
    description: 'Moon with subsurface ocean from tidal heating'
  },

  captured_asteroid: {
    name: 'Captured Asteroid',
    colors: ['#a9a9a9', '#808080', '#696969'],
    resources: ['Iron', 'Silicon', 'Titanium'],
    description: 'Irregular captured asteroid',
    irregular: true
  },

  // NEW EXOTIC MOON TYPES
  cryovolcanic_moon: {
    name: 'Cryovolcanic Moon',
    colors: ['#aaccff', '#bbddff', '#cceeff'],
    resources: ['Water', 'Ammonia', 'Rare Isotopes'],
    description: 'Moon with ice volcanoes erupting water and ammonia',
    glow: true,
    icy: true,
    active: true
  },

  shepherd_moon: {
    name: 'Shepherd Moon',
    colors: ['#888888', '#999999', '#aaaaaa'],
    resources: ['Iron', 'Silicon'],
    description: 'Small moon that maintains planetary ring structure',
    irregular: true,
    shepherd: true
  },

  ring_moon: {
    name: 'Ringed Moon',
    colors: ['#aa8866', '#bb9977', '#ccaa88'],
    resources: ['Silicon', 'Iron', 'Water'],
    description: 'Rare moon with its own ring system',
    hasRings: true,
    sparkle: true
  },

  tidally_locked_moon: {
    name: 'Tidally Locked Moon',
    colors: ['#775544', '#886655', '#997766'],
    resources: ['Iron', 'Silicon', 'Titanium'],
    description: 'Moon always showing same face to parent planet',
    split: true
  },

  lava_moon: {
    name: 'Lava Moon',
    colors: ['#ff3300', '#ff6600', '#ff9900'],
    resources: ['Rare Isotopes', 'Titanium', 'Platinum'],
    description: 'Tidally heated moon covered in molten lava',
    glow: true,
    animated: true
  },

  crystal_moon: {
    name: 'Crystal Moon',
    colors: ['#ff88ff', '#ee77ee', '#dd66dd'],
    resources: ['Crystalline Matrix', 'Silicon', 'Exotic Matter'],
    description: 'Moon with crystalline surface formations',
    sparkle: true,
    reflective: true
  },

  methane_moon: {
    name: 'Methane Moon',
    colors: ['#ffaa44', '#ff9933', '#ff8822'],
    resources: ['Methane', 'Carbon', 'Water'],
    description: 'Moon with methane lakes and atmosphere',
    cloudPattern: 'wispy'
  }
};

export const SPECIAL_CELESTIAL_OBJECTS = {
  comet: {
    name: 'Comet',
    size: 15,
    color: '#e0ffff',
    tail: true,
    tailLength: 500,
    tailColor: '#4488ff',
    resources: ['Water', 'Carbon', 'Rare Isotopes'],
    description: 'Icy comet with glowing tail'
  },

  asteroid_belt: {
    name: 'Asteroid Belt',
    density: 100, // Number of asteroids
    spread: 2000, // Radius of belt
    resources: ['Iron', 'Silicon', 'Titanium', 'Platinum'],
    description: 'Dense field of rocky asteroids'
  },

  nebula: {
    name: 'Nebula',
    size: 3000,
    colors: ['#ff00ff', '#8800ff', '#4400ff'],
    density: 50,
    description: 'Colorful gas cloud',
    ambient: true
  },

  black_hole: {
    name: 'Black Hole',
    size: 100,
    color: '#000000',
    accretionDisk: true,
    diskColor: '#ff6600',
    gravitationalPull: 5000,
    description: 'Massive gravitational anomaly',
    danger: 10
  },

  neutron_star: {
    name: 'Neutron Star',
    size: 30,
    color: '#ffffff',
    pulsing: true,
    radiation: true,
    description: 'Ultra-dense stellar remnant',
    danger: 8
  },

  dyson_sphere: {
    name: 'Dyson Sphere',
    size: 500,
    color: '#00ffff',
    ancient: true,
    description: 'Megastructure enclosing a star',
    gridPattern: true
  },

  wormhole: {
    name: 'Wormhole',
    size: 150,
    color: '#8800ff',
    swirling: true,
    portal: true,
    description: 'Unstable spacetime anomaly',
    danger: 7
  },

  space_station_derelict: {
    name: 'Derelict Station',
    size: 80,
    color: '#666666',
    damaged: true,
    salvageable: true,
    resources: ['Titanium', 'Platinum', 'Electronics'],
    description: 'Abandoned space station, possibly salvageable',
    loot: true
  },

  // NEW EXOTIC SPECIAL CELESTIAL OBJECTS - ULTRA ENHANCED VARIETY
  binary_star_system: {
    name: 'Binary Star System',
    primarySize: 300,
    secondarySize: 200,
    separation: 800,
    primaryColor: '#ffff88',
    secondaryColor: '#ffaa44',
    orbitalPeriod: 0.01,
    description: 'Two stars orbiting their common center of mass',
    danger: 9,
    spectacular: true,
    animated: true,
    dualGlow: true
  },

  proto_planetary_disk: {
    name: 'Proto-Planetary Disk',
    size: 2000,
    colors: ['#aa6633', '#bb7744', '#cc8855', '#dd9966'],
    density: 150,
    innerRadius: 400,
    outerRadius: 2000,
    centralStar: true,
    starSize: 150,
    starColor: '#ffaa44',
    description: 'Disk of gas and dust forming new planets',
    animated: true,
    swirling: true,
    forming: true
  },

  asteroid_cluster: {
    name: 'Dense Asteroid Cluster',
    density: 200,
    spread: 1500,
    clusterSize: 800,
    asteroidSizes: [5, 15],
    resources: ['Iron', 'Silicon', 'Titanium', 'Platinum', 'Rare Isotopes'],
    description: 'Extremely dense field of asteroids',
    danger: 6,
    mineable: true
  },

  comet_swarm: {
    name: 'Comet Swarm',
    cometCount: 15,
    spread: 1800,
    colors: ['#e0ffff', '#c0e0ff', '#a0c0ff'],
    tailLength: 400,
    description: 'Group of comets traveling together',
    spectacular: true,
    animated: true
  },

  trojan_asteroids: {
    name: 'Trojan Asteroids',
    density: 50,
    spread: 600,
    lagrangePoint: 'L4', // or 'L5'
    resources: ['Iron', 'Silicon', 'Titanium'],
    description: 'Asteroids trapped in Lagrange point',
    stable: true
  },

  pulsar: {
    name: 'Pulsar',
    size: 40,
    color: '#ffffff',
    beamColor: '#00ffff',
    rotationSpeed: 0.5,
    beamWidth: 30,
    beamLength: 2000,
    description: 'Rapidly rotating neutron star emitting radiation beams',
    danger: 9,
    radiation: true,
    spectacular: true,
    animated: true
  },

  magnetar: {
    name: 'Magnetar',
    size: 35,
    color: '#ff88ff',
    fieldColor: '#8800ff',
    magneticField: 10000,
    flares: true,
    description: 'Neutron star with extremely powerful magnetic field',
    danger: 10,
    radiation: true,
    magnetic: true,
    animated: true
  },

  white_dwarf: {
    name: 'White Dwarf',
    size: 80,
    color: '#ffffff',
    temperature: 'ultra-hot',
    description: 'Dense stellar remnant - dead star core',
    glow: true,
    radiation: true,
    danger: 4
  },

  red_giant: {
    name: 'Red Giant',
    size: 600,
    color: '#ff4400',
    expanded: true,
    dying: true,
    description: 'Massive dying star in late evolutionary stage',
    glow: true,
    animated: true,
    danger: 8,
    spectacular: true
  },

  blue_supergiant: {
    name: 'Blue Supergiant',
    size: 800,
    color: '#4488ff',
    temperature: 'extremely-hot',
    luminosity: 100000,
    description: 'Enormous extremely hot and luminous star',
    glow: true,
    animated: true,
    danger: 9,
    spectacular: true
  },

  planetary_nebula: {
    name: 'Planetary Nebula',
    size: 2500,
    colors: ['#ff00ff', '#ff44ff', '#ff88ff', '#ffccff'],
    centralStar: true,
    starSize: 60,
    starColor: '#ffffff',
    density: 80,
    expanding: true,
    description: 'Beautiful expanding shell ejected by dying star',
    spectacular: true,
    animated: true,
    ambient: true
  },

  supernova_remnant: {
    name: 'Supernova Remnant',
    size: 3500,
    colors: ['#ff0000', '#ff4400', '#ff8800', '#ffcc00'],
    centralNeutronStar: true,
    neutronStarSize: 30,
    density: 60,
    shockwave: true,
    description: 'Expanding debris from stellar explosion',
    spectacular: true,
    animated: true,
    radiation: true,
    danger: 7
  },

  ring_system: {
    name: 'Planetary Ring System',
    innerRadius: 150,
    outerRadius: 400,
    density: 100,
    colors: ['#ccaa88', '#ddbb99', '#eeccaa'],
    description: 'Dense ring system around celestial body',
    spectacular: true,
    rotating: true
  },

  kuiper_belt: {
    name: 'Kuiper Belt',
    density: 80,
    innerRadius: 5000,
    outerRadius: 10000,
    objectSizes: [3, 12],
    resources: ['Water', 'Carbon', 'Rare Isotopes'],
    description: 'Distant belt of icy objects beyond planets',
    icy: true
  },

  oort_cloud_object: {
    name: 'Oort Cloud Object',
    size: 10,
    color: '#c0e0ff',
    distance: 15000,
    icy: true,
    resources: ['Water', 'Carbon'],
    description: 'Distant icy object from outer reaches',
    isolated: true
  },

  rogue_asteroid: {
    name: 'Rogue Asteroid',
    size: 25,
    color: '#888888',
    velocity: 'high',
    trajectory: 'elliptical',
    resources: ['Iron', 'Silicon', 'Titanium', 'Platinum'],
    description: 'Fast-moving asteroid on unusual trajectory',
    danger: 5,
    mineable: true
  },

  ancient_megastructure: {
    name: 'Ancient Megastructure',
    size: 600,
    color: '#00aaaa',
    pattern: 'geometric',
    age: 'millions of years',
    abandoned: true,
    description: 'Massive ancient alien construction',
    mysterious: true,
    salvageable: true,
    resources: ['Exotic Matter', 'Antimatter', 'Advanced Technology'],
    loot: true
  },

  ring_habitat: {
    name: 'Ring Habitat',
    radius: 500,
    ringThickness: 80,
    color: '#888888',
    rotating: true,
    inhabited: true,
    description: 'Massive rotating space habitat',
    docking: true,
    spectacular: true
  },

  space_elevator: {
    name: 'Space Elevator',
    height: 1200,
    width: 40,
    color: '#aaaaaa',
    anchored: true,
    description: 'Enormous structure connecting planet to orbit',
    spectacular: true,
    functional: true
  },

  gravity_well_anomaly: {
    name: 'Gravity Anomaly',
    size: 200,
    color: '#440088',
    gravitationalPull: 3000,
    unstable: true,
    description: 'Mysterious region of warped spacetime',
    danger: 8,
    anomaly: true,
    swirling: true
  },

  dark_matter_cloud: {
    name: 'Dark Matter Cloud',
    size: 2000,
    color: '#110033',
    density: 40,
    invisible: true,
    gravitationalEffect: true,
    description: 'Invisible cloud of dark matter',
    mysterious: true,
    danger: 6
  },

  stellar_nursery: {
    name: 'Stellar Nursery',
    size: 4000,
    colors: ['#ff6688', '#ff88aa', '#ffaacc'],
    density: 120,
    protoStars: 10,
    description: 'Region where new stars are forming',
    spectacular: true,
    animated: true,
    forming: true
  }
};

/**
 * Generate enhanced planet with more detail
 */
export function generateEnhancedPlanet(seed, distance, index) {
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Select planet type (weighted distribution)
  const typeRoll = rng();
  let planetType;

  if (typeRoll < 0.20) planetType = 'rocky_planet';
  else if (typeRoll < 0.35) planetType = 'desert_planet';
  else if (typeRoll < 0.45) planetType = 'ice_planet';
  else if (typeRoll < 0.55) planetType = 'terran_planet';
  else if (typeRoll < 0.65) planetType = 'ocean_planet';
  else if (typeRoll < 0.73) planetType = 'gas_giant';
  else if (typeRoll < 0.80) planetType = 'volcanic_planet';
  else if (typeRoll < 0.85) planetType = 'toxic_planet';
  else if (typeRoll < 0.90) planetType = 'frozen_wasteland';
  else if (typeRoll < 0.94) planetType = 'jungle_planet';
  else if (typeRoll < 0.97) planetType = 'crystal_planet';
  else if (typeRoll < 0.99) planetType = 'molten_planet';
  else planetType = 'shattered_planet';

  const typeData = ENHANCED_PLANET_TYPES[planetType];

  const planet = {
    name: `Planet ${String.fromCharCode(65 + index)}`,
    planetType: planetType,
    distance: distance,
    angle: rng() * Math.PI * 2,
    orbitSpeed: 0.05 / (distance / 1000),
    radius: 30 + rng() * 50,
    mass: 1000 + rng() * 9000,
    colors: typeData.colors,
    atmosphere: typeData.atmosphere,
    resources: [...typeData.resources],
    habitability: typeData.habitability,
    description: typeData.description,
    temperature: -100 + rng() * 600,
    moons: [],
    landable: typeData.habitability > 0.1,

    // Enhanced properties
    hasRings: typeData.hasRings || (rng() > 0.9 && distance > 2000),
    glow: typeData.glow || false,
    sparkle: typeData.sparkle || false,
    animated: typeData.animated || false,
    cloudPattern: typeData.cloudPattern || 'none',
    hostile: typeData.hostile || false,
    debris: typeData.debris || false
  };

  // Generate moons
  const moonCount = planet.radius > 60 ? (rng() > 0.5 ? 1 + Math.floor(rng() * 3) : 0) : 0;
  for (let i = 0; i < moonCount; i++) {
    const moonDist = planet.radius + 100 + rng() * 150;
    const moonType = rng() > 0.7 ? 'ice_moon' : 'rocky_moon';
    const moonData = ENHANCED_MOON_TYPES[moonType];

    planet.moons.push({
      name: `${planet.name} Moon ${i + 1}`,
      moonType: moonType,
      distance: moonDist,
      angle: rng() * Math.PI * 2,
      orbitSpeed: 0.1 / (moonDist / 50),
      radius: 10 + rng() * 15,
      colors: moonData.colors,
      resources: moonData.resources,
      description: moonData.description,
      sparkle: moonData.sparkle || false,
      glow: moonData.glow || false
    });
  }

  return planet;
}

/**
 * Generate comet with tail
 */
export function generateComet(seed, index) {
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const distance = 1000 + rng() * 4000;
  const angle = rng() * Math.PI * 2;

  return {
    type: 'comet',
    name: `Comet ${index + 1}`,
    distance: distance,
    angle: angle,
    orbitSpeed: 0.02 + rng() * 0.03,
    size: 10 + rng() * 10,
    tailLength: 300 + rng() * 500,
    direction: angle, // Tail points away from star
    color: '#e0ffff',
    tailColor: '#4488ff',
    resources: SPECIAL_CELESTIAL_OBJECTS.comet.resources
  };
}
