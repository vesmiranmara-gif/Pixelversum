#!/usr/bin/env node
/**
 * PIXELVERSUM - ULTRA HIGH DETAIL CELESTIAL SPRITE GENERATOR
 * Generates massively detailed, heavily pixelated celestial body sprites
 * With complex geological features: rivers, lakes, seas, mountains, canyons, volcanoes, etc.
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public/sprites');

// Configuration - INCREASED RESOLUTION WITH REALISTIC SIZE DIVERSITY
const CONFIG = {
  spritesPerPlanetType: 80,
  spritesPerMoon: 80,
  spritesPerAsteroid: 80,
  stellarClasses: ['O', 'B', 'A', 'F', 'G', 'K', 'M', 'BrownDwarf', 'WhiteDwarf', 'NeutronStar', 'Pulsar', 'RedGiant', 'BlueGiant', 'RedSuperGiant', 'BlueSuperGiant'],
  planetTypes: ['terran', 'rocky', 'desert', 'ice', 'frozen', 'lava', 'volcanic', 'ocean', 'carbon', 'crystal', 'metal', 'eyeball', 'tidally_locked', 'radioactive', 'super_earth', 'jungle', 'chthonian', 'iron_core', 'hycean', 'coreless'],

  // REALISTIC SIZE DIVERSITY - Based on actual stellar/planetary physics
  // Canvas limit: max ~32,767px per dimension, so with 24 frames: max ~1360px per frame
  starSizes: {
    'O': { min: 900, max: 1100 },               // Massive blue supergiants
    'B': { min: 800, max: 1000 },               // Large blue-white stars
    'A': { min: 700, max: 900 },                // White stars
    'F': { min: 650, max: 850 },                // Yellow-white stars
    'G': { min: 600, max: 800 },                // Sun-like stars (baseline)
    'K': { min: 500, max: 700 },                // Orange dwarfs
    'M': { min: 300, max: 500 },                // Red dwarfs (small)
    'BrownDwarf': { min: 200, max: 350 },       // Failed stars (tiny)
    'WhiteDwarf': { min: 150, max: 300 },       // Collapsed remnants (very small)
    'NeutronStar': { min: 100, max: 200 },      // Ultra-dense remnants (smallest)
    'Pulsar': { min: 100, max: 200 },           // Spinning neutron stars
    'RedGiant': { min: 1100, max: 1300 },       // Swollen red giants (huge)
    'BlueGiant': { min: 1000, max: 1200 },      // Massive blue giants
    'RedSuperGiant': { min: 1200, max: 1360 },  // Enormous red supergiants (largest, at canvas limit)
    'BlueSuperGiant': { min: 1100, max: 1300 }  // Massive blue supergiants
  },

  planetSizes: {
    'terran': { min: 400, max: 600 },           // Earth-like (medium)
    'rocky': { min: 300, max: 500 },            // Rocky worlds (small-medium)
    'desert': { min: 350, max: 550 },           // Desert worlds
    'ice': { min: 300, max: 500 },              // Ice worlds (small-medium)
    'frozen': { min: 250, max: 450 },           // Frozen worlds
    'lava': { min: 300, max: 500 },             // Lava worlds
    'volcanic': { min: 350, max: 550 },         // Volcanic worlds
    'ocean': { min: 400, max: 650 },            // Ocean worlds (can be large)
    'carbon': { min: 300, max: 500 },           // Carbon planets
    'crystal': { min: 250, max: 450 },          // Crystal planets
    'metal': { min: 200, max: 400 },            // Metal-rich (small, dense)
    'eyeball': { min: 350, max: 550 },          // Tidally locked
    'tidally_locked': { min: 300, max: 500 },   // Tidally locked
    'radioactive': { min: 250, max: 450 },      // Radioactive worlds
    'super_earth': { min: 600, max: 900 },      // Super-Earths (large)
    'jungle': { min: 450, max: 700 },           // Jungle worlds (large, habitable)
    'chthonian': { min: 400, max: 650 },        // Gas giant cores (large)
    'iron_core': { min: 200, max: 400 },        // Exposed cores (small, dense)
    'hycean': { min: 500, max: 800 },           // Water-rich super-Earths (very large)
    'coreless': { min: 350, max: 600 }          // Unusual planets
  },

  moonSizes: { min: 150, max: 300 },            // Varied moon sizes
  asteroidSizes: { min: 100, max: 400 }         // Highly varied asteroid sizes
};

// Advanced Perlin noise implementation
class AdvancedNoiseGenerator {
  constructor(seed = 12345) {
    this.seed = seed;
    this.permutation = this.generatePermutation(seed);
  }

  generatePermutation(seed) {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    let rng = seed;
    for (let i = 255; i > 0; i--) {
      rng = (rng * 1664525 + 1013904223) & 0xFFFFFFFF;
      const j = Math.floor((rng / 0xFFFFFFFF) * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    return [...p, ...p];
  }

  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(a, b, t) { return a + t * (b - a); }

  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y, z = 0) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = this.fade(x), v = this.fade(y), w = this.fade(z);
    const A = this.permutation[X] + Y, AA = this.permutation[A] + Z, AB = this.permutation[A + 1] + Z;
    const B = this.permutation[X + 1] + Y, BA = this.permutation[B] + Z, BB = this.permutation[B + 1] + Z;
    return this.lerp(
      this.lerp(
        this.lerp(this.grad(this.permutation[AA], x, y, z), this.grad(this.permutation[BA], x - 1, y, z), u),
        this.lerp(this.grad(this.permutation[AB], x, y - 1, z), this.grad(this.permutation[BB], x - 1, y - 1, z), u), v),
      this.lerp(
        this.lerp(this.grad(this.permutation[AA + 1], x, y, z - 1), this.grad(this.permutation[BA + 1], x - 1, y, z - 1), u),
        this.lerp(this.grad(this.permutation[AB + 1], x, y - 1, z - 1), this.grad(this.permutation[BB + 1], x - 1, y - 1, z - 1), u), v), w);
  }

  fbm(x, y, z = 0, octaves = 8) {
    let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude; amplitude *= 0.5; frequency *= 2.0;
    }
    return (value / maxValue) * 0.5 + 0.5;
  }

  turbulence(x, y, z = 0, octaves = 6) {
    let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      value += Math.abs(this.noise(x * frequency, y * frequency, z * frequency)) * amplitude;
      maxValue += amplitude; amplitude *= 0.5; frequency *= 2.0;
    }
    return value / maxValue;
  }

  ridged(x, y, z = 0, octaves = 6) {
    let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      const n = 1.0 - Math.abs(this.noise(x * frequency, y * frequency, z * frequency));
      value += n * n * amplitude;
      maxValue += amplitude; amplitude *= 0.5; frequency *= 2.0;
    }
    return value / maxValue;
  }

  domainWarp(x, y, z = 0, strength = 1.0) {
    return {
      x: x + this.fbm(x + 5.2, y + 1.3, z, 4) * strength,
      y: y + this.fbm(x + 7.8, y + 3.7, z, 4) * strength
    };
  }
}

// Color utilities
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function lerpColor(color1, color2, t) {
  const c1 = hexToRgb(color1), c2 = hexToRgb(color2);
  return rgbToHex(c1.r + (c2.r - c1.r) * t, c1.g + (c2.g - c1.g) * t, c1.b + (c2.b - c1.b) * t);
}

// Enhanced star palettes
const STAR_PALETTES = {
  'O': { core: ['#7799ff', '#8899ff', '#99aaff', '#aabfff', '#b9d4ff'], corona: ['#6688ee', '#7799ff', '#88aaff'], glow: ['#99bbff', '#aaccff', '#bbddff'] },
  'B': { core: ['#99aaff', '#aabfff', '#b9d4ff', '#c8e2ff', '#d7efff'], corona: ['#8899ff', '#99aaff', '#aabbff'], glow: ['#bbccff', '#ccddff', '#ddeeff'] },
  'A': { core: ['#c8e2ff', '#d7efff', '#e6f8ff', '#f5fdff', '#ffffff'], corona: ['#b9d4ff', '#c8e2ff', '#d7efff'], glow: ['#e6f8ff', '#f0fcff', '#ffffff'] },
  'F': { core: ['#fff8f0', '#fffaeb', '#fffce6', '#fffee0', '#ffffdb'], corona: ['#ffe8cc', '#fff0dd', '#fff8ee'], glow: ['#fffaeb', '#fffcf0', '#fffef5'] },
  'G': { core: ['#fff9e6', '#ffee99', '#ffdd55', '#ffcc33', '#ffbb11'], corona: ['#ffea99', '#fff0aa', '#fff6bb'], glow: ['#ffee99', '#fff4aa', '#fffabb'] },
  'K': { core: ['#ffcc88', '#ffaa66', '#ff9944', '#ff8833', '#ff7722'], corona: ['#ffb380', '#ffc299', '#ffd1b3'], glow: ['#ffcc99', '#ffddb3', '#ffeecc'] },
  'M': { core: ['#ff9955', '#ff7733', '#ff5511', '#ff3300', '#ee2200'], corona: ['#ff7b42', '#ff8a55', '#ff9968'], glow: ['#ff9955', '#ffaa66', '#ffbb77'] },
  'BrownDwarf': { core: ['#8B4513', '#A0522D', '#B8704C', '#CD853F', '#D2935C'], corona: ['#6B3410', '#7A4315', '#89521A'], glow: ['#A0522D', '#B8704C', '#CD853F'] },
  'WhiteDwarf': { core: ['#FFFFFF', '#F8F8FF', '#F0F0FF', '#E8E8FF', '#E0E0FF'], corona: ['#F0F0F0', '#F5F5F5', '#FAFAFA'], glow: ['#FFFFFF', '#FFFFFF', '#FFFFFF'] },
  'NeutronStar': { core: ['#4169E1', '#1E90FF', '#00BFFF', '#87CEEB', '#B0E0E6'], corona: ['#A0D8F0', '#B0E0F5', '#C0E8FA'], glow: ['#87CEEB', '#ADD8E6', '#B0E0E6'] },
  'Pulsar': { core: ['#00FFFF', '#00F5F5', '#00EBEB', '#00E0E0', '#00D5D5'], corona: ['#B0FFFF', '#C0FFFF', '#D0FFFF'], glow: ['#66FFFF', '#88FFFF', '#AAFFFF'] },
  'RedGiant': { core: ['#FF6347', '#FF5533', '#FF4422', '#FF3311', '#FF2200'], corona: ['#FFB088', '#FFC09A', '#FFD0AC'], glow: ['#FF7755', '#FF8866', '#FF9977'] },
  'BlueGiant': { core: ['#4169E1', '#3355DD', '#2244CC', '#1133BB', '#0022AA'], corona: ['#A0D8F0', '#B0E0F5', '#C0E8FA'], glow: ['#6699FF', '#77AAFF', '#88BBFF'] },
  'RedSuperGiant': { core: ['#FF3300', '#FF2200', '#EE1100', '#DD0000', '#CC0000'], corona: ['#FF7355', '#FF8363', '#FF9371'], glow: ['#FF5533', '#FF6644', '#FF7755'] },
  'BlueSuperGiant': { core: ['#0033FF', '#0022EE', '#0011DD', '#0000CC', '#0000BB'], corona: ['#5A7FE6', '#6A8FEB', '#7A9FF0'], glow: ['#3366FF', '#4477FF', '#5588FF'] }
};

// Helper function to get random size from range
function getRandomSize(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

// Generate GLOWING ultra-detailed star sprite with REALISTIC SIZE DIVERSITY
function generateStar(stellarClass) {
  // Get realistic size for this stellar class
  const sizeRange = CONFIG.starSizes[stellarClass] || CONFIG.starSizes['G'];
  const size = getRandomSize(sizeRange.min, sizeRange.max);

  console.log(`  Generating ${stellarClass} star (${size}x${size}px)...`);
  const frames = 24;
  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new AdvancedNoiseGenerator(Math.random() * 100000);
  const palette = STAR_PALETTES[stellarClass] || STAR_PALETTES['G'];

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const centerX = size / 2, centerY = size / 2;
    const radius = size * 0.35;
    const time = frame / frames;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    // Render star with glow
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX, dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const idx = (y * size + x) * 4;

        // GLOW LAYER - extends far beyond star surface
        if (dist < radius * 3.5) {
          const glowDist = dist / radius;
          const glowFalloff = Math.max(0, 1 - glowDist / 3.5);
          const glowPower = Math.pow(glowFalloff, 2.5);

          if (glowPower > 0.01) {
            const glowColor = hexToRgb(palette.glow[1]);
            data[idx] += glowColor.r * glowPower * 0.4;
            data[idx + 1] += glowColor.g * glowPower * 0.4;
            data[idx + 2] += glowColor.b * glowPower * 0.4;
          }
        }

        // STAR SURFACE
        if (dist < radius * 1.6) {
          const normalizedDist = dist / radius;

          if (normalizedDist <= 1) {
            // Main star body
            const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));
            const texX = (angle + time * Math.PI * 2) * 8;
            const texY = Math.acos(Math.min(1, z)) * 8;

            // Complex surface features
            const granulation = noise.fbm(texX * 4, texY * 4, time * 3, 10) * 0.25;
            const convection = noise.turbulence(texX * 2, texY * 2, time * 4, 8) * 0.35;
            const magneticFields = noise.ridged(texX * 3, texY * 3, time * 2, 7) * 0.25;
            const sunspots = noise.fbm(texX * 5, texY * 5, time * 0.5, 6);

            // Sunspots (darker regions)
            let darkening = 1.0;
            if (sunspots < 0.3) darkening = 0.6 + (sunspots / 0.3) * 0.4;

            // CMEs and flares
            const cmeNoise = noise.fbm(angle * 5 + time * 15, dist / 25, time * 8, 6);
            const cmeIntensity = cmeNoise > 0.78 ? (cmeNoise - 0.78) * 5 : 0;

            let brightness = (granulation + convection + magneticFields) * darkening;
            brightness = Math.max(0, Math.min(1, brightness));

            // Limb darkening
            brightness *= (0.3 + 0.7 * z);
            brightness += cmeIntensity * 0.4;

            // Color based on brightness
            let color;
            if (brightness > 0.75) {
              const t = (brightness - 0.75) / 0.25;
              color = hexToRgb(lerpColor(palette.core[3], palette.core[4], t));
            } else if (brightness > 0.5) {
              const t = (brightness - 0.5) / 0.25;
              color = hexToRgb(lerpColor(palette.core[2], palette.core[3], t));
            } else if (brightness > 0.3) {
              const t = (brightness - 0.3) / 0.2;
              color = hexToRgb(lerpColor(palette.core[1], palette.core[2], t));
            } else {
              const t = brightness / 0.3;
              color = hexToRgb(lerpColor(palette.core[0], palette.core[1], t));
            }

            data[idx] = Math.min(255, data[idx] + color.r * brightness * 1.2);
            data[idx + 1] = Math.min(255, data[idx + 1] + color.g * brightness * 1.2);
            data[idx + 2] = Math.min(255, data[idx + 2] + color.b * brightness * 1.2);
            data[idx + 3] = 255;
          } else {
            // Corona layer (1.0 to 1.6)
            const coronaDist = (normalizedDist - 1.0) / 0.6;
            const coronaNoise = noise.fbm(angle * 6 + time * 12, dist / 20, time * 10, 7);
            const coronaBrightness = Math.max(0, (1 - coronaDist) * coronaNoise * 1.2);

            if (coronaBrightness > 0.08) {
              const coronaColor = hexToRgb(palette.corona[Math.floor(coronaNoise * (palette.corona.length - 1))]);
              data[idx] = Math.min(255, data[idx] + coronaColor.r * coronaBrightness);
              data[idx + 1] = Math.min(255, data[idx + 1] + coronaColor.g * coronaBrightness);
              data[idx + 2] = Math.min(255, data[idx + 2] + coronaColor.b * coronaBrightness);
              data[idx + 3] = Math.max(data[idx + 3], Math.floor(coronaBrightness * 255));
            }
          }
        }

        // Set alpha for transparency
        if (data[idx + 3] === 0) {
          const totalBrightness = data[idx] + data[idx + 1] + data[idx + 2];
          if (totalBrightness > 5) {
            data[idx + 3] = Math.min(255, totalBrightness / 3);
          }
        }
      }
    }

    ctx.putImageData(imageData, offsetX, 0);
  }

  return canvas;
}

// Extensive planet color palettes
const PLANET_PALETTES = {
  terran: {
    deepOcean: ['#001a33', '#002040', '#002b4d', '#003560', '#004070', '#004f80'],
    ocean: ['#004f80', '#005a90', '#0066aa', '#0070bb', '#007acc', '#0088dd'],
    shallowWater: ['#0099cc', '#00aadd', '#00bbee', '#00ccff', '#22ddff', '#44eeff'],
    beach: ['#c9b18a', '#d2b48c', '#dcc09e', '#e6c896', '#f0d2a0', '#fadcaa'],
    plains: ['#3a6a2f', '#4a7c3f', '#5a8c4f', '#6a9c5f', '#7aac6f', '#8abc7f'],
    forest: ['#0a4a0a', '#1a5c1a', '#2a6e2a', '#3a803a', '#4a924a', '#5aa45a'],
    desert: ['#c8a47e', '#d2b48c', '#dcc09e', '#e6c896', '#f0d2a0', '#fadcaa'],
    mountain: ['#5a4d44', '#6b5d54', '#7c6d64', '#8d7d74', '#9e8d84', '#af9d94'],
    snowCap: ['#d0e8ff', '#e0f0ff', '#f0f8ff', '#f8fcff', '#ffffff', '#ffffff'],
    clouds: ['#f0f8ff', '#f5faff', '#fafcff', '#ffffff', '#ffffff'],
    riverBed: ['#003d66', '#004770', '#00517a', '#005b84', '#00658e', '#006f98'],
    lakeBed: ['#002b4d', '#003557', '#003f61', '#00496b', '#005375', '#005d7f'],
    city: ['#ffaa00', '#ffbb22', '#ffcc44', '#ffdd66', '#ffee88']
  },
  rocky: {
    darkCrater: ['#2a1d15', '#3a2d25', '#4a3d35', '#5a4d45', '#6a5d55'],
    crater: ['#4a3d35', '#5a4d45', '#6a5d55', '#7a6d65', '#8a7d75'],
    base: ['#6a5d55', '#7a6d65', '#8a7d75', '#9a8d85', '#aa9d95'],
    highland: ['#9a8d85', '#aa9d95', '#baada5', '#cabdb5', '#dacdc5'],
    light: ['#cabdb5', '#dacdc5', '#eaddd5', '#faede5', '#fffdf5']
  },
  desert: {
    darkSand: ['#b89a6c', '#c8a47e', '#d2ae88', '#dcb892', '#e6c29c'],
    sand: ['#d2b48c', '#dcbe96', '#e6c8a0', '#f0d2aa', '#fadcb4', '#ffebcc'],
    lightSand: ['#e6c896', '#f0d2a0', '#fadcaa', '#ffe6b4', '#fff0be', '#fffac8'],
    dune: ['#c8a47e', '#d2ae88', '#dcb892', '#e6c29c', '#f0cca6'],
    rock: ['#908070', '#a09080', '#b0a090', '#c0b0a0', '#d0c0b0'],
    canyon: ['#886644', '#987755', '#a88866', '#b89977', '#c8aa88']
  },
  ice: {
    deepIce: ['#5080a0', '#6090b0', '#70a0c0', '#80b0d0', '#90c0e0'],
    ice: ['#a0c0d0', '#b0d0e0', '#c0e0f0', '#d0f0ff', '#e0f8ff'],
    lightIce: ['#d0f0ff', '#e0f8ff', '#f0fcff', '#f8feff', '#ffffff'],
    frost: ['#e0f8ff', '#f0fcff', '#f8feff', '#ffffff', '#ffffff'],
    crevasse: ['#304050', '#405060', '#506070', '#607080', '#708090'],
    glacier: ['#8ab0c0', '#9ac0d0', '#aad0e0', '#bae0f0', '#caf0ff']
  },
  frozen: {
    ice: ['#90b0c0', '#a0c0d0', '#b0d0e0', '#c0e0f0', '#d0f0ff'],
    nitrogen: ['#b0c0ff', '#c0d0ff', '#d0e0ff', '#e0f0ff', '#f0f8ff'],
    methane: ['#ffc0d0', '#ffd0e0', '#ffe0f0', '#fff0f8', '#fffcfe'],
    darkMatter: ['#203040', '#304050', '#405060', '#506070', '#607080']
  },
  lava: {
    lava: ['#ff2200', '#ff3300', '#ff4400', '#ff5500', '#ff6600', '#ff7700'],
    brightLava: ['#ff7700', '#ff8800', '#ff9900', '#ffaa00', '#ffbb00', '#ffcc00'],
    moltenRock: ['#cc3300', '#dd4400', '#ee5500', '#ff6600', '#ff7700'],
    coolingCrust: ['#992200', '#aa3300', '#bb4400', '#cc5500', '#dd6600'],
    solidCrust: ['#0a0a0a', '#1a1a1a', '#2a2a2a', '#3a3a3a', '#4a4a4a'],
    volcanicRock: ['#2a1a1a', '#3a2a2a', '#4a3a3a', '#5a4a4a', '#6a5a5a']
  },
  volcanic: {
    ash: ['#404040', '#505050', '#606060', '#707070', '#808080'],
    rock: ['#2a1a1a', '#3a2a2a', '#4a3a3a', '#5a4a4a', '#6a5a5a'],
    lavaFlow: ['#ff3300', '#ff4400', '#ff5500', '#ff6600', '#ff7700'],
    sulfur: ['#bbbb00', '#cccc00', '#dddd22', '#eeee44', '#ffff66'],
    pumice: ['#707070', '#808080', '#909090', '#a0a0a0', '#b0b0b0']
  },
  ocean: {
    abyss: ['#000d1a', '#001a33', '#00274d', '#003466', '#004180'],
    deep: ['#004180', '#004e99', '#005bb3', '#0068cc', '#0075e6'],
    mid: ['#0075e6', '#0088ee', '#009aff', '#00aaff', '#00bbff'],
    shallow: ['#00bbff', '#22ccff', '#44ddff', '#66eeff', '#88ffff'],
    surface: ['#88ffff', '#aaffff', '#ccffff', '#eeffff', '#ffffff']
  },
  jungle: {
    deepForest: ['#0a3a0a', '#1a4a1a', '#2a5a2a', '#3a6a3a', '#4a7a4a'],
    forest: ['#2a5a2a', '#3a6a3a', '#4a7a4a', '#5a8a5a', '#6a9a6a'],
    canopy: ['#4a7a3a', '#5a8a4a', '#6a9a5a', '#7aaa6a', '#8aba7a'],
    jungle: ['#1a6a1a', '#2a7a2a', '#3a8a3a', '#4a9a4a', '#5aaa5a'],
    water: ['#004f80', '#0066aa', '#007acc', '#008cee', '#00aaff'],
    vines: ['#0a5a0a', '#1a6a1a', '#2a7a2a', '#3a8a3a', '#4a9a4a'],
    clouds: ['#d0f0d0', '#e0f8e0', '#f0fff0', '#f8fff8', '#ffffff']
  },
  super_earth: {
    deepOcean: ['#002040', '#003060', '#004080', '#0050a0', '#0060c0'],
    ocean: ['#0060c0', '#0070d0', '#0080e0', '#0090f0', '#00a0ff'],
    continent: ['#2a5a2a', '#3a6a3a', '#4a7a4a', '#5a8a5a', '#6a9a6a'],
    mountain: ['#5a4a3a', '#6a5a4a', '#7a6a5a', '#8a7a6a', '#9a8a7a'],
    peak: ['#a09090', '#b0a0a0', '#c0b0b0', '#d0c0c0', '#e0d0d0'],
    ice: ['#c0e0f0', '#d0f0ff', '#e0f8ff', '#f0fcff', '#ffffff']
  }
};

// Generate ULTRA-DETAILED planet with rivers, lakes, seas, mountains, etc.
function generatePlanet(type, index) {
  // Get realistic size for this planet type
  const sizeRange = CONFIG.planetSizes[type] || CONFIG.planetSizes.rocky;
  const size = getRandomSize(sizeRange.min, sizeRange.max);

  console.log(`    Planet ${type}_${String(index).padStart(3, '0')} (${size}x${size}px)...`);
  const frames = 24;
  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new AdvancedNoiseGenerator(Math.random() * 100000 + index * 1000);
  const palette = PLANET_PALETTES[type] || PLANET_PALETTES.rocky;

  const params = {
    hasOceans: ['terran', 'ocean', 'super_earth', 'hycean', 'eyeball'].includes(type),
    hasRivers: ['terran', 'jungle', 'super_earth'].includes(type),
    hasLakes: ['terran', 'jungle', 'super_earth', 'ice', 'frozen'].includes(type),
    hasMountains: !['ocean', 'lava'].includes(type),
    hasCanyons: ['desert', 'rocky', 'volcanic', 'mars'].includes(type) || type === 'terran',
    hasVolcanoes: ['lava', 'volcanic', 'tidally_locked', 'chthonian'].includes(type),
    hasClouds: ['terran', 'super_earth', 'jungle', 'hycean'].includes(type),
    hasAtmosphere: ['terran', 'super_earth', 'jungle', 'hycean', 'eyeball'].includes(type),
    hasIceCaps: ['terran', 'super_earth', 'ice', 'frozen', 'eyeball'].includes(type),
    hasCities: type === 'terran' && Math.random() > 0.6,
    hasDesertDunes: type === 'desert',
    hasGlaciers: ['ice', 'frozen'].includes(type),
    rotationSpeed: Math.random() * 0.3 + 0.2
  };

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const centerX = size / 2, centerY = size / 2;
    const radius = size * 0.44;
    const time = frame / frames;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX, dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const idx = (y * size + x) * 4;

        if (dist <= radius) {
          const normalizedDist = dist / radius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));
          const longitude = (angle + time * Math.PI * 2 * params.rotationSpeed) / Math.PI * 180;
          const latitude = Math.asin((y - centerY) / radius) / Math.PI * 180;
          const texX = longitude / 25;
          const texY = latitude / 25;

          // Domain warping for organic terrain
          const warped = noise.domainWarp(texX, texY, index, 4);

          // MULTI-LAYER TERRAIN GENERATION
          const continentNoise = noise.fbm(warped.x * 0.4, warped.y * 0.4, index, 8);
          const detailNoise = noise.fbm(warped.x * 2.5, warped.y * 2.5, index + 100, 10);
          const microDetail = noise.turbulence(texX * 10, texY * 10, index + 200, 8);

          // ORGANIC MOUNTAINS - Irregular peaks with natural clustering
          let mountains = 0;
          if (params.hasMountains) {
            // Multi-scale ridged noise creates realistic mountain ranges
            const mountainBase = noise.ridged(warped.x * 1.8 + microDetail * 0.5, warped.y * 1.8 - microDetail * 0.5, index + 50, 9);
            const mountainDetail = noise.ridged(warped.x * 4.5, warped.y * 4.5, index + 75, 7);
            const mountainCluster = noise.turbulence(texX * 1.2, texY * 1.2, index + 90, 6);

            // Combine layers for non-uniform, organic mountain ranges
            mountains = mountainBase * 0.6 + mountainDetail * 0.25 + mountainCluster * 0.15;
            // Random variation breaks up geometric patterns
            if (Math.random() > 0.7) mountains *= 0.7 + Math.random() * 0.6;
          }

          // CHAOTIC CANYONS - Branching, erosion-like patterns
          let canyons = 0;
          if (params.hasCanyons) {
            // Multiple ridged layers create complex canyon networks
            const canyonMain = noise.ridged(warped.x * 2.2 + detailNoise, warped.y * 2.2 - detailNoise, index + 150, 7);
            const canyonBranch = noise.ridged(warped.x * 5.5, warped.y * 5.5, index + 175, 6);
            const erosion = noise.turbulence(texX * 3.5, texY * 3.5, index + 190, 8);

            // Irregular canyon depths and widths
            canyons = -(canyonMain * 0.5 + canyonBranch * 0.3 + erosion * 0.2) * 0.5;
            // Break up patterns with randomness
            if (Math.random() > 0.6) canyons *= 0.5 + Math.random() * 0.8;
          }

          // ORGANIC VOLCANOES - Scattered, irregular volcanic features
          let volcanoes = 0;
          if (params.hasVolcanoes) {
            // Multi-scale noise creates realistic volcanic clustering
            const volcanoNoise1 = noise.fbm(texX * 3 + continentNoise * 2, texY * 3 - continentNoise * 2, index + 250, 5);
            const volcanoNoise2 = noise.turbulence(texX * 7, texY * 7, index + 275, 6);
            const volcanoCluster = noise.fbm(texX * 1.5, texY * 1.5, index + 290, 4);

            // Irregular volcanic activity zones (not circular)
            const volcanoPattern = volcanoNoise1 * 0.5 + volcanoNoise2 * 0.3 + volcanoCluster * 0.2;
            const volcanoThreshold = 0.78 + Math.random() * 0.08;

            if (volcanoPattern > volcanoThreshold) {
              volcanoes = (volcanoPattern - volcanoThreshold) * (2.5 + Math.random() * 1.5);
            }
          }

          // ORGANIC CRATERS - Irregular impact patterns with varying sizes
          let craters = 0;
          const craterNoise1 = noise.fbm(texX * 6 + microDetail, texY * 6 - microDetail, index + 300, 6);
          const craterNoise2 = noise.turbulence(texX * 12, texY * 12, index + 325, 7);
          const craterCluster = noise.fbm(texX * 2, texY * 2, index + 340, 5);

          // Multi-scale crater impacts (not uniform circles)
          const craterPattern = craterNoise1 * 0.6 + craterNoise2 * 0.25 + craterCluster * 0.15;
          const craterThreshold = 0.85 + Math.random() * 0.06;

          if (craterPattern > craterThreshold) {
            // Variable crater depth and size
            craters = -(craterPattern - craterThreshold) * (3 + Math.random() * 3);
          }

          // ORGANIC DESERT DUNES - Wave-like patterns with chaos
          let duneNoise = 0;
          if (params.hasDesertDunes) {
            // Multiple noise layers create realistic wind-blown dune patterns
            const duneWaves = noise.fbm(texX * 4 + detailNoise, texY * 4, index + 400, 6);
            const duneRipples = noise.fbm(texX * 8, texY * 8 - detailNoise, index + 425, 7);
            const windPatterns = noise.turbulence(texX * 6, texY * 6, index + 450, 5);

            // Asymmetric, organic dune shapes
            duneNoise = (duneWaves * 0.5 + duneRipples * 0.3 + windPatterns * 0.2) * 0.3;
            // Add directional bias (wind direction)
            duneNoise += Math.sin(texX * 3) * Math.cos(texY * 2) * 0.1;
          }

          // Combine elevation
          let elevation = continentNoise * 0.4 + detailNoise * 0.25 + microDetail * 0.15;
          elevation += mountains * 0.5 + canyons + volcanoes + craters + duneNoise;
          elevation = Math.max(-1, Math.min(1, elevation));

          // ORGANIC, CHAOTIC RIVERS - Multi-scale, irregular branching patterns
          let isRiver = false;
          if (params.hasRivers && elevation > 0.35 && elevation < 0.75) {
            // Multiple noise layers create complex, winding river networks
            const riverNoise1 = noise.fbm(texX * 8 + microDetail * 2, texY * 8 + microDetail * 2, index + 500, 6);
            const riverNoise2 = noise.turbulence(texX * 12 - microDetail, texY * 12 - microDetail, index + 550, 7);
            const riverFlow = noise.turbulence(texX * 6 + detailNoise, texY * 6 - detailNoise, index + 600, 8);

            // Complex conditions create irregular, organic river shapes (not circular)
            const riverPattern = riverNoise1 * 0.4 + riverNoise2 * 0.3 + riverFlow * 0.3;
            const riverThreshold = 0.45 + microDetail * 0.1; // Variable threshold for chaos

            if (riverPattern < riverThreshold && riverFlow > 0.6 && Math.random() > 0.2) {
              isRiver = true;
              elevation -= 0.15 + Math.random() * 0.05; // Variable depth
            }
          }

          // ORGANIC LAKES - Irregular shapes with fractal edges
          let isLake = false;
          if (params.hasLakes && elevation > 0.25 && elevation < 0.45) {
            // Multi-scale noise creates natural, non-circular lake shapes
            const lakeNoise1 = noise.fbm(texX * 5 + continentNoise, texY * 5 - continentNoise, index + 700, 7);
            const lakeNoise2 = noise.turbulence(texX * 9, texY * 9, index + 750, 6);
            const lakeBoundary = noise.fbm(texX * 15, texY * 15, index + 800, 8);

            // Irregular lake boundaries with fractal detail
            const lakePattern = lakeNoise1 * 0.5 + lakeNoise2 * 0.3 + lakeBoundary * 0.2;

            if (lakePattern > 0.68 + Math.random() * 0.08) {
              isLake = true;
              elevation = 0.32 + Math.random() * 0.06; // Variable lake depth
            }
          }

          // Phong lighting
          const lightDir = { x: 0.5, y: 0.3, z: 0.8 };
          const normal = { x: dx / radius, y: dy / radius, z: z };
          const dotProduct = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z;
          let lighting = Math.max(0.12, Math.min(1, dotProduct * 0.75 + 0.25));
          lighting *= (0.75 + elevation * 0.35);

          // COLOR SELECTION
          let finalColor;

          if (isRiver && palette.riverBed) {
            finalColor = hexToRgb(palette.riverBed[Math.floor(Math.random() * palette.riverBed.length)]);
          } else if (isLake && palette.lakeBed) {
            finalColor = hexToRgb(palette.lakeBed[Math.floor(Math.random() * palette.lakeBed.length)]);
          } else if (params.hasOceans && elevation < 0.38) {
            // Ocean depth
            const depth = (0.38 - elevation) / 0.5;
            const oceanKeys = Object.keys(palette).filter(k => k.includes('ocean') || k.includes('water') || k.includes('deep') || k.includes('abyss'));
            if (oceanKeys.length > 0) {
              const key = oceanKeys[Math.min(Math.floor(depth * oceanKeys.length), oceanKeys.length - 1)];
              finalColor = hexToRgb(palette[key][Math.floor(Math.random() * palette[key].length)]);
            } else {
              finalColor = hexToRgb('#004080');
            }
          } else if (params.hasVolcanoes && volcanoes > 0.5) {
            // Active lava
            const lavaKeys = Object.keys(palette).filter(k => k.includes('lava') || k.includes('molten'));
            if (lavaKeys.length > 0) {
              finalColor = hexToRgb(palette[lavaKeys[0]][Math.floor(Math.random() * palette[lavaKeys[0]].length)]);
              lighting *= 1.6; // Lava glows
            } else {
              finalColor = hexToRgb('#ff4400');
              lighting *= 1.6;
            }
          } else if (params.hasIceCaps && Math.abs(latitude) > 65) {
            // Ice caps
            const iceKeys = Object.keys(palette).filter(k => k.includes('ice') || k.includes('snow') || k.includes('frost') || k.includes('glacier'));
            if (iceKeys.length > 0) {
              finalColor = hexToRgb(palette[iceKeys[Math.floor(Math.random() * iceKeys.length)]][Math.floor(Math.random() * palette[iceKeys[0]].length)]);
            } else {
              finalColor = hexToRgb('#ffffff');
            }
          } else if (elevation > 0.75 && params.hasMountains) {
            // Mountain peaks
            const mountainKeys = Object.keys(palette).filter(k => k.includes('mountain') || k.includes('peak') || k.includes('highland'));
            if (mountainKeys.length > 0) {
              finalColor = hexToRgb(palette[mountainKeys[0]][Math.floor(Math.random() * palette[mountainKeys[0]].length)]);
            } else {
              finalColor = hexToRgb('#8a7a6a');
            }
          } else {
            // General terrain
            const terrainKeys = Object.keys(palette).filter(k => !k.includes('ocean') && !k.includes('water') && !k.includes('deep') && !k.includes('lava') && !k.includes('ice') && !k.includes('snow'));
            if (terrainKeys.length > 0) {
              const keyIdx = Math.floor(Math.abs(elevation) * terrainKeys.length) % terrainKeys.length;
              const selectedKey = terrainKeys[keyIdx];
              const colorArray = palette[selectedKey];
              finalColor = hexToRgb(colorArray[Math.floor(detailNoise * (colorArray.length - 1))]);
            } else {
              finalColor = hexToRgb('#8a7a6a');
            }
          }

          // Apply lighting
          data[idx] = finalColor.r * lighting;
          data[idx + 1] = finalColor.g * lighting;
          data[idx + 2] = finalColor.b * lighting;
          data[idx + 3] = 255;

          // CLOUD LAYER
          if (params.hasClouds && palette.clouds) {
            const cloudNoise = noise.fbm(texX * 3.5 + time * 8, texY * 3.5, index + 800, 8);
            const cloudTurbulence = noise.turbulence(texX * 4 + time * 6, texY * 4, index + 900, 6);
            if (cloudNoise > 0.52 && cloudTurbulence > 0.48) {
              const cloudDensity = ((cloudNoise - 0.52) / 0.48) * ((cloudTurbulence - 0.48) / 0.52);
              const cloudAlpha = Math.min(0.85, cloudDensity);
              const cloudColor = hexToRgb(palette.clouds[Math.floor(cloudNoise * (palette.clouds.length - 1))]);
              data[idx] = data[idx] * (1 - cloudAlpha) + cloudColor.r * cloudAlpha * lighting;
              data[idx + 1] = data[idx + 1] * (1 - cloudAlpha) + cloudColor.g * cloudAlpha * lighting;
              data[idx + 2] = data[idx + 2] * (1 - cloudAlpha) + cloudColor.b * cloudAlpha * lighting;
            }
          }

          // CITY LIGHTS on night side
          if (params.hasCities && dotProduct < 0.15 && elevation > 0.38 && elevation < 0.65) {
            const cityNoise = noise.fbm(texX * 15, texY * 15, index + 1000, 5);
            if (cityNoise > 0.82) {
              const cityBrightness = (cityNoise - 0.82) / 0.18;
              data[idx] += 120 * cityBrightness;
              data[idx + 1] += 100 * cityBrightness;
              data[idx + 2] += 30 * cityBrightness;
            }
          }
        } else if (params.hasAtmosphere && dist < radius * 1.12) {
          // Atmospheric glow
          const atmosDist = (dist - radius) / (radius * 0.12);
          const atmosNoise = noise.fbm(angle * 15, dist / 15, time * 5, 6);
          const atmosBrightness = Math.max(0, (1 - atmosDist) * atmosNoise * 0.5);
          if (atmosBrightness > 0.08) {
            const atmosColor = hexToRgb('#77aaff');
            data[idx] = atmosColor.r * atmosBrightness;
            data[idx + 1] = atmosColor.g * atmosBrightness;
            data[idx + 2] = atmosColor.b * atmosBrightness;
            data[idx + 3] = Math.floor(atmosBrightness * 255);
          }
        }
      }
    }

    ctx.putImageData(imageData, offsetX, 0);
  }

  return canvas;
}

// Generate moon sprite with enhanced detail
function generateMoon(index) {
  // Get realistic varied size for moons
  const size = getRandomSize(CONFIG.moonSizes.min, CONFIG.moonSizes.max);

  console.log(`    Moon ${String(index).padStart(3, '0')} (${size}x${size}px)...`);
  const frames = 16;
  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new AdvancedNoiseGenerator(500000 + index * 1000);

  const moonTypes = ['rocky', 'icy', 'volcanic', 'captured_asteroid'];
  const moonType = moonTypes[index % moonTypes.length];

  const palettes = {
    rocky: {
      highland: ['#a09080', '#b0a090', '#c0b0a0', '#d0c0b0', '#e0d0c0', '#f0e0d0'],
      mare: ['#404040', '#505050', '#606060', '#707070', '#808080', '#909090'],
      crater: ['#202020', '#303030', '#404040', '#505050', '#606060', '#707070']
    },
    icy: {
      ice: ['#b0c0d0', '#c0d0e0', '#d0e0f0', '#e0f0ff', '#f0f8ff', '#ffffff'],
      cracks: ['#304050', '#405060', '#506070', '#607080', '#708090', '#8090a0'],
      smooth: ['#d0e0f0', '#e0f0ff', '#f0f8ff', '#f8fcff', '#ffffff']
    },
    volcanic: {
      sulfur: ['#aaaa00', '#bbbb00', '#cccc00', '#dddd22', '#eeee44', '#ffff66'],
      lava: ['#ff2200', '#ff3300', '#ff4400', '#ff6600', '#ff8800', '#ffaa00'],
      rock: ['#2a1a1a', '#3a2a2a', '#4a3a3a', '#5a4a4a', '#6a5a5a', '#7a6a6a']
    },
    captured_asteroid: {
      rock: ['#4a3a3a', '#5a4a4a', '#6a5a5a', '#7a6a6a', '#8a7a7a', '#9a8a8a'],
      metal: ['#606070', '#707080', '#808090', '#9090a0', '#a0a0b0', '#b0b0c0'],
      dark: ['#1a1a1a', '#2a2a2a', '#3a3a3a', '#4a4a4a', '#5a5a5a', '#6a6a6a']
    }
  };

  const palette = palettes[moonType];

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const centerX = size / 2, centerY = size / 2;
    const radius = size * 0.44;
    const time = frame / frames;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX, dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const idx = (y * size + x) * 4;

        if (dist <= radius) {
          const normalizedDist = dist / radius;
          const z = Math.sqrt(Math.max(0, 1 - normalizedDist * normalizedDist));
          const longitude = (angle + time * Math.PI * 2) / Math.PI * 180;
          const latitude = Math.asin((y - centerY) / radius) / Math.PI * 180;
          const texX = longitude / 20, texY = latitude / 20;

          const baseNoise = noise.fbm(texX, texY, index, 10);
          const detailNoise = noise.fbm(texX * 6, texY * 6, index + 100, 12);
          const microDetail = noise.turbulence(texX * 12, texY * 12, index + 200, 8);

          // Heavy cratering
          const craterNoise = noise.fbm(texX * 10, texY * 10, index + 300, 7);
          const craters = craterNoise > 0.78 ? -(craterNoise - 0.78) * 3 : 0;

          const elevation = baseNoise * 0.5 + detailNoise * 0.35 + microDetail * 0.15 + craters;

          const lightDir = { x: 0.6, y: 0.4, z: 0.7 };
          const normal = { x: dx / radius, y: dy / radius, z: z };
          const dotProduct = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z;
          let lighting = Math.max(0.08, Math.min(1, dotProduct * 0.85 + 0.15));
          lighting *= (0.65 + elevation * 0.45);

          const terrainKeys = Object.keys(palette);
          const selectedKey = terrainKeys[Math.floor(Math.abs(elevation) * terrainKeys.length) % terrainKeys.length];
          const colorArray = palette[selectedKey];
          const finalColor = hexToRgb(colorArray[Math.floor(Math.abs(detailNoise) * (colorArray.length - 1))]);

          data[idx] = finalColor.r * lighting;
          data[idx + 1] = finalColor.g * lighting;
          data[idx + 2] = finalColor.b * lighting;
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, offsetX, 0);
  }

  return canvas;
}

// Generate asteroid sprite with enhanced detail
function generateAsteroid(index) {
  // Get highly varied size for asteroids (from small rocks to large planetoids)
  const size = getRandomSize(CONFIG.asteroidSizes.min, CONFIG.asteroidSizes.max);

  console.log(`    Asteroid ${String(index).padStart(3, '0')} (${size}x${size}px)...`);
  const frames = 12;
  const canvas = createCanvas(size * frames, size);
  const ctx = canvas.getContext('2d');
  const noise = new AdvancedNoiseGenerator(600000 + index * 1000);

  const asteroidTypes = ['rocky', 'metallic', 'carbonaceous', 'icy'];
  const asteroidType = asteroidTypes[index % asteroidTypes.length];

  const palettes = {
    rocky: {
      base: ['#5a4a4a', '#6a5a5a', '#7a6a6a', '#8a7a7a', '#9a8a8a', '#aa9a9a'],
      dark: ['#2a2a2a', '#3a3a3a', '#4a4a4a', '#5a5a5a', '#6a6a6a', '#7a7a7a'],
      light: ['#8a7a7a', '#9a8a8a', '#aa9a9a', '#baaaaa', '#cabaaa', '#dacaa0']
    },
    metallic: {
      metal: ['#7080a0', '#8090b0', '#90a0c0', '#a0b0d0', '#b0c0e0', '#c0d0f0'],
      iron: ['#505060', '#606070', '#707080', '#808090', '#9090a0', '#a0a0b0'],
      shine: ['#a0b0d0', '#b0c0e0', '#c0d0f0', '#d0e0ff', '#e0f0ff', '#f0f8ff']
    },
    carbonaceous: {
      carbon: ['#0a0a0a', '#1a1a1a', '#2a2a2a', '#3a3a3a', '#4a4a4a', '#5a5a5a'],
      dark: ['#000000', '#0a0a0a', '#1a1a1a', '#2a2a2a', '#3a3a3a', '#4a4a4a'],
      dust: ['#3a3a3a', '#4a4a4a', '#5a5a5a', '#6a6a6a', '#7a7a7a', '#8a8a8a']
    },
    icy: {
      ice: ['#b0c0d0', '#c0d0e0', '#d0e0f0', '#e0f0ff', '#f0f8ff', '#ffffff'],
      rock: ['#4a4a4a', '#5a5a5a', '#6a6a6a', '#7a7a7a', '#8a8a8a', '#9a9a9a'],
      frost: ['#d0e0f0', '#e0f0ff', '#f0f8ff', '#f8fcff', '#ffffff', '#ffffff']
    }
  };

  const palette = palettes[asteroidType];

  for (let frame = 0; frame < frames; frame++) {
    const offsetX = frame * size;
    const centerX = size / 2, centerY = size / 2;
    const time = frame / frames;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX, dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) + time * Math.PI * 2;
        const idx = (y * size + x) * 4;

        // Very irregular shape
        const shapeNoise1 = noise.fbm(Math.cos(angle) * 4, Math.sin(angle) * 4, index, 8);
        const shapeNoise2 = noise.turbulence(Math.cos(angle * 2) * 3, Math.sin(angle * 2) * 3, index + 50, 7);
        const shapeNoise3 = noise.ridged(Math.cos(angle * 3) * 2, Math.sin(angle * 3) * 2, index + 100, 6);
        const irregularRadius = (size * 0.32) * (0.4 + shapeNoise1 * 0.35 + shapeNoise2 * 0.25 + shapeNoise3 * 0.2);

        if (dist < irregularRadius) {
          const surfaceNoise = noise.fbm(x / 10, y / 10, time * 0.5, 12);
          const boulderNoise = noise.turbulence(x / 6, y / 6, index + 150, 8);
          const microDetail = noise.fbm(x / 15, y / 15, index + 200, 10);

          // Heavy cratering
          const craterNoise = noise.fbm(x / 12, y / 12, index + 250, 7);
          const craters = craterNoise > 0.82 ? -(craterNoise - 0.82) * 4 : 0;

          const elevation = surfaceNoise * 0.4 + boulderNoise * 0.3 + microDetail * 0.2 + craters * 0.3;

          const normalX = (x - centerX) / irregularRadius;
          const normalY = (y - centerY) / irregularRadius;
          const lighting = Math.max(0.15, 0.45 + normalX * 0.45 + normalY * 0.25 + elevation * 0.35);

          const terrainKeys = Object.keys(palette);
          const selectedKey = terrainKeys[Math.floor(Math.abs(elevation) * terrainKeys.length) % terrainKeys.length];
          const colorArray = palette[selectedKey];
          const finalColor = hexToRgb(colorArray[Math.floor(Math.abs(surfaceNoise) * (colorArray.length - 1))]);

          data[idx] = finalColor.r * lighting;
          data[idx + 1] = finalColor.g * lighting;
          data[idx + 2] = finalColor.b * lighting;
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, offsetX, 0);
  }

  return canvas;
}

// Main generation
async function generateAllSprites() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  PIXELVERSUM - ULTRA HIGH DETAIL GENERATOR        ║');
  console.log('║  Rivers • Lakes • Seas • Mountains • Canyons      ║');
  console.log('║  Volcanoes • Glaciers • Cities • Glowing Stars    ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  ['stars', 'planets', 'moons', 'asteroids'].forEach(dir => {
    const dirPath = path.join(OUTPUT_DIR, dir);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  });

  let totalGenerated = 0;

  console.log('\n1. GENERATING GLOWING STARS (1000x1000, 24 frames)...');
  for (const stellarClass of CONFIG.stellarClasses) {
    const canvas = generateStar(stellarClass);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'stars', `star_${stellarClass}.png`), buffer);
    totalGenerated++;
  }
  console.log(`   ✓ ${CONFIG.stellarClasses.length} star sprites`);

  console.log('\n2. GENERATING PLANETS (600x600, 24 frames) with geological features...');
  for (const planetType of CONFIG.planetTypes) {
    console.log(`   ${planetType}...`);
    for (let i = 0; i < CONFIG.spritesPerPlanetType; i++) {
      const canvas = generatePlanet(planetType, i);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(path.join(OUTPUT_DIR, 'planets', `planet_${planetType}_${String(i).padStart(3, '0')}.png`), buffer);
      totalGenerated++;
      if ((i + 1) % 20 === 0) console.log(`     ${i + 1}/${CONFIG.spritesPerPlanetType}`);
    }
  }
  console.log(`   ✓ ${CONFIG.planetTypes.length * CONFIG.spritesPerPlanetType} planet sprites`);

  console.log('\n3. GENERATING MOONS (240x240, 16 frames)...');
  for (let i = 0; i < CONFIG.spritesPerMoon; i++) {
    const canvas = generateMoon(i);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'moons', `moon_${String(i).padStart(3, '0')}.png`), buffer);
    totalGenerated++;
    if ((i + 1) % 20 === 0) console.log(`   ${i + 1}/${CONFIG.spritesPerMoon}`);
  }
  console.log(`   ✓ ${CONFIG.spritesPerMoon} moon sprites`);

  console.log('\n4. GENERATING ASTEROIDS (300x300, 12 frames)...');
  for (let i = 0; i < CONFIG.spritesPerAsteroid; i++) {
    const canvas = generateAsteroid(i);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'asteroids', `asteroid_${String(i).padStart(3, '0')}.png`), buffer);
    totalGenerated++;
    if ((i + 1) % 20 === 0) console.log(`   ${i + 1}/${CONFIG.spritesPerAsteroid}`);
  }
  console.log(`   ✓ ${CONFIG.spritesPerAsteroid} asteroid sprites`);

  console.log('\n5. GENERATING MANIFEST...');
  const manifest = {
    version: '3.0.0',
    generated: new Date().toISOString(),
    description: 'Ultra high-detail sprites with rivers, lakes, seas, mountains, canyons, volcanoes, glaciers, cities, and glowing stars',
    sprites: { stars: {}, planets: {}, moons: {}, asteroids: {} }
  };

  for (const stellarClass of CONFIG.stellarClasses) {
    manifest.sprites.stars[stellarClass] = { file: `stars/star_${stellarClass}.png`, frames: 24, width: 1000 * 24, height: 1000 };
  }

  for (const planetType of CONFIG.planetTypes) {
    for (let i = 0; i < CONFIG.spritesPerPlanetType; i++) {
      const key = `${planetType}_${String(i).padStart(3, '0')}`;
      manifest.sprites.planets[key] = { file: `planets/planet_${planetType}_${String(i).padStart(3, '0')}.png`, frames: 24, width: 600 * 24, height: 600 };
    }
  }

  for (let i = 0; i < CONFIG.spritesPerMoon; i++) {
    manifest.sprites.moons[String(i).padStart(3, '0')] = { file: `moons/moon_${String(i).padStart(3, '0')}.png`, frames: 16, width: 240 * 16, height: 240 };
  }

  for (let i = 0; i < CONFIG.spritesPerAsteroid; i++) {
    manifest.sprites.asteroids[String(i).padStart(3, '0')] = { file: `asteroids/asteroid_${String(i).padStart(3, '0')}.png`, frames: 12, width: 300 * 12, height: 300 };
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('   ✓ manifest.json');

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log(`║  ✓ COMPLETE! ${totalGenerated} sprites                        ║`);
  console.log('║  Location: /public/sprites/                        ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
}

generateAllSprites().catch(console.error);
