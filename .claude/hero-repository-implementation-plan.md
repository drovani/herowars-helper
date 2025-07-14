# Hero Repository Implementation Plan

**Related Issue**: [#38 - Create Hero Repository and Database Schema](https://github.com/drovani/herowars-helper/issues/38)

## Overview
Implement comprehensive database schema for heroes and create HeroRepository extending BaseRepository. This involves migrating from JSON-based HeroDataService to database-backed hero management with complex relationships for artifacts, skins, glyphs, and equipment.

## Branch Strategy
`feature/hero-repository` - New functionality for database-backed hero management replacing JSON-based service

## Prerequisites
Files to examine and understand before starting:
- `app/repositories/BaseRepository.ts` - Repository pattern implementation (from #35)
- `app/data/heroes.json` - Current hero data structure
- `app/data/hero.zod.ts` - Existing hero validation schemas
- `app/services/HeroDataService.ts` - Current service implementation
- `app/types/supabase.ts` - Database schema definitions
- `app/repositories/EquipmentRepository.ts` - Complex relationship patterns

## Dependency Analysis

### Files Using HeroDataService
Based on current usage patterns:
- `app/routes/views/heroes/index.tsx` - Hero listing page
- `app/routes/views/heroes/slug.tsx` - Hero details page
- `app/routes/views/heroes/slug/edit.tsx` - Hero editing (editor only)
- `app/components/hero/` - All hero-related components
- `app/routes/views/admin/data-setup/heroes.tsx` - Admin data management

### Current Hero Data Structure
Complex nested structure requiring multiple related tables:
- **Core Hero Data**: slug, name, class, faction, main_stat, attack_type, stone_source
- **Equipment Items**: Quality-level nested object with 6-slot arrays
- **Artifacts**: Weapon (with team buff), book, ring structure
- **Skins**: Array of skins with stats and plus variants
- **Glyphs**: Array of exactly 5 stats (5th matches main_stat)

### Impact Assessment
- **High Impact**: Complete data layer transformation
- **Medium Risk**: Complex relationships and data migration
- **Estimated Time**: 3-4 phases, 15-20 tasks total
- **Migration Strategy**: Gradual replacement of service calls

## Phase 1: Database Schema Design and Migration

### 1.1 Create Database Migration
- [ ] Create Supabase migration file for hero tables
- [ ] Define main `hero` table with proper column types
- [ ] Create related tables for artifacts, skins, glyphs, equipment
- [ ] Add foreign key constraints and indexes
- [ ] Test migration on local Supabase instance

### 1.2 Database Schema Implementation
```sql
-- Main hero table
CREATE TABLE hero (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  faction TEXT NOT NULL,
  main_stat TEXT NOT NULL,
  attack_type TEXT[] NOT NULL,
  stone_source TEXT[] NOT NULL,
  order_rank NUMERIC NOT NULL,
  updated_on TIMESTAMPTZ DEFAULT NOW()
);

-- Hero artifacts table
CREATE TABLE hero_artifact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_slug TEXT NOT NULL REFERENCES hero(slug) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL, -- 'weapon', 'book', 'ring'
  name TEXT,
  team_buff TEXT, -- for weapon only
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hero_slug, artifact_type)
);

-- Hero skins table
CREATE TABLE hero_skin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_slug TEXT NOT NULL REFERENCES hero(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stat_type TEXT NOT NULL,
  stat_value NUMERIC NOT NULL,
  has_plus BOOLEAN DEFAULT FALSE,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hero_slug, name)
);

-- Hero glyphs table
CREATE TABLE hero_glyph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_slug TEXT NOT NULL REFERENCES hero(slug) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 5),
  stat_type TEXT NOT NULL,
  stat_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hero_slug, position)
);

-- Hero equipment slots table
CREATE TABLE hero_equipment_slot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_slug TEXT NOT NULL REFERENCES hero(slug) ON DELETE CASCADE,
  quality TEXT NOT NULL,
  slot_position INTEGER NOT NULL CHECK (slot_position >= 1 AND slot_position <= 6),
  equipment_slug TEXT REFERENCES equipment(slug),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hero_slug, quality, slot_position)
);
```

### 1.3 Update Type Definitions
- [ ] Add hero-related table definitions to `app/types/supabase.ts`
- [ ] Run `npm run supabase:types` to generate updated types
- [ ] Create TypeScript interfaces for complex hero data
- [ ] Update `app/repositories/types.ts` with hero repository types

## Phase 2: Repository Implementation

### 2.1 Create HeroRepository Class
- [ ] Create `app/repositories/HeroRepository.ts` extending BaseRepository
- [ ] Implement constructor with proper table configuration
- [ ] Add hero-specific schema validation
- [ ] Include proper error handling and logging patterns

### 2.2 Basic CRUD Operations
- [ ] Implement core repository methods (findById, findAll, create, update, delete)
- [ ] Add hero-specific query methods (findByClass, findByFaction, findByMainStat)
- [ ] Implement search functionality for hero names
- [ ] Add proper TypeScript typing for all methods

### 2.3 Complex Relationship Methods
```typescript
class HeroRepository extends BaseRepository<'hero'> {
  // Hero-specific queries
  async findByClass(heroClass: string): Promise<RepositoryResult<Hero[]>>
  async findByFaction(faction: string): Promise<RepositoryResult<Hero[]>>
  async findByMainStat(mainStat: string): Promise<RepositoryResult<Hero[]>>
  async findByAttackType(attackType: string): Promise<RepositoryResult<Hero[]>>
  
  // Complex hero data with relationships
  async findWithAllData(slug: string): Promise<RepositoryResult<CompleteHero>>
  async findWithArtifacts(slug: string): Promise<RepositoryResult<HeroWithArtifacts>>
  async findWithSkins(slug: string): Promise<RepositoryResult<HeroWithSkins>>
  async findWithGlyphs(slug: string): Promise<RepositoryResult<HeroWithGlyphs>>
  async findWithEquipment(slug: string): Promise<RepositoryResult<HeroWithEquipment>>
  
  // Equipment relationship queries
  async findHeroesUsingEquipment(equipmentSlug: string): Promise<RepositoryResult<Hero[]>>
  async getHeroEquipmentByQuality(heroSlug: string, quality: string): Promise<RepositoryResult<Equipment[]>>
}
```

## Phase 3: Data Migration and Bulk Operations

### 3.1 Bulk Import Operations
- [ ] Implement `bulkCreateHeroes` method for main hero data
- [ ] Create `bulkCreateArtifacts` method for artifact data
- [ ] Implement `bulkCreateSkins` method for skin data
- [ ] Create `bulkCreateGlyphs` method for glyph data
- [ ] Implement `bulkCreateEquipmentSlots` method for equipment relationships

### 3.2 JSON Data Migration
- [ ] Create data migration utility to transform JSON to database format
- [ ] Handle complex nested structures (artifacts, skins, glyphs, equipment)
- [ ] Implement transaction-based bulk operations for data integrity
- [ ] Add progress tracking for large data imports
- [ ] Create validation for imported data consistency

### 3.3 Admin Panel Integration
- [ ] Update admin data setup page for hero management
- [ ] Add bulk import functionality from JSON files
- [ ] Implement conflict resolution for existing hero data
- [ ] Add export functionality for database hero data
- [ ] Create data validation and repair tools

## Phase 4: Service Layer Migration

### 4.1 Create Database-Backed Hero Service
- [ ] Create `app/services/DatabaseHeroService.ts` as repository wrapper
- [ ] Implement same interface as existing HeroDataService
- [ ] Add caching layer for frequently accessed hero data
- [ ] Handle complex data aggregation and formatting

### 4.2 Update Service Integration
- [ ] Replace HeroDataService imports with DatabaseHeroService
- [ ] Update hero route loaders to use repository
- [ ] Modify hero components to handle database-sourced data
- [ ] Update admin panels to use repository operations

### 4.3 Maintain Backward Compatibility
- [ ] Ensure same return data structure as JSON service
- [ ] Keep same method signatures for existing service calls
- [ ] Handle migration gracefully with fallback options
- [ ] Add comprehensive error handling for database operations

## Phase 5: Component and Route Updates

### 5.1 Update Hero Route Loaders
- [ ] Modify `/app/routes/views/heroes/index.tsx` to use HeroRepository
- [ ] Update `/app/routes/views/heroes/slug.tsx` for database hero details
- [ ] Modify hero edit route to use repository operations
- [ ] Add proper error handling for database failures

### 5.2 Update Hero Components
- [ ] Modify hero components to handle repository data format
- [ ] Update hero cards and tiles for database structure
- [ ] Adjust hero detail components for relationship data
- [ ] Ensure all components handle loading and error states

### 5.3 Admin Panel Updates
- [ ] Update admin hero management for repository operations
- [ ] Add bulk import/export functionality
- [ ] Implement hero data validation and repair tools
- [ ] Create admin hero editing with full relationship support

## Testing Strategy

### Unit Tests
- [ ] HeroRepository tests with mocked Supabase client
- [ ] Complex relationship query tests
- [ ] Bulk operation tests with transaction handling
- [ ] Data transformation and validation tests
- [ ] Hero-specific query method tests

### Integration Tests
- [ ] Database schema validation tests
- [ ] Hero relationship integrity tests
- [ ] Complex hero data loading tests
- [ ] Admin bulk import/export tests
- [ ] Service layer integration tests

### Manual Testing Checklist
- [ ] Hero listing page loads from database
- [ ] Hero details page shows all relationship data
- [ ] Hero editing works with database persistence
- [ ] Admin bulk import processes JSON data correctly
- [ ] Hero search and filtering work properly
- [ ] Equipment relationships display correctly
- [ ] Hero navigation functions properly

## Performance Impact

### Expected Improvements
- **Database Queries**: Indexed queries vs JSON file scanning
- **Relationship Loading**: Eager loading vs multiple file reads
- **Data Consistency**: ACID transactions vs file-based operations
- **Scalability**: Database handles large datasets efficiently

### Potential Considerations
- **Query Complexity**: Complex joins for relationship data
- **Database Load**: Additional queries for hero relationships
- **Memory Usage**: Loading complex hero objects
- **Caching Strategy**: Repository-level caching for frequently accessed data

## Code Review Checklist

### Code Quality
- [ ] TypeScript strict mode compliance
- [ ] Error handling follows project patterns
- [ ] No console.log statements in production code
- [ ] Proper logging with loglevel for repository operations

### Architecture
- [ ] Follows repository pattern consistently
- [ ] Proper separation of concerns between repository and service
- [ ] Database queries are optimized with proper indexes
- [ ] Complex relationship loading is efficient

### Database Design
- [ ] Foreign key constraints properly defined
- [ ] Indexes created for query performance
- [ ] Data types match application requirements
- [ ] Migration scripts are reversible

## Documentation Updates

### Files to Update
- [ ] README.md - Update hero repository architecture section
- [ ] CLAUDE.md - Update repository status for hero completion
- [ ] Database schema documentation for new hero tables
- [ ] Component documentation for hero relationship usage

### Comments and JSDoc
- [ ] Add JSDoc comments to HeroRepository methods
- [ ] Document complex relationship loading patterns
- [ ] Comment database migration scripts
- [ ] Document data transformation utilities

## Environment Setup

### Development
- [ ] Run Supabase migration to create hero tables
- [ ] Seed database with hero data from JSON
- [ ] Verify foreign key relationships work correctly
- [ ] Test complex relationship queries

### Testing
- [ ] Set up test database with hero tables
- [ ] Create test fixtures for hero data
- [ ] Configure mocked Supabase client for hero operations
- [ ] Verify log capturing works for repository tests

### Production Considerations
- [ ] Database migration scripts ready for production
- [ ] Data migration strategy from JSON to database
- [ ] Performance monitoring for complex hero queries
- [ ] Backup strategy for hero data

## Rollback Plan

### If Migration Fails
1. Revert database migration: `git checkout` to previous migration state
2. Restore HeroDataService imports in affected files
3. Remove HeroRepository and related service files
4. Restore original hero route loaders

### Backup Strategy
- [ ] Create feature branch before starting database changes
- [ ] Commit working state before major service replacements
- [ ] Export current JSON hero data as backup
- [ ] Document rollback procedure for each phase

## Success Criteria

### Functional Requirements
- [ ] Hero data loads from database with all relationships
- [ ] Hero listing page works with database queries
- [ ] Hero details page shows complete hero information
- [ ] Hero editing persists changes to database
- [ ] Admin bulk import processes JSON hero data successfully
- [ ] All hero-related components function correctly

### Technical Requirements
- [ ] TypeScript compilation passes without errors
- [ ] All unit and integration tests pass
- [ ] No runtime errors in browser console
- [ ] Database queries perform acceptably
- [ ] Repository pattern followed consistently

### Data Integrity
- [ ] All hero relationships maintain referential integrity
- [ ] Complex hero data (artifacts, skins, glyphs) loads correctly
- [ ] Hero equipment relationships work properly
- [ ] Data migration preserves all JSON data accurately

## Completion
- [ ] Pull request created and linked to Issue #38
- [ ] All tests passing in CI/CD
- [ ] Code review completed and approved
- [ ] Database migration deployed successfully
- [ ] Documentation updated and reviewed
- [ ] Issue #38 closed with PR reference
- [ ] HeroDataService successfully replaced with HeroRepository