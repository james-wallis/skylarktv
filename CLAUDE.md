# SkylarkTV Project Context for Claude

## Project Overview

SkylarkTV is a streaming TV application built by Ostmodern that connects to Skylark (a headless CMS/content management platform). The project consists of two main packages:

1. **skylarktv** - The main Next.js streaming application
2. **ingestor** - A tool that ingests data from legacy systems into Skylark and adds additional schema fields

## Key Technologies & Architecture

- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query (@tanstack/react-query)
- **GraphQL**: graphql-request for API calls
- **Mocking**: MSW (Mock Service Worker) for development/testing
- **Backend**: Skylark headless CMS
- **Build Tool**: Yarn workspaces

## Important Commands

```bash
# TypeScript checking
yarn tsc:skylarktv
yarn tsc:ingestor
yarn tsc:all

# Linting
yarn lint:skylarktv
yarn lint:ingestor
yarn lint:all

# Testing
yarn test:skylarktv
yarn test:ingestor
yarn test:all
yarn test:ci

# Development
cd packages/skylarktv && yarn dev
```

## Core Concepts

### Skylark Platform

- **Skylark** is a headless CMS that manages content objects (Movies, Episodes, Seasons, Brands, etc.)
- **SkylarkTV** is the frontend streaming application that consumes this content
- **Ingestor** adds additional schema fields and migrates legacy data

### Content Types

- **Movie**: Individual films with budget, audience_rating fields
- **Episode**: Individual episodes with audience_rating, episode_number
- **Season**: Collections of episodes with preferred_image_type, season_number
- **Brand**: Top-level content groupings (like TV series)
- **SkylarkSet**: Content collections (rails, sliders, pages)
- **LiveStream**: Live streaming content
- **Article**: Editorial content

### Additional Schema Fields (SkylarkTVAdditionalFields)

These are added by the ingestor and detected by the app:

- `preferred_image_type`: For optimized image display
- `audience_rating`: Content ratings (numeric)
- `budget`: Movie budgets (numeric)

## Project Structure

```
packages/
├── skylarktv/                    # Main streaming app
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── mocks/               # MSW mocking system
│   │   │   ├── fixtures/        # Mock API handlers
│   │   │   └── airtable/        # Airtable data parsing
│   │   ├── graphql/queries/     # GraphQL queries
│   │   ├── types/               # TypeScript types
│   │   └── pages/               # Next.js pages
│   └── claude/                  # Claude documentation
└── ingestor/                    # Data ingestion tool
```

## MSW Mocking System

The app uses MSW to mock the Skylark API during development. Key files:

### Mock Data Flow

1. **Data Source**: `skylark_airtable_data.json` - Contains mock Airtable data
2. **Parsing**: `mocks/airtable/parse-media-objects.ts` - Converts to GraphQL format
3. **Handlers**: `mocks/fixtures/*.ts` - MSW request handlers
4. **Utilities**: `mocks/airtable/utils.ts` - Common parsing utilities

### Key Utility Functions

- `findObjectByUidOrExternalId()`: Standard object lookup by ID
- `createGraphQLResponse()`: Standardized response wrapper
- `extractRequestContext()`: Gets language, dimensions, time travel from headers
- `filterContentByAvailability()`: Content filtering by availability rules

## Availability System

Skylark has a sophisticated availability system:

### Core Concepts

- **Availability Records**: Define when/where content is accessible
- **Dimensions**: Customer types, device types, regions
- **Time Travel**: View content availability at specific points in time
- **Dynamic Dates**: Special slugs like "active-next-sunday"

### Implementation

- `x-time-travel` header: ISO date for time-based filtering
- `x-skylark-availability-dimensions`: JSON object with dimension filters
- Availability filtering happens in `filterContentByAvailability()`

### Special Availability Slugs

- `active-next-sunday`: Content active until next Sunday
- `active-until-next-sunday`: Content active from next Sunday
- Dynamic date computation in `computeDynamicDates()`

## GraphQL Integration

### Key Queries

- `GET_SKYLARK_ENVIRONMENT`: Checks for ingestor schema fields
- `GET_SEASON_AND_EPISODES`: Season with episodes
- `GET_BRAND`: Brand with seasons and episodes
- `GET_MOVIE_THUMBNAIL`: Movie metadata
- `GET_EPISODE_THUMBNAIL`: Episode metadata

### Environment Detection

The `useSkylarkEnvironment` hook checks:

- `hasUpdatedSeason`: If Season has `preferred_image_type` field
- `hasStreamTVConfig`/`hasAppConfig`: Available object types

## Refactoring Patterns

The codebase has been extensively refactored to reduce duplication:

### Utility Creation

- **Media Object Utils**: `fetchAndParseMediaObject()`, `findChildObjects()`
- **GraphQL Utils**: `createGraphQLResponse()`, `createListByMetadataHandler()`
- **Set Utils**: `createSetHandler()` for SkylarkSet queries
- **Object Lookup**: `findObjectByUidOrExternalId()` for consistent ID matching

### ID Matching Pattern

Standard pattern for finding objects by uid or externalId:

```typescript
const obj = findObjectByUidOrExternalId(collection, variables);
// Checks: obj.id === uid || obj.id === externalId || obj.fields.external_id === externalId
```

## Important Files to Know

### Configuration

- `packages/skylarktv/src/constants/env.ts` - Environment config
- `packages/skylarktv/package.json` - Dependencies and scripts

### Types

- `packages/skylarktv/src/types/gql.ts` - Generated GraphQL types
- `packages/skylarktv/src/types/extendedGql.ts` - Additional SkylarkTV types

### Mock System

- `packages/skylarktv/src/mocks/skylark_airtable_data.json` - Mock data
- `packages/skylarktv/src/mocks/airtable/` - Data parsing and utilities
- `packages/skylarktv/src/mocks/fixtures/` - MSW handlers

### Key Documentation

- `packages/skylarktv/claude/key-learnings/` - Detailed system documentation
- Previous docs: `understanding-availability-4.md`

## Development Workflow

1. **Make Changes**: Edit source files in `packages/skylarktv/src/`
2. **Check Types**: Run `yarn tsc:skylarktv`
3. **Check Linting**: Run `yarn lint:skylarktv`
4. **Test**: Run `yarn test:skylarktv`
5. **Commit**: Never commit unless explicitly asked

## Common Issues & Solutions

### TypeScript Errors

- Missing imports: Check if utilities are exported from `airtable/index.ts`
- Type mismatches: Use proper assertion functions (`assertString`, `assertNumber`)
- Any types: Provide proper typing with interfaces

### MSW Handler Issues

- Use `createGraphQLResponse()` for consistent responses
- Extract request context with `extractRequestContext()`
- Handle availability filtering when dimensions are provided

### Object Lookup Issues

- Always use `findObjectByUidOrExternalId()` utility
- Check all three ID patterns: uid, externalId, external_id field

## API Documentation

- **Skylark Platform API**: https://docs.skylarkplatform.com
- Official documentation for Skylark CMS GraphQL API, object types, and platform features

## Getting Help

- Check existing documentation in `claude/key-learnings/`
- Reference Skylark API docs at https://docs.skylarkplatform.com
- Use search tools (Grep, Glob) to find patterns in codebase
- Look at similar implementations in other fixture files
- Follow established refactoring patterns and utilities
