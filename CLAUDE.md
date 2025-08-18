# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HQ is a monorepo system for life control built with:
- **Backend (The Grid)**: Hono framework with TypeScript, PostgreSQL via Drizzle ORM
- **Frontend (The Horizon)**: Next.js 14 with App Router, React, Tailwind CSS
- **Shared (The Core)**: Common types and utilities
- **Architecture**: Domain-driven design with service registry pattern

## Essential Commands

### Development
```bash
# Run all packages in development mode
npm run dev

# Run specific packages
npm run api:dev          # Backend only (Grid)
npm run frontend:dev     # Frontend only (Horizon)

# Individual package commands
npm run dev --workspace=packages/thegrid      # Backend
npm run dev --workspace=packages/thehorizon   # Frontend
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode for debugging
npm run test:ui

# Run specific test files
npm run test -- path/to/file.test.ts

# Test memory systems
npm run test:memory --workspace=packages/thegrid
```

### Type Checking & Linting
```bash
# Type check all packages
npm run type-check

# Lint code (automatically fixes when possible)
npm run lint

# Full check (type-check + lint)
npm run check
```

### Database Operations
```bash
# Generate migrations from schema changes
npm run db:generate --workspace=packages/thegrid

# Apply migrations to database
npm run db:migrate --workspace=packages/thegrid

# Push schema changes directly (dev only)
npm run db:push --workspace=packages/thegrid

# Open database studio
npm run db:studio --workspace=packages/thegrid
```

### Build & Deploy
```bash
# Build all packages
npm run build

# Build specific packages
npm run build:thegrid
npm run build:thehorizon
```

## Architecture Patterns

### Service Registry Pattern
All services in The Grid use a centralized registry for dependency injection:
- Services are registered in `src/services/registry.ts`
- Access services via `registry.get('serviceName')`
- Lazy loading prevents circular dependencies
- Enables easy mocking for tests

### Domain Structure
The Grid follows domain-driven design:
- `src/domains/ai/` - AI services (LLM, conversation, memory)
- `src/domains/workflow/` - Pipelines, approvals, signals
- `src/domains/integration/` - External APIs (Storyblok, GitHub, AWS)
- `src/domains/communication/` - Notifications, Slack, audio

### Database Schema Guidelines
**Critical**: Follow these rules strictly:
- **Database schemas**: Use Drizzle ORM exclusively
- **NEVER convert Drizzle schemas to Zod**
- **Validation schemas**: Use Zod for API/service boundaries only
- Keep database and validation concerns separate

### Testing Strategy
- **Unit tests**: Vitest with jsdom environment
- **Test location**: Co-located with source files (`.test.ts`)
- **AI evaluation**: Evalite framework for agent testing
- **Coverage**: Full V8 coverage reporting

## Key Technologies

### Backend (The Grid)
- **Framework**: Hono (lightweight web framework)
- **Database**: PostgreSQL with Drizzle ORM
- **AI Services**: OpenAI, Anthropic, Google Gemini, OpenRouter
- **Vector DB**: Qdrant for memory storage
- **Validation**: Zod schemas for runtime validation
- **Logging**: Pino logger

### Frontend (The Horizon)
- **Framework**: Next.js 14 with App Router
- **UI Components**: Radix UI primitives + custom components
- **State Management**: Jotai atoms
- **Styling**: Tailwind CSS with custom theme
- **Data Fetching**: TanStack Query

### AI Agent System
Multiple specialized agents in `src/agent/`:
- `FigmaToStoryblokAgent` - Converts Figma designs to Storyblok
- `IRFArchitectAgent` - Manages IRF (Intermediate Representation Format)
- `StoryblokEditorAgent` - Edits Storyblok content
- `ResearchAgent` - Web research and analysis

## Development Workflow

### Adding New Features
1. Create domain service in appropriate directory
2. Register service in the service registry
3. Add Zod validation schemas for API boundaries
4. Write unit tests alongside implementation
5. Update frontend to consume new endpoints

### Working with AI Agents
1. Agents are in `src/agent/factories/`
2. Each agent has tools in its `tools/` directory
3. Use the Agent base class for new agents
4. Test with Evalite framework

### Database Changes
1. Modify Drizzle schema in `src/db/schema/`
2. Run `npm run db:generate` to create migration
3. Review generated SQL in `drizzle/` directory
4. Apply with `npm run db:migrate`

## Environment Setup

Environment variables are defined in `packages/thegrid/src/config.env.ts` using Zod validation.

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - For Claude AI
- `OPENAI_API_KEY` - For GPT models
- `OPENROUTER_API_KEY` - For OpenRouter LLM access
- `ELEVENLABS_API_KEY` - For ElevenLabs text-to-speech
- `LEONARDOAI_API_KEY` - For LeonardoAI image generation
- `FIGMA_API_KEY` - For Figma integration
- `GEMINI_API_KEY` - For Google Gemini AI
- `X_API_KEY` - For X (Twitter) API access
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` - For AWS S3 storage
- `AWS_REGION` - AWS region configuration
- `S3_BUCKET_NAME` - S3 bucket for file storage
- `QDRANT__SERVICE__URL` - Qdrant vector database URL

### Optional Variables
- `NODE_ENV` - Environment mode (development/production/test, default: development)
- `PORT` - Server port (default: 3000)
- `LOG_LEVEL` - Logging level (default: info)
- `TODOIST_API_TOKEN` - For Todoist integration
- `FIRECRAWL_API_KEY` - For web scraping
- `GITHUB_TOKEN` - For GitHub API access
- `HQ_SLACK_SECRET` - For Slack integration
- `SLACK_BOT_URL` - Slack bot webhook URL
- `STORYBLOK_OAUTH_TOKEN` - Storyblok OAuth token
- `STORYBLOK_ACCESS_TOKEN` - Storyblok access token
- `QDRANT__SERVICE__PORT` - Qdrant port (default: 443)
- `QDRANT__SERVICE__API_KEY` - Qdrant API key (optional)
- `LANGFUSE_SECRET_KEY` - LLM observability secret key
- `LANGFUSE_PUBLIC_KEY` - LLM observability public key
- `LANGFUSE_BASE_URL` - Langfuse URL (default: https://cloud.langfuse.com)
- `LANGFUSE_ENABLED` - Enable Langfuse (default: true)
- `LANGFUSE_FLUSH_AT` - Batch size for Langfuse (default: 1)
- `LANGFUSE_FLUSH_INTERVAL` - Flush interval in ms (default: 1000)

See `.env.example` for a template configuration file.

## Code Style

- TypeScript strict mode enabled
- ESLint + Prettier configured
- Unused variables prefixed with underscore
- No unnecessary comments unless explicitly needed
- Follow existing patterns in neighboring files

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
