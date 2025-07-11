# SkylarkTV Project Overview & Learnings

_Last updated: 2025-07-10 10:30 UTC_

## Project Summary

SkylarkTV is a sophisticated streaming platform built with Next.js that uses Airtable as a content management system and Mock Service Worker (MSW) for development/testing. The project demonstrates enterprise-level architecture with advanced features like multilingual content, complex data relationships, and flexible search capabilities.

## Technology Stack

### Core Technologies

- **Frontend**: Next.js 15.1.0 with React
- **Language**: TypeScript with strict type checking
- **Styling**: CSS-in-JS with global styles
- **API Layer**: GraphQL with `graphql-request`
- **Mocking**: Mock Service Worker (MSW) for API simulation
- **Content Management**: Airtable with custom data modeling
- **Internationalization**: `next-translate` for multi-language support
- **Build Tools**: Yarn workspaces, ESLint, Prettier

### Development Environment

- **Monorepo Structure**: Uses Lerna/Yarn workspaces
- **Code Generation**: GraphQL codegen for type safety
- **Testing**: Jest configuration present
- **CI/CD**: Codecov integration for coverage
- **Package Management**: Yarn with lock file

## Architecture Highlights

### 1. Modular MSW Architecture

The project uses a sophisticated MSW setup that was **refactored from a monolithic 2000+ line file** into a clean modular structure:

```
src/mocks/
├── airtable/           # Data transformation layer
│   ├── index.ts        # Re-exports for backward compatibility
│   ├── utils.ts        # Type assertions & utilities
│   ├── data.ts         # Data loading & getters
│   ├── media-objects.ts # Media object conversions
│   ├── search.ts       # Search functionality
│   ├── sets.ts         # Set operations
│   └── dynamic-content.ts # Dynamic content rules
└── fixtures/           # GraphQL endpoint handlers
    ├── search.ts       # SEARCH query
    ├── getBrand.ts     # Brand queries
    ├── getSeason.ts    # Season & episode queries
    └── [other endpoints]
```

### 2. Advanced Data Relationships

- **Bidirectional References**: Main objects ↔ translations
- **Hierarchical Content**: Brands → Seasons → Episodes
- **Complex Credits**: Person + Role + Character mappings
- **Rich Metadata**: Genres, themes, tags, images, ratings

### 3. GraphQL Depth Limiting

Implements sophisticated depth control to prevent over-fetching:

- **Root objects**: depth 0
- **Direct relationships**: depth 1
- **Nested relationships**: depth 2+
- **Arrays don't add depth** (elements vs nesting distinction)

### 4. Multilingual Translation System

- **Language Isolation**: Each language has its own content
- **Referential Integrity**: Bidirectional object relationships
- **Fallback Support**: Can default to main language
- **Scalable**: Easy to add new languages

## Key Technical Achievements

### 1. Type Safety Implementation

- **Runtime Type Assertions**: `assertString`, `assertNumber`, `assertSingleString`
- **Airtable Integration**: Proper TypeScript types for Airtable records
- **GraphQL Types**: Auto-generated types from schema
- **Strict Mode**: All TypeScript strict checks enabled

### 2. Advanced Search Capabilities

- **Flexible Text Matching**: Handles punctuation differences ("obi wan" finds "Obi-Wan")
- **Text Normalization**: Strips punctuation, normalizes spacing
- **Multi-field Search**: Searches titles, synopses, descriptions
- **Highlighted Results**: Returns search term highlighting
- **Cross-content Search**: Media objects, articles, people

### 3. Performance Optimizations

- **Depth Limiting**: Prevents infinite recursion
- **Modular Loading**: Split large files for better performance
- **Type Caching**: Efficient object type checking
- **Lazy Evaluation**: Only process needed relationships

### 4. Developer Experience

- **Hot Reloading**: MSW integration with Next.js dev server
- **Type Generation**: Automated GraphQL type generation
- **Modular Architecture**: Easy to understand and maintain
- **Comprehensive Logging**: Console output for debugging

## Development Workflow Insights

### Code Quality Standards

- **ESLint Rules**: Strict linting with custom rules
- **No Console Logs**: Production builds fail on console statements
- **Import Organization**: Clean import structure
- **Consistent Formatting**: Prettier integration

### Build Process

