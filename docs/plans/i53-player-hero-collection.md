# Player Hero Collection System Implementation Plan

## Overview
Implement a hero collection tracking system for Hero Wars Helper that allows authenticated users to track their personal hero progression including stars (1-6) and equipment levels (1-16). This feature enables players to manage their roster and track development progress.

## Branch Strategy
Create feature branch: `feature/i53-player-hero-collection`

## Prerequisites
- Review existing authentication patterns in `app/contexts/AuthContext.tsx`
- Understand BaseRepository and HeroRepository implementations
- Examine existing route structure in `app/routes.ts`
- Study Supabase RLS patterns from hero tables migration

## Dependency Analysis

### Files Using Player Data (New Implementation)
- New `PlayerHeroRepository` extending `BaseRepository`
- New player routes under `ProtectedUserLayout`
- Navigation updates for Player Tools section
- UI components for hero collection management

### Impact Assessment
- **Medium impact** - New feature addition without breaking existing functionality
- **Estimated time**: 4-6 hours implementation + testing
- **Risk factors**: RLS policy configuration, authentication integration

## Phase 1: Database Schema & Repository

### 1.1 Create Player Hero Database Migration
- Create `supabase/migrations/[timestamp]_player_hero_collection.sql`
- Define `player_hero` table with:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `hero_slug` (text, foreign key to hero table)
  - `stars` (smallint, 1-6 range)
  - `equipment_level` (smallint, 1-16 range)
  - Unique constraint on `(user_id, hero_slug)`
- Define `player_event` table for event sourcing:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `event_type` (text, enum: CLAIM_HERO, UNCLAIM_HERO, UPDATE_HERO_STARS, UPDATE_HERO_EQUIPMENT)
  - `hero_slug` (text, foreign key to hero table)
  - `event_data` (jsonb, stores action-specific data like previous/new values)
  - `created_at` (timestamptz, default now())
  - `created_by` (uuid, foreign key to auth.users - who performed the action)
- Implement RLS policies for user-only access on both tables
- Create appropriate indexes for performance (including event queries by user and type)
- Run `npx supabase reset` to reset the local database and process migrations & seed data

### 1.2 Update Supabase Types
- Run `npm run supabase:types` to regenerate types
- Update `app/repositories/types.ts` with new PlayerHero and PlayerEvent types

### 1.3 Create PlayerEventRepository
- Create `app/repositories/PlayerEventRepository.ts`
- Extend BaseRepository for event sourcing operations
- Implement methods:
  - `createEvent(eventType: string, userId: string, heroSlug: string, eventData: object)` - Record new event
  - `findEventsByUser(userId: string)` - Get user's event history
  - `findEventsByHero(userId: string, heroSlug: string)` - Get hero-specific events
  - `findEventsByType(userId: string, eventType: string)` - Get events by type

### 1.4 Create PlayerHeroRepository
- Create `app/repositories/PlayerHeroRepository.ts`
- Extend BaseRepository with custom authentication-aware queries
- Integrate event sourcing for all state changes
- Implement methods:
  - `findByUserId(userId: string)` - Get user's collection
  - `addHeroToCollection(userId: string, heroSlug: string)` - Add hero + record CLAIM_HERO event
  - `updateHeroProgress(userId: string, heroSlug: string, updates)` - Update progression + record UPDATE events
  - `removeFromCollection(userId: string, heroSlug: string)` - Remove hero + record UNCLAIM_HERO event
  - `findWithHeroDetails(userId: string)` - Get collection with hero metadata
  - All mutation methods should create corresponding events via PlayerEventRepository

## Phase 2: Player Routes & Navigation ✅ COMPLETED (2025-01-16)

### 2.1 Update Routes Configuration ✅
- ✅ Modified `app/routes.ts` to add player routes under `ProtectedUserLayout`:
  ```typescript
  layout("./layouts/ProtectedUserLayout.tsx", [
    route("account", "./routes/views/account/index.tsx", [
      index("./routes/views/account/profile.tsx")
    ]),
    route("player", "./routes/views/player/layout.tsx", [
      index("./routes/views/player/roster.tsx"),
      route("activity", "./routes/views/player/activity.tsx")
    ])
  ])
  ```

### 2.2 Create Player Route Components ✅
- ✅ Created `app/routes/views/player/layout.tsx` - Player section layout with breadcrumb support
- ✅ Created `app/routes/views/player/roster.tsx` - Main roster management page with auth checks
- ✅ Created `app/routes/views/player/activity.tsx` - Event history and activity log with auth checks
- ✅ Implemented loader functions with authentication checks
- ✅ Added breadcrumb support for navigation
- ✅ Added loading states and error handling

### 2.3 Update Navigation ✅
- ✅ Modified `app/data/navigation.ts` Player Tools section:
  ```typescript
  {
    name: "Player Tools",
    items: [
      { 
        name: "Hero Roster", 
        icon: UsersRoundIcon, 
        href: "/player" 
      },
      { 
        name: "Activity Log", 
        icon: ClockIcon, 
        href: "/player/activity" 
      }
    ],
  }
  ```

## Phase 3: UI Components

