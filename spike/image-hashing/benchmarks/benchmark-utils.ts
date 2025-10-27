// ABOUTME: Common utilities for image hashing benchmarks including performance
// ABOUTME: measurement, distance calculation, and result formatting

import { promises as fs } from "fs";
import path from "path";

export interface PerformanceMetrics {
  avgHashTime: number;
  minHashTime: number;
  maxHashTime: number;
  p95HashTime: number;
  throughput: number;
  peakMemoryMB: number;
  avgMemoryMB: number;
}

export interface AccuracyMetrics {
  identicalMatch: number;
  croppedMatch: number;
  resizedMatch: number;
  compressedMatch: number;
  colorVariationMatch: number;
  distinctSeparation: number;
}

export interface BenchmarkResult {
  library: string;
  timestamp: string;
  performance: PerformanceMetrics;
  accuracy: AccuracyMetrics;
  optimalThreshold: number;
  notes: string[];
}

/**
 * Calculate Hamming distance between two strings or buffers
 */
export function hammingDistance(hash1: string | Buffer, hash2: string | Buffer): number {
  const str1 = hash1.toString();
  const str2 = hash2.toString();

  if (str1.length !== str2.length) {
    throw new Error(`Hash lengths don't match: ${str1.length} vs ${str2.length}`);
  }

  let distance = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) {
      distance++;
    }
  }

  return distance;
}

/**
 * Measure performance of a hashing function
 */
export async function measurePerformance(
  imageFiles: string[],
  hashFunction: (imagePath: string) => Promise<string | Buffer>
): Promise<{ hashes: Map<string, string | Buffer>; metrics: PerformanceMetrics }> {
  const times: number[] = [];
  const memoryReadings: number[] = [];
  const hashes = new Map<string, string | Buffer>();

  // Warm up
  if (imageFiles.length > 0) {
    await hashFunction(imageFiles[0]);
  }

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  const initialMemory = process.memoryUsage().heapUsed;
  let peakMemory = initialMemory;

  for (const imagePath of imageFiles) {
    const startTime = performance.now();
    const hash = await hashFunction(imagePath);
    const endTime = performance.now();

    times.push(endTime - startTime);
    hashes.set(imagePath, hash);

    const currentMemory = process.memoryUsage().heapUsed;
    memoryReadings.push(currentMemory);
    peakMemory = Math.max(peakMemory, currentMemory);
  }

  // Calculate statistics
  const sortedTimes = times.slice().sort((a, b) => a - b);
  const avgHashTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minHashTime = sortedTimes[0];
  const maxHashTime = sortedTimes[sortedTimes.length - 1];
  const p95Index = Math.floor(sortedTimes.length * 0.95);
  const p95HashTime = sortedTimes[p95Index];
  const throughput = 1000 / avgHashTime; // images per second

  const avgMemoryMB = memoryReadings.reduce((a, b) => a + b, 0) / memoryReadings.length / 1024 / 1024;
  const peakMemoryMB = peakMemory / 1024 / 1024;

  return {
    hashes,
    metrics: {
      avgHashTime,
      minHashTime,
      maxHashTime,
      p95HashTime,
      throughput,
      peakMemoryMB,
      avgMemoryMB,
    },
  };
}

/**
 * Measure accuracy by testing hash distances
 */
