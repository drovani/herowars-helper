# Team Management System Implementation (Issue #19)

## Overview
Implement a comprehensive team management system that allows users to create, label, and manage teams of exactly 5 heroes. Teams automatically display heroes in descending order by order_rank (left to right), reflecting the in-game team display format. This feature extends the existing player hero collection system with strategic team planning capabilities.

## Branch Strategy
**Branch Name**: `feature/i19-team-management`
- **Type**: `feature/` - New functionality for team creation and management
- **Base Branch**: `main`
- **Target**: Enable users to create labeled teams with exactly 5 heroes (auto-ordered by rank)

## Prerequisites
### Files to Examine and Understand
- `app/types/supabase.ts` - Database schema and types
- `app/repositories/PlayerHeroRepository.ts` - Existing player hero management patterns
- `app/routes/views/player/roster.tsx` - Current player collection UI patterns
- `app/data/navigation.ts` - Navigation structure for new team pages
- `app/contexts/AuthContext.tsx` - Authentication patterns
- `app/components/player/HeroCollectionCard.tsx` - Existing hero display components

### Database Schema Analysis
Current relevant tables:
- `player_hero`: User hero collection with stars/equipment tracking
- `hero`: Master hero data with team_buff fields
- Need to create: `player_team` and `player_team_hero` tables
- Note: Teams display heroes by order_rank (descending), no manual positioning

## Dependency Analysis
### Files Using Player Hero System
- `/app/routes/views/player/roster.tsx` - Player collection management
- `/app/repositories/PlayerHeroRepository.ts` - Database operations
- `/app/components/player/HeroCollectionCard.tsx` - Hero display component
- Integration patterns for team selection from existing collection

### Impact Assessment
- **Impact Level**: Medium - New feature with database schema changes
- **Estimated Development Time**: 3-4 days
- **Risk Factors**: Database migration, new component creation, state management
- **Mitigation**: Follow existing repository patterns, comprehensive testing

## Phase 1: Database Schema and Repository Foundation
### 1.1 Database Schema Design
- [ ] Create `player_team` table schema (id, user_id, name, description, created_at, updated_at)
- [ ] Implement default naming pattern: "Team 1", "Team 2", etc. for new teams
- [ ] Create `player_team_hero` table schema (id, team_id, hero_slug, created_at)
- [ ] Add foreign key constraints and indexes (no position field needed - use hero.order_rank)
- [ ] Generate Supabase types with `npm run supabase:types`

### 1.2 Repository Implementation
- [ ] Create `PlayerTeamRepository.ts` extending BaseRepository
- [ ] Implement CRUD operations: create, findByUserId, update, delete
- [ ] Add auto-naming logic: generate "Team {n}" where n is next available number for user
- [ ] Implement team hero management: addHeroToTeam, removeHeroFromTeam (no positioning needed)
- [ ] Add comprehensive error handling and validation
- [ ] Implement team validation (exactly 5 heroes max)

### 1.3 Types and Interfaces
- [ ] Define `PlayerTeam`, `PlayerTeamHero`, `TeamWithHeroes` types
- [ ] Update `app/repositories/types.ts` with team-related types
- [ ] Create Zod validation schemas for team creation/updates

## Phase 2: Core Team Management Components
### 2.1 Team List Component
- [ ] Create `TeamListCard.tsx` for displaying team summary
- [ ] Show team name, hero count, last modified date
- [ ] Include edit/delete actions with confirmation modals
- [ ] Implement responsive grid layout for multiple teams

### 2.2 Team Builder Component  
- [ ] Create `TeamBuilder.tsx` for team creation/editing
- [ ] Implement 5-hero selection interface (auto-ordered by rank)
- [ ] Include hero selection from user's collection with search/filter
- [ ] Validate team composition (exactly 5 heroes, no duplicates)
- [ ] Display preview ordered by order_rank (descending)

### 2.3 Team Hero Display Component
- [ ] Create `TeamHeroDisplay.tsx` for showing heroes in rank order
- [ ] Display hero image, name, stars, equipment level, order_rank
- [ ] Show heroes left-to-right in descending order_rank
- [ ] Include remove hero functionality with confirmation

## Phase 3: Team Management Routes and Navigation
### 3.1 Team Management Routes
- [ ] Create `/app/routes/views/player/teams/index.tsx` - Team list page
- [ ] Create `/app/routes/views/player/teams/new.tsx` - Team creation page
- [ ] Create `/app/routes/views/player/teams/$teamId/edit.tsx` - Team editing page
- [ ] Implement loader/action functions for data fetching and mutations
- [ ] Add authentication guards and error boundaries

### 3.2 Navigation Integration
- [ ] Add "Team Management" item to Player Tools navigation section
- [ ] Update `app/data/navigation.ts` with team routes
- [ ] Add appropriate icons (Users/Shield combination)
- [ ] Ensure proper role-based access (authenticated users only)

