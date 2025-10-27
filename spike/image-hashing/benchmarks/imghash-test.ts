// ABOUTME: Benchmark test for imghash library - ImageMagick-based perceptual
// ABOUTME: hashing with multiple algorithm support

import imghash from "imghash";
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

const LIBRARY_NAME = "imghash";
const HASH_BITS = 256; // Using default block hash size

/**
 * Hash an image using imghash
 */
async function hashImage(imagePath: string): Promise<string> {
  try {
    // imghash returns a promise that resolves to a hex string
    const hash = await imghash.hash(imagePath, HASH_BITS);
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
 * Run the imghash benchmark
 */
async function runBenchmark(): Promise<void> {
  console.log(`\n🔬 Starting ${LIBRARY_NAME} benchmark...\n`);

  const notes: string[] = [];

  // Check if ImageMagick is available
  try {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execAsync = promisify(exec);

    try {
      await execAsync("convert -version");
      notes.push("ImageMagick detected and available");
    } catch {
      notes.push("⚠️  ImageMagick not found - library may not work correctly");
      console.warn("⚠️  Warning: ImageMagick not detected. imghash requires ImageMagick to be installed.");
      console.warn("   Install with: apt-get install imagemagick (Linux) or brew install imagemagick (macOS)\n");
    }
  } catch (error) {
    notes.push("Could not verify ImageMagick installation");
  }

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
    const maxPossibleDistance = HASH_BITS; // 256 bits
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
        "Requires ImageMagick system dependency",
        `Uses ${HASH_BITS}-bit block hashing`,
        "Simple API - accepts file paths directly",
        "Hash format: hexadecimal string",
        ...notes,
      ],
    };

    // Display and save results
    printResults(result);
    await saveBenchmarkResults(LIBRARY_NAME, result);
  } catch (error) {
    console.error(`\n❌ Benchmark failed:`, error);
    if (error instanceof Error && error.message.includes("spawn")) {
      console.error("\n💡 Tip: This error usually means ImageMagick is not installed.");
      console.error("   Install ImageMagick and try again.");
    }
    process.exit(1);
  }
}

// Run the benchmark
runBenchmark();
