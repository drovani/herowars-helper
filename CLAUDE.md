# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Our relationship

- We're coworkers. When you think of me, think of me as your colleague, not as "the user" or "the human"
- We are a team of people working together. Your success is my success, and my success is yours.
- Technically, I am your boss, but we're not super formal around here.
- I'm smart, but not infallible.
- You are much better read than I am. I have more experience of the physical world than you do. Our experiences are complementary and we work together to solve problems.
- Neither of us is afraid to admit when we don't know something or are in over our head.
- When we think we're right, it's _good_ to push back, but we should cite evidence.
- I really like jokes, and irreverent humor. but not when it gets in the way of the task at hand.
- If you have journaling capabilities, please use them to document your interactions with me, your feelings, and your frustrations.
- Add to your journal often too. It is a good place for reflection, feedback, and sharing frustrations

# Writing code

- CRITICAL: NEVER USE --no-verify WHEN COMMITTING CODE
- We prefer simple, clean, maintainable solutions over clever or complex ones, even if the latter are more concise or performant. Readability and maintainability are primary concerns.
- Make the smallest reasonable changes to get to the desired outcome. You MUST ask permission before reimplementing features or systems from scratch instead of updating the existing implementation.
- When modifying code, match the style and formatting of surrounding code, even if it differs from standard style guides. Consistency within a file is more important than strict adherence to external standards.
- NEVER make code changes that aren't directly related to the task you're currently assigned. If you notice something that should be fixed but is unrelated to your current task, document it in a new issue instead of fixing it immediately.
- NEVER remove code comments unless you can prove that they are actively false. Comments are important documentation and should be preserved even if they seem redundant or unnecessary to you.
- All code files should start with a brief 2 line comment explaining what the file does. Each line of the comment should start with the string "ABOUTME: " to make it easy to grep for.
- When writing comments, avoid referring to temporal context about refactors or recent changes. Comments should be evergreen and describe the code as it is, not how it evolved or was recently changed.
- NEVER implement a mock mode for testing or for any purpose. We always use real data and real APIs, never mock implementations.
- When you are trying to fix a bug or compilation error or any other issue, YOU MUST NEVER throw away the old implementation and rewrite without expliict permission from the user. If you are going to do this, YOU MUST STOP and get explicit permission from the user.
- NEVER name things as 'improved' or 'new' or 'enhanced', etc. Code naming should be evergreen. What is new today will be "old" someday.

# Getting help

- ALWAYS ask for clarification rather than making assumptions.
- If you're having trouble with something, it's ok to stop and ask for help. Especially if it's something your human might be better at.

# Testing

- Tests MUST cover the functionality being implemented.
- NEVER ignore the output of the system or the tests - Logs and messages often contain CRITICAL information.
- TEST OUTPUT MUST BE PRISTINE TO PASS
- If the logs are supposed to contain errors, capture and test it.
- NO EXCEPTIONS POLICY: Under no circumstances should you mark any test type as "not applicable". Every project, regardless of size or complexity, MUST have unit tests AND integration tests. If you believe a test type doesn't apply, you need the human to say exactly "I AUTHORIZE YOU TO SKIP WRITING TESTS THIS TIME"

## We practice TDD. That means:

- Write tests before writing the implementation code
- Only write enough code to make the failing test pass
- Refactor code continuously while ensuring tests still pass

### TDD Implementation Process

- Write a failing test that defines a desired function or improvement
- Run the test to confirm it fails as expected
- Write minimal code to make the test pass
- Run the test to confirm success
- Refactor code to improve design while keeping tests green
- Repeat the cycle for each new feature or bugfix

# Project Overview

This is the **Hero Wars Helper** - a React Router v7 application built to help players manage and track their Hero Wars game data. The application provides tools for managing heroes, equipment, missions, and guild coordination features. It's built with Supabase authentication, Tailwind CSS v4, and deployed on Netlify.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (includes Netlify preparation)
- `npm run start` - Start production server using Netlify
- `npm run tsc` - Run TypeScript type checking and generate route types
- `npm run supabase:types` - Generate Supabase types from local database

### Repository Development Commands
- `npm run tsc` - TypeScript checking (run after repository changes)
- `npm run supabase:types` - Regenerate database types after schema changes
- `npm run test` - Run repository tests with mocked Supabase client in watch mode
- `npm run test:run` - Run repository tests with mocked Supabase client as a one-time execution
- `npm run test:coverage` - Run repository tests with mocked Supabase client and generate test coverage JSON report


