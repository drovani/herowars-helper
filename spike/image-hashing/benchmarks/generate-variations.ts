// ABOUTME: Generates synthetic equipment-like test images and creates variations
// ABOUTME: (cropped, resized, compressed, color-shifted) for image hashing benchmarks

import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const BASE_SIZE = 256;
const TEST_IMAGES_DIR = path.join(process.cwd(), "test-images");

interface ImagePattern {
  name: string;
  type: "equipment" | "similar";
  description: string;
}

// Patterns simulating different equipment types
const PATTERNS: ImagePattern[] = [
  { name: "sword-red", type: "equipment", description: "Red sword icon" },
  { name: "sword-blue", type: "equipment", description: "Blue sword icon" },
  { name: "shield-gold", type: "equipment", description: "Gold shield icon" },
  { name: "shield-silver", type: "equipment", description: "Silver shield icon" },
  { name: "helmet-dark", type: "equipment", description: "Dark helmet icon" },
  { name: "helmet-light", type: "equipment", description: "Light helmet icon" },
  { name: "armor-heavy", type: "equipment", description: "Heavy armor icon" },
  { name: "armor-light", type: "equipment", description: "Light armor icon" },
  { name: "ring-ruby", type: "equipment", description: "Ruby ring icon" },
  { name: "ring-sapphire", type: "equipment", description: "Sapphire ring icon" },
  { name: "boots-leather", type: "equipment", description: "Leather boots icon" },
  { name: "boots-metal", type: "equipment", description: "Metal boots icon" },
  { name: "gloves-cloth", type: "equipment", description: "Cloth gloves icon" },
  { name: "gloves-plate", type: "equipment", description: "Plate gloves icon" },
  { name: "amulet-moon", type: "equipment", description: "Moon amulet icon" },
  { name: "amulet-sun", type: "equipment", description: "Sun amulet icon" },
  { name: "staff-fire", type: "equipment", description: "Fire staff icon" },
  { name: "staff-ice", type: "equipment", description: "Ice staff icon" },
  { name: "bow-short", type: "equipment", description: "Short bow icon" },
  { name: "bow-long", type: "equipment", description: "Long bow icon" },
];

// Generate additional patterns programmatically
for (let i = 0; i < 80; i++) {
  const colors = ["red", "blue", "green", "yellow", "purple", "orange"];
  const shapes = ["circle", "square", "triangle", "star", "diamond"];
  const color = colors[i % colors.length];
  const shape = shapes[Math.floor(i / colors.length) % shapes.length];

  PATTERNS.push({
    name: `item-${shape}-${color}-${i}`,
    type: "equipment",
    description: `${color} ${shape} equipment ${i}`,
  });
}

// Add similar but distinct patterns
PATTERNS.push(
  { name: "sword-red-worn", type: "similar", description: "Worn red sword (similar to sword-red)" },
  { name: "shield-gold-cracked", type: "similar", description: "Cracked gold shield (similar to shield-gold)" }
);

/**
 * Generates a synthetic equipment-like image with geometric patterns
 */
