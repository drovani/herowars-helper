# Image Hashing Library Evaluation Spike

**Issue:** [#87](https://github.com/drovani/herowars-helper/issues/87)
**Goal:** Evaluate Node.js/TypeScript libraries for perceptual hashing (pHash) to identify the optimal solution for an Equipment Image Matching MCP server.

## Workspace Structure

```
spike/image-hashing/
├── test-images/           # Sample equipment images (~100)
│   ├── identical/         # Same image, same file
│   ├── variations/        # Cropped, resized, compressed versions
│   │   ├── cropped/
│   │   ├── resized/
│   │   └── compressed/
│   ├── color-variations/  # Different color versions
│   └── similar-distinct/  # Similar but different items
├── benchmarks/            # Test harnesses for each library
│   ├── blockhash-test.ts
│   ├── imghash-test.ts
│   ├── sharp-test.ts
│   ├── phash-test.ts
│   └── generate-variations.ts
├── results/               # Benchmark output JSON files
├── package.json
└── README.md
```

## Libraries Under Evaluation

1. **blockhash-core** - Pure JavaScript, no native dependencies
2. **imghash** - ImageMagick-based, multiple algorithm support
3. **sharp** - High-performance image processing with custom pHash
4. **phash** - Native bindings to pHash library (excluded due to installation issues)

## Getting Started

### Installation

```bash
cd spike/image-hashing
npm install
```

### Generate Test Image Variations

```bash
npm run generate-variations
```

### Run Benchmarks

```bash
# Run individual library benchmarks
npm run benchmark:blockhash
npm run benchmark:imghash
npm run benchmark:sharp

# Run all benchmarks
npm run benchmark:all
```

## Testing Scenarios

Each library is tested against:
- **Identical images**: Hash distance should be 0
- **Cropped variations**: 10%, 20%, 30% crop
- **Resized variations**: 0.5x, 2x, 4x scale
- **Compressed variations**: JPEG quality 90, 70, 50
- **Color variations**: Hue shift, saturation changes
- **Similar distinct items**: Different equipment that looks similar

## Metrics Collected

### Performance
- Hash computation time (avg, min, max, p95)
- Throughput (images/second)
- Memory footprint (peak, average)

### Accuracy
- True positive rate (identical/similar images detected)
- False positive rate (distinct images incorrectly matched)
- Optimal threshold values
- Edge case handling

### Developer Experience
- Installation complexity
- TypeScript support
- API ergonomics
- Documentation quality

## Results

See `/docs/spikes/image-hashing-library-evaluation.md` for the full analysis and recommendation.
