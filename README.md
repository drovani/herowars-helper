# Inavord React Router Template

A modern, production-ready template for building full-stack React applications with authentication, authorization, and comprehensive testing. Built with React Router v7, Supabase, Tailwind CSS v4, and deployed on Netlify.

## 🚀 Features

### Core Technologies

- **React Router v7** - File-based routing with SSR support
- **Supabase** - Authentication, authorization, and database
- **Tailwind CSS v4** - Modern utility-first styling with CSS variables
- **TypeScript** - Strict type safety throughout
- **Vite** - Fast build tooling and HMR
- **Netlify** - Production deployment with serverless functions

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
- Framer Motion animations

### Developer Experience

- **Comprehensive Testing** - Vitest with React Testing Library
- **TypeScript Strict Mode** - No `any` types allowed
- **Automated Type Generation** - Supabase types and route types
- **Claude Code Integration** - AI assistant workflow commands
- **Linting & Formatting** - ESLint and Prettier configured

## 📋 Prerequisites

- **Node.js** >= 22.12.0
- **npm** or **yarn**
- **Supabase** account (for authentication and database)
- **Netlify** account (for deployment)

## 🛠️ Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

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

To assign the first admin user, run this SQL in your Supabase Dashboard:

```sql
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'),
  '{roles}',
  '["admin"]'
)
WHERE email = 'your-email@example.com';
```

## 🏗️ Architecture

### Project Structure

```
app/
├── components/ui/        # shadcn/ui components
├── contexts/            # React contexts (Auth, etc.)
├── data/               # Static data and navigation
├── hooks/              # Custom React hooks
├── layouts/            # Route layouts (Protected, Admin, etc.)
├── lib/                # Utilities and configurations
├── routes/             # File-based routing (see Route Organization below)
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
    │   ├── login.tsx              # /login
    │   ├── sign-up.tsx            # /sign-up
    │   ├── confirm.tsx            # /auth/confirm
    │   ├── error.tsx              # /auth/error
    │   ├── forgot-password.tsx    # /forgot-password
    │   └── update-password.tsx    # /update-password
    ├── admin/              # Admin interface (requires admin role)
    │   ├── index.tsx              # /admin/* (dashboard)
    │   ├── users.tsx              # /admin/users
    │   ├── setup.tsx              # /admin/setup
    │   └── test-coverage.tsx      # /admin/test-coverage
    ├── account/            # User account pages
    │   ├── index.tsx              # /account (main account page)
    │   └── profile.tsx            # /account (nested index route)
    └── public/             # Public pages
        ├── index.tsx              # / (home page)
        ├── logout.tsx             # /logout
        └── protected.tsx          # /protected
```

#### Route Organization Benefits

- **🎯 Feature Grouping**: Related routes are co-located (all auth routes in `auth/`)
- **🔌 Resource Separation**: API routes separated from UI routes for clarity
- **📈 Scalability**: Supports growth from 17 to 100+ routes without chaos
- **🧭 Predictable Locations**: Developers know exactly where to find route files
- **⚡ Performance**: Easier code splitting and lazy loading implementation

#### Route Configuration

All routes are centrally configured in `app/routes.ts` with URL preservation:

- **URLs Unchanged**: All existing URLs maintained during reorganization
- **Layout Nesting**: Admin routes use `ProtectedAdminLayout`, user routes use `ProtectedUserLayout`
- **Type Safety**: React Router v7 auto-generates route types for each file

### Authentication Flow

1. **Public Routes** - Landing, login, signup, password reset
2. **Protected Routes** - Require authentication
3. **Admin Routes** - Require admin role
4. **Role Management** - Centralized role checking and assignment

### Data Layer

- **Supabase Client** - SSR-compatible configuration
- **Type Safety** - Auto-generated types from database schema
- **Repository Pattern** - Structured data access (extensible)

## 🧪 Testing

This project includes comprehensive testing with **Vitest** for unit/integration tests and **Playwright** for end-to-end testing.

### Unit & Integration Testing

```bash
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run with coverage report
npm run test:ui       # Run with UI interface
```

**Testing Strategy:**
- **Unit Tests** - Components, hooks, utilities
- **Integration Tests** - API routes, auth flows
- **Mocking** - Supabase client, external APIs
- **Coverage** - Comprehensive test coverage tracking

### End-to-End Testing (Playwright)

```bash
npm run e2e           # Run all e2e tests
npm run e2e:headed    # Run tests with browser UI visible
npm run e2e:debug     # Run tests in debug mode (step through)
npm run e2e:ui        # Run tests with Playwright UI
npm run e2e:report    # View test results report
```

**E2E Testing Features:**
- **DOM Snapshots** - Automatic HTML and screenshot capture
- **Console Error Tracking** - Monitor browser console messages and errors
- **Debug Reports** - Comprehensive JSON reports with debugging data
- **Network Monitoring** - Wait for async operations and network idle states
- **Responsive Testing** - Test across different viewport sizes and devices
- **Multi-Browser Support** - Chrome, Firefox, Safari, Mobile (Pixel 7, iPhone 15)

**Debugging UI Issues:**
When encountering UI problems or regressions:

1. **See it live**: `npm run e2e:headed` - Watch tests run in real browser
2. **Step through**: `npm run e2e:debug` - Interactive debugging with breakpoints
3. **Check console**: Review `playwright-report/debug-reports/` for JavaScript errors
4. **Compare DOM**: Analyze `playwright-report/snapshots/` for HTML structure changes
5. **Test responsive**: Verify UI works across different screen sizes

**Example Debug Usage:**
```typescript
import { createDebugHelper } from './e2e/utils/debug-helpers';

test('debug UI issue', async ({ page }) => {
  const debug = createDebugHelper(page, 'issue-name');
  
  await page.goto('/problematic-page');
  await debug.takeDOMSnapshot('initial-state');
  await debug.waitForNetworkIdle();
  await debug.logPageState();
  await debug.assertNoConsoleErrors();
  await debug.generateDebugReport();
});
```

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
npm run tsc              # TypeScript type checking
npm run supabase:types   # Generate Supabase types
```

## 🤖 AI Assistant Integration

This project includes Claude Code workflow commands in `.claude/commands/`:

### Available Commands

- `issue <number>` - Automated issue-to-PR workflow

### Usage with Claude Code

1. Install Claude Code CLI
2. Run `claude issue 123` to process GitHub issue #123
3. Follow the automated workflow for implementation

## 📚 Documentation

- **Project Guidelines** - See `CLAUDE.md` for development best practices
- **Component Library** - [shadcn/ui documentation](https://ui.shadcn.com/)
- **React Router** - [Official documentation](https://reactrouter.com/)
- **Supabase** - [Authentication guide](https://supabase.com/docs/guides/auth)
- **Tailwind CSS** - [Utility classes](https://tailwindcss.com/docs)

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React Router, Supabase, and modern web technologies.**

_This template is designed to be a solid foundation for full-stack React applications with authentication, testing, and deployment ready out of the box._