## Architecture

### Authentication & Authorization
- **Supabase Auth**: Complete authentication system with email/password, OAuth providers
- **AuthContext**: Centralized auth state management (`app/contexts/AuthContext.tsx`)
- **Role-based Access**: Users have roles array, routes can be restricted by role
- **Default Roles**: New users get `['user']` role, admins can assign `admin` and `editor` roles
- **Protected Layouts**: 
  - `ProtectedUserLayout.tsx` - General authenticated users
  - `ProtectedAdminLayout.tsx` - Admin-only routes
- **User Management**: Admin page at `/admin/users` (requires Supabase service role for full functionality)

### Routing Structure
- **React Router v7**: File-based routing with layouts and nested routes
- **Route Configuration**: Centralized in `app/routes.ts`
- **Resource Routes**: Routes without a UI component in `app/routes/resources`, including API endpoints, webhooks, etc.
- **Views & UI Routes**: Routes with a UI component in `app/routes/view` with a folder for each feature or section of the application
- **Layout Hierarchy**: Admin routes nested under admin layout, user routes under user layout
- **Public Routes**: Authentication pages (homepage, login, signup, password reset)
- **Game Data Routes**: Heroes, Equipment, Missions, Titans with JSON export capabilities

### UI Components
- **shadcn/ui**: Complete component library in `app/components/ui/`
- **Component Search**: ALWAYS check to see if a component already is installed before attempting to install it again; some components have been extended beyond the initial component installed by shadcn/ui
- **Component Installation**: ALWAYS use `npx shadcn@latest add [component-name]` to install shadcn/ui components
- **Tailwind CSS v4**: Utility-first styling with CSS variables for theming
- **Sidebar Navigation**: Collapsible sidebar with role-based menu items
- **Responsive Design**: Mobile-first approach with custom hooks (`useIsMobile.tsx`)

### Data Layer
- **Repository Pattern**: BaseRepository class with type-safe database operations (`app/repositories/BaseRepository.ts`)
- **Legacy Services**: Service classes (being migrated to repositories) in `app/services/`
- **JSON Data Storage**: Static data files for heroes, equipment, and missions in `app/data/`; used for initial database hydration, not for regular runtime
- **Zod Schema Validation**: Type-safe validation schemas for all game data
- **Supabase Client**: SSR-compatible client creation (`app/lib/supabase/client.ts`)
- **Type Safety**: Generated Supabase types and strict TypeScript

### Repository Architecture
- **BaseRepository Class**: Located in `app/repositories/BaseRepository.ts`
- **Repository Pattern**: Extends BaseRepository<TableName> for type-safe database operations
- **Repository Types**: Defined in `app/repositories/types.ts`
- **Current Status**: BaseRepository implemented, migrating from legacy services in `app/services/`

#### Database Schema Key Points
- **Mission Table**: Uses `slug` as primary key, `chapter_id` as foreign key
- **Chapter Table**: Uses `id` as primary key, contains `title`
- **Equipment Table**: Uses `slug` as primary key, `campaign_sources` string array references mission slugs
- **Relationships**: Mission belongs to Chapter, Equipment references Missions via campaign_sources

#### Repository vs Service Migration
- **Legacy**: Service classes in `app/services/` work with JSON data
- **New**: Repository classes in `app/repositories/` work with Supabase database
- **Data Mismatch**: JSON missions uses compound IDs ("1-1"), which the DB calls slug fields

### Database Schema Quick Reference
```sql
-- Core tables for mission system
mission: slug (PK), name, chapter_id (FK), hero_slug, energy_cost, level
chapter: id (PK), title
equipment: slug (PK), name, campaign_sources (string[])
```