export async function measureAccuracy(
  baseImagesDir: string,
  variationsDir: string,
  hashes: Map<string, string | Buffer>,
  distanceFunction: (h1: string | Buffer, h2: string | Buffer) => number,
  threshold: number
): Promise<AccuracyMetrics> {
  const results = {
    identicalMatch: 0,
    croppedMatch: 0,
    resizedMatch: 0,
    compressedMatch: 0,
    colorVariationMatch: 0,
    distinctSeparation: 0,
  };

  const baseImages = await fs.readdir(baseImagesDir);

  // Test identical images
  let identicalTests = 0;
  for (const image of baseImages.slice(0, 20)) {
    const hash1 = hashes.get(path.join(baseImagesDir, image));
    const hash2 = hashes.get(path.join(baseImagesDir, image));
    if (hash1 && hash2) {
      const distance = distanceFunction(hash1, hash2);
      if (distance === 0) results.identicalMatch++;
      identicalTests++;
    }
  }
  results.identicalMatch = (results.identicalMatch / identicalTests) * 100;

  // Test cropped variations
  const croppedDir = path.join(variationsDir, "cropped");
  const croppedImages = await fs.readdir(croppedDir);
  let croppedTests = 0;
  for (const croppedImage of croppedImages) {
    const baseName = croppedImage.split("_crop")[0] + ".png";
    const baseHash = hashes.get(path.join(baseImagesDir, baseName));
    const croppedHash = hashes.get(path.join(croppedDir, croppedImage));
    if (baseHash && croppedHash) {
      const distance = distanceFunction(baseHash, croppedHash);
      if (distance <= threshold) results.croppedMatch++;
      croppedTests++;
    }
  }
  results.croppedMatch = (results.croppedMatch / croppedTests) * 100;

  // Test resized variations
  const resizedDir = path.join(variationsDir, "resized");
  const resizedImages = await fs.readdir(resizedDir);
  let resizedTests = 0;
  for (const resizedImage of resizedImages) {
    const baseName = resizedImage.split("_scale")[0] + ".png";
    const baseHash = hashes.get(path.join(baseImagesDir, baseName));
    const resizedHash = hashes.get(path.join(resizedDir, resizedImage));
    if (baseHash && resizedHash) {
      const distance = distanceFunction(baseHash, resizedHash);
      if (distance <= threshold) results.resizedMatch++;
      resizedTests++;
    }
  }
  results.resizedMatch = (results.resizedMatch / resizedTests) * 100;

  // Test compressed variations
  const compressedDir = path.join(variationsDir, "compressed");
  const compressedImages = await fs.readdir(compressedDir);
  let compressedTests = 0;
  for (const compressedImage of compressedImages) {
    const baseName = compressedImage.split("_q")[0] + ".png";
    const baseHash = hashes.get(path.join(baseImagesDir, baseName));
    const compressedHash = hashes.get(path.join(compressedDir, compressedImage));
    if (baseHash && compressedHash) {
      const distance = distanceFunction(baseHash, compressedHash);
      if (distance <= threshold) results.compressedMatch++;
      compressedTests++;
    }
  }
  results.compressedMatch = (results.compressedMatch / compressedTests) * 100;

  // Test color variations
  const colorDir = path.join(process.cwd(), "test-images", "color-variations");
  const colorImages = await fs.readdir(colorDir);
  let colorTests = 0;
  for (const colorImage of colorImages) {
    const baseName = colorImage.split("_hue")[0] + ".png";
    const baseHash = hashes.get(path.join(baseImagesDir, baseName));
    const colorHash = hashes.get(path.join(colorDir, colorImage));
    if (baseHash && colorHash) {
      const distance = distanceFunction(baseHash, colorHash);
      if (distance <= threshold) results.colorVariationMatch++;
      colorTests++;
    }
  }
  results.colorVariationMatch = (results.colorVariationMatch / colorTests) * 100;

  // Test distinct separation (different items should NOT match)
  const distinctTests = Math.min(100, baseImages.length * (baseImages.length - 1) / 2);
  let distinctSeparations = 0;
  let testsRun = 0;
  for (let i = 0; i < baseImages.length && testsRun < distinctTests; i++) {
    for (let j = i + 1; j < baseImages.length && testsRun < distinctTests; j++) {
      const hash1 = hashes.get(path.join(baseImagesDir, baseImages[i]));
      const hash2 = hashes.get(path.join(baseImagesDir, baseImages[j]));
      if (hash1 && hash2) {
        const distance = distanceFunction(hash1, hash2);
        if (distance > threshold) distinctSeparations++;
        testsRun++;
      }
    }
  }
  results.distinctSeparation = (distinctSeparations / testsRun) * 100;

  return results;
}

