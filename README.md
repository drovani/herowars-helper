# Hero Wars Helper

A React Router v7 application built to help players manage and track their Hero Wars game data. The application provides tools for managing heroes, equipment, missions, and guild coordination features. Built with Supabase authentication, Tailwind CSS v4, and deployed on Netlify.

## 🚀 Features

### Core Technologies

- **React Router v7** - File-based routing with SSR support
- **Supabase** - Authentication, authorization, and database
- **Tailwind CSS v4** - Modern utility-first styling with CSS variables
- **TypeScript** - Strict type safety throughout
- **Vite** - Fast build tooling and HMR
- **Netlify** - Production deployment with serverless functions

### Hero Wars Game Features

- **Hero Management** - Complete hero database with stats, artifacts, skins, and glyphs
- **Equipment Tracking** - Comprehensive equipment catalog with crafting trees and sources
- **Mission Planning** - Campaign chapter information with energy costs and rewards
- **Data Export** - JSON export capabilities for external tools
- **Admin Tools** - Database setup and data management for administrators

### Authentication & Authorization

- Complete auth system with email/password and OAuth providers
- Role-based access control (`admin`, `editor`, `user`)
- Protected routes and layouts
- User management dashboard for admins
- SSR-compatible auth state management

### UI Components

- **shadcn/ui** - Complete component library
- Responsive design with mobile-first approach
- Dark/light theme support ready
- Accessible components following WAI-ARIA guidelines
- Game-specific UI components for Hero Wars data

### Developer Experience

- **Comprehensive Testing** - Vitest with React Testing Library
- **TypeScript Strict Mode** - No `any` types allowed
- **Repository Pattern** - Structured database operations with BaseRepository
- **Automated Type Generation** - Supabase types and route types
- **Claude Code Integration** - AI assistant workflow commands
- **Linting & Formatting** - ESLint and Prettier configured

## 📋 Prerequisites

- **Node.js** >= 22.12.0
- **npm** >= 11.3.0
- **Supabase** account (for authentication and database)
- **Netlify** account (for deployment)

## 🛠️ Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
VITE_SUPABASE_DATABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Dev values found with `npx supabase status`
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DATABASE_URL=
SUPABASE_JWT_SECRET=

# Optional: For full user management functionality
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Installation

```bash
npm install
```

### 3. Development

```bash
npm run dev
```

Your application will be available at `http://localhost:3000`.

### 4. Initial Admin Setup

The seed data creates the first admin user. Email admin@example.com, password ~!adminShoes.09
🚨 It is highly recommended that you made a new user, assign them admin priviledges, then delete the default admin@example.com user. 🚨

## 🏗️ Architecture

### Project Structure

```
app/
├── components/ui/        # shadcn/ui components
├── contexts/            # React contexts (Auth, etc.)
├── data/               # Static game data (heroes, equipment, missions) and navigation
├── hooks/              # Custom React hooks
├── layouts/            # Route layouts (Protected, Admin, etc.)
├── lib/                # Utilities and configurations
├── repositories/       # Database repository classes
├── routes/             # File-based routing (see Route Organization below)
├── services/           # Legacy service classes (being migrated)
├── types/              # TypeScript type definitions
└── __tests__/          # Test files and utilities
```

### Route Organization

The project uses a **resource/views pattern** for scalable route organization:

```
app/routes/
├── resources/              # Non-UI routes (APIs, webhooks, background jobs)
│   └── api/
│       └── admin/
│           ├── users.tsx         # Admin user management API
│           └── users.test.tsx    # API route tests
└── views/                  # UI routes organized by feature
    ├── auth/               # Authentication pages
    ├── admin/              # Admin interface (requires admin role)
    │   ├── setup.tsx              # /admin/setup (database initialization)
    │   ├── users.tsx              # /admin/users (user management)
    │   └── test-coverage.tsx      # /admin/test-coverage
    ├── heroes/             # Hero Wars hero management
    │   ├── index.tsx              # /heroes (hero listing)
    │   ├── json.tsx               # /heroes/json (data export)
    │   └── $slug.tsx              # /heroes/astaroth (hero details)
    ├── equipment/          # Equipment catalog and management
    ├── missions/           # Campaign mission browser
    ├── account/            # User account pages
    └── public/             # Public pages
        ├── index.tsx              # / (home page)
        └── logout.tsx             # /logout
```

### Data Layer Architecture

#### Repository Pattern (Current)
- **BaseRepository Class**: Type-safe database operations foundation
- **HeroRepository**: ✅ Complete - Full CRUD operations for hero data
- **EquipmentRepository**: ✅ Complete - Equipment and crafting data management
- **MissionRepository**: ✅ Complete - Campaign and mission data access
- **Migration Status**: Hero services fully migrated from legacy JSON-based services