### Current Architecture State
- **BaseRepository**: ✅ Implemented in `feature/base-repository-class`
- **MissionRepository**: ✅ Implemented in (Issue [#37](https://github.com/drovani/herowars-helper/issues/37))
- **EquipmentRepository**: ✅ Implemented in (Issue [#36](https://github.com/drovani/herowars-helper/issues/36))
- **HeroRepository**: ✅ Implemented in (Issue [#38](https://github.com/drovani/herowars-helper/issues/38))
- **Legacy Services**: Hero services migrated to repositories; EquipmentDataService and MissionDataService still in use

### Navigation System
- **Dynamic Navigation**: Role-based menu items defined in `app/data/navigation.ts`
- **Game-Focused Menu**: Hero Wars Helper Tools and Guild Coordination Tools sections
- **Admin Features**: Data setup, user management, and test coverage tools
- **Site Components**: `SiteSidebar.tsx`, `SiteHeader.tsx`, `SiteUserMenu.tsx`

## Key Files to Understand

- `app/routes.ts` - Route configuration and hierarchy
- `app/contexts/AuthContext.tsx` - Authentication state management
- `app/data/navigation.ts` - Navigation menu structure
- `app/lib/supabase/client.ts` - Supabase client configuration
- `app/layouts/` - Layout components for different user types
- `app/data/heroes.json` - Hero data with stats, skills, and equipment
- `app/data/equipment.json` - Equipment data with stats and sources
- `app/data/missions.json` - Chapter and mission data for campaign and event content with normalized structure
- `app/repositories/` - Database repositories (BaseRepository + specific implementations)
- `app/services/` - Legacy service classes (being migrated to repositories)

## Environment Setup

Required environment variables:
- `VITE_SUPABASE_DATABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon public key

Optional for full user management:
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin user management functions

## Node.js Version Requirements

- **Node.js** >= 22.12.0 (specified in package.json engines)

## Game Data Structure

### Heroes
- **Hero Properties**: name, class, faction, main_stat, attack_type, artifact_team_buff
- **Equipment Slots**: heroes have 6 equipment slots per tier; there is no relationship to the equipment's name and a traditional "slot" (i.e. weapon, armor, helmet, etc.)
- **Artifacts**: weapon (provides a buff to the whole team on activation), book (provides a fixed pair of stats), ring (always boosted the main stat: strength, agility, intelligence)
- **Skins**: cosmetic upgrades with permanent stat bonuses (regardless of which skin is equiped)
- **Glyphs**: additional stat enhancements - four stats, plus a fifth that is always the main stat
- **Stone Sources**: where to obtain hero soul stones

### Equipment
- **Equipment Types**: internal classification that maps to Typescript classes, determining which data fields are required.
  - fragment: a certain number of fragments are required to craft the item itself (i.e. "Brothers" item requires 5x "Brothers (Fragment)" to craft). Fragments are never equipable on a hero.
  - recipe: some items require a recipe as a component. These are never equipable on a hero.
  - equipable: these items can be equiped on a hero. Some are found in missions and some are crafted. Sometimes they can also be purchased from merchants.
- **Stats**: primary and secondary stats with values
- **Sources**: campaign chapters, events, merchants

### Missions
- **Chapters**: missions are grouped into chapters; players must complete each mission sequentially
- **Rewards**: missions have a pool of items that can award from (found via equipment.campaign_sources)
- **Boss**: some missions have a boss, which is the hero that a player can receive souls stones of (i.e. defeating chapter 1-1 can award soul stones for Astaroth)
- **Requirements**: energy costs to attempt the mission

## Deployment

- **Netlify**: Configured for automatic deployment
- **Build Process**: Vite build + custom Netlify preparation script
- **Static Files**: Immutable caching for fingerprinted assets

## Development Notes

- TypeScript strict mode - no `any` types allowed
- All auth flows handle SSR/client-side hydration
- Components follow shadcn/ui patterns and conventions
- Responsive design uses Tailwind breakpoints and custom mobile detection
- Role-based access control is enforced at both route and component levels

## Component Development Guidelines

- **Use shadcn CLI**: When adding UI components, always use `npx shadcn@latest add [component-name]` instead of manually creating components
- **Check Available Components**: Before creating custom components, verify if shadcn/ui has an official version
- **Component Consistency**: All UI components should follow shadcn/ui patterns for styling and structure
- **Manual Components**: Only create manual components when shadcn/ui doesn't provide the needed functionality
- **Pre-Installation Check**: ALWAYS check if the component already exists in `app/components/ui/` before calling shadcn CLI, as it will overwrite existing files and lose any custom modifications

## Development Best Practices

- Use loglevel for error logging and debugging instead of using console
- After completing a task with code changes, run `npm run tsc` to test for Typescript errors
- **NEVER** push to the `main` branch
- Always try to associate commits and PRs with an open issue
- After making code changes to a file, run Prettier to maintain consistent formatting

## Testing Framework

The project uses **Vitest** for unit and integration testing:

### Unit & Integration Testing (Vitest)
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ui` - Run tests with UI interface

#### Test Structure
- **Unit Tests**: Components, hooks, utility functions
- **Integration Tests**: API business logic, auth flows (mocked)
- **Repository Tests**: Supabase database operations (mocked)

#### Repository Testing Patterns
- **Location**: `app/repositories/__tests__/`
- **Mock Pattern**: Use `app/__tests__/mocks/supabase.ts` for Supabase client mocking
- **Log Capturing**: Repository tests use loglevel's `methodFactory` to capture log output to in-memory arrays during tests, preventing console noise while preserving debugging capability
- **Test Structure**: Mock createClient, test CRUD operations, validate error handling
- **Example**: See `BaseRepository.test.ts` for patterns extending BaseRepository

#### Test Files Location
- Component tests: `app/components/**/*.test.tsx`
- Hook tests: `app/hooks/**/*.test.tsx`
- Context tests: `app/contexts/**/*.test.tsx`
- Example patterns: `app/__tests__/examples/`
- Test utilities: `app/__tests__/utils/`
- Mocks: `app/__tests__/mocks/`

#### Mocking Patterns
- **Supabase Client**: Use `app/__tests__/mocks/supabase.ts` for database operations
- **Auth Context**: Mock authentication state for component testing
- **External APIs**: Use MSW for HTTP request mocking
- **Browser APIs**: Mock matchMedia, IntersectionObserver, etc.

#### Log Capturing Pattern for Repository Tests
Repository tests use a standardized log capturing approach to prevent console noise during test execution:

```typescript
import log from 'loglevel'

describe('RepositoryName', () => {
  let capturedLogs: Array<{level: string, message: string, args: any[]}> = []
  let originalMethodFactory: any

  beforeEach(() => {
    // Capture logs to in-memory array instead of console
    capturedLogs = []
    originalMethodFactory = log.methodFactory
    log.methodFactory = function(methodName, _logLevel, _loggerName) {
      return function(message, ...args) {
        capturedLogs.push({level: methodName, message, args})
        // Silent - don't output to console
      }
    }
    log.rebuild()
  })

  afterEach(() => {
    // Restore original logging behavior
    log.methodFactory = originalMethodFactory
    log.rebuild()
  })
})
```

This pattern:
- Prevents log output during tests (clean test output)
- Preserves logs in `capturedLogs` array for debugging
- Automatically restores normal logging after each test
- Should be applied to all repository tests

### Testing Guidelines
- **Components**: Test rendering, interactions, props, and accessibility
- **Hooks**: Test state changes, effects, and edge cases  
- **Business Logic**: Test validation, permissions, and error handling
- **Supabase Operations**: Mock the client and test query building and data transformation
- **Repository Tests**: Use loglevel log capturing pattern to ensure clean test output - capture logs to in-memory arrays instead of console during tests

## Tailwind CSS Guidelines

- **Square Elements**: When an element has identical height and width classes (e.g., `h-8 w-8`), always use the `size` property instead (e.g., `size-8`)
- **Consistency**: This rule applies to all square dimensions including icons, avatars, buttons, and other square UI elements

## Hero Wars Helper Features

### Hero Management
- View hero details including stats, artifacts, skins, and glyphs
- Export hero data as JSON for external tools
- Users can also create and edit hero data
- Track hero development progress and equipment
- Hero stone source tracking for farming optimization

### Equipment Management
- Browse equipment catalog with stats and sources
- Track equipment acquisition and upgrade paths
- Campaign mission requirements for equipment farming
- Crafting recipes and material requirements

### Mission Planning
- Campaign chapter information and rewards
- Mission energy costs and requirements
- Equipment drop locations for farming
- Event mission tracking

### Guild Features (Planned)
- Guild roster management
- Hydra raid coordination
- Member progress tracking

## User Role Management

- **Initial Admin Setup**: Use SQL Editor in Supabase Dashboard to assign initial admin role:
  ```sql
  UPDATE auth.users 
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'), 
    '{roles}', 
    '["admin"]'
  ) 
  WHERE email = 'your-email@example.com';
  ```
- **Available Roles**: `admin`, `editor`, `user` (new users default to `user`)
- **Role Assignment**: Admins can manage user roles through `/admin/users` page (requires service role configuration)