/**
 * Find optimal threshold by testing different values
 */
export async function findOptimalThreshold(
  baseImagesDir: string,
  variationsDir: string,
  hashes: Map<string, string | Buffer>,
  distanceFunction: (h1: string | Buffer, h2: string | Buffer) => number,
  maxDistance: number
): Promise<number> {
  let bestThreshold = 0;
  let bestScore = 0;

  for (let threshold = 0; threshold <= maxDistance; threshold++) {
    const accuracy = await measureAccuracy(
      baseImagesDir,
      variationsDir,
      hashes,
      distanceFunction,
      threshold
    );

    // Score combines variation matching (should be high) and distinct separation (should be high)
    const variationScore = (accuracy.croppedMatch + accuracy.resizedMatch + accuracy.compressedMatch) / 3;
    const score = (variationScore + accuracy.distinctSeparation) / 2;

    if (score > bestScore) {
      bestScore = score;
      bestThreshold = threshold;
    }
  }

  return bestThreshold;
}

/**
 * Get all image files from a directory
 */
export async function getImageFiles(directory: string): Promise<string[]> {
  const files = await fs.readdir(directory);
  return files
    .filter((f) => f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg"))
    .map((f) => path.join(directory, f));
}

/**
 * Get all image files from multiple directories
 */
export async function getAllImageFiles(...directories: string[]): Promise<string[]> {
  const allFiles: string[] = [];
  for (const dir of directories) {
    const files = await getImageFiles(dir);
    allFiles.push(...files);
  }
  return allFiles;
}

/**
 * Save benchmark results to JSON file
 */
export async function saveBenchmarkResults(
  libraryName: string,
  result: BenchmarkResult
): Promise<void> {
  const resultsDir = path.join(process.cwd(), "results");
  await fs.mkdir(resultsDir, { recursive: true });

  const filename = `${libraryName}-${Date.now()}.json`;
  const filepath = path.join(resultsDir, filename);

  await fs.writeFile(filepath, JSON.stringify(result, null, 2));
  console.log(`\n✅ Results saved to: ${filename}`);
}

/**
 * Print benchmark results in a readable format
 */
export function printResults(result: BenchmarkResult): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${result.library} - Benchmark Results`);
  console.log(`${"=".repeat(60)}\n`);

  console.log("Performance Metrics:");
  console.log(`  Average hash time:    ${result.performance.avgHashTime.toFixed(2)} ms`);
  console.log(`  Min hash time:        ${result.performance.minHashTime.toFixed(2)} ms`);
  console.log(`  Max hash time:        ${result.performance.maxHashTime.toFixed(2)} ms`);
  console.log(`  P95 hash time:        ${result.performance.p95HashTime.toFixed(2)} ms`);
  console.log(`  Throughput:           ${result.performance.throughput.toFixed(2)} images/sec`);
  console.log(`  Peak memory:          ${result.performance.peakMemoryMB.toFixed(2)} MB`);
  console.log(`  Average memory:       ${result.performance.avgMemoryMB.toFixed(2)} MB\n`);

  console.log("Accuracy Metrics:");
  console.log(`  Identical match:      ${result.accuracy.identicalMatch.toFixed(1)}%`);
  console.log(`  Cropped match:        ${result.accuracy.croppedMatch.toFixed(1)}%`);
  console.log(`  Resized match:        ${result.accuracy.resizedMatch.toFixed(1)}%`);
  console.log(`  Compressed match:     ${result.accuracy.compressedMatch.toFixed(1)}%`);
  console.log(`  Color variation:      ${result.accuracy.colorVariationMatch.toFixed(1)}%`);
  console.log(`  Distinct separation:  ${result.accuracy.distinctSeparation.toFixed(1)}%\n`);

  console.log(`Optimal Threshold:      ${result.optimalThreshold}\n`);

  if (result.notes.length > 0) {
    console.log("Notes:");
    result.notes.forEach((note) => console.log(`  - ${note}`));
    console.log();
  }

  console.log(`${"=".repeat(60)}\n`);
}