## Phase 4: Advanced Features and UX Enhancements
### 4.1 Team Display Options
- [ ] Implement automatic order_rank sorting (descending, left-to-right)
- [ ] Create team preview mode showing formation layout
- [ ] Add team synergy indicators (based on hero team_buff fields)
- [ ] Show team power/ranking calculations

### 4.2 Team Import/Export
- [ ] Add team sharing functionality (JSON export)
- [ ] Implement team import from shared JSON
- [ ] Create team template system for common formations
- [ ] Add team comparison tools for strategy planning

## Testing Strategy
### Unit Tests
- [ ] `PlayerTeamRepository.test.ts` with mocked Supabase client
- [ ] `TeamBuilder.test.tsx` component interactions
- [ ] `TeamHeroSlot.test.tsx` slot management
- [ ] Validation schema tests for team creation

### Integration Tests
- [ ] Team CRUD operations with database
- [ ] Team hero assignment and positioning
- [ ] User authentication and authorization
- [ ] Form validation and error handling

### Manual Testing Checklist
- [ ] Create team with custom name (or default "Team 1", "Team 2") and description
- [ ] Add/remove heroes from team slots
- [ ] Verify automatic hero ordering by rank
- [ ] Delete teams with confirmation
- [ ] Navigation between team management pages
- [ ] Responsive design on mobile devices
- [ ] Error handling for invalid operations

## Performance Impact
### Expected Improvements
- **Strategic Planning**: Organized team building for game events
- **Collection Utilization**: Better use of hero roster for specific strategies
- **User Engagement**: Enhanced planning tools increase app value

### Potential Considerations
- **Database Queries**: Additional joins for team-hero relationships
- **Component Complexity**: Hero selection and validation state management
- **Memory Usage**: Team data caching for faster navigation

## Code Review Checklist
### Code Quality
- [ ] TypeScript strict mode compliance
- [ ] Error handling follows repository patterns
- [ ] No console.log statements in production code
- [ ] Proper logging with loglevel for debugging

### Architecture
- [ ] Repository pattern consistently applied
- [ ] Components follow shadcn/ui patterns
- [ ] Database queries are optimized with proper indexes
- [ ] Form validation provides clear user feedback

### User Experience
- [ ] Intuitive team creation workflow
- [ ] Clear visual feedback for hero selection and rank ordering
- [ ] Responsive design works across devices
- [ ] Accessibility compliance (keyboard navigation, screen readers, rank-based ordering)

## Documentation Updates
### Files to Update
- [ ] `README.md` - Add team management to features section
- [ ] `CLAUDE.md` - Update with team repository patterns
- [ ] Navigation documentation - New team management routes
- [ ] Database schema documentation - Team table relationships

### Comments and JSDoc
- [ ] Add JSDoc comments to PlayerTeamRepository methods
- [ ] Document team validation logic and automatic ordering
- [ ] Update component prop interfaces with team types

## Environment Setup
### Development
- [ ] Verify local database schema includes team tables
- [ ] Update local .env if additional permissions needed
- [ ] Run `npm run supabase:types` after schema changes

### Testing
- [ ] Create test team data fixtures
- [ ] Update mock configurations for team repositories
- [ ] Verify test database includes team table structure

### Production Considerations
- [ ] Database migration scripts for team tables
- [ ] Row Level Security policies for team data
- [ ] Performance monitoring for team queries

### Backup Strategy
- [ ] Create feature branch before database changes
- [ ] Export current schema before modifications
- [ ] Document rollback procedures for team tables

## Success Criteria
- [ ] Users can create teams with custom names and descriptions
- [ ] Teams contain exactly 5 heroes (all slots filled, no empty slots)
- [ ] Heroes can be added/removed from teams via intuitive UI
- [ ] Heroes automatically ordered by order_rank (descending, left-to-right)
- [ ] Teams display heroes in automatic rank-based order (order_rank descending)
- [ ] All 511+ tests pass including new team functionality
- [ ] TypeScript compilation successful with no errors
- [ ] Mobile-responsive design works across devices
- [ ] Database performance remains optimal with team queries

## Completion
- [ ] PR creation with comprehensive team management system
- [ ] TodoWrite tracking shows all phases completed
- [ ] Commit messages follow project descriptive patterns
- [ ] `CLAUDE.md` updated with team repository implementation status
- [ ] `README.md` updated with team management feature description
- [ ] `/app/routes/views/public/index.tsx` updated with team management in `recentUpdates` array
- [ ] User acceptance testing completed for team workflows

---

**Implementation Notes:**
- Follow existing `PlayerHeroRepository` patterns for consistency
- Use shadcn/ui components for all UI elements (`npx shadcn@latest add [component]`)
- Implement drag-and-drop with `@dnd-kit/core` if not already available
- Ensure all team operations respect user authentication and data isolation
- Consider team synergy calculations based on existing `team_buff` hero fields
- Plan for future guild team sharing functionality in architecture design