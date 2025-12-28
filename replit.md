# replit.md

## Overview

This is a browser-based skiing/snowboarding game built with React and HTML5 Canvas. Players navigate down a procedurally generated slope, avoiding obstacles while accumulating score based on distance traveled. The game features smooth animations, a day/night cycle, and a persistent high score leaderboard stored in PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Animations**: Framer Motion for UI transitions
- **Game Rendering**: HTML5 Canvas API with `requestAnimationFrame` for 60fps gameplay

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Build Tool**: Vite for frontend, esbuild for server bundling
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for validation

### Data Storage
- **Database**: PostgreSQL via `node-postgres` (pg)
- **ORM**: Drizzle ORM with Drizzle-Zod for schema validation
- **Schema Location**: `shared/schema.ts` contains table definitions
- **Migrations**: Drizzle-kit for database migrations (`npm run db:push`)

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components (shadcn/ui)
    game/         # Game engine logic (engine.ts)
    hooks/        # Custom React hooks
    pages/        # Route pages
    lib/          # Utilities
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route handlers
  storage.ts      # Database access layer
  db.ts           # Database connection
shared/           # Shared between client/server
  schema.ts       # Drizzle schema definitions
  routes.ts       # API contract definitions
```

### Key Design Decisions

1. **Shared Type Safety**: The `shared/` directory contains both database schema and API route definitions, ensuring type consistency between frontend and backend.

2. **Canvas-Based Game Engine**: Game logic is separated from React in `client/src/game/engine.ts`, allowing the game loop to run independently of React's render cycle.

3. **Component Library**: Using shadcn/ui provides accessible, customizable components without external dependencies, as components are copied directly into the codebase.

4. **API Validation**: Zod schemas in `shared/routes.ts` validate both request inputs and response shapes, with the same schemas used on client and server.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage (available but sessions may not be implemented yet)

### Frontend Libraries
- **@tanstack/react-query**: Async state management and caching
- **framer-motion**: Animation library for smooth UI transitions
- **lucide-react**: Icon library
- **Radix UI**: Headless component primitives (accordion, dialog, dropdown, etc.)

### Development Tools
- **Vite**: Frontend dev server with HMR
- **Replit Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer` for enhanced Replit integration

### Build Configuration
- Frontend builds to `dist/public/`
- Server bundles to `dist/index.cjs`
- TypeScript paths: `@/` maps to `client/src/`, `@shared/` maps to `shared/`