// ABOUTME: Benchmark test for blockhash-core library - pure JavaScript perceptual
// ABOUTME: hashing without native dependencies

import { bmvbhash } from "blockhash-core";
import sharp from "sharp";
import path from "path";
import {
  getAllImageFiles,
  measurePerformance,
  measureAccuracy,
  findOptimalThreshold,
  hammingDistance,
  saveBenchmarkResults,
  printResults,
  type BenchmarkResult,
} from "./benchmark-utils.js";

const LIBRARY_NAME = "blockhash-core";
const BITS = 16; // 16x16 block hash = 256 bits

/**
 * Hash an image using blockhash-core
 */
async function hashImage(imagePath: string): Promise<string> {
  try {
    // blockhash-core requires raw pixel data in RGBA format
    const image = sharp(imagePath);

    // Get raw RGBA pixel data
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // blockhash expects data in format { data: Uint8Array, width: number, height: number }
    // The data should be RGBA format (4 bytes per pixel)
    const hash = bmvbhash({ data: data, width: info.width, height: info.height }, BITS);
    return hash;
  } catch (error) {
    throw new Error(`Failed to hash image ${imagePath}: ${error}`);
  }
}

/**
 * Calculate bit-based Hamming distance for hex strings
 */
function hexHammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    throw new Error(`Hash lengths don't match: ${hash1.length} vs ${hash2.length}`);
  }

  let distance = 0;

  // Compare each hex character
  for (let i = 0; i < hash1.length; i++) {
    const val1 = parseInt(hash1[i], 16);
    const val2 = parseInt(hash2[i], 16);
    const xor = val1 ^ val2;

    // Count bits in XOR result
    let bits = xor;
    while (bits > 0) {
      distance += bits & 1;
      bits >>= 1;
    }
  }

  return distance;
}

/**
 * Run the blockhash-core benchmark
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
    const maxPossibleDistance = BITS * BITS; // 256 bits for 16x16
    const optimalThreshold = await findOptimalThreshold(
      baseImagesDir,
      variationsDir,
      hashes,
      hexHammingDistance,
      Math.min(50, maxPossibleDistance) // Test up to 50 bit differences
    );
    console.log(`  ✓ Optimal threshold: ${optimalThreshold} bits\n`);

    // Measure accuracy
    console.log("Phase 3: Measuring accuracy...");
    const accuracy = await measureAccuracy(
      baseImagesDir,
      variationsDir,
      hashes,
      hexHammingDistance,
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
        "Pure JavaScript implementation - no native dependencies",
        `Uses ${BITS}x${BITS} block hashing (${BITS * BITS} bits)`,
        "Requires manual pixel data extraction via Sharp",
        "Hash format: hexadecimal string",
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