async function generateSyntheticImage(
  pattern: ImagePattern,
  size: number = BASE_SIZE
): Promise<Buffer> {
  // Extract color and shape hints from pattern name
  const isRed = pattern.name.includes("red");
  const isBlue = pattern.name.includes("blue");
  const isGreen = pattern.name.includes("green");
  const isYellow = pattern.name.includes("yellow");
  const isPurple = pattern.name.includes("purple");
  const isOrange = pattern.name.includes("orange");
  const isGold = pattern.name.includes("gold");
  const isSilver = pattern.name.includes("silver");

  // Base color selection
  let baseColor: { r: number; g: number; b: number };
  if (isRed) baseColor = { r: 200, g: 50, b: 50 };
  else if (isBlue) baseColor = { r: 50, g: 100, b: 200 };
  else if (isGreen) baseColor = { r: 50, g: 180, b: 50 };
  else if (isYellow) baseColor = { r: 220, g: 220, b: 50 };
  else if (isPurple) baseColor = { r: 150, g: 50, b: 180 };
  else if (isOrange) baseColor = { r: 230, g: 140, b: 50 };
  else if (isGold) baseColor = { r: 212, g: 175, b: 55 };
  else if (isSilver) baseColor = { r: 192, g: 192, b: 192 };
  else {
    // Generate pseudo-random color based on pattern name hash
    const hash = pattern.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    baseColor = {
      r: (hash * 37) % 200 + 55,
      g: (hash * 73) % 200 + 55,
      b: (hash * 149) % 200 + 55,
    };
  }

  // Create SVG with geometric shapes simulating equipment
  const isCircle = pattern.name.includes("circle") || pattern.name.includes("ring") || pattern.name.includes("amulet");
  const isSquare = pattern.name.includes("square") || pattern.name.includes("shield");
  const isTriangle = pattern.name.includes("triangle") || pattern.name.includes("sword");
  const isStar = pattern.name.includes("star");

  let shapeElement: string;
  if (isCircle) {
    shapeElement = `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 3}" fill="rgb(${baseColor.r},${baseColor.g},${baseColor.b})" />`;
  } else if (isSquare) {
    const rectSize = size / 1.8;
    const offset = (size - rectSize) / 2;
    shapeElement = `<rect x="${offset}" y="${offset}" width="${rectSize}" height="${rectSize}" fill="rgb(${baseColor.r},${baseColor.g},${baseColor.b})" />`;
  } else if (isTriangle) {
    const points = `${size / 2},${size / 6} ${size / 6},${(5 * size) / 6} ${(5 * size) / 6},${(5 * size) / 6}`;
    shapeElement = `<polygon points="${points}" fill="rgb(${baseColor.r},${baseColor.g},${baseColor.b})" />`;
  } else if (isStar) {
    const points = generateStarPoints(size / 2, size / 2, 5, size / 3, size / 6);
    shapeElement = `<polygon points="${points}" fill="rgb(${baseColor.r},${baseColor.g},${baseColor.b})" />`;
  } else {
    // Default: diamond shape
    const points = `${size / 2},${size / 6} ${(5 * size) / 6},${size / 2} ${size / 2},${(5 * size) / 6} ${size / 6},${size / 2}`;
    shapeElement = `<polygon points="${points}" fill="rgb(${baseColor.r},${baseColor.g},${baseColor.b})" />`;
  }

  // Add detail overlay (simulating equipment detail)
  const detailColor = {
    r: Math.min(255, baseColor.r + 50),
    g: Math.min(255, baseColor.g + 50),
    b: Math.min(255, baseColor.b + 50),
  };

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="rgb(40,40,45)" />
      ${shapeElement}
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 8}" fill="rgb(${detailColor.r},${detailColor.g},${detailColor.b})" opacity="0.7" />
    </svg>
  `;

  return await sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

/**
 * Generate star points for SVG polygon
 */
function generateStarPoints(
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
): string {
  const points: string[] = [];
  const step = Math.PI / spikes;

  for (let i = 0; i < 2 * spikes; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }

  return points.join(" ");
}

/**
 * Create cropped variation
 */
async function createCroppedVariation(
  imageBuffer: Buffer,
  cropPercent: number
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || BASE_SIZE;
  const height = metadata.height || BASE_SIZE;

  const cropAmount = Math.floor(width * cropPercent);
  const newWidth = width - cropAmount * 2;
  const newHeight = height - cropAmount * 2;

  return await sharp(imageBuffer)
    .extract({
      left: cropAmount,
      top: cropAmount,
      width: newWidth,
      height: newHeight,
    })
    .resize(width, height)
    .png()
    .toBuffer();
}

/**
 * Create resized variation
 */
async function createResizedVariation(
  imageBuffer: Buffer,
  scale: number
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || BASE_SIZE;
  const height = metadata.height || BASE_SIZE;

  return await sharp(imageBuffer)
    .resize(Math.floor(width * scale), Math.floor(height * scale))
    .png()
    .toBuffer();
}

/**
 * Create compressed variation (JPEG with different quality)
 */
async function createCompressedVariation(
  imageBuffer: Buffer,
  quality: number
): Promise<Buffer> {
  return await sharp(imageBuffer)
    .jpeg({ quality })
    .toBuffer();
}

/**
 * Create color variation (hue shift)
 */
async function createColorVariation(
  imageBuffer: Buffer,
  hueShift: number
): Promise<Buffer> {
  // Rotate hue by modulating the image
  return await sharp(imageBuffer)
    .modulate({
      hue: hueShift,
      saturation: 1.0,
    })
    .png()
    .toBuffer();
}

/**
 * Main generation function
 */
async function generateAllTestImages() {
  console.log("Generating test images and variations...\n");

  const startTime = Date.now();
  let imageCount = 0;

  // Generate base images in "identical" folder
  console.log("1. Generating base images...");
  for (const pattern of PATTERNS) {
    const imageBuffer = await generateSyntheticImage(pattern);
    const filename = `${pattern.name}.png`;
    const filepath = path.join(TEST_IMAGES_DIR, "identical", filename);

    await fs.writeFile(filepath, imageBuffer);
    imageCount++;

    if (pattern.type === "similar") {
      // Also save similar patterns to similar-distinct folder
      const similarPath = path.join(TEST_IMAGES_DIR, "similar-distinct", filename);
      await fs.writeFile(similarPath, imageBuffer);
    }
  }
  console.log(`   Generated ${imageCount} base images\n`);

  // Generate variations using first 20 base patterns
  const variationPatterns = PATTERNS.slice(0, 20);

  // Cropped variations
  console.log("2. Generating cropped variations...");
  const cropPercentages = [0.1, 0.2, 0.3];
  for (const pattern of variationPatterns) {
    const baseImage = await generateSyntheticImage(pattern);
    for (const cropPercent of cropPercentages) {
      const cropped = await createCroppedVariation(baseImage, cropPercent);
      const filename = `${pattern.name}_crop${Math.floor(cropPercent * 100)}.png`;
      const filepath = path.join(TEST_IMAGES_DIR, "variations", "cropped", filename);
      await fs.writeFile(filepath, cropped);
      imageCount++;
    }
  }
  console.log(`   Generated ${variationPatterns.length * cropPercentages.length} cropped variations\n`);

  // Resized variations
  console.log("3. Generating resized variations...");
  const scales = [0.5, 2.0, 4.0];
  for (const pattern of variationPatterns) {
    const baseImage = await generateSyntheticImage(pattern);
    for (const scale of scales) {
      const resized = await createResizedVariation(baseImage, scale);
      const filename = `${pattern.name}_scale${scale.toFixed(1)}.png`;
      const filepath = path.join(TEST_IMAGES_DIR, "variations", "resized", filename);
      await fs.writeFile(filepath, resized);
      imageCount++;
    }
  }
  console.log(`   Generated ${variationPatterns.length * scales.length} resized variations\n`);

  // Compressed variations
  console.log("4. Generating compressed variations...");
  const qualities = [90, 70, 50];
  for (const pattern of variationPatterns) {
    const baseImage = await generateSyntheticImage(pattern);
    for (const quality of qualities) {
      const compressed = await createCompressedVariation(baseImage, quality);
      const filename = `${pattern.name}_q${quality}.jpg`;
      const filepath = path.join(TEST_IMAGES_DIR, "variations", "compressed", filename);
      await fs.writeFile(filepath, compressed);
      imageCount++;
    }
  }
  console.log(`   Generated ${variationPatterns.length * qualities.length} compressed variations\n`);

  // Color variations
  console.log("5. Generating color variations...");
  const hueShifts = [30, 60, -30];
  for (const pattern of variationPatterns) {
    const baseImage = await generateSyntheticImage(pattern);
    for (const hueShift of hueShifts) {
      const colorShifted = await createColorVariation(baseImage, hueShift);
      const filename = `${pattern.name}_hue${hueShift > 0 ? "+" : ""}${hueShift}.png`;
      const filepath = path.join(TEST_IMAGES_DIR, "color-variations", filename);
      await fs.writeFile(filepath, colorShifted);
      imageCount++;
    }
  }
  console.log(`   Generated ${variationPatterns.length * hueShifts.length} color variations\n`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Complete! Generated ${imageCount} total images in ${elapsed}s`);
  console.log(`   Base images: ${PATTERNS.length}`);
  console.log(`   Variations: ${imageCount - PATTERNS.length}`);
}

// Run the generator
generateAllTestImages().catch((error) => {
  console.error("Error generating test images:", error);
  process.exit(1);
});
