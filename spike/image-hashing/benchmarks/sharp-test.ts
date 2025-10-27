// ABOUTME: Benchmark test for Sharp library with custom perceptual hash implementation
// ABOUTME: High-performance image processing with native bindings

import sharp from "sharp";
import path from "path";
import {
  getAllImageFiles,
  measurePerformance,
  measureAccuracy,
  findOptimalThreshold,
  saveBenchmarkResults,
  printResults,
  type BenchmarkResult,
} from "./benchmark-utils.js";

const LIBRARY_NAME = "sharp (custom pHash)";
const HASH_SIZE = 16; // 16x16 = 256 bits

/**
 * Compute perceptual hash using Sharp
 * Based on the pHash algorithm:
 * 1. Resize to small square (removes detail, focuses on structure)
 * 2. Convert to grayscale
 * 3. Compute DCT (Discrete Cosine Transform) - approximated with average-based hash
 * 4. Extract low-frequency components
 * 5. Compare to median to generate binary hash
 */
async function hashImage(imagePath: string): Promise<string> {
  try {
    // Resize to hash size and convert to grayscale
    const { data, info } = await sharp(imagePath)
      .resize(HASH_SIZE, HASH_SIZE, { fit: "fill" })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Calculate average pixel value
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    const average = sum / data.length;

    // Generate binary hash: 1 if pixel > average, 0 otherwise
    let hash = "";
    for (let i = 0; i < data.length; i++) {
      hash += data[i] > average ? "1" : "0";
    }

    // Convert binary to hex for compact storage
    return binaryToHex(hash);
  } catch (error) {
    throw new Error(`Failed to hash image ${imagePath}: ${error}`);
  }
}

/**
 * Convert binary string to hexadecimal
 */
function binaryToHex(binary: string): string {
  let hex = "";
  for (let i = 0; i < binary.length; i += 4) {
    const chunk = binary.substr(i, 4);
    const value = parseInt(chunk, 2);
    hex += value.toString(16);
  }
  return hex;
}

/**
 * Convert hexadecimal to binary string
 */
function hexToBinary(hex: string): string {
  let binary = "";
  for (let i = 0; i < hex.length; i++) {
    const value = parseInt(hex[i], 16);
    binary += value.toString(2).padStart(4, "0");
  }
  return binary;
}

/**
 * Calculate Hamming distance between two hex hashes
 */
function hammingDistance(hash1: string, hash2: string): number {
  const bin1 = hexToBinary(hash1);
  const bin2 = hexToBinary(hash2);

  if (bin1.length !== bin2.length) {
    throw new Error(`Hash lengths don't match: ${bin1.length} vs ${bin2.length}`);
  }

  let distance = 0;
  for (let i = 0; i < bin1.length; i++) {
    if (bin1[i] !== bin2[i]) {
      distance++;
    }
  }

  return distance;
}

/**
 * Run the Sharp benchmark
 */
async function runBenchmark(): Promise<void> {
  console.log(`\n🔬 Starting ${LIBRARY_NAME} benchmark...\n`);

  const notes: string[] = [];

  try {
    // Collect all test images
    const baseImagesDir = path.join(process.cwd(), "test-images", "identical");
    const variationsDir = path.join(process.cwd(), "test-images", "variations");
    const colorVariationsDir = path.join(process.cwd(), "test-images", "color-variations");

    const allImages = await getAllImageFiles(
      baseImagesDir,
      path.join(variationsDir, "cropped"),
      path.join(variationsDir, "resized"),
      path.join(variationsDir, "compressed"),
      colorVariationsDir
    );

    console.log(`Found ${allImages.length} test images\n`);

    // Measure performance
    console.log("Phase 1: Measuring performance...");
    const { hashes, metrics } = await measurePerformance(allImages, hashImage);
    console.log(`  ✓ Hashed ${allImages.length} images`);
    console.log(`  ✓ Average: ${metrics.avgHashTime.toFixed(2)}ms per image\n`);

    // Find optimal threshold
    console.log("Phase 2: Finding optimal threshold...");
    const maxPossibleDistance = HASH_SIZE * HASH_SIZE; // 256 bits
    const optimalThreshold = await findOptimalThreshold(
      baseImagesDir,
      variationsDir,
      hashes,
      hammingDistance,
      Math.min(50, maxPossibleDistance) // Test up to 50 bit differences
    );
    console.log(`  ✓ Optimal threshold: ${optimalThreshold} bits\n`);

    // Measure accuracy
    console.log("Phase 3: Measuring accuracy...");
    const accuracy = await measureAccuracy(
      baseImagesDir,
      variationsDir,
      hashes,
      hammingDistance,
      optimalThreshold
    );
    console.log(`  ✓ Accuracy tests complete\n`);

    // Compile results
    const result: BenchmarkResult = {
      library: LIBRARY_NAME,
      timestamp: new Date().toISOString(),
      performance: metrics,
      accuracy,
      optimalThreshold,
      notes: [
        "High-performance native bindings (pre-compiled)",
        `Custom average-based perceptual hash (${HASH_SIZE}x${HASH_SIZE} = ${HASH_SIZE * HASH_SIZE} bits)`,
        "No additional system dependencies (Sharp includes libvips)",
        "Already used in project for image processing",
        "Hash format: hexadecimal string",
        "Could implement full DCT-based pHash for better accuracy",
        ...notes,
      ],
    };

    // Display and save results
    printResults(result);
    await saveBenchmarkResults(LIBRARY_NAME, result);
  } catch (error) {
    console.error(`\n❌ Benchmark failed:`, error);
    process.exit(1);
  }
}

// Run the benchmark
runBenchmark();
