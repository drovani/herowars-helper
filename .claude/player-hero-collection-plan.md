# Player Hero Collection Implementation Plan

**Related Issue**: [#53 - Player Hero Collection System](https://github.com/drovani/herowars-helper/issues/53)

## Overview
Implement a comprehensive player hero collection system that allows authenticated users to track their Hero Wars heroes with progression details (stars, equipment levels). For unauthenticated users, collections will be stored locally in browser storage. The system includes dedicated UI components for adding heroes from hero lists and a dedicated player roster page.

## Branch Strategy
`feature/player-hero-collection` - New functionality for user-specific hero tracking and progression management

## Prerequisites
Files to examine and understand before starting:
- `/app/routes.ts` - Current routing structure
- `/app/contexts/AuthContext.tsx` - Authentication state management
- `/app/repositories/BaseRepository.ts` - Repository pattern implementation
- `/app/data/navigation.ts` - Navigation menu structure
- `/app/routes/views/heroes/index.tsx` - Heroes listing page (add plus buttons)
- `/app/routes/views/heroes/slug.tsx` - Hero details page (add plus buttons)
- `/app/types/supabase.ts` - Database schema definitions

## Database Schema Requirements

### Player Hero Collection Table
```sql
CREATE TABLE player_hero (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hero_slug TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 1 CHECK (stars >= 1 AND stars <= 6),
  equipment_level INTEGER NOT NULL DEFAULT 1 CHECK (equipment_level >= 1 AND equipment_level <= 16),
  added_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  UNIQUE(user_id, hero_slug)
);

-- Row Level Security Policies
ALTER TABLE player_hero ENABLE ROW LEVEL SECURITY;

-- Users can only see their own hero collections
CREATE POLICY "Users can view own hero collection" ON player_hero
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own hero collection items
CREATE POLICY "Users can insert own hero collection" ON player_hero
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own hero collection items
CREATE POLICY "Users can update own hero collection" ON player_hero
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own hero collection items
CREATE POLICY "Users can delete own hero collection" ON player_hero
  FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_player_hero_user_id ON player_hero(user_id);
CREATE INDEX idx_player_hero_hero_slug ON player_hero(hero_slug);
```

## Phase 1: Database Setup and Repository Implementation

### 1.1 Create Supabase Migration
- [ ] Create database migration file for `player_hero` table
- [ ] Add RLS policies for user-owned data access
- [ ] Create indexes for performance optimization
- [ ] Test migration on local Supabase instance

### 1.2 Update Type Definitions
- [ ] Add `player_hero` table definition to `app/types/supabase.ts`
- [ ] Create Zod schema for player hero validation
- [ ] Define TypeScript interfaces for player hero data
- [ ] Update `app/repositories/types.ts` with new repository type

### 1.3 Implement PlayerHeroRepository
- [ ] Create `app/repositories/PlayerHeroRepository.ts` extending BaseRepository
- [ ] Implement user-specific query methods (findByUserId, findByUserAndHero)
- [ ] Add hero collection management methods (addHero, updateProgress, removeHero)
- [ ] Include proper error handling and logging patterns
- [ ] Follow existing repository patterns from MissionRepository

## Phase 2: Local Storage Fallback System

### 2.1 Create Local Storage Service
- [ ] Create `app/services/LocalPlayerHeroService.ts` for unauthenticated users
- [ ] Implement localStorage operations mirroring database operations
- [ ] Add data serialization/deserialization with validation
- [ ] Create migration path from localStorage to database on login

### 2.2 Unified Player Hero Service
- [ ] Create `app/services/PlayerHeroService.ts` that abstracts storage layer
- [ ] Automatically choose between database and localStorage based on auth state
- [ ] Handle data sync when user logs in with existing localStorage data
- [ ] Implement consistent API regardless of storage backend

## Phase 3: UI Component Development

### 3.1 Add Hero Collection Buttons
- [ ] Add "Add to Collection" plus button to `/app/routes/views/heroes/index.tsx`
- [ ] Add "Add to Collection" plus button to `/app/routes/views/heroes/slug.tsx`
- [ ] Create reusable `AddToCollectionButton` component
- [ ] Include visual feedback for heroes already in collection
- [ ] Handle both authenticated and unauthenticated states

### 3.2 Player Hero Collection Components
- [ ] Create `app/components/player/PlayerHeroCard.tsx` for collection display
- [ ] Create `app/components/player/PlayerHeroEditForm.tsx` for star/level editing
- [ ] Create `app/components/player/CollectionStats.tsx` for progress overview
- [ ] Implement responsive grid layout for hero collection display

### 3.3 Hero Progress Management
- [ ] Create star rating component (1-6 stars)
- [ ] Create equipment level selector (1-16 levels)
- [ ] Add notes field for player comments
- [ ] Include quick actions (edit, remove, favorite)

## Phase 4: Route Implementation

### 4.1 Create Player Route Structure
- [ ] Create `/app/routes/views/player/` directory structure
- [ ] Implement player layout at `/app/routes/views/player/layout.tsx`
- [ ] Create player index route at `/app/routes/views/player/index.tsx`
- [ ] Add player roster route at `/app/routes/views/player/roster.tsx`

### 4.2 Update Route Configuration
- [ ] Add player routes to `/app/routes.ts` under ProtectedUserLayout
- [ ] Configure `/player/roster` URL mapping
- [ ] Set up proper breadcrumb handling for player routes
- [ ] Add route-level loading and error boundaries

### 4.3 Player Roster Page Implementation
- [ ] Create comprehensive hero collection view
- [ ] Include search and filtering capabilities
- [ ] Add sorting options (date added, stars, equipment level)
- [ ] Implement bulk operations (export, stats)
- [ ] Show collection progress statistics

## Phase 5: Navigation Integration

### 5.1 Update Navigation Menu
- [ ] Update `/app/data/navigation.ts` to link "Hero Roster" to `/player/roster`
- [ ] Ensure Player Tools section is visible to authenticated users
- [ ] Add appropriate icons and navigation hierarchy
- [ ] Test navigation accessibility and mobile responsiveness

## Testing Strategy

### Unit Tests
- [ ] PlayerHeroRepository tests with mocked Supabase client
- [ ] LocalPlayerHeroService tests with mocked localStorage
- [ ] PlayerHeroService tests for storage abstraction
- [ ] Component unit tests for collection management

### Integration Tests
- [ ] Database operations with RLS policy testing
- [ ] Authentication state changes and data migration
- [ ] Collection button integration on hero pages
- [ ] Player roster page functionality

### Manual Testing Checklist
- [ ] Unauthenticated user can add heroes to localStorage collection
- [ ] Authenticated user can add heroes to database collection
- [ ] Data migrates properly from localStorage to database on login
- [ ] RLS policies prevent users from seeing other players' collections
- [ ] Star and equipment level validation works correctly
- [ ] Collection buttons show correct state (added/not added)
- [ ] Player roster page displays and functions correctly
- [ ] Navigation works properly across all user states

## Performance Impact

### Expected Improvements
- User-specific data provides personalized experience
- Database queries are user-scoped for security and performance
- Local storage provides instant access for unauthenticated users

### Potential Considerations
- Additional database queries for collection status checks
- localStorage size management for large collections
- RLS query performance with proper indexing

## Code Review Checklist

### Code Quality
- [ ] TypeScript strict mode compliance
- [ ] Error handling follows project patterns
- [ ] No console.log statements in production code
- [ ] Proper logging with loglevel

### Architecture
- [ ] Follows repository pattern consistently
- [ ] Proper separation of concerns between storage layers
- [ ] Database queries are optimized with proper indexes
- [ ] RLS policies are correctly implemented and tested

### Security
- [ ] RLS policies prevent unauthorized data access
- [ ] User input validation with Zod schemas
- [ ] No sensitive data in localStorage
- [ ] Proper authentication checks in UI components

## Documentation Updates

### Files to Update
- [ ] README.md - Update Player Hero Collection section
- [ ] CLAUDE.md - Update repository status and player features
- [ ] Database schema documentation for new tables
- [ ] Component documentation for player collection components

### Comments and JSDoc
- [ ] Add JSDoc comments to PlayerHeroRepository methods
- [ ] Document local storage service patterns
- [ ] Comment complex RLS policy logic
- [ ] Document storage migration patterns

## Environment Setup

### Development
- [ ] Run Supabase migration to create player_hero table
- [ ] Verify RLS policies work correctly in development
- [ ] Test with multiple user accounts
- [ ] Verify localStorage persistence across browser sessions

### Testing
- [ ] Set up test database with player_hero table
- [ ] Configure mocked authentication states
- [ ] Create test fixtures for player hero data
- [ ] Verify log capturing works for repository tests

## Future Work Items (Not in Current Scope)

The following features are planned for future implementation but not part of this current plan:

### Advanced Hero Tracking
- [ ] Skin collection and level tracking
- [ ] Glyph level progression tracking  
- [ ] Artifact star and level tracking
- [ ] Team composition management
- [ ] Hero performance analytics

### Enhanced Features
- [ ] Hero comparison tools
- [ ] Progress goal setting and tracking
- [ ] Guild roster integration
- [ ] Import/export hero collections
- [ ] Hero farming recommendations

### Social Features
- [ ] Share hero collections with guild members
- [ ] Hero collection statistics and leaderboards
- [ ] Guild-wide hero availability tracking

## Rollback Plan

### If Implementation Fails
1. Revert database migration: `supabase db reset`
2. Remove player routes from `/app/routes.ts`
3. Remove player hero repository and service files
4. Restore navigation.ts to original state

### Backup Strategy
- [ ] Create feature branch before starting
- [ ] Commit working state before major database changes
- [ ] Document current working functionality
- [ ] Test rollback procedure in development environment

## Success Criteria

### Functional Requirements
- [ ] Authenticated users can add heroes to their collection via database
- [ ] Unauthenticated users can add heroes to localStorage collection
- [ ] Users can specify star level (1-6) and equipment level (1-16)
- [ ] Plus buttons appear on hero list and detail pages
- [ ] Player roster page displays collection with filtering/sorting
- [ ] Data migrates from localStorage to database on authentication
- [ ] RLS policies ensure users only see their own data

### Technical Requirements
- [ ] TypeScript compilation passes without errors
- [ ] All unit and integration tests pass
- [ ] No runtime errors in browser console
- [ ] Database performance remains acceptable with new queries
- [ ] Repository pattern followed consistently

### User Experience
- [ ] Intuitive collection management interface
- [ ] Clear visual feedback for collection status
- [ ] Responsive design works on mobile devices
- [ ] Navigation is logical and accessible
- [ ] Loading states and error handling provide good UX

## Completion
- [ ] Pull request created and linked to Issue #53
- [ ] All tests passing in CI/CD
- [ ] Code review completed and approved
- [ ] Database migration deployed successfully
- [ ] Documentation updated and reviewed
- [ ] Issue #53 closed with PR reference