- **CSS Generation**: Automated global CSS compilation
- **Type Checking**: Full TypeScript validation
- **Asset Optimization**: Next.js production optimization
- **Static Generation**: Pre-rendered pages where possible

### Testing Strategy

- **Mock Data**: Comprehensive Airtable data simulation
- **GraphQL Mocking**: MSW handlers for all endpoints
- **Type Safety**: Runtime assertions prevent data corruption
- **Integration Testing**: Full request/response cycle testing

## Problem-Solving Examples

### 1. Depth Limiting Bug Fix

**Problem**: Season rails only showing 2 episodes instead of all episodes
**Root Cause**: Depth limiting was incorrectly treating array elements as nested objects
**Solution**: Distinguished between object nesting (adds depth) and array iteration (no depth cost)

### 2. Search Functionality Issues

**Problem**: Search for "obi wan" returned no results despite having "Obi-Wan Kenobi" content
**Root Cause**: Exact string matching couldn't handle punctuation differences
**Solution**: Implemented text normalization and flexible matching

### 3. Large File Refactoring

**Problem**: Single 2000+ line file was unmaintainable
**Root Cause**: Monolithic architecture made changes difficult
**Solution**: Split into logical modules with clear separation of concerns

### 4. Type Safety Implementation

**Problem**: Airtable data had inconsistent types (arrays vs single values)
**Root Cause**: Airtable fields can be arrays or single values depending on relationships
**Solution**: Created type assertion utilities to handle both cases safely

## Current Project State

### Working Features

- ✅ **Search**: Flexible text search across all content types
- ✅ **Content Browsing**: Movies, episodes, seasons, brands
- ✅ **Multilingual Support**: Translation system in place
- ✅ **Image Handling**: Multiple image types and URLs
- ✅ **Complex Relationships**: Credits, genres, themes, tags
- ✅ **Depth Limiting**: Proper GraphQL response control

### Architecture Quality

- ✅ **Modular Design**: Clean separation of concerns
- ✅ **Type Safety**: Comprehensive TypeScript coverage
- ✅ **Performance**: Optimized data fetching and processing
- ✅ **Maintainability**: Easy to understand and extend
- ✅ **Developer Experience**: Good tooling and debugging

### Build & Deployment

- ✅ **Clean Builds**: Successfully compiles with only console.log warnings
- ✅ **Type Checking**: No TypeScript errors
- ✅ **Static Generation**: 29 pages pre-rendered
- ✅ **Asset Optimization**: Proper Next.js optimization

## Future Opportunities

### Potential Enhancements

1. **Translation API Integration**: Dynamic language switching in UI
2. **Advanced Search**: Faceted search, filters, sorting
3. **Performance Monitoring**: Real user metrics and optimization
4. **Content Recommendations**: AI-powered content suggestions
5. **Real-time Updates**: Live content updates from Airtable
6. **Advanced Analytics**: User behavior tracking and insights

### Technical Debt Reduction

1. **Console Logging**: Remove remaining console statements
2. **Error Handling**: More robust error boundaries
3. **Testing Coverage**: Expand test suite
4. **Documentation**: API documentation and guides
5. **Performance Profiling**: Identify and fix bottlenecks

## Lessons Learned

### Architecture Decisions

- **Modular over Monolithic**: Breaking large files into focused modules significantly improves maintainability
- **Type Safety First**: Runtime type checking prevents many production issues
- **Flexible Data Handling**: Supporting both array and single value fields makes the system more robust
- **Depth Control**: Proper depth limiting is crucial for GraphQL performance

### Development Practices

- **Incremental Refactoring**: Large architectural changes should be done in small, testable steps
- **Test-Driven Debugging**: Create minimal test cases to isolate and fix bugs
- **Documentation**: Keeping architectural decisions documented helps future development
- **Tool Integration**: Proper ESLint, TypeScript, and build tool configuration saves time

### Data Modeling Insights

- **Bidirectional Relationships**: Make data integrity easier to maintain
- **Translation Isolation**: Keeping languages separate provides flexibility
- **Hierarchical Organization**: Clear parent-child relationships simplify queries
- **Metadata Rich**: Comprehensive tagging and categorization enables powerful features

This project demonstrates how to build a sophisticated, enterprise-level streaming platform with modern web technologies, proper architecture, and attention to developer experience.
