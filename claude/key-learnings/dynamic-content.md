# Dynamic Content in Skylark

## Overview

Dynamic content in Skylark is a powerful feature that allows sets to automatically populate their content based on rules and relationships rather than manually curated lists. Instead of hard-coding specific content items, sets can define criteria that dynamically query and filter content at runtime.

## How Dynamic Content Works

### Data Structure

Dynamic content is stored as JSON in Airtable set records under the `dynamic_content` or `Dynamic Content` field:

```json
{
  "dynamic_content_types": ["Episode"],
  "dynamic_content_rules": [
    [
      {
        "object_types": ["Episode"],
        "uid": null,
        "relationship_name": null
      },
      {
        "object_types": ["Season"],
        "uid": null,
        "relationship_name": "seasons"
      },
      {
        "object_types": ["Brand"],
        "uid": ["reculg97iNzbkEZCK"],
        "relationship_name": "brands"
      }
    ]
  ]
}
```

### Key Components

#### 1. Dynamic Content Types

- **Purpose**: Defines what type of objects the set should contain
- **Example**: `["Episode"]` means the set will contain episodes
- **Supported Types**: Episode, Movie, Season, Brand, etc.

#### 2. Dynamic Content Rules

- **Structure**: Array of rule chains (AND logic within chains, OR logic between chains)
- **Execution**: Each rule chain is evaluated independently, results are combined
- **Logic**: Rules within a chain must ALL match (AND), but only ONE chain needs to match (OR)

#### 3. Rule Structure

Each rule contains:

- **object_types**: What type of object this rule applies to
- **uid**: Specific object ID(s) to match (null = any object of this type)
- **relationship_name**: The relationship field to follow (null = base object)

## Rule Chain Examples

### Example 1: Game of Thrones Highest Rated Episodes

```json
{
  "dynamic_content_types": ["Episode"],
  "dynamic_content_rules": [
    [
      { "object_types": ["Episode"], "uid": null, "relationship_name": null },
      {
        "object_types": ["Season"],
        "uid": null,
        "relationship_name": "seasons"
      },
      {
        "object_types": ["Brand"],
        "uid": ["reculg97iNzbkEZCK"],
        "relationship_name": "brands"
      }
    ]
  ]
}
```

**Translation**: Find all Episodes → that belong to any Season → that belongs to Brand with ID "reculg97iNzbkEZCK" (Game of Thrones)

### Example 2: Pedro Pascal's Game of Thrones Episodes

```json
{
  "dynamic_content_types": ["Episode"],
  "dynamic_content_rules": [
    [
      { "object_types": ["Episode"], "uid": null, "relationship_name": null },
      {
        "object_types": ["Credit"],
        "uid": null,
        "relationship_name": "credits"
      },
      {
        "object_types": ["Person"],
        "uid": ["recsHo1htVlv6OsXn"],
        "relationship_name": "people"
      }
    ],
    [
      { "object_types": ["Episode"], "uid": null, "relationship_name": null },
      {
        "object_types": ["Season"],
        "uid": null,
        "relationship_name": "seasons"
      },
      {
        "object_types": ["Brand"],
        "uid": ["reculg97iNzbkEZCK"],
        "relationship_name": "brands"
      }
    ]
  ]
}
```

**Translation**: Find Episodes that EITHER:

1. Have Credits → linked to Person "recsHo1htVlv6OsXn" (Pedro Pascal)
2. OR belong to Seasons → of Brand "reculg97iNzbkEZCK" (Game of Thrones)

## Implementation Details

### Rule Processing Algorithm

1. **Start with base content type**: Filter all objects matching `dynamic_content_types`
2. **Apply each rule in sequence**: Within a rule chain, each rule further filters the candidates
3. **Relationship traversal**: Follow the `relationship_name` to connected objects
4. **UID filtering**: If `uid` specified, only match those specific objects
5. **Chain combination**: Combine results from all rule chains using OR logic

### Complex Relationship Handling

The system handles complex multi-hop relationships:

**Episode → Credits → Person Chain:**

```typescript
// Check if episode has credits
const creditsIds = candidate.fields.credits;

// Then check if those credits link to the specified person
const hasPersonInCredits = creditIdsArray.some((creditId) => {
  const credit = airtableData.credits?.find((c) => c.id === creditId);
  const creditPeople = credit.fields.person;
  return creditPeopleArray.includes(targetPersonId);
});
```

### Content Sorting and Limiting

Dynamic sets support additional metadata:

- **content_sort_field**: Field to sort results by (e.g., "audience_rating", "release_date")
- **content_sort_direction**: "ASC" or "DESC"
- **content_limit**: Maximum number of items to return

## Use Cases

### 1. Content Discovery

- "All episodes featuring a specific actor"
- "Highest rated content from a particular brand"
- "Recently released movies in a genre"

### 2. Personalization

- "Content similar to user's viewing history"
- "Episodes from shows the user follows"
- "Movies starring actors the user likes"

### 3. Editorial Curation

- "Award-winning content from this year"
- "Behind-the-scenes content for popular shows"
- "Content trending in user's region"

## Benefits

### 1. Automatic Updates

- Content automatically appears/disappears as metadata changes
- No manual curation needed when new content is added
- Always up-to-date without editorial intervention

### 2. Scalability

- One rule set can generate hundreds of content items
- Rules adapt to growing content catalogs
- Consistent logic across similar sets

### 3. Flexibility

- Complex multi-criteria filtering
- Support for OR/AND logic combinations
- Relationship traversal across multiple object types

## Technical Implementation

### File Locations

- **Dynamic Content Logic**: `src/mocks/airtable/dynamic-content.ts`
- **Set Integration**: `src/mocks/airtable/sets.ts`
- **Data Storage**: `skylark_airtable_data.json` (sets with `dynamic_content` field)

### Key Functions

```typescript
// Main entry point for dynamic content generation
export const generateDynamicContent = (set: AirtableRecord<FieldSet>): string[]

// Core rule matching logic
const findObjectsMatchingRules = (rules: [], contentTypes: string[]): string[]
```

### Integration with Sets

Dynamic content is evaluated when:

1. Set content is requested via GraphQL
2. No static `content` field exists on the set
3. `dynamic_content` or `Dynamic Content` field contains valid JSON rules

The system falls back gracefully:

1. **Static content** (highest priority)
2. **Referenced sets** (medium priority)
3. **Dynamic content** (fallback priority)

## Real-World Examples from Data

### Game of Thrones Highest Rated Episodes

- **Set Type**: GRID
- **Sort**: By audience_rating DESC
- **Limit**: 6 episodes
- **Rule**: Episodes from Game of Thrones brand, sorted by rating

### Pedro Pascal's Episodes

- **Set Type**: RAIL_WITH_SYNOPSIS
- **Sort**: By release_date ASC
- **Rule**: Episodes featuring Pedro Pascal OR from Game of Thrones

This dynamic content system enables sophisticated content discovery and curation while maintaining performance and flexibility.
