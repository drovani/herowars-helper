# Hero Page Sorting and Filtering Implementation

## Overview

Implement comprehensive sorting and filtering functionality for the `/heroes` route to allow users to sort by name or order_rank and filter by multiple facets including class, faction, main_stat, attack_type, stone_source, artifact properties, and roster status (for authenticated users).

## Branch Strategy

Use `feature/i64-hero-sorting-filtering` as the branch name for this feature enhancement.

## Prerequisites

Files to examine and understand before starting:
- `/app/routes/views/heroes/index.tsx` - Main heroes page with existing search and display modes
- `/app/components/hero/HeroCard.tsx` - Hero card component
- `/app/components/hero/HeroTile.tsx` - Hero tile component  
- `/app/data/hero.zod.ts` - Hero data schema and types
- `/app/data/ReadonlyArrays.ts` - Available filter options (class, faction, etc.)
- `/app/hooks/useQueryState.ts` - URL state management hook
- `/app/components/ui/` - Available UI components (select, checkbox, etc.)

## Dependency Analysis

### Files Using Hero Components

- `/app/routes/views/heroes/index.tsx` - Main implementation target
- `/app/components/hero/HeroCard.tsx` - May need props for highlighting filtered attributes
- `/app/components/hero/HeroTile.tsx` - May need props for highlighting filtered attributes

### Impact Assessment

- **High Impact**: Heroes index route will be significantly enhanced
- **Medium Impact**: Hero display components may receive minor enhancements
- **Low Impact**: No breaking changes to existing functionality
- **Estimated Time**: 4-6 hours for full implementation including tests
- **Risk Factors**: URL state management complexity, filter performance on large datasets

## Phase 1: Core Filtering Infrastructure

### 1.1 Create Filter Context and Types

- [ ] Create `/app/types/hero-filters.ts` with comprehensive filter interfaces
- [ ] Define filter state structure for all supported facets
- [ ] Add TypeScript types for sort options and filter values
- [ ] Create helper functions for filter application logic

### 1.2 Enhance Hero Data Loading

- [ ] Update `loadHeroesData` function to accept filter and sort parameters
- [ ] Implement server-side filtering logic in the loader
- [ ] Add URL parameter parsing for filters and sorting
- [ ] Optimize database queries for filtered results

### 1.3 URL State Management

- [ ] Extend `useQueryState` usage for filter parameters
- [ ] Implement multi-value filter URL encoding/decoding
- [ ] Add sort parameter to URL state
- [ ] Ensure browser back/forward navigation works correctly

## Phase 2: Filter UI Components

### 2.1 Sort Controls Component

- [ ] Create `/app/components/hero-filters/HeroSortControls.tsx`
- [ ] Implement radio group or select for sort options (name, order_rank)
- [ ] Add ascending/descending toggle
- [ ] Integrate with URL state management

### 2.2 Multi-Select Filter Components

- [ ] Create `/app/components/hero-filters/HeroFilterPanel.tsx`
- [ ] Implement class filter with checkbox group
- [ ] Implement faction filter with checkbox group
- [ ] Implement main_stat filter with checkbox group
- [ ] Implement attack_type filter with checkbox group

### 2.3 Advanced Filter Components

- [ ] Create stone_source filter component
- [ ] Create artifact team buff filter (from weapon.team_buff)
- [ ] Create book artifact filter component
- [ ] Create glyph stats filter component
- [ ] Create skin stats filter component

### 2.4 Roster Filter (Authenticated Users)

- [ ] Add "In My Roster" / "Not in My Roster" filter
- [ ] Integrate with user collection data
- [ ] Show filter only for authenticated users

## Phase 3: Filter Application Logic

### 3.1 Client-Side Filtering Functions

- [ ] Create `/app/lib/hero-filtering.ts` with filter application logic
- [ ] Implement `filterHeroesByClass` function
- [ ] Implement `filterHeroesByFaction` function
- [ ] Implement `filterHeroesByMainStat` function
- [ ] Implement `filterHeroesByAttackType` function

### 3.2 Advanced Filtering Functions

- [ ] Implement `filterHeroesByStoneSource` function
- [ ] Implement `filterHeroesByArtifactTeamBuff` function
- [ ] Implement `filterHeroesByBookArtifact` function
- [ ] Implement `filterHeroesByGlyphStats` function
- [ ] Implement `filterHeroesBySkinStats` function

### 3.3 Roster Integration Filtering

- [ ] Implement `filterHeroesByRosterStatus` function
- [ ] Combine all filters with logical AND operations
- [ ] Add filter combination optimization

### 3.4 Sorting Implementation

- [ ] Create `/app/lib/hero-sorting.ts` with sorting functions
- [ ] Implement `sortHeroesByName` function (alphabetical)
- [ ] Implement `sortHeroesByOrderRank` function (ascending)
- [ ] Add reverse sorting capabilities

## Phase 4: UI Integration and Layout

### 4.1 Filter Panel Integration

- [ ] Add collapsible filter panel to heroes index page
- [ ] Position filters above the search bar
- [ ] Implement mobile-responsive filter layout
- [ ] Add "Clear All Filters" functionality

### 4.2 Active Filters Display

- [ ] Create active filters chips/badges display
- [ ] Allow individual filter removal via chip close buttons
- [ ] Show result count with active filters
- [ ] Add filter summary text (e.g., "Showing 15 of 89 heroes")

### 4.3 Filter State Persistence

- [ ] Ensure filters persist across page refreshes
- [ ] Maintain filter state when switching display modes
- [ ] Handle pagination with active filters

### 4.4 Performance Optimization

- [ ] Implement debounced filter application
- [ ] Add loading states during filter operations
- [ ] Optimize re-renders with useMemo for filtered results
- [ ] Consider virtualization for large filtered result sets

