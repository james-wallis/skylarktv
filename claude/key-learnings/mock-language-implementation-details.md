# Mock Language Implementation Details

## Overview

Implemented comprehensive language support for the MSW (Mock Service Worker) GraphQL mocks, allowing content to be served in different languages based on the `x-language` request header.

## Implementation Architecture

### Request Language Detection

- **Header**: `x-language`
- **Default**: `en-GB` (English - Great Britain)
- **Case Insensitive**: Supports `pt-PT`, `PT-PT`, `pt-pt`, etc.
- **Location**: `src/mocks/airtable/requestUtils.ts`

```typescript
export const getLanguageFromRequest = (headers: Headers): string => {
  const language = headers.get("x-language");
  return language ? language.toLowerCase() : "en-gb";
};
```

### Translation Lookup System

- **Data Structure**: Airtable translations stored in `translations.mediaObjects` array
- **Matching Logic**: Bidirectional relationships between main objects and translations
- **Case Insensitive**: Language codes matched with `.toLowerCase()`
- **Location**: `src/mocks/airtable/utils.ts`

```typescript
export const findTranslationForObject = (
  mainObjectId: string,
  languageCode: string,
  translationsData: AirtableRecord<FieldSet>[],
): AirtableRecord<FieldSet> | null =>
  translationsData.find((translation) => {
    const objectIds = assertStringArray(translation.fields.object) || [];
    const translationLanguageCodes =
      assertStringArray(translation.fields.language_code) || [];

    return (
      objectIds.includes(mainObjectId) &&
      translationLanguageCodes.some(
        (code) => code.toLowerCase() === languageCode.toLowerCase(),
      )
    );
  }) || null;
```

### Content Merging Strategy

- **Base Content**: Original object fields in default language
- **Translation Overlay**: Translated fields override base content
- **Selective Translation**: Only translated fields are replaced (title, synopsis, etc.)
- **Fallback**: Missing translations fall back to original language

```typescript
export const mergeTranslatedContent = (
  mainFields: FieldSet,
  translationFields: FieldSet,
): FieldSet => ({
  ...mainFields,
  ...Object.fromEntries(
    Object.entries(translationFields).filter(([, value]) => value != null),
  ),
});
```

### Options Object Pattern

Converted functions to use options objects for scalability:

```typescript
export interface ConvertMediaObjectOptions {
  airtableObj: AirtableRecord<FieldSet>;
  currentDepth?: number;
  languageCode?: string;
}

export const convertMediaObjectToGraphQL = (
  options: ConvertMediaObjectOptions,
) => {
  const { airtableObj, currentDepth = 0, languageCode } = options;
  // Implementation...
};
```

## Supported Content Types

All major content types now support language translations:

1. **Episodes** - `src/mocks/fixtures/getEpisode.ts`
2. **Movies** - `src/mocks/fixtures/getMovie.ts`
3. **Seasons** - `src/mocks/fixtures/getSeason.ts`
4. **Brands** - `src/mocks/fixtures/getBrand.ts`
5. **Live Streams** - `src/mocks/fixtures/getLiveStream.ts`
6. **Search Results** - `src/mocks/fixtures/search.ts`

## Example Usage

### Request Headers

```http
GET /graphql
x-language: pt-PT
Content-Type: application/json
```

### Translation Example

**Asteroid City (Movie)**

- **Original (English)**: "Following a writer on his world famous fictional play..."
- **Portuguese (pt-PT)**: "Seguindo um escritor em sua mundialmente famosa peça fictícia..."

### Testing Different Cases

All of these work identically:

- `x-language: pt-PT`
- `x-language: PT-PT`
- `x-language: pt-pt`
- `x-language: Pt-Pt`

## Data Structure Insights

### Airtable Translation Records

```json
{
  "id": "recatGSBPtT82xyqp",
  "fields": {
    "object": ["recVtNWfwnLgE8sV5"],
    "language_code": ["pt-PT"],
    "title": "Asteroid City",
    "synopsis": "Seguindo um escritor em sua mundialmente famosa peça fictícia...",
    "translation_created": true
  }
}
```

### Bidirectional Relationships

- Main objects reference translation IDs
- Translation objects reference main object IDs via `object` field
- Language codes stored as arrays for flexibility
- Many-to-many relationship support

## Key Technical Decisions

1. **Case Insensitivity**: Ensures consistent behavior regardless of header casing
2. **Options Objects**: Scalable pattern for functions with multiple parameters
3. **Selective Merging**: Only override fields that have translations
4. **Depth Awareness**: Translations applied at all nesting levels
5. **Fallback Strategy**: Graceful degradation to original language

## Files Modified

- `src/mocks/airtable/requestUtils.ts` - Request utilities
- `src/mocks/airtable/utils.ts` - Translation lookup and merging
- `src/mocks/airtable/media-objects.ts` - Media object conversion
- `src/mocks/fixtures/*.ts` - All GraphQL handlers updated

## Testing Notes

- Portuguese translations available for multiple content items
- Case insensitive language code matching works correctly
- Fallback to English when translations unavailable
- Search results include translated content when language specified
