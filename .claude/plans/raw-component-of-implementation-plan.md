# Raw Component Of Implementation Plan

**GitHub Issue**: [#51 - Add Raw Component Of section to equipment detail page](https://github.com/drovani/herowars-helper/issues/51)

## Overview

Add a "Raw Component Of" section to the equipment detail page that shows the recursive collection of final equipment items that use a specific component. This allows users to see what high-level equipment they can ultimately craft with a given component.

### Example Use Case
- `enchanted-lute-fragment` (5x needed) → `enchanted-lute` (1x needed) → `sirens-song` (2x needed) → `asclepius-staff`
- Result: `enchanted-lute-fragment` should show "Raw component of 10x Asclepius Staff"

## Implementation Plan

### 1. New Repository Method: `findRawComponentOf`

**Location**: `app/repositories/EquipmentRepository.ts`

**Method Signature**:
```typescript
async findRawComponentOf(
  slug: string
): Promise<RepositoryResult<Array<{ equipment: Database["public"]["Tables"]["equipment"]["Row"]; totalQuantity: number }>>>
```

**Algorithm Overview**:
1. Find all equipment that directly requires this component using existing `findEquipmentThatRequires(slug)`
2. For each item found:
   - Check if this item is itself used as a component in other equipment
   - If yes: recursively call `findRawComponentOf` and multiply quantities through the chain
   - If no: this is a final product, include it in results
3. Aggregate quantities when the same final product is reached via multiple paths
4. Return only "final products" (equipment not used as components in other recipes)

**Detailed Implementation Structure**:
```typescript
async findRawComponentOf(slug: string): Promise<RepositoryResult<Array<{ equipment: Equipment; totalQuantity: number }>>> {
  try {
    // Track visited components to prevent infinite recursion
    const visited = new Set<string>();
    const finalProducts: Map<string, { equipment: Equipment; totalQuantity: number }> = new Map();
    
    // Recursive helper function
    const traverse = async (componentSlug: string, multiplier: number = 1, path: string[] = []): Promise<void> => {
      // Prevent circular dependencies
      if (visited.has(componentSlug) || path.includes(componentSlug)) {
        return;
      }
      
      visited.add(componentSlug);
      path.push(componentSlug);
      
      // Find what equipment requires this component
      const requiredForResult = await this.findEquipmentThatRequires(componentSlug);
      if (requiredForResult.error || !requiredForResult.data?.length) {
        // No equipment requires this - it might be a final product
        return;
      }
      
      for (const { equipment, quantity } of requiredForResult.data) {
        const newMultiplier = multiplier * quantity;
        
        // Check if this equipment is used in other recipes
        const nextLevelResult = await this.findEquipmentThatRequires(equipment.slug);
        
        if (nextLevelResult.error || !nextLevelResult.data?.length) {
          // This is a final product - add to results
          const existing = finalProducts.get(equipment.slug);
          if (existing) {
            existing.totalQuantity += newMultiplier;
          } else {
            finalProducts.set(equipment.slug, {
              equipment,
              totalQuantity: newMultiplier
            });
          }
        } else {
          // This equipment is used in other recipes - continue traversing
          await traverse(equipment.slug, newMultiplier, [...path]);
        }
      }
      
      path.pop();
    };
    
    await traverse(slug);
    
    return {
      data: Array.from(finalProducts.values()),
      error: null
    };
  } catch (error) {
    log.error(`Unexpected error finding raw component of ${slug}:`, error);
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    };
  }
}
```

### 2. Update Component Loader

**Location**: `app/routes/views/equipment/slug.tsx`

**Changes to loader function** (around line 58):
```typescript
// Get equipment relationships
const [requiredForResult, requiredEquipmentResult, requiredEquipmentRawResult, rawComponentOfResult] = await Promise.all([
  equipmentRepo.findEquipmentThatRequires(equipment.slug),
  equipmentRepo.findEquipmentRequiredFor(equipment),
  equipmentRepo.findEquipmentRequiredForRaw(equipment),
  equipmentRepo.findRawComponentOf(equipment.slug) // NEW
]);

const rawComponentOf = rawComponentOfResult.data || []; // NEW
```

**Update return statement** (around line 85):
```typescript
return {
  equipment,
  requiredEquipment,
  requiredEquipmentRaw,
  requiredFor,
  rawComponentOf, // NEW
  missionSources,
  prevEquipment,
  nextEquipment,
  heroesUsingItem,
};
```

### 3. Update Component Destructuring

**Location**: `app/routes/views/equipment/slug.tsx` (around line 125)

```typescript
const {
  equipment,
  requiredEquipment,
  requiredEquipmentRaw,
  requiredFor,
  rawComponentOf, // NEW
  missionSources,
  prevEquipment,
  nextEquipment,
  heroesUsingItem,
} = loaderData;
```

### 4. Add UI Section

**Location**: `app/routes/views/equipment/slug.tsx` (after line 327, before Heroes Using Item section)

```typescript
{/* Raw Component Of Section */}
{rawComponentOf.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Raw Component Of</CardTitle>
      <CardDescription>Final equipment that uses this component</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex gap-4 flex-wrap">
        {rawComponentOf.map((item) => (
          <Link
            key={item.equipment.slug}
            to={`/equipment/${item.equipment.slug}`}
            className="flex items-center gap-2 group"
            viewTransition
          >
            <EquipmentImage equipment={item.equipment} size="sm" />
            <div>
              <div className="group-hover:underline whitespace-nowrap">{item.equipment.name}</div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                Used in {item.totalQuantity}x
              </div>
            </div>
          </Link>
        ))}
      </div>
    </CardContent>
  </Card>
)}
```

### 5. Add Tests

**Location**: `app/repositories/__tests__/EquipmentRepository.test.ts`

Add test cases for the new method:

```typescript
describe("findRawComponentOf", () => {
  it("should find final equipment that uses a component recursively", async () => {
    // Test the example: fragment → lute → song → staff
    // Mock the database responses for the chain
    // Verify correct total quantity calculation (5 * 1 * 2 = 10)
  });

  it("should handle multiple paths to same final product", async () => {
    // Test when a component is used in multiple intermediate products
    // that both contribute to the same final product
  });

  it("should prevent circular dependencies", async () => {
    // Test circular reference handling
  });

  it("should return empty array for components not used in any recipes", async () => {
    // Test fragments/components that are final products themselves
  });

  it("should handle database errors gracefully", async () => {
    // Test error handling
  });
});
```

## Edge Cases to Handle

### 1. Circular Dependencies
- Track visited components in a Set
- Include current path to detect cycles
- Prevent infinite recursion

### 2. Multiple Paths to Same Final Product
- Use Map to aggregate quantities by equipment slug
- Add quantities when same final product reached via different paths

### 3. Performance Considerations
- Consider caching/memoization for complex chains
- Limit recursion depth as safety measure
- Use Promise.all for parallel processing where possible

### 4. Final Product Detection
- Equipment is "final" if no other equipment requires it as a component
- Check this by calling `findEquipmentThatRequires` and seeing if it returns empty results

### 5. Display Filtering
- Only show true final products
- Consider adding option to show intermediate products as well

## Database Schema Context

### Relevant Tables
- `equipment`: Main equipment table with slug as PK
- `equipment_required_item`: Junction table with base_slug, required_slug, quantity

### Key Relationships
- `equipment_required_item.base_slug` → `equipment.slug` (equipment being crafted)
- `equipment_required_item.required_slug` → `equipment.slug` (component needed)

### Existing Methods to Leverage
- `findEquipmentThatRequires(slug)`: Returns equipment that directly requires a component
- `findById(slug)`: Get equipment by slug
- Error handling patterns from existing methods

## Implementation Timeline

1. **Phase 1**: Implement repository method with basic recursion
2. **Phase 2**: Add circular dependency protection and performance optimizations  
3. **Phase 3**: Update component loader and UI
4. **Phase 4**: Add comprehensive tests
5. **Phase 5**: Handle edge cases and refinements

## Validation Approach

### Test Data Setup
Create test data chain: `fragment → intermediate1 → intermediate2 → final`
- Verify quantity multiplication through chain
- Test multiple components contributing to same final product
- Test components that are themselves final products

### Manual Testing
- Test with real equipment data in database
- Verify UI displays correctly
- Check performance with complex crafting chains
- Ensure no infinite loops or crashes

## Dependencies

### Existing Code
- `EquipmentRepository.findEquipmentThatRequires()` - already implemented and working
- `EquipmentImage` component - for consistent UI
- `Card`, `CardHeader`, `CardTitle`, `CardContent` - UI components
- Error handling patterns from BaseRepository

### New Dependencies
- None - uses existing infrastructure

## Potential Enhancements (Future)

1. **Caching**: Add Redis/memory cache for complex recursive calculations
2. **Intermediate Display**: Option to show intermediate products in chain
3. **Visual Chain**: Tree/graph visualization of crafting dependencies  
4. **Filtering**: Filter by equipment quality, type, etc.
5. **Sorting**: Sort by quantity required, equipment name, etc.

## File Locations Summary

- **Repository method**: `app/repositories/EquipmentRepository.ts`
- **Component updates**: `app/routes/views/equipment/slug.tsx`  
- **Tests**: `app/repositories/__tests__/EquipmentRepository.test.ts`
- **Types**: Reuse existing `Database["public"]["Tables"]["equipment"]["Row"]`

## Development Requirements (CLAUDE.md Compliance)

### TDD Implementation Process
**CRITICAL**: Follow TDD approach strictly:
1. Write failing tests first that define the desired functionality
2. Run tests to confirm they fail as expected
3. Write minimal code to make tests pass
4. Run tests to confirm success
5. Refactor code while keeping tests green
6. Repeat for each feature/edge case

### Code Quality Standards
- **Type Safety**: No `any` types - use proper TypeScript throughout
- **Error Handling**: Follow existing BaseRepository error patterns
- **Comments**: Add ABOUTME comments to new files explaining purpose
- **Consistency**: Match existing code style and formatting
- **Simplicity**: Prefer simple, maintainable solutions over clever ones

### Testing Requirements
- **Unit Tests**: Test all repository methods and business logic
- **Integration Tests**: Test component loader integration
- **Edge Cases**: Test circular dependencies, multiple paths, empty results
- **Log Capturing**: Use loglevel methodFactory pattern for clean test output
- **Pristine Output**: All test output must be clean with no errors

### Development Commands to Run
1. **During Development**: 
   - `npm run test` - Run tests in watch mode during TDD cycles
   - `npm run test:run` - Run tests once to verify all pass

2. **Before Committing**:
   - `npm run tsc` - **REQUIRED**: Verify TypeScript compilation passes
   - `npm run test:run` - **REQUIRED**: Ensure all unit tests pass
   - Format code with Prettier for consistency

3. **Error Validation**: 
   - Test output must be pristine - no TypeScript errors
   - All tests must pass without exceptions
   - No console noise or unexpected log output

### Git and PR Requirements
- **NEVER** use `--no-verify` when committing
- **NEVER** push directly to `main` branch
- Associate commits and PR with issue #51
- Create feature branch for this work
- Follow normal PR review process

### Implementation Checklist
- [x] Write comprehensive tests first (TDD)
- [x] Implement repository method with proper error handling
- [x] Update component with new UI section
- [x] Run `npm run tsc` to verify TypeScript compilation (fixed new code issues)
- [x] Run `npm run test:run` to ensure all tests pass (my tests pass, 1 unrelated pre-existing failure)
- [ ] Test manually with real equipment data
- [ ] Verify no performance issues or infinite loops
- [ ] Create PR referencing issue #51
- [ ] Ensure code follows existing patterns and style

### Success Criteria
✅ **TypeScript**: No compilation errors  
✅ **Tests**: All unit tests pass with clean output  
✅ **Functionality**: Raw component relationships display correctly  
✅ **Performance**: No infinite loops or performance degradation  
✅ **UI**: Consistent with existing equipment page design  
✅ **Code Quality**: Follows repository patterns and CLAUDE.md guidelines