## Phase 5: Enhanced User Experience

### 5.1 Filter Presets

- [ ] Add common filter presets ("Tank Heroes", "Campaign Farmable", etc.)
- [ ] Implement preset selection and application
- [ ] Save/load user custom presets (if authenticated)

### 5.2 Search Integration

- [ ] Combine text search with filter application
- [ ] Search within filtered results
- [ ] Highlight search terms in filtered heroes

### 5.3 Visual Enhancements

- [ ] Add filter match highlighting on hero cards/tiles
- [ ] Show why each hero matches current filters
- [ ] Add hover states and tooltips for filter options

## Testing Strategy

### Unit Tests

- [ ] Test hero filtering functions in `/app/lib/__tests__/hero-filtering.test.ts`
  - Test individual filter functions with various inputs
  - Test filter combination logic
  - Test edge cases (empty filters, no matches)
- [ ] Test hero sorting functions in `/app/lib/__tests__/hero-sorting.test.ts`
  - Test alphabetical sorting with edge cases
  - Test order_rank sorting
  - Test reverse sorting
- [ ] Test filter components in `/app/components/hero-filters/__tests__/`
  - Test filter state changes
  - Test URL parameter integration
  - Test accessibility features

### Integration Tests

- [ ] Test heroes route with filters in `/app/routes/views/heroes/__tests__/index.integration.test.ts`
  - Test filter application with mocked data
  - Test sort parameter handling
  - Test pagination with filters
  - Test roster filter for authenticated users
- [ ] Test filter persistence across navigation
- [ ] Test mobile responsive filter behavior

### Manual Testing Checklist

- [ ] All individual filters work correctly
- [ ] Multiple filters combine properly (AND logic)
- [ ] Sorting works with and without filters
- [ ] URL parameters reflect current filter/sort state
- [ ] Browser navigation preserves filter state
- [ ] Mobile layout is usable and responsive
- [ ] Performance is acceptable with large hero datasets
- [ ] Roster filter shows correct results for authenticated users
- [ ] Clear filters functionality works
- [ ] Filter chips can be individually removed

## Performance Impact

### Expected Improvements

- Users can find relevant heroes faster with targeted filtering
- Reduced cognitive load with organized filter categories
- Better discoverability of hero attributes through filter options

### Potential Regressions

- Initial page load may be slightly slower with filter UI
- Memory usage increase from storing filter state
- Complex filter combinations may impact rendering performance

### Optimization Strategies

- Use `useMemo` for expensive filter calculations
- Implement filter debouncing to reduce computation frequency
- Consider server-side filtering for very large datasets
- Lazy load filter options if datasets become large

## Code Review Checklist

### Code Quality

- [ ] TypeScript strict mode compliance with proper filter types
- [ ] Error handling for malformed filter parameters
- [ ] No console.log statements in production code
- [ ] Proper logging with loglevel for debug information
- [ ] Filter functions are pure and testable
- [ ] Components follow React best practices

### Architecture

- [ ] Filter logic separated from UI components
- [ ] URL state management follows existing patterns
- [ ] Database queries optimized for filter performance
- [ ] Proper separation between client and server filtering
- [ ] Error responses are user-friendly
- [ ] Filter state is properly typed and validated

### User Experience

- [ ] Filter UI is intuitive and discoverable
- [ ] Loading states provide appropriate feedback
- [ ] Filter combinations work logically (AND operations)
- [ ] Active filters are clearly displayed
- [ ] Mobile experience is fully functional
- [ ] Accessibility standards are met

## Documentation Updates

### Files to Update

- [ ] `README.md` - Update Hero Management section with filtering capabilities
- [ ] `CLAUDE.md` - Update Heroes section with new filter functionality
- [ ] Component documentation - Document new filter components
- [ ] API documentation - Document filter URL parameters

### Comments and JSDoc

- [ ] Add JSDoc comments to all filter functions
- [ ] Document filter parameter formats and validation
- [ ] Add inline comments for complex filter logic
- [ ] Document performance considerations

## Environment Setup

### Development

- [ ] Verify hero data includes all filterable attributes
- [ ] Test with realistic hero dataset size
- [ ] Verify filter options match data structure

### Testing

- [ ] Create test fixtures with diverse hero attributes
- [ ] Mock user authentication for roster filter testing
- [ ] Verify test coverage includes edge cases

### Production Considerations

- [ ] Monitor filter performance with real user data
- [ ] Consider caching strategies for filter options
- [ ] Plan for filter option evolution (new attributes)

### Backup Strategy

- [ ] Create feature branch from current state
- [ ] Commit each phase separately with descriptive messages
- [ ] Test rollback scenarios if needed

## Success Criteria

- Users can sort heroes by name (alphabetical) and order_rank (ascending)
- All specified filter facets are available and functional:
  - class, faction, main_stat, attack_type
  - stone_source, main artifact team buff
  - book artifact, glyph stats, skin stats
  - roster status (authenticated users only)
- Multiple filters combine correctly with AND logic
- Filter state persists in URL and across navigation
- Filter UI is responsive and accessible
- Search functionality works with active filters
- All tests pass including new filter test coverage
- TypeScript compilation passes without errors
- No runtime errors in development or production
- Performance remains acceptable with filtered datasets

## Completion

- [ ] PR created with comprehensive description of new filtering capabilities
- [ ] Update TodoWrite with completion status and implementation notes
- [ ] Commit all changes with descriptive messages following project patterns
- [ ] CLAUDE.md updated with new Heroes filtering documentation
- [ ] `/app/routes/views/public/index.tsx` updated with "Hero filtering and sorting" line item in `recentUpdates` array