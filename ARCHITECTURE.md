# Mark1 Project Architecture

## Overview

Mark1 is a modular application built with Next.js, featuring a clear separation of concerns and module boundaries. The application follows a structured approach to organizing code, with specific patterns for cross-module communication.

## Directory Structure

```
src/
├── app/                     # App Router (UI components)
│   ├── (modules)/           # Route group for feature modules
│   │   ├── todos/           # Todo module
│   │   ├── content-mgmt/    # Content management module
│   │   ├── strategy/        # Strategy module
│   │   └── layout.tsx       # Shared layout for all modules
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Root page (redirects to /todos)
├── components/
│   └── shared/              # Shared components used across modules
├── lib/                     # Shared utilities and services
│   └── supabase.ts          # Supabase client utilities
└── pages/                   # Pages Router (API only)
    └── api/                 # API routes
        └── todos/           # Todo API endpoints
```

## Module Structure

Each module follows this structure:

```
(modules)/module-name/
├── components/              # Module-specific components
├── contexts/                # Module-specific context providers (optional)
├── hooks/                   # Module-specific hooks (optional)
├── utils/                   # Module-specific utilities (optional)
├── page.tsx                 # Main module page
└── [other routes].tsx       # Other routes within the module
```

## Architecture Rules

1. **Module Boundaries**: Modules cannot import directly from other modules. All cross-module communication must be done via API calls or context providers.

2. **Router Usage**:
   - Pages Router (`/pages/*`) is used exclusively for API routes.
   - App Router (`/app/*`) is used for all UI features.

3. **Database Operations**: All database operations must be performed in API routes, not directly in UI components. This ensures a clean separation between frontend and backend logic.

4. **Shared Components**: Components that need to be used across multiple modules should be placed in `/components/shared/*`.

5. **Context Providers**: For state that needs to be shared across modules, use context providers in the appropriate layout file.

## Communication Patterns

### Between Modules

Modules communicate with each other in the following ways:

1. **API Calls**: The primary method for data exchange between modules is through API calls.

   ```typescript
   // Example: Module A fetching data from Module B
   const response = await fetch('/api/module-b/resource');
   const data = await response.json();
   ```

2. **Context Providers**: For UI state that needs to be shared, use context providers in the parent layout.

   ```typescript
   // Example: Shared context in layout.tsx
   <SharedStateProvider>
     {children}
   </SharedStateProvider>
   ```

### Within Modules

Within a module, components can import directly from each other:

```typescript
// Module-internal imports are allowed
import { ModuleComponent } from './components/ModuleComponent';
```

## Development Guidelines

1. **Adding New Features**:
   - Identify which module the feature belongs to
   - Add components, routes, and API endpoints as needed
   - Respect module boundaries
   - Use path aliases for imports: `@/components/*`, `@/lib/*`, etc.

2. **Cross-Module Features**:
   - Add shared components to `/components/shared/*`
   - Add shared utilities to `/lib/*`
   - Implement API endpoints for data exchange

3. **Database Access**:
   - All database operations should be in API routes
   - Use the Supabase client from `@/lib/supabase` for database access

## Deployment

The application is deployed on Vercel, with environment variables configured there. No local environment setup is required for development, as all changes are tested directly in the Vercel deployment.

Database is managed through Supabase, with the connection details stored in Vercel environment variables. 