#### Database Schema
```sql
-- Core Hero Wars tables
hero: slug (PK), name, faction, main_stat, attack_type, artifact_team_buff
equipment: slug (PK), name, campaign_sources (string[])
mission: slug (PK), name, chapter_id (FK), hero_slug, energy_cost, level
chapter: id (PK), title
```

### Game Data Management

#### Heroes
- Complete hero database with stats, skills, and equipment requirements
- Hero stone source tracking for farming optimization
- Artifact, skin, and glyph management
- JSON export for external tool integration

#### Equipment
- Equipment catalog with stats and crafting requirements
- Campaign mission sources for farming locations
- Gray, green, blue, violet, and orange tier items
- Crafting tree relationships and material tracking

#### Missions
- Campaign chapter and mission data
- Energy cost calculations and requirements
- Equipment drop location mapping
- Boss hero stone rewards tracking

## 🧪 Testing

This project includes comprehensive testing with **Vitest** for unit and integration tests.

### Unit & Integration Testing

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run with coverage report
npm run test:ui       # Run with UI interface
```

### Repository Testing
- Repository tests use Supabase client mocking
- Log capturing pattern prevents console noise during tests
- Comprehensive CRUD operation testing
- Integration tests ready for authentication scenarios

**Testing Strategy:**
- **Unit Tests** - Components, hooks, utilities, repositories
- **Integration Tests** - API routes, auth flows, database operations
- **Mocking** - Supabase client, external APIs
- **Coverage** - Comprehensive test coverage tracking

## 🚀 Deployment

### Netlify Deployment

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Build Process

```bash
npm run build    # Production build
npm run start    # Local preview of production build
```

## 🔧 Development Commands

```bash
npm run tsc              # TypeScript type checking and route generation
npm run supabase:types   # Generate Supabase types from database schema
npm run test             # Run repository tests in watch mode
npm run test:run         # Run repository tests once
npm run test:coverage    # Run tests with coverage report
```

## 🎮 Hero Wars Helper Specific Features

### Hero Management
- View detailed hero information including stats and abilities
- Track hero development progress and stone farming
- Equipment requirement tracking per hero
- Export hero data for external tools

### Equipment System
- Browse complete equipment catalog
- View crafting recipes and material requirements
- Track campaign sources for equipment farming
- Equipment tier progression (gray → orange)

### Mission Planning
- Campaign mission browser with rewards
- Energy cost optimization for farming
- Equipment drop location reference
- Boss hero stone farming guides

### Admin Tools
- Database initialization and data setup
- Import game data from JSON sources
- User role management
- System health monitoring

## 🤖 AI Assistant Integration

This project includes Claude Code workflow commands in `.claude/commands/`:

### Available Commands

- `issue <number>` - Automated issue-to-PR workflow
- `/plan <description of changes to implement>` - Create a markdown file of a detailed plan to implement the described changes
- `continue <plan-file>` - Execute implementation plans with progress tracking

### Usage with Claude Code

1. Install Claude Code CLI
2. Run `claude issue 123` to process GitHub issue #123
3. Use `claude continue @docs/plans/plan.md` for guided implementation

## 📚 Documentation

- **Project Guidelines** - See `CLAUDE.md` for development best practices
- **Game Data Structure** - Hero Wars specific data models and relationships
- **Component Library** - [shadcn/ui documentation](https://ui.shadcn.com/)
- **React Router** - [Official documentation](https://reactrouter.com/)
- **Supabase** - [Authentication guide](https://supabase.com/docs/guides/auth)
- **Tailwind CSS** - [Utility classes](https://tailwindcss.com/docs)
- **Repository Pattern** - BaseRepository implementation for database operations

## 🔒 Security Best Practices

- Environment variables for sensitive data
- Row Level Security (RLS) in Supabase
- Role-based authorization checks
- No hardcoded secrets in codebase
- Secure cookie handling for auth

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes with appropriate tests
3. Run `npm run tsc` to check TypeScript
4. Run `npm run test:run` to verify tests pass
5. Create a pull request with clear description
6. **Never push directly to `main` branch**

### Development Notes

- Follow TDD practices - write tests before implementation
- Use repository pattern for all database operations
- Maintain Hero Wars game data accuracy
- Preserve existing JSON data structure compatibility

## 🎯 Project Status

### Completed Features
- ✅ **Repository Architecture**: Complete BaseRepository implementation
- ✅ **Hero Management**: Full CRUD operations with database integration
- ✅ **Equipment System**: Comprehensive equipment catalog and sources
- ✅ **Mission Browser**: Campaign data with farming optimization
- ✅ **Authentication**: Role-based access control
- ✅ **Admin Tools**: Database setup and user management


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for Hero Wars: Alliance players using React Router, Supabase, and modern web technologies.**

_A comprehensive tool for managing your Hero Wars game progression, hero development, and equipment optimization._