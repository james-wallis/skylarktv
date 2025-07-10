# Airtable Data Relationships & Translation Architecture

## Overview

The Skylark TV project uses a sophisticated Airtable-based data structure with bidirectional relationships and multilingual translation support.

## Core Data Structure

### Main Data Categories

```
airtable_data/
├── dimensions/
│   ├── customerTypes
│   ├── regions
│   └── languages
├── mediaObjects/          # Primary content (movies, episodes, seasons, brands)
├── translations/          # Multilingual content
│   ├── mediaObjects
│   ├── people
│   └── articles
├── genres/
├── themes/
├── tags/
├── people/
├── credits/
├── roles/
├── images/
├── articles/
└── sets/
```

## Translation System Architecture

### Bidirectional Relationship Pattern

The translation system uses a **bidirectional reference pattern** ensuring referential integrity:

#### Main Object → Translations

```javascript
// Main object (English content)
{
  "id": "recUps0Fxi3wowmjX",
  "fields": {
    "title": "TLOU S01E01 - When You're Lost in the Darkness",
    "synopsis": "Joel and his daughter Sarah escape a fungal infection outbreak...",
    "language_code": ["en-GB"],
    "translations": ["rec7PU3OTXEQ6zn4m", "recgNlvRX1gDzSn66"] // References to translation objects
  }
}
```

#### Translation Object → Main Object

```javascript
// Translation object (Portuguese content)
{
  "id": "rec025gHx8yuhF0ox",
  "fields": {
    "title": "Quando você está perdido na escuridão",
    "synopsis": "Joel e sua filha Sarah escapam de um surto de infecção fúngica...",
    "language_code": ["pt-PT"],
    "object": ["recUps0Fxi3wowmjX"], // References back to main object
    "Translation Created": true
  }
}
```

### Key Benefits

1. **Referential Integrity**: Both objects know about each other
2. **Language Isolation**: Each language version maintains its own content
3. **Scalability**: Easy to add new languages
4. **Fallback Support**: Can fallback to main object if translation missing

## Content Relationships

### Media Object Hierarchies

```
Brand (e.g., "Obi-Wan Kenobi")
├── Season (e.g., "Obi-Wan Kenobi - Miniseries")
│   ├── Episode 1 ("Part I")
│   ├── Episode 2 ("Part II")
│   └── Episode 3 ("Part III")
└── Related Content
    ├── Images (thumbnails, posters, character shots)
    ├── Credits (cast, crew with roles)
    ├── Genres (Action, Drama, Sci-Fi)
    ├── Themes (coming-of-age, redemption)
    └── Tags (status, schedule metadata)
```

### Credit System

```javascript
// Complex multi-relationship structure
{
  "credit": {
    "person": ["personId"],      // Who
    "role": ["roleId"],          // What role
    "character": "Obi-Wan",      // Character name
    "mediaContent": ["mediaId"]  // Which content
  }
}
```

## Depth Limiting Architecture

### GraphQL Response Depth Control

The system implements sophisticated depth limiting to prevent over-fetching:

```javascript
convertMediaObjectToGraphQL(obj, currentDepth = 0) {
  // Prevent infinite recursion and over-fetching
  if (currentDepth >= MAX_DEPTH) return null;

  // Nested relationships add depth cost
  const genres = processNestedRelationships(
    fields.genres,
    processor,
    currentDepth,
    1  // Depth cost for this relationship
  );
}
```

### Depth Calculation Examples

- **Root object**: depth 0
- **Direct relationships** (genres, tags): depth 1
- **Nested relationships** (credit → person, credit → role): depth 2
- **Array elements**: No additional depth cost (arrays ≠ nesting)

## Search System Features

### Flexible Text Matching

```javascript
// Handles punctuation differences
normalizeSearchText("Obi-Wan Kenobi"); // → "obi wan kenobi"
normalizeSearchText("obi wan"); // → "obi wan"

// Search "obi wan" successfully finds "Obi-Wan Kenobi"
```

### Search Response Format

```javascript
{
  "search": {
    "total_count": 10,
    "objects": [
      {
        "__typename": "Brand",
        "uid": "reckn2aTQdpCfL6kI",
        "title": "Obi-Wan Kenobi",
        "_context": {
          "typename_highlight": "Brand"  // For UI highlighting
        }
      }
    ]
  }
}
```

## MSW (Mock Service Worker) Integration

### Modular Handler Architecture

```
mocks/
├── airtable/           # Data transformation layer
│   ├── utils.ts        # Type assertions, normalization
│   ├── data.ts         # Data loading, getters
│   ├── media-objects.ts # Media conversions
│   ├── search.ts       # Search functionality
│   └── sets.ts         # Set operations
└── fixtures/           # GraphQL endpoint handlers
    ├── search.ts       # SEARCH query handler
    ├── getBrand.ts     # GET_BRAND handler
    └── getSeason.ts    # GET_SEASON_AND_EPISODES handler
```

## Key Technical Patterns

### 1. Type Safety with Runtime Assertions

```javascript
const assertString = (value) => (typeof value === "string" ? value : null);
const assertSingleString = (value) =>
  Array.isArray(value) ? assertString(value[0]) : assertString(value);
```

### 2. Flexible Field Processing

```javascript
// Handles both single values and arrays
const processNestedRelationships = (
  relationshipIds,
  processor,
  depth,
  cost,
) => {
  let idsArray = Array.isArray(relationshipIds)
    ? relationshipIds
    : [relationshipIds];

  return idsArray.map(processor).filter(Boolean);
};
```

### 3. Depth-Aware Processing

```javascript
// Each relationship type knows its depth cost
const credits = processNestedRelationships(
  fields.credits,
  creditProcessor,
  currentDepth,
  1, // Credits add 1 to depth
);

const people = processNestedRelationships(
  credit.fields.person,
  personProcessor,
  currentDepth,
  2, // Credit → Person adds 2 to depth
);
```

## Performance Considerations

1. **Depth Limiting**: Prevents infinite recursion and over-fetching
2. **Lazy Loading**: Only fetch relationships when needed
3. **Type Caching**: Efficient object type checking
4. **Search Normalization**: Pre-process text for faster matching
5. **Modular Architecture**: Split large files for better maintainability

## Future Extensibility

The architecture supports:

- **Additional Languages**: Just add new translation objects
- **New Content Types**: Follow existing relationship patterns
- **Complex Queries**: Depth limiting scales to deep object graphs
- **Search Enhancement**: Pluggable text processing pipeline
- **API Evolution**: Modular handlers adapt to schema changes

This architecture demonstrates enterprise-level data modeling with proper separation of concerns, type safety, and internationalization support.
