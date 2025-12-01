/**
 * NewCelestialSpriteGenerator - Heavily pixelated, realistic celestial body sprites
 *
 * ENHANCED VERSION with:
 * - Heavy pixelation with MANY tiny pixels (not large blocks)
 * - Phong shading for realistic 3D sphere depth
 * - Atmospheric halos and shadow effects
 * - Complex surface features (sunspots, craters, ice caps)
 * - Multi-octave noise for detailed textures
 * - Proper specular highlights and terminator lines
 */

export class NewCelestialSpriteGenerator {
  constructor() {
    // Noise functions for procedural generation
    this.seed = Math.random() * 10000;

    // Light direction for Phong shading (normalized, from top-left)
    this.lightDir = { x: -0.5, y: -0.5, z: 0.707 };

    // PERFORMANCE: Cache for noise calculations
    this.noiseCache = new Map();
    this.noiseCacheSize = 0;
    this.maxCacheSize = 10000;

    // Rendering quality settings
    // ENHANCED QUALITY: More detail, better textures, heavily pixelated
    this.quality = {
      starPixelSize: 2,      // ENHANCED: Smaller pixels = more detail and heavy pixelation
      planetPixelSize: 2,    // ENHANCED: Tiny pixels for detailed surfaces
      starOctaves: 4,        // ENHANCED: More detail for complex star surfaces
      planetOctaves: 3,      // ENHANCED: Better terrain detail
      enablePhong: true,     // 3D depth shading for spherical appearance
      enableAtmosphere: true // Atmospheric glow
    };
  }