### 3.1 Create Collection Management Components
- Create `app/components/player/HeroCollectionCard.tsx` - Individual hero card
- Create `app/components/player/AddHeroButton.tsx` - Plus button for adding heroes
- Create `app/components/player/StarRating.tsx` - Star progression display/edit
- Create `app/components/player/EquipmentLevels.tsx` - Equipment tier level management
- Create `app/components/player/ActivityFeed.tsx` - Event history display component
- Create `app/components/player/EventCard.tsx` - Individual event display with timestamps and details

### 3.2 Update Hero Pages with Add Buttons
- Modify `app/routes/views/heroes/slug.tsx` - Add "Add to Collection" button
- Modify `app/routes/views/heroes/index.tsx` - Add plus buttons to hero list
- Implement authentication checks for button visibility

### 3.3 Create Roster Management Interface
- Implement filtering by class, faction, stars
- Add sorting options (name, stars, recent additions)
- Responsive design for mobile/desktop
- Search functionality

### 3.4 Create Activity Log Interface
- Display chronological event history with pagination
- Filter events by type (CLAIM_HERO, UPDATE_HERO_STARS, etc.)
- Show event details including timestamps and data changes
- Export activity log functionality for external analysis

## Phase 4: Authentication Integration

### 4.1 User Context Integration
- Use existing `useAuth()` hook for user identification
- Implement user ID extraction for repository queries
- Add authentication guards for player routes

### 4.2 Action Handlers
- Create form actions for hero collection operations
- Implement optimistic UI updates
- Add error handling and user feedback

## Testing Strategy

### Unit Tests
- [ ] PlayerHeroRepository tests with mocked Supabase client
- [ ] PlayerEventRepository tests with mocked Supabase client
- [ ] Component rendering tests for collection UI
- [ ] Authentication integration tests
- [ ] Event sourcing integration tests

### Integration Tests
- [ ] Database operations with RLS policies
- [ ] Hero addition/removal workflows
- [ ] Star and equipment level updates
- [ ] Event creation and retrieval workflows
- [ ] Activity log filtering and pagination

### Manual Testing Checklist
- [ ] Authenticated users can add heroes to collection
- [ ] Plus buttons appear on hero pages for authenticated users
- [ ] Roster page loads and displays user's collection
- [ ] Star and equipment level updates persist correctly
- [ ] RLS policies prevent access to other users' data
- [ ] Unauthenticated users cannot access player routes
- [ ] Activity log displays all user events chronologically
- [ ] Event filtering works correctly by event type
- [ ] Events are created for all hero collection changes
- [ ] Activity log pagination functions properly

## Performance Impact

### Expected Improvements
- User-specific data filtering at database level
- Efficient queries with proper indexing
- Optimistic UI updates for responsiveness
- Event sourcing enables audit trails and analytics

### Potential Considerations
- Additional database queries for collection data
- Client-side state management for collection
- Event table will grow over time - consider archival strategy
- Additional write operations for event logging

## Code Review Checklist

### Code Quality
- [ ] TypeScript strict mode compliance
- [ ] Error handling follows project patterns
- [ ] Proper logging with loglevel
- [ ] No security vulnerabilities

### Architecture
- [ ] Follows repository pattern consistently
- [ ] RLS policies properly implemented
- [ ] Authentication integration secure
- [ ] Database queries optimized
- [ ] Event sourcing pattern correctly implemented
- [ ] Event data structure is consistent and queryable

## Documentation Updates

### Files to Update
- [ ] CLAUDE.md - Update Player Tools section status
- [ ] `app/routes/views/public/index.tsx` - Add feature to recent updates
- [ ] Component documentation for new player components
- [ ] Document event sourcing patterns and event types

### Comments and JSDoc
- [ ] Add JSDoc comments to PlayerHeroRepository methods
- [ ] Add JSDoc comments to PlayerEventRepository methods
- [ ] Document RLS policy implementation
- [ ] Update type definitions with inline documentation
- [ ] Document event sourcing architecture and patterns

## Environment Setup

### Development
- [ ] Run database migration locally
- [ ] Verify RLS policies in Supabase dashboard
- [ ] Test with authenticated users

### Testing
- [ ] Seed test data for user collections
- [ ] Mock PlayerHeroRepository for component tests
- [ ] Mock PlayerEventRepository for component tests
- [ ] Verify log capturing pattern in repository tests
- [ ] Seed test event data for activity log testing

## Success Criteria
- Authenticated users can add heroes to their personal collection
- Plus buttons function correctly on hero list and detail pages
- Roster page displays user's collection with filtering/sorting
- Star ratings and equipment levels can be updated
- RLS policies ensure data security
- TypeScript compilation passes without errors
- All tests pass including new repository tests
- No runtime errors in browser console
- Event sourcing system captures all player actions
- Activity log displays complete event history with filtering
- Events are properly stored with user identification and timestamps
- Event data structure supports future analytics and reporting

## Completion
- Create PR with title "feat: implement player hero collection system"
- Update TodoWrite with completion status
- Commit changes with descriptive messages following project patterns
- CLAUDE.md updated reflecting new Player Tools functionality
- `/app/routes/views/public/index.tsx` updated with user-facing feature description