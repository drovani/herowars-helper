# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Hero Wars Helper** - a React Router v7 application built to help players manage and track their Hero Wars game data. The application provides tools for managing heroes, equipment, missions, and guild coordination features. It's built with Supabase authentication, Tailwind CSS v4, and deployed on Netlify.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (includes Netlify preparation)
- `npm run start` - Start production server using Netlify
- `npm run tsc` - Run TypeScript type checking and generate route types
- `npm run supabase:types` - Generate Supabase types from local database

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
- **Data Services**: Service classes for Heroes, Equipment, and Missions data management
- **JSON Data Storage**: Static data files for heroes, equipment, and missions in `app/data/`; used for initial database hydration, not for regular runtime
- **Zod Schema Validation**: Type-safe validation schemas for all game data
- **Supabase Client**: SSR-compatible client creation (`app/lib/supabase/client.ts`)
- **Type Safety**: Generated Supabase types and strict TypeScript

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
- `app/data/missions.json` - Mission data for campaign and event content
- `app/services/` - Data service classes for game entities

## Environment Setup

Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon public key

Optional for full user management:
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin user management functions

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

The project uses **Vitest** with React Testing Library for comprehensive testing:

### Available Test Commands
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ui` - Run tests with UI interface

### Test Structure
- **Unit Tests**: Components, hooks, utility functions
- **Integration Tests**: API business logic, auth flows (mocked)
- **Repository Tests**: Supabase database operations (mocked)

### Testing Guidelines
- **Components**: Test rendering, interactions, props, and accessibility
- **Hooks**: Test state changes, effects, and edge cases  
- **Business Logic**: Test validation, permissions, and error handling
- **Supabase Operations**: Mock the client and test query building and data transformation

### Test Files Location
- Component tests: `app/components/**/*.test.tsx`
- Hook tests: `app/hooks/**/*.test.tsx`
- Context tests: `app/contexts/**/*.test.tsx`
- Example patterns: `app/__tests__/examples/`
- Test utilities: `app/__tests__/utils/`
- Mocks: `app/__tests__/mocks/`

### Mocking Patterns
- **Supabase Client**: Use `app/__tests__/mocks/supabase.ts` for database operations
- **Auth Context**: Mock authentication state for component testing
- **External APIs**: Use MSW for HTTP request mocking
- **Browser APIs**: Mock matchMedia, IntersectionObserver, etc.

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