  /**
   * Simple pseudo-random number generator
   */
  random(x, y, z = 0) {
    const seed = this.seed;
    const n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164 + seed) * 43758.5453;
    return n - Math.floor(n);
  }

  /**
   * Perlin-like noise with caching
   */
  noise(x, y, z = 0) {
    // PERFORMANCE: Round to reduce cache misses while maintaining quality
    const rx = Math.round(x * 100) / 100;
    const ry = Math.round(y * 100) / 100;
    const rz = Math.round(z * 100) / 100;
    const cacheKey = `${rx},${ry},${rz}`;

    // Check cache first
    if (this.noiseCache.has(cacheKey)) {
      return this.noiseCache.get(cacheKey);
    }

    const X = Math.floor(x);
    const Y = Math.floor(y);
    const Z = Math.floor(z);

    const xf = x - X;
    const yf = y - Y;
    const zf = z - Z;

    // Pre-calculate fade coefficients
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);

    const u = fade(xf);
    const v = fade(yf);
    const w = fade(zf);

    const a = this.random(X, Y, Z);
    const b = this.random(X + 1, Y, Z);
    const c = this.random(X, Y + 1, Z);
    const d = this.random(X + 1, Y + 1, Z);

    const e = this.random(X, Y, Z + 1);
    const f = this.random(X + 1, Y, Z + 1);
    const g = this.random(X, Y + 1, Z + 1);
    const h = this.random(X + 1, Y + 1, Z + 1);

    const x1 = a + u * (b - a);
    const x2 = c + u * (d - c);
    const y1 = x1 + v * (x2 - x1);

    const x3 = e + u * (f - e);
    const x4 = g + u * (h - g);
    const y2 = x3 + v * (x4 - x3);

    const result = y1 + w * (y2 - y1);

    // Cache the result (with size limit)
    if (this.noiseCacheSize < this.maxCacheSize) {
      this.noiseCache.set(cacheKey, result);
      this.noiseCacheSize++;
    } else if (this.noiseCacheSize >= this.maxCacheSize && Math.random() < 0.01) {
      // Occasionally clear cache to prevent memory leak
      this.noiseCache.clear();
      this.noiseCacheSize = 0;
    }

    return result;
  }

  /**
   * Fractal Brownian Motion for detailed noise
   */
  fbm(x, y, z = 0, octaves = 6) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return value / maxValue;
  }

  /**
   * Parse hex color to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * RGB to hex
   */
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Interpolate between colors
   */
  lerpColor(color1, color2, t) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    const r = c1.r + (c2.r - c1.r) * t;
    const g = c1.g + (c2.g - c1.g) * t;
    const b = c1.b + (c2.b - c1.b) * t;

    return this.rgbToHex(r, g, b);
  }

  /**
   * Calculate Phong shading for a point on a sphere
   * @param {number} nx - Normal X component
   * @param {number} ny - Normal Y component
   * @param {number} nz - Normal Z component
   * @param {Object} options - Shading options
   * @returns {Object} { diffuse, specular, ambient, total }
   */
  calculatePhongShading(nx, ny, nz, options = {}) {
    const {
      ambient = 0.15,      // Ambient light intensity
      diffuseStrength = 0.7, // Diffuse light intensity
      specularStrength = 0.3, // Specular highlight intensity
      shininess = 32       // Specular exponent (higher = sharper highlights)
    } = options;

    // Light direction (already normalized in constructor)
    const lx = this.lightDir.x;
    const ly = this.lightDir.y;
    const lz = this.lightDir.z;

    // Diffuse shading (Lambert)
    const dotNL = Math.max(0, nx * lx + ny * ly + nz * lz);
    const diffuse = diffuseStrength * dotNL;

    // Specular shading (Blinn-Phong)
    // View direction (looking straight at sphere)
    const vx = 0, vy = 0, vz = 1;

    // Half vector between light and view
    const hx = lx + vx;
    const hy = ly + vy;
    const hz = lz + vz;
    const hLen = Math.sqrt(hx * hx + hy * hy + hz * hz);
    const hnx = hx / hLen, hny = hy / hLen, hnz = hz / hLen;

    const dotNH = Math.max(0, nx * hnx + ny * hny + nz * hnz);
    const specular = specularStrength * Math.pow(dotNH, shininess);

    const total = Math.min(1, ambient + diffuse + specular);

    return { diffuse, specular, ambient, total };
  }

  /**
   * Calculate sphere normal at a point
   * @param {number} dx - X offset from center
   * @param {number} dy - Y offset from center
   * @param {number} radius - Sphere radius
   * @returns {Object|null} Normal vector { nx, ny, nz } or null if outside sphere
   */
  calculateSphereNormal(dx, dy, radius) {
    const distSq = dx * dx + dy * dy;
    if (distSq > radius * radius) return null;

    const z = Math.sqrt(radius * radius - distSq);
    const len = radius; // Since it's on sphere surface

    return {
      nx: dx / len,
      ny: dy / len,
      nz: z / len
    };
  }

  /**
   * Apply atmospheric scattering effect at edge of planet
   * @param {Object} rgb - Base color {r, g, b}
   * @param {number} edgeFactor - 0 = center, 1 = edge
   * @param {string} atmosphereColor - Hex color of atmosphere
   * @returns {Object} Modified rgb
   */
  applyAtmosphericScattering(rgb, edgeFactor, atmosphereColor = '#88aaff') {
    if (!this.quality.enableAtmosphere) return rgb;

    const atmo = this.hexToRgb(atmosphereColor);
    const scatter = Math.pow(edgeFactor, 3) * 0.5; // Stronger at edges

    return {
      r: rgb.r + (atmo.r - rgb.r) * scatter,
      g: rgb.g + (atmo.g - rgb.g) * scatter,
      b: rgb.b + (atmo.b - rgb.b) * scatter
    };
  }

  /**
   * Generate a glowing star sprite with complex surface and coronal mass ejections
   */
  async generateStar(config) {
    const {
      radius = 256,           // Star size in pixels
      stellarClass = 'G',     // G = Sun-like yellow star
      seed = Math.random() * 10000,
      animationFrames = 6     // PERFORMANCE: Reduced from 24 to 6 for 4x faster generation (still smooth)
    } = config;

    console.log(`[NewCelestialSpriteGenerator] generateStar: radius=${radius}, class=${stellarClass}, frames=${animationFrames}`);

    this.seed = seed;

    // ENHANCED: Brighter, more vivid color palettes for glowing realistic stars
    const starPalettes = {
      'O': { core: '#bbddff', surface: ['#bbddff', '#ccddff', '#ddeeFF', '#eeffff'], corona: ['#88bbff', '#99ccff', '#aaddff'] },
      'B': { core: '#ddeeff', surface: ['#ddeeff', '#eeffff', '#ffffff', '#f0f8ff'], corona: ['#aaddff', '#bbddff', '#cceeFF'] },
      'A': { core: '#ffffff', surface: ['#ffffff', '#ffffee', '#ffffdd', '#ffffcc'], corona: ['#eeeeff', '#f0f0ff', '#ffffff'] },
      'F': { core: '#ffffee', surface: ['#ffffee', '#ffffdd', '#ffffcc', '#ffffbb'], corona: ['#ffffcc', '#ffffdd', '#ffffee'] },
      'G': { core: '#ffffcc', surface: ['#ffffbb', '#ffff99', '#ffee77', '#ffdd55', '#ffcc33'], corona: ['#ffbb00', '#ffcc00', '#ffdd00'] },
      'K': { core: '#ffddaa', surface: ['#ffdd99', '#ffcc77', '#ffbb55', '#ffaa33'], corona: ['#ff9900', '#ffaa00', '#ffbb22'] },
      'M': { core: '#ffaa66', surface: ['#ffaa55', '#ff9933', '#ff8822', '#ff7700', '#ff6600'], corona: ['#ff5500', '#ff6600', '#ff7722'] }
    };

    const palette = starPalettes[stellarClass] || starPalettes['G'];

    const frames = [];
    // ENHANCED: Larger canvas to prevent cutoff of glow and corona
    const pixelSize = this.quality.starPixelSize;
    const size = Math.ceil(radius * 2.8 + pixelSize * 30); // Generous padding to prevent cutoff

    try {
      // PERFORMANCE: Process frames in batches with single yield point
      const batchSize = 1; // PERFORMANCE FIX: Yield every frame for smooth loading
      for (let frame = 0; frame < animationFrames; frame++) {
        // ASYNC YIELD: Let browser breathe every batch to prevent UI freeze
        if (frame > 0 && frame % batchSize === 0) {
          await new Promise(resolve => requestAnimationFrame(() => resolve()));
        }

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          console.error(`[NewCelestialSpriteGenerator] Failed to get 2D context for star frame ${frame}`);
          continue;
        }

        // CRITICAL: Disable ALL image smoothing for crisp pixels
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;

      const centerX = size / 2;
      const centerY = size / 2;
      const timeOffset = frame / animationFrames;

      // ENHANCED: Use quality settings for pixel size (much more detailed now)
      const pixelSize = this.quality.starPixelSize; // Now 3 instead of 6

      // Pre-calculate sunspot positions (3-7 sunspots per star)
      const sunspotCount = 3 + Math.floor(this.random(seed, frame, 0) * 5);
      const sunspots = [];
      for (let s = 0; s < sunspotCount; s++) {
        const spotAngle = this.random(seed + s, 100, 0) * Math.PI * 2;
        const spotDist = 0.2 + this.random(seed + s, 200, 0) * 0.5;
        const spotSize = 0.05 + this.random(seed + s, 300, 0) * 0.1;
        sunspots.push({
          x: Math.cos(spotAngle + timeOffset * 0.5) * spotDist,
          y: Math.sin(spotAngle + timeOffset * 0.5) * spotDist,
          size: spotSize
        });
      }

      // Pre-calculate coronal holes (2-4 coronal holes per star, larger and darker than sunspots)
      // Coronal holes are cooler, less dense regions typically found near star poles
      const coronalHoleCount = 2 + Math.floor(this.random(seed, frame, 1000) * 3);
      const coronalHoles = [];
      for (let c = 0; c < coronalHoleCount; c++) {
        // Bias toward polar regions (top/bottom of star)
        const polarBias = this.random(seed + c, 400, 0);
        const holeAngle = polarBias < 0.7
          ? (polarBias < 0.35 ? Math.PI / 2 : 3 * Math.PI / 2) + (this.random(seed + c, 500, 0) - 0.5) * Math.PI / 3
          : this.random(seed + c, 500, 0) * Math.PI * 2;
        const holeDist = 0.1 + this.random(seed + c, 600, 0) * 0.6;
        const holeSize = 0.15 + this.random(seed + c, 700, 0) * 0.2; // Larger than sunspots
        coronalHoles.push({
          x: Math.cos(holeAngle + timeOffset * 0.3) * holeDist,
          y: Math.sin(holeAngle + timeOffset * 0.3) * holeDist,
          size: holeSize,
          intensity: 0.5 + this.random(seed + c, 800, 0) * 0.3 // How dark the hole is
        });
      }

      for (let py = 0; py < size; py += pixelSize) {
        for (let px = 0; px < size; px += pixelSize) {
          const dx = px - centerX;
          const dy = py - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          const normalizedDist = dist / radius;

          if (normalizedDist <= 1.2) {
            // Core and surface
            // ENHANCED: Use quality settings for octaves (more detail)
            const surfaceNoise = this.fbm(
              px / 40 + timeOffset * 10,
              py / 40 + timeOffset * 10,
              timeOffset * 5,
              this.quality.starOctaves  // Now 5 octaves for more detail
            );

            const chaosNoise = this.fbm(
              px / 20 + Math.cos(timeOffset * Math.PI * 2) * 5,
              py / 20 + Math.sin(timeOffset * Math.PI * 2) * 5,
              timeOffset * 10,
              this.quality.starOctaves - 1
            );

            // ULTRA-REALISTIC: Multi-scale granulation for convection cells
            const granulationNoise = this.fbm(
              px / 12 + timeOffset * 20,
              py / 12 + timeOffset * 20,
              timeOffset * 15,
              4  // Increased octaves for finer detail
            );

            // Add magnetic field patterns for realistic stellar activity
            const magneticNoise = this.fbm(
              angle * 8 + timeOffset * 5,
              normalizedDist * 15,
              timeOffset * 8,
              3
            );

            // Add differential rotation (equator rotates faster than poles)
            const latitude = Math.abs(Math.sin(Math.asin(dy / Math.max(dist, 1))));
            const rotationSpeed = (1.0 - latitude * 0.3) * timeOffset * 15;
            const rotationNoise = this.fbm(
              angle * 10 + rotationSpeed,
              normalizedDist * 20,
              0,
              2
            );

            if (normalizedDist <= 1.0) {
              // Star surface - ultra-complex and realistic
              const brightness = (surfaceNoise * 0.3 + chaosNoise * 0.3 + granulationNoise * 0.25 + magneticNoise * 0.1 + rotationNoise * 0.05);
              const colorIndex = Math.floor(brightness * (palette.surface.length - 1));
              const color = palette.surface[Math.min(colorIndex, palette.surface.length - 1)];

              // Check for sunspots
              let isSunspot = false;
              const normalizedX = dx / radius;
              const normalizedY = dy / radius;
              for (const spot of sunspots) {
                const spotDx = normalizedX - spot.x;
                const spotDy = normalizedY - spot.y;
                const spotDist = Math.sqrt(spotDx * spotDx + spotDy * spotDy);
                if (spotDist < spot.size) {
                  isSunspot = true;
                  break;
                }
              }

              // Check for coronal holes (larger, darker regions)
              let coronalHoleIntensity = 0;
              for (const hole of coronalHoles) {
                const holeDx = normalizedX - hole.x;
                const holeDy = normalizedY - hole.y;
                const holeDist = Math.sqrt(holeDx * holeDx + holeDy * holeDy);
                if (holeDist < hole.size) {
                  // Soft falloff for coronal holes (not as sharp as sunspots)
                  const falloff = 1.0 - (holeDist / hole.size);
                  coronalHoleIntensity = Math.max(coronalHoleIntensity, hole.intensity * falloff);
                }
              }

              // STELLAR GLOW: Stars are self-luminous - no shadows, only radial glow
              // Stars emit light from their entire surface, getting brighter toward center
              // Use inverse square falloff for realistic stellar limb darkening
              let sphericalShading = 1.0;

              // Limb darkening: Stars are slightly dimmer at edges due to optical depth
              // But NEVER dark like a shadow - minimum 40% brightness at limb
              const limbDarkening = 1.0 - (normalizedDist * normalizedDist * 0.6); // Quadratic falloff, max 60% reduction
              sphericalShading = Math.max(0.4, limbDarkening); // Never below 40% brightness

              // Center brightening for realistic stellar core glow
              const centerGlow = 1.0 + Math.pow(1.0 - normalizedDist, 3) * 0.5; // Brighter center
              sphericalShading *= centerGlow;

              // Add hot spots (but darken for sunspots and coronal holes)
              let hotSpot = chaosNoise > 0.7 ? 1.5 : 1.2;
              if (isSunspot) {
                hotSpot = 0.4 + granulationNoise * 0.2; // Dark sunspots
              }
              if (coronalHoleIntensity > 0) {
                // Coronal holes are darker, with a bluish tint for cooler regions
                hotSpot *= (1.0 - coronalHoleIntensity * 0.6); // Darken by up to 60%
              }

              const rgb = this.hexToRgb(color);

              // ULTRA-REALISTIC: Stellar luminosity with proper energy distribution
              // Stars are extremely bright - boost overall luminosity for realistic glow
              const finalBrightness = hotSpot * sphericalShading * 1.5; // Maximum realistic brightness

              ctx.fillStyle = this.rgbToHex(
                Math.min(255, rgb.r * finalBrightness),
                Math.min(255, rgb.g * finalBrightness),
                Math.min(255, rgb.b * finalBrightness)
              );
              ctx.fillRect(px, py, pixelSize, pixelSize);
            } else {
              // Corona - wispy tendrils
              const coronaNoise = this.fbm(
                angle * 3 + timeOffset * 5,
                normalizedDist * 10,
                timeOffset * 3,
                4
              );

              if (coronaNoise > 0.3) {
                const alpha = (1.2 - normalizedDist) * 5 * (coronaNoise - 0.3);
                const colorIndex = Math.floor(coronaNoise * (palette.corona.length - 1));
                const color = palette.corona[Math.min(colorIndex, palette.corona.length - 1)];

                ctx.fillStyle = color;
                ctx.globalAlpha = Math.min(alpha, 0.9);
                ctx.fillRect(px, py, pixelSize, pixelSize);
                ctx.globalAlpha = 1.0;
              }
            }
          } else if (normalizedDist <= 1.8) {
            // Outer glow - ENHANCED: more pixels for detail
            const glowAlpha = (1.8 - normalizedDist) / 0.6;
            const glowNoise = this.noise(px / 30, py / 30, timeOffset);
            if (glowAlpha > 0 && glowNoise > 0.3) {
              ctx.fillStyle = palette.corona[0];
              ctx.globalAlpha = glowAlpha * 0.4 * glowNoise;
              ctx.fillRect(px, py, pixelSize, pixelSize);
              ctx.globalAlpha = 1.0;
            }
          }

          // Add coronal mass ejections (CMEs)
          const cmeAngle = (frame / animationFrames) * Math.PI * 2;
          const angleDiff = Math.abs(((angle - cmeAngle + Math.PI) % (Math.PI * 2)) - Math.PI);

          if (angleDiff < 0.5 && normalizedDist > 0.95 && normalizedDist < 1.5) {
            const cmeNoise = this.noise(dist / 30, angle * 10, timeOffset * 8);
            if (cmeNoise > 0.5) {
              ctx.fillStyle = palette.corona[1];
              ctx.globalAlpha = (cmeNoise - 0.5) * 2 * (1.5 - normalizedDist) * 2;
              ctx.fillRect(px, py, pixelSize, pixelSize);
              ctx.globalAlpha = 1.0;
            }
          }
        }
      }

        // Add glow effect (currently disabled due to browser compatibility)
        const glowCanvas = this.addGlow(canvas, palette.core, radius * 0.3);
        frames.push(glowCanvas);
      }
    } catch (error) {
      console.error(`[NewCelestialSpriteGenerator] Error generating star (class=${stellarClass}):`, error);
      console.error('[NewCelestialSpriteGenerator] Error stack:', error.stack);
      console.error('[NewCelestialSpriteGenerator] Config:', { radius, stellarClass, seed, animationFrames });
      // Return whatever frames we managed to generate
      if (frames.length === 0) {
        console.error('[NewCelestialSpriteGenerator] No frames generated, returning null');
        return null;
      }
    }

    console.log(`[NewCelestialSpriteGenerator] Generated ${frames.length} star frames, size: ${size}x${size}`);

    if (frames.length === 0) {
      console.error('[NewCelestialSpriteGenerator] No frames were generated for star!');
      return null;
    }

    return {
      frames,
      frameWidth: size,
      frameHeight: size,
      animationFrames
    };
  }

  /**
   * Generate a planet sprite with realistic surface features
   */
  async generatePlanet(config) {
    const {
      radius = 128,
      type = 'terran',
      seed = Math.random() * 10000,
      animationFrames = 4  // PERFORMANCE: Reduced from 16 to 4 for 4x faster generation
    } = config;

    this.seed = seed;

    // Map game planet types to generator palette types
    const typeMapping = {
      // Exact matches
      'terran': 'terran',
      'rocky': 'rocky',
      'desert': 'desert',
      'gasGiant': 'gasGiant',
      'gas_giant': 'gasGiant',
      'ice': 'ice',
      'ice_giant': 'ice',
      'moon': 'moon',
      'lava': 'lava',
      'ocean': 'ocean',
      'volcanic': 'volcanic',
      // Game planet types
      'brown_dwarf': 'gasGiant',  // Brown dwarfs are like small gas giants
      'carbon_planet': 'rocky',
      'lava_planet': 'lava',
      'ocean_planet': 'ocean',
      'rocky_planet': 'rocky',
      'ice_planet': 'ice',
      'dwarf_planet': 'moon',
      'super_earth': 'terran',
      'super_jupiter': 'gasGiant',
      'hot_jupiter': 'gasGiant',
      'desert_planet': 'desert',
      'volcanic_planet': 'lava'
    };

    const mappedType = typeMapping[type] || 'rocky';

    // MASSIVELY ENHANCED Planet type palettes with MORE colors for complex features
    const planetPalettes = {
      terran: {
        deepOcean: ['#003366', '#004477', '#005588'],
        ocean: ['#0066aa', '#0077bb', '#0088cc', '#0099dd'],
        shallowWater: ['#00aacc', '#00bbdd', '#00ccee'],
        beach: ['#e6d7a0', '#f0e1aa', '#faebb4'],
        plains: ['#5a8a4a', '#6a9a5a', '#7aaa6a', '#8abb7a'],
        forest: ['#2d5a2d', '#3d6a3d', '#4d7a4d'],
        desert: ['#d2b48c', '#c8a878', '#be9c64'],
        mountain: ['#9a8a6a', '#aa9a7a', '#baaa8a', '#cabbaa'],
        snowCap: ['#f0f0ff', '#ffffff', '#e8e8ff'],
        river: ['#4488cc', '#5599dd', '#66aaee'],
        lake: ['#3377bb', '#4488cc', '#5599dd'],
        city: ['#ffaa00', '#ffbb22', '#ffcc44'],
        cloud: ['#ffffff', '#f0f0f0', '#e0e0e0', '#d8d8d8']
      },
      desert: {
        sand: ['#e6c896', '#d2b48c', '#c8a878', '#be9c64'],
        dunes: ['#c8a878', '#be9c64', '#b49250'],
        rock: ['#aa8866', '#996644', '#885533'],
        canyon: ['#884422', '#773311', '#662200'],
        oasis: ['#00aa66', '#00bb77', '#00cc88']
      },
      rocky: {
        rock: ['#8a6a5a', '#7a5a4a', '#6a4a3a', '#5a3a2a'],
        dark: ['#4a3a2a', '#3a2a1a', '#2a1a0a'],
        light: ['#aa8a7a', '#ba9a8a', '#caaa9a'],
        crater: ['#5a4a3a', '#4a3a2a', '#3a2a1a'],
        mountains: ['#998877', '#aa9988', '#bbaa99']
      },
      gasGiant: {
        bands: ['#c4a574', '#d4b584', '#e4c594', '#d4b584', '#c4a574', '#b49564', '#a48554'],
        storms: ['#e4d5a4', '#f4e5b4', '#ffffc4', '#fff4d4'],
        dark: ['#a48554', '#947544', '#846534', '#745524'],
        vortex: ['#dd9944', '#cc8833', '#bb7722']
      },
      ice: {
        ice: ['#b0d0e0', '#c0e0f0', '#d0f0ff', '#e0f8ff'],
        darkIce: ['#8090a0', '#90a0b0', '#a0b0c0'],
        cracks: ['#90b0c0', '#a0c0d0', '#b0d0e0'],
        shadow: ['#7090a0', '#80a0b0', '#90b0c0'],
        glacier: ['#a0c8d8', '#b0d8e8', '#c0e8f8'],
        snow: ['#f0f8ff', '#ffffff', '#e8f0f8']
      },
      moon: {
        surface: ['#c0b0a0', '#d0c0b0', '#e0d0c0', '#f0e0d0'],
        crater: ['#a09080', '#b0a090', '#c0b0a0'],
        shadow: ['#908070', '#a09080', '#b0a090'],
        maria: ['#8a8a8a', '#9a9a9a', '#aaaaaa'],
        highland: ['#d8d0c8', '#e8e0d8', '#f8f0e8']
      },
      lava: {
        cooledCrust: ['#1a1a1a', '#2a2a2a', '#3a3a3a'],
        crust: ['#3a2a1a', '#4a3a2a', '#5a4a3a'],
        hotCrust: ['#884422', '#995533', '#aa6644'],
        lavaFlow: ['#ff5500', '#ff6622', '#ff7744'],
        lava: ['#ff6600', '#ff7722', '#ff8844'],
        lavaGlow: ['#ff9944', '#ffaa66', '#ffbb88'],
        volcano: ['#665544', '#776655', '#887766']
      },
      ocean: {
        deepOcean: ['#002244', '#003355', '#004466'],
        ocean: ['#0055aa', '#0066bb', '#0077cc'],
        reef: ['#00aa88', '#00bb99', '#00ccaa'],
        trench: ['#001122', '#002233', '#003344'],
        island: ['#5a8a4a', '#6a9a5a', '#7aaa6a']
      },
      volcanic: {
        ash: ['#554433', '#665544', '#776655'],
        lava: ['#ff4400', '#ff5522', '#ff6644'],
        smoke: ['#333333', '#444444', '#555555'],
        caldera: ['#221100', '#332211', '#443322']
      }
    };

    const palette = planetPalettes[mappedType] || planetPalettes.rocky;

    const frames = [];
    const size = radius * 2.5;  // Calculate size once, outside the loop

    try {
      // PERFORMANCE: Process frames in batches with single yield point
      const batchSize = 1; // PERFORMANCE FIX: Yield every frame for smooth loading
      for (let frame = 0; frame < animationFrames; frame++) {
        // ASYNC YIELD: Let browser breathe every batch to prevent UI freeze
        if (frame > 0 && frame % batchSize === 0) {
          await new Promise(resolve => requestAnimationFrame(() => resolve()));
        }

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          console.error(`[NewCelestialSpriteGenerator] Failed to get 2D context for planet frame ${frame}`);
          continue;
        }

        ctx.imageSmoothingEnabled = false;

      const centerX = size / 2;
      const centerY = size / 2;
      const rotationOffset = (frame / animationFrames) * Math.PI * 2;

      // ENHANCED: Use quality settings for pixel size (much more detailed now)
      const pixelSize = this.quality.planetPixelSize; // Now 2 instead of 4

      // Determine atmosphere color based on planet type
      const atmosphereColors = {
        terran: '#88aaff',    // Blue atmosphere
        rocky: '#aa8866',     // Dusty atmosphere
        gasGiant: '#ffddaa',  // Golden haze
        ice: '#aaddff',       // Cold blue
        moon: null,           // No atmosphere
        lava: '#ff6644'       // Red volcanic haze
      };
      const atmosphereColor = atmosphereColors[mappedType];

      for (let py = 0; py < size; py += pixelSize) {
        for (let px = 0; px < size; px += pixelSize) {
          const dx = px - centerX;
          const dy = py - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist <= radius) {
            // ENHANCED: Calculate proper sphere normal for Phong shading
            const normal = this.calculateSphereNormal(dx, dy, radius);
            if (!normal) continue;

            const normalizedDist = dist / radius;
            const edgeFactor = normalizedDist; // 0 at center, 1 at edge

            // Sphere UV coordinates
            const longitude = Math.atan2(dy, dx) + rotationOffset;
            const latitude = Math.asin(Math.min(1, Math.max(-1, dy / radius)));

            // Generate surface based on type
            let color;

            if (mappedType === 'terran') {
              // ULTRA-ENHANCED: Complex terrain generation with MANY features

              // Base terrain noise (continents)
              const continentNoise = this.fbm(longitude * 2, latitude * 2, 0, this.quality.planetOctaves);

              // Detail noise layers
              const landNoise = this.fbm(longitude * 3, latitude * 3, 0, this.quality.planetOctaves);
              const mountainNoise = this.fbm(longitude * 8, latitude * 8, 10, this.quality.planetOctaves - 2);
              const detailNoise = this.fbm(longitude * 15, latitude * 15, 20, 4);

              // Water features
              const riverNoise = this.fbm(longitude * 12, latitude * 12, 30, 3);
              const lakeNoise = this.fbm(longitude * 6, latitude * 6, 40, 4);

              // Polar ice caps
              const polarFactor = Math.abs(latitude) / (Math.PI / 2);
              const isIceCap = polarFactor > 0.75 + this.noise(longitude * 2, latitude * 2) * 0.1;

              // Temperature/climate zones
              const temperatureGradient = 1.0 - polarFactor;
              const equatorialFactor = 1.0 - Math.abs(latitude) / (Math.PI / 2);

              if (isIceCap) {
                // Polar ice caps with detail
                if (detailNoise > 0.6) {
                  color = palette.snowCap[2]; // Bright ice
                } else {
                  color = palette.snowCap[Math.floor(detailNoise * palette.snowCap.length)];
                }
              } else if (continentNoise > 0.45) {
                // LAND - various biomes based on latitude/climate
                const elevation = mountainNoise;
                const moisture = this.fbm(longitude * 4, latitude * 4, 50, 3);

                // Rivers (follow terrain)
                if (riverNoise > 0.78 && elevation < 0.6 && moisture > 0.4) {
                  color = palette.river[Math.floor(Math.random() * palette.river.length)];
                }
                // Lakes (in lower elevations)
                else if (lakeNoise > 0.72 && elevation < 0.5) {
                  color = palette.lake[Math.floor(Math.random() * palette.lake.length)];
                }
                // High mountains with snow caps
                else if (elevation > 0.7) {
                  if (elevation > 0.8) {
                    color = palette.snowCap[Math.floor(detailNoise * palette.snowCap.length)];
                  } else {
                    color = palette.mountain[Math.floor(Math.random() * palette.mountain.length)];
                  }
                }
                // Medium mountains
                else if (elevation > 0.55) {
                  color = palette.mountain[Math.floor(detailNoise * palette.mountain.length)];
                }
                // Deserts (hot, dry regions near equator)
                else if (equatorialFactor > 0.6 && moisture < 0.3) {
                  color = palette.desert[Math.floor(detailNoise * palette.desert.length)];
                }
                // Beaches (near water)
                else if (continentNoise < 0.48 && continentNoise > 0.45) {
                  color = palette.beach[Math.floor(Math.random() * palette.beach.length)];
                }
                // Forests (temperate, moist regions)
                else if (temperatureGradient > 0.4 && moisture > 0.5) {
                  color = palette.forest[Math.floor(detailNoise * palette.forest.length)];
                }
                // Plains (default land)
                else {
                  color = palette.plains[Math.floor(landNoise * palette.plains.length)];
                }

                // Cities on habitable land (rare, bright lights)
                const cityNoise = this.fbm(longitude * 20, latitude * 20, 100, 2);
                if (cityNoise > 0.88 && elevation < 0.6 && elevation > 0.3) {
                  color = palette.city[Math.floor(Math.random() * palette.city.length)];
                }
              } else {
                // OCEAN - depth-based coloring
                const oceanDepth = 0.45 - continentNoise;

                if (oceanDepth > 0.3) {
                  // Deep ocean
                  color = palette.deepOcean[Math.floor(Math.random() * palette.deepOcean.length)];
                } else if (oceanDepth > 0.15) {
                  // Regular ocean
                  color = palette.ocean[Math.floor(Math.random() * palette.ocean.length)];
                } else {
                  // Shallow water
                  color = palette.shallowWater[Math.floor(Math.random() * palette.shallowWater.length)];
                }
              }

              // Clouds (dynamic, swirling)
              const cloudNoise = this.fbm(
                longitude * 5 + frame * 0.05,
                latitude * 5 + frame * 0.03,
                frame * 0.1,
                3
              );
              if (cloudNoise > 0.68) {
                const cloudDensity = (cloudNoise - 0.68) / 0.32;
                color = palette.cloud[Math.min(Math.floor(cloudDensity * palette.cloud.length), palette.cloud.length - 1)];
              }
            } else if (mappedType === 'gasGiant') {
              // ENHANCED: Banded structure with more detail
              const bandNoise = this.fbm(latitude * 4, longitude * 1, frame * 0.2, this.quality.planetOctaves - 2);
              const bandIndex = Math.floor((latitude + Math.PI / 2) / Math.PI * palette.bands.length + bandNoise * 2);
              color = palette.bands[Math.abs(bandIndex % palette.bands.length)];

              // ENHANCED: Great Red Spot style storms
              const stormNoise = this.fbm(longitude * 6, latitude * 6, frame * 0.1, 4);
              if (stormNoise > 0.72) {
                color = palette.storms[Math.floor(Math.random() * palette.storms.length)];
              }
            } else if (mappedType === 'moon') {
              // ENHANCED: More crater detail
              const craterNoise = this.fbm(longitude * 10, latitude * 10, 0, this.quality.planetOctaves - 1);

              // ENHANCED: Large crater impact basins
              const largeFeature = this.fbm(longitude * 2, latitude * 2, 50, 3);
              const hasLargeBasin = largeFeature > 0.75;

              if (craterNoise > 0.65 || hasLargeBasin) {
                // Crater
                color = palette.crater[Math.floor(Math.random() * palette.crater.length)];
              } else {
                color = palette.surface[Math.floor(craterNoise * palette.surface.length)];
              }
            } else if (mappedType === 'ice') {
              // ENHANCED: Ice surface with cracks
              const iceNoise = this.fbm(longitude * 6, latitude * 6, 0, this.quality.planetOctaves - 1);

              // ENHANCED: Polar variation
              const polarFactor = Math.abs(latitude) / (Math.PI / 2);

              if (iceNoise > 0.55) {
                color = palette.cracks[Math.floor(Math.random() * palette.cracks.length)];
              } else {
                const colorIndex = Math.floor(iceNoise * palette.ice.length);
                // Brighter ice at poles
                color = polarFactor > 0.6 ? '#ffffff' : palette.ice[colorIndex];
              }
            } else if (mappedType === 'lava') {
              // ULTRA-ENHANCED: Volcanic world with lava lakes, lava oceans, volcanoes

              // Base terrain
              const terrainNoise = this.fbm(longitude * 3, latitude * 3, 0, this.quality.planetOctaves);
              const lavaFlow = this.fbm(longitude * 4, latitude * 4, frame * 0.3, this.quality.planetOctaves - 2);
              const coolingNoise = this.fbm(longitude * 8, latitude * 8, 0, 3);
              const detailNoise = this.fbm(longitude * 15, latitude * 15, 20, 4);

              // Volcanic features
              const volcanoNoise = this.fbm(longitude * 10, latitude * 10, 50, 4);
              const lavaLakeNoise = this.fbm(longitude * 6, latitude * 6, 30, 3);

              // Lava oceans (large molten regions)
              if (terrainNoise < 0.35) {
                // Active lava ocean with waves
                const waveNoise = this.fbm(longitude * 12 + frame * 0.4, latitude * 12, frame * 0.5, 2);
                if (waveNoise > 0.6) {
                  color = palette.lavaGlow[Math.floor(Math.random() * palette.lavaGlow.length)];
                } else {
                  color = palette.lava[Math.floor(Math.random() * palette.lava.length)];
                }
              }
              // Volcanoes (elevated features with calderas)
              else if (volcanoNoise > 0.75) {
                const volcanoHeight = (volcanoNoise - 0.75) / 0.25;
                if (volcanoHeight > 0.7) {
                  // Caldera with active lava
                  color = palette.lavaFlow[Math.floor(Math.random() * palette.lavaFlow.length)];
                } else if (volcanoHeight > 0.4) {
                  // Volcanic rock near peak
                  color = palette.volcano[Math.floor(detailNoise * palette.volcano.length)];
                } else {
                  // Volcanic slopes
                  color = palette.hotCrust[Math.floor(detailNoise * palette.hotCrust.length)];
                }
              }
              // Lava lakes (smaller molten pools)
              else if (lavaLakeNoise > 0.72 && terrainNoise < 0.6) {
                const lakeBrightness = this.fbm(longitude * 20, latitude * 20, frame * 0.6, 2);
                if (lakeBrightness > 0.6) {
                  color = palette.lavaGlow[Math.floor(Math.random() * palette.lavaGlow.length)];
                } else {
                  color = palette.lavaFlow[Math.floor(Math.random() * palette.lavaFlow.length)];
                }
              }
              // Lava rivers/flows
              else if (lavaFlow > 0.70 && terrainNoise > 0.4) {
                const flowIntensity = (lavaFlow - 0.70) / 0.30;
                if (flowIntensity > 0.7) {
                  color = palette.lava[Math.floor(Math.random() * palette.lava.length)];
                } else {
                  color = palette.lavaFlow[Math.floor(Math.random() * palette.lavaFlow.length)];
                }
              }
              // Cooling/solidified crust
              else {
                if (coolingNoise < 0.3) {
                  // Fully cooled black crust
                  color = palette.cooledCrust[Math.floor(detailNoise * palette.cooledCrust.length)];
                } else if (coolingNoise < 0.5) {
                  // Recently cooled dark crust
                  color = palette.crust[Math.floor(Math.random() * palette.crust.length)];
                } else {
                  // Hot crust (still warm, but solidified)
                  color = palette.hotCrust[Math.floor(detailNoise * palette.hotCrust.length)];
                }
              }
            } else if (mappedType === 'desert') {
              // ULTRA-ENHANCED: Desert planet with dunes, canyons, oases

              // Terrain features
              const terrainNoise = this.fbm(longitude * 3, latitude * 3, 0, this.quality.planetOctaves);
              const duneNoise = this.fbm(longitude * 8, latitude * 8 + frame * 0.01, 10, 4);
              const canyonNoise = this.fbm(longitude * 6, latitude * 6, 20, 5);
              const oasisNoise = this.fbm(longitude * 10, latitude * 10, 30, 3);
              const detailNoise = this.fbm(longitude * 15, latitude * 15, 40, 3);

              // Canyons (deep cuts in terrain)
              if (canyonNoise < 0.25) {
                const canyonDepth = (0.25 - canyonNoise) / 0.25;
                if (canyonDepth > 0.7) {
                  color = palette.canyon[2]; // Deep canyon
                } else {
                  color = palette.canyon[Math.floor(canyonDepth * palette.canyon.length)];
                }
              }
              // Rare oases
              else if (oasisNoise > 0.85) {
                color = palette.oasis[Math.floor(Math.random() * palette.oasis.length)];
              }
              // Rocky outcrops
              else if (terrainNoise > 0.65) {
                color = palette.rock[Math.floor(detailNoise * palette.rock.length)];
              }
              // Dunes (wave-like sand formations)
              else if (duneNoise > 0.55) {
                const duneHeight = (duneNoise - 0.55) / 0.45;
                if (duneHeight > 0.6) {
                  // Dune peaks (lighter)
                  color = palette.dunes[0];
                } else {
                  // Dune valleys (darker)
                  color = palette.dunes[Math.floor(duneHeight * palette.dunes.length)];
                }
              }
              // Sand plains
              else {
                color = palette.sand[Math.floor(detailNoise * palette.sand.length)];
              }
            } else if (mappedType === 'ocean') {
              // ULTRA-ENHANCED: Ocean world with deep trenches, reefs, islands

              const depthNoise = this.fbm(longitude * 4, latitude * 4, 0, this.quality.planetOctaves);
              const reefNoise = this.fbm(longitude * 12, latitude * 12, 20, 4);
              const islandNoise = this.fbm(longitude * 6, latitude * 6, 30, 5);

              // Rare islands
              if (islandNoise > 0.80) {
                color = palette.island[Math.floor(Math.random() * palette.island.length)];
              }
              // Shallow reefs
              else if (reefNoise > 0.72 && depthNoise > 0.5) {
                color = palette.reef[Math.floor(Math.random() * palette.reef.length)];
              }
              // Ocean depth-based
              else if (depthNoise < 0.3) {
                // Deep ocean trenches
                color = palette.trench[Math.floor(Math.random() * palette.trench.length)];
              } else if (depthNoise < 0.4) {
                // Very deep ocean
                color = palette.deepOcean[Math.floor(Math.random() * palette.deepOcean.length)];
              } else {
                // Regular ocean
                color = palette.ocean[Math.floor(Math.random() * palette.ocean.length)];
              }
            } else {
              // Rocky default - ENHANCED with more features
              const terrainNoise = this.fbm(longitude * 4, latitude * 4, 0, this.quality.planetOctaves);
              const craterNoise = this.fbm(longitude * 10, latitude * 10, 10, 4);
              const mountainNoise = this.fbm(longitude * 8, latitude * 8, 20, 5);
              const detailNoise = this.fbm(longitude * 15, latitude * 15, 30, 3);

              // Get first palette category
              const paletteKey = Object.keys(palette)[0];
              const colors = palette[paletteKey];

              // Impact craters
              if (palette.crater && craterNoise > 0.72) {
                color = palette.crater[Math.floor(detailNoise * palette.crater.length)];
              }
              // Mountains/highlands
              else if (palette.mountains && mountainNoise > 0.65) {
                color = palette.mountains[Math.floor(detailNoise * palette.mountains.length)];
              }
              // Regular terrain
              else {
                const terrainIndex = Math.floor(terrainNoise * colors.length);
                color = colors[Math.min(terrainIndex, colors.length - 1)];
              }
            }

            // ENHANCED: Apply Phong shading for 3D depth
            let rgb = this.hexToRgb(color);

            if (this.quality.enablePhong) {
              const shading = this.calculatePhongShading(normal.nx, normal.ny, normal.nz, {
                ambient: 0.2,
                diffuseStrength: 0.65,
                specularStrength: mappedType === 'ice' ? 0.4 : 0.15,
                shininess: mappedType === 'ice' ? 64 : 16
              });

              rgb = {
                r: rgb.r * shading.total,
                g: rgb.g * shading.total,
                b: rgb.b * shading.total
              };

              // Add specular highlight for ice and ocean
              if ((mappedType === 'ice' || mappedType === 'terran') && shading.specular > 0.1) {
                rgb.r = Math.min(255, rgb.r + shading.specular * 80);
                rgb.g = Math.min(255, rgb.g + shading.specular * 80);
                rgb.b = Math.min(255, rgb.b + shading.specular * 80);
              }
            } else {
              // Fallback to simple shading
              const lighting = Math.max(0.3, normal.nz);
              rgb = { r: rgb.r * lighting, g: rgb.g * lighting, b: rgb.b * lighting };
            }

            // ENHANCED: Apply atmospheric scattering at limb
            if (atmosphereColor) {
              rgb = this.applyAtmosphericScattering(rgb, edgeFactor, atmosphereColor);
            }

            ctx.fillStyle = this.rgbToHex(rgb.r, rgb.g, rgb.b);
            ctx.fillRect(px, py, pixelSize, pixelSize);
          }

          // ENHANCED: Draw atmospheric halo outside planet edge
          else if (atmosphereColor && dist <= radius * 1.15) {
            const haloFactor = 1 - (dist - radius) / (radius * 0.15);
            if (haloFactor > 0) {
              const atmoRgb = this.hexToRgb(atmosphereColor);
              ctx.fillStyle = this.rgbToHex(atmoRgb.r, atmoRgb.g, atmoRgb.b);
              ctx.globalAlpha = haloFactor * 0.3;
              ctx.fillRect(px, py, pixelSize, pixelSize);
              ctx.globalAlpha = 1.0;
            }
          }
        }
      }

        frames.push(canvas);
      }
    } catch (error) {
      console.error(`[NewCelestialSpriteGenerator] Error generating planet (type=${type}, mappedType=${mappedType}):`, error);
      console.error('[NewCelestialSpriteGenerator] Error stack:', error.stack);
      console.error('[NewCelestialSpriteGenerator] Config:', { radius, type, seed, animationFrames });
      // Return whatever frames we managed to generate
      if (frames.length === 0) {
        console.error('[NewCelestialSpriteGenerator] No frames generated, returning null');
        return null;
      }
    }

    console.log(`[NewCelestialSpriteGenerator] Successfully generated ${frames.length} planet frames (type=${type})`);

    return {
      frames,
      frameWidth: size,
      frameHeight: size,
      animationFrames
    };
  }

  /**
   * Generate an asteroid sprite with irregular shape
   */
  async generateAsteroid(config) {
    const {
      size = 64,
      seed = Math.random() * 10000,
      animationFrames = 1  // PERFORMANCE: No animation needed for asteroids (they just rotate)
    } = config;

    this.seed = seed;

    const palette = {
      surface: ['#a0a0a0', '#b0b0b0', '#c0c0c0', '#d0d0d0'],
      dark: ['#707070', '#808080', '#909090'],
      light: ['#d0d0d0', '#e0e0e0', '#f0f0f0']
    };

    const frames = [];

    // PERFORMANCE: Process frames in batches with single yield point
    const batchSize = 4;
    for (let frame = 0; frame < animationFrames; frame++) {
      // ASYNC YIELD: Let browser breathe every batch to prevent UI freeze
      if (frame > 0 && frame % batchSize === 0) {
        await new Promise(resolve => requestAnimationFrame(() => resolve()));
      }

      const canvas = document.createElement('canvas');
      const canvasSize = size * 2;
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const centerX = canvasSize / 2;
      const centerY = canvasSize / 2;
      const rotationOffset = (frame / animationFrames) * Math.PI * 2;

      const pixelSize = 1;

      for (let py = 0; py < canvasSize; py += pixelSize) {
        for (let px = 0; px < canvasSize; px += pixelSize) {
          const dx = px - centerX;
          const dy = py - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) + rotationOffset;

          // Irregular shape
          const shapeNoise = this.fbm(
            Math.cos(angle) * 2,
            Math.sin(angle) * 2,
            rotationOffset,
            4
          );

          const irregularRadius = size / 2 * (0.6 + shapeNoise * 0.8);

          if (dist <= irregularRadius) {
            // Surface detail
            const surfaceNoise = this.fbm(
              angle * 5,
              dist / 10,
              rotationOffset * 2,
              5
            );

            let color;
            if (surfaceNoise > 0.7) {
              color = palette.light[Math.floor(Math.random() * palette.light.length)];
            } else if (surfaceNoise < 0.3) {
              color = palette.dark[Math.floor(Math.random() * palette.dark.length)];
            } else {
              color = palette.surface[Math.floor(surfaceNoise * palette.surface.length)];
            }

            // Rough lighting
            const lighting = Math.max(0.4, 1.0 - dist / irregularRadius);
            const rgb = this.hexToRgb(color);

            ctx.fillStyle = this.rgbToHex(
              rgb.r * lighting,
              rgb.g * lighting,
              rgb.b * lighting
            );
            ctx.fillRect(px, py, pixelSize, pixelSize);
          }
        }
      }

      frames.push(canvas);
    }

    return {
      frames,
      frameWidth: canvasSize,
      frameHeight: canvasSize,
      animationFrames
    };
  }

  /**
   * Add glow effect to a canvas (simple version without filter effects)
   */
  addGlow(sourceCanvas) {
    // Just return the source canvas for now - glow is already built into the star generation
    // Using ctx.filter causes InvalidStateError in some browsers
    // Note: glowColor and glowRadius parameters removed as they were unused
    return sourceCanvas;
  }

  /**
   * Generate a comet with tail
   * NEW METHOD for comets with animated tails
   */
  async generateComet(config) {
    const {
      size = 64,
      seed = Math.random() * 10000,
      animationFrames = 12,
      tailLength = 200 // Length of comet tail
    } = config;

    this.seed = seed;

    const palette = {
      core: ['#d0d0d0', '#e0e0e0', '#f0f0f0'],
      surface: ['#a0a0a0', '#b0b0b0', '#c0c0c0'],
      dark: ['#707070', '#808080', '#909090'],
      ice: ['#b0d0e0', '#c0e0f0', '#d0f0ff'],
      tail: ['#88aacc', '#99bbdd', '#aaccee'],
      tailGlow: ['#aaccee', '#bbddff', '#cceeff']
    };

    const frames = [];

    // Process frames in batches
    const batchSize = 4;
    for (let frame = 0; frame < animationFrames; frame++) {
      if (frame > 0 && frame % batchSize === 0) {
        await new Promise(resolve => requestAnimationFrame(() => resolve()));
      }

      const canvas = document.createElement('canvas');
      const canvasSize = size * 2 + tailLength;
      canvas.width = canvasSize;
      canvas.height = size * 2;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      const cometCenterX = size;
      const cometCenterY = size;
      const rotationOffset = (frame / animationFrames) * Math.PI * 2;

      const pixelSize = 1;

      // Draw comet tail first (so nucleus is on top)
      for (let tx = cometCenterX; tx < canvasSize; tx += pixelSize * 2) {
        const tailProgress = (tx - cometCenterX) / tailLength;
        if (tailProgress > 1) break;

        const tailWidth = size * (1 - tailProgress * 0.8);
        const tailAlpha = (1 - tailProgress) * 0.6;

        for (let ty = -tailWidth; ty < tailWidth; ty += pixelSize * 2) {
          const distFromCenter = Math.abs(ty) / tailWidth;
          if (distFromCenter > 1) continue;

          // Wispy tail effect
          const wispNoise = this.fbm(tx / 30, ty / 30, frame * 0.1, 3);
          if (wispNoise < 0.3) continue;

          const alpha = tailAlpha * (1 - distFromCenter) * wispNoise;
          const colorIndex = Math.floor(distFromCenter * palette.tail.length);
          const color = palette.tail[Math.min(colorIndex, palette.tail.length - 1)];

          ctx.fillStyle = color;
          ctx.globalAlpha = alpha;
          ctx.fillRect(tx, cometCenterY + ty, pixelSize * 2, pixelSize * 2);
        }
      }
      ctx.globalAlpha = 1.0;

      // Draw comet nucleus
      for (let py = 0; py < size * 2; py += pixelSize) {
        for (let px = 0; px < size * 2; px += pixelSize) {
          const dx = px - cometCenterX;
          const dy = py - cometCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) + rotationOffset;

          // Irregular comet shape (more elongated than asteroids)
          const shapeNoise = this.fbm(
            Math.cos(angle) * 2,
            Math.sin(angle) * 2,
            rotationOffset,
            4
          );

          const irregularRadius = size / 2 * (0.5 + shapeNoise * 0.7);

          if (dist <= irregularRadius) {
            // Surface detail with ice patches
            const surfaceNoise = this.fbm(
              angle * 5,
              dist / 10,
              rotationOffset * 2,
              5
            );

            const iceNoise = this.fbm(
              angle * 8,
              dist / 15,
              rotationOffset + 100,
              3
            );

            let color;
            // Ice patches
            if (iceNoise > 0.65) {
              color = palette.ice[Math.floor(Math.random() * palette.ice.length)];
            }
            // Bright spots
            else if (surfaceNoise > 0.7) {
              color = palette.core[Math.floor(Math.random() * palette.core.length)];
            }
            // Dark spots
            else if (surfaceNoise < 0.3) {
              color = palette.dark[Math.floor(Math.random() * palette.dark.length)];
            }
            // Regular surface
            else {
              color = palette.surface[Math.floor(surfaceNoise * palette.surface.length)];
            }

            // Rough lighting
            const lighting = Math.max(0.4, 1.0 - dist / irregularRadius);
            const rgb = this.hexToRgb(color);

            ctx.fillStyle = this.rgbToHex(
              rgb.r * lighting,
              rgb.g * lighting,
              rgb.b * lighting
            );
            ctx.fillRect(px, py, pixelSize, pixelSize);
          }
        }
      }

      frames.push(canvas);
    }

    return {
      frames,
      frameWidth: canvasSize,
      frameHeight: size * 2,
      animationFrames
    };
  }

  /**
   * Convert canvas to sprite sheet
   */
  async createSpriteSheet(frames) {
    if (!frames || frames.length === 0) {
      console.error('[NewCelestialSpriteGenerator] No frames to pack');
      return null;
    }

    const frameWidth = frames[0].width;
    const frameHeight = frames[0].height;
    const cols = Math.min(frames.length, 8);
    const rows = Math.ceil(frames.length / cols);

    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = frameWidth * cols;
    sheetCanvas.height = frameHeight * rows;
    const ctx = sheetCanvas.getContext('2d');

    if (!ctx) {
      console.error('[NewCelestialSpriteGenerator] Failed to get canvas context');
      return null;
    }

    ctx.imageSmoothingEnabled = false;

    try {
      for (let i = 0; i < frames.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        ctx.drawImage(frames[i], col * frameWidth, row * frameHeight);

        // PERFORMANCE FIX: Immediately clear frame canvas to free GPU memory
        // Prevents memory leaks from accumulating 100MB+ of unused canvas data
        frames[i].width = 0;
        frames[i].height = 0;
        frames[i] = null;
      }
    } catch (error) {
      console.error('[NewCelestialSpriteGenerator] Error packing sprite sheet:', error);
      return null;
    }

    // PERFORMANCE FIX: Save frame count before clearing array
    const totalFrames = frames.length;

    // PERFORMANCE FIX: Clear frames array after sprite sheet creation
    frames.length = 0;

    return {
      canvas: sheetCanvas,
      frameWidth,
      frameHeight,
      cols,
      rows,
      frameCount: totalFrames
    };
  }

  /**
   * Wrapper methods for compatibility with SpriteManager
   * These delegate to the actual generation methods
   */
  async generateStarSprite(config) {
    return await this.generateStar(config);
  }

  async generatePlanetSprite(config) {
    return await this.generatePlanet(config);
  }

  async generateMoonSprite(config) {
    // Moons are just small planets
    return await this.generatePlanet(config);
  }

  async generateAsteroidSprite(config) {
    return await this.generateAsteroid(config);
  }

  async generateCometSprite(config) {
    return await this.generateComet(config);
  }

  /**
   * Get sprite sheet generator (for compatibility with SpriteRenderer)
   * @returns {NewCelestialSpriteGenerator} Returns this instance
   */
  getSpriteSheetGenerator() {
    return this;
  }
}
