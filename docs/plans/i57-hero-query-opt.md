# Hero Query Optimization - Issue 57

## Overview
The `/heroes` page performance is severely impacted by loading ALL hero data including relationships (artifacts, skins, glyphs, equipment) via `findAllWithRelationships()`. This optimization will implement:

1. **Cards View**: Minimal query for hero name and slug only
2. **Tiles View**: Paginated loading with full relationships only for visible heroes
3. **Performance**: Reduce initial load time from "fooooorrrrreeeeevvvveeeeerrrrr" to sub-second

## Branch Strategy
`feature/i57-hero-query-optimization` - New functionality for optimized queries

## Prerequisites
- **HeroRepository**: `app/repositories/HeroRepository.ts` (already has `findAll` with pagination)
- **Heroes Index Route**: `app/routes/views/heroes/index.tsx` (current implementation)
- **URL State Management**: `useQueryState` hook already implemented for mode switching

## Dependency Analysis

### Current Performance Issue
- **Query**: `findAllWithRelationships()` loads ~70 heroes with ALL relationship data
- **Data Size**: Each hero includes artifacts, skins, glyphs, equipment slots
- **Impact**: Massive payload sent to client for simple card grid view
- **Problem**: Cards view only needs `{ slug, name }` but gets full CompleteHero objects

### Files Using Heroes Data
- `app/routes/views/heroes/index.tsx` - Main consumer, needs optimization
- `app/components/hero/HeroCard.tsx` - Only needs basic hero data
- `app/components/hero/HeroItemsCompact.tsx` - Needs equipment relationships
- `app/components/hero/HeroSkinsCompact.tsx` - Needs skin relationships
- `app/components/hero/HeroArtifactsCompact.tsx` - Needs artifact relationships
- `app/components/hero/HeroGlyphsCompact.tsx` - Needs glyph relationships

### Impact Assessment
- **High Impact**: Complete rewrite of loader logic, query optimization
- **Medium Risk**: URL state management, pagination implementation
- **Breaking Changes**: None - maintaining same API contract

## Phase 1: Optimize Repository Queries
### 1.1 Add Lightweight Hero Query Method
- Add `findAllBasic()` method to HeroRepository
- Query only essential fields: `slug, name, class, faction, main_stat, order_rank`
- Support pagination parameters for future tiles optimization

### 1.2 Update Existing Query for Pagination
- Modify `findAllWithRelationships()` to better support pagination
- Ensure efficient querying for tiles view

## Phase 2: Implement Smart Loading Strategy
### 2.1 Update Loader Logic
- **Cards Mode**: Use `findAllBasic()` for minimal data
- **Tiles Mode**: Use `findAllWithRelationships()` with pagination (limit: 10)
- Maintain equipment loading for tiles mode
- Keep user collection loading for both modes

### 2.2 Add Pagination State Management
- Add `page` query parameter using `useQueryState`
- Add pagination controls to tiles view
- Implement "Load More" or traditional pagination UI

### 2.3 Implement Progressive Enhancement
- Initial load shows 10 heroes in tiles mode
- Add pagination navigation
- Maintain search functionality across modes

## Phase 3: UI/UX Improvements
### 3.1 Loading States
- Add skeleton loading for initial hero grid
- Add loading indicators for pagination
- Optimize for perceived performance

### 3.2 Pagination Controls
- Add "Previous" / "Next" navigation
- Add page indicator
- Consider infinite scroll for better UX

## Testing Strategy
### Unit Tests
- [ ] Test `findAllBasic()` method with mocked Supabase client
- [ ] Test pagination parameters
- [ ] Test query parameter state management

### Integration Tests
- [ ] Test loader performance with different view modes
- [ ] Test pagination flow in tiles mode
- [ ] Test search functionality across modes

### Performance Tests
- [ ] Measure query time improvement
- [ ] Test payload size reduction
- [ ] Verify no N+1 query issues

### Manual Testing Checklist
- [ ] Cards mode loads quickly with minimal data
- [ ] Tiles mode loads 10 heroes with full data
- [ ] Pagination works correctly
- [ ] Search works in both modes
- [ ] User collection state maintained
- [ ] No broken hero links or images

## Performance Impact
### Expected Improvements
- **Cards Mode**: 95%+ reduction in query time and payload size
- **Tiles Mode**: Limited to 10 heroes instead of all 70
- **Initial Load**: Sub-second response time
- **Bandwidth**: Significant reduction for mobile users

### Database Query Optimization
- Basic query: `SELECT slug, name, class, faction, main_stat, order_rank FROM hero ORDER BY order_rank`
- Complex query: Limited to LIMIT 10 OFFSET (page * 10)
- No more full relationship joins for cards view

## Code Review Checklist
### Code Quality
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling for pagination edge cases
- [ ] Logging with loglevel for query performance
- [ ] No console.log statements

### Architecture
- [ ] Repository pattern maintained
- [ ] Clean separation of concerns
- [ ] Efficient database queries
- [ ] User-friendly error states

### Performance
- [ ] Query execution time measured
- [ ] Payload size verified
- [ ] Pagination performance tested
- [ ] No memory leaks in pagination

## Success Criteria
- Cards view loads in <1 second
- Tiles view loads 10 heroes with full data in <2 seconds
- Pagination works smoothly
- Search functionality preserved
- User collection integration maintained
- TypeScript compilation passes
- All tests pass
- No runtime errors

## Completion
- Feature branch merged via PR
- Performance improvement documented
- User experience significantly improved
- Query optimization techniques established for future features