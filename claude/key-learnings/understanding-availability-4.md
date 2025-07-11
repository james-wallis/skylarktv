# Understanding Skylark's Availability System (Complete Implementation)

## Overview

Skylark's availability system is a comprehensive content filtering and access control mechanism that determines which content users can see based on multiple dimensions and time constraints. The system has been fully implemented with advanced features including dynamic time windows and time travel functionality.

## Core Components

### 1. Availability Records

Each availability record defines access rules for content:

- **Dimensions**: Customer types, device types, regions
- **Time Windows**: Start and end dates for temporal availability
- **Segments**: Reusable groupings of dimensions
- **Dynamic Dates**: Special slugs that compute dates at runtime

### 2. Content Association

Content objects (movies, episodes, articles, etc.) reference availability records:

- Content can have multiple availability records (OR logic)
- If ANY availability record grants access, content is available
- No availability = uses default availability record

### 3. Request Context

Availability is evaluated against request headers:

- `x-sl-dimension-customer-types`: Comma-separated customer types
- `x-sl-dimension-device-types`: Comma-separated device types
- `x-sl-dimension-regions`: Comma-separated regions
- `x-time-travel`: ISO date string for viewing content at specific time

## Key Implementation Files

### Core Logic (`/packages/skylarktv/src/mocks/airtable/availability.ts`)

```typescript
// Dynamic date computation for special availability slugs
const computeDynamicDates = (availabilityRecord: AirtableRecord<FieldSet>) => {
  const slug = assertString(availabilityRecord.fields.slug);

  if (slug === "active-next-sunday") {
    const nextSunday = getNextSundayAt9PM();
    return { starts: nextSunday, ends: null };
  }

  if (slug === "active-until-next-sunday") {
    const nextSunday = getNextSundayAt9PM();
    return { starts: null, ends: nextSunday };
  }

  // Return original dates for non-dynamic records
  return { starts, ends };
};

// Time-based availability checking with time travel support
const isAvailabilityTimeActive = (
  availabilityRecord: AirtableRecord<FieldSet>,
  timeTravelDate?: Date | null,
): boolean => {
  const { starts, ends } = computeDynamicDates(availabilityRecord);
  const now = timeTravelDate || new Date();

  // Time window logic
  if (!starts && !ends) return true; // Always available
  if (starts && !ends) return now >= starts; // Available after start
  if (!starts && ends) return now < ends; // Available before end
  if (starts && ends) return now >= starts && now < ends; // Within window

  return true;
};
```

### Request Utilities (`/packages/skylarktv/src/mocks/airtable/requestUtils.ts`)

```typescript
// Extract availability dimensions from headers
export const getAvailabilityDimensionsFromRequest = (
  headers: Headers,
): AvailabilityDimensions => {
  return {
    customerTypes: parseHeaderList(
      headers.get("x-sl-dimension-customer-types"),
    ),
    deviceTypes: parseHeaderList(headers.get("x-sl-dimension-device-types")),
    regions: parseHeaderList(headers.get("x-sl-dimension-regions")),
  };
};

// Extract time travel date from headers
export const getTimeTravelFromRequest = (headers: Headers): Date | null => {
  const timeTravel = headers.get("x-time-travel");
  if (!timeTravel || timeTravel.trim() === "") return null;

  try {
    return new Date(timeTravel);
  } catch {
    return null;
  }
};
```

### Content Parsing Integration (`/packages/skylarktv/src/mocks/airtable/parse-media-objects.ts`)

```typescript
export interface MediaObjectParseOptions {
  airtableObj: AirtableRecord<FieldSet>;
  currentDepth?: number;
  languageCode?: string;
  requestedDimensions?: AvailabilityDimensions;
  timeTravelDate?: Date | null; // Time travel support
}

// Availability checking in content parsing
if (hasDimensionsRequested) {
  const contentAvailabilityIds = assertStringArray(fields.availability) || [];
  const hasAccess = filterContentByAvailability(
    contentAvailabilityIds,
    requestedDimensions,
    airtableData,
    timeTravelDate, // Pass time travel date
  );

  if (!hasAccess) return null; // Filter out inaccessible content
}
```

## Availability Logic Flow

### 1. Request Processing

```
Request Headers → Extract Dimensions + Time Travel → Parse Content
```

### 2. Content Filtering

```
For each content item:
  1. Get availability record IDs
  2. For each availability record:
     a. Check time window (with time travel)
     b. Check dimension matching
  3. Content available if ANY record grants access
```

### 3. Dimension Matching

```
For each dimension type (customer, device, region):
  - No requested dimensions = no restriction
  - No available dimensions = no access
  - Must have overlap between requested and available
```

## Special Features

### 1. Dynamic Time Windows

Special availability slugs compute dates at runtime:

- `active-next-sunday`: Available starting next Sunday at 9 PM
- `active-until-next-sunday`: Available until next Sunday at 9 PM

### 2. Time Travel

The `x-time-travel` header allows viewing content as it appeared at any point in time:

- All time-based availability checks use the time travel date
- Dynamic dates are computed relative to the time travel moment
- Enables historical content state viewing

### 3. Audience Segments

Reusable dimension groupings:

- Availability records can reference segments instead of direct dimensions
- Segments resolve to customer types, device types, and regions
- Provides content management efficiency

### 4. Default Availability

Fallback mechanism for content without explicit availability:

- Content with no availability records uses default availability
- Default availability record marked with `default: true`
- Ensures content isn't accidentally hidden

## Integration Points

### 1. GraphQL Handlers

All content handlers extract and pass availability context:

```typescript
const languageCode = getLanguageFromRequest(request.headers);
const requestedDimensions = getAvailabilityDimensionsFromRequest(
  request.headers,
);
const timeTravelDate = getTimeTravelFromRequest(request.headers);

const parsedContent = parseContent({
  airtableObj: content,
  languageCode,
  requestedDimensions,
  timeTravelDate,
});
```

### 2. Search Integration

Search results respect availability rules:

- Media objects filtered during conversion
- Articles filtered before result processing
- Time travel applies to search results

### 3. Content Types Supported

- Movies, Episodes, Seasons, Brands, LiveStreams
- Articles
- Any content type with availability field

## Testing the System

### 1. Basic Availability

```bash
# Request with specific dimensions
curl -H "x-sl-dimension-customer-types: premium" \
     -H "x-sl-dimension-device-types: mobile" \
     -H "x-sl-dimension-regions: uk" \
     https://api.example.com/graphql
```

### 2. Time Travel

```bash
# View content as it appeared on specific date
curl -H "x-time-travel: 2024-01-15T10:00:00Z" \
     -H "x-sl-dimension-customer-types: premium" \
     https://api.example.com/graphql
```

### 3. Dynamic Windows

Test dynamic availability by checking content with:

- `active-next-sunday` slug (should appear/disappear based on current time vs next Sunday 9 PM)
- `active-until-next-sunday` slug (should disappear after next Sunday 9 PM)

## Key Architectural Decisions

### 1. OR Logic for Multiple Availability Records

Content is available if ANY of its availability records grant access, providing flexibility for complex access scenarios.

### 2. Null Return for Filtered Content

Filtered content returns `null` from parsing functions, causing it to be excluded from results rather than returning with limited data.

### 3. Time Travel as Request Context

Time travel date is extracted once per request and passed through the entire content processing pipeline, ensuring consistent temporal context.

### 4. Dynamic Date Computation

Special availability slugs compute dates at evaluation time rather than storage time, enabling relative time-based availability rules.

## Performance Considerations

### 1. Efficient Filtering

- Availability checks happen early in content parsing
- Filtered content is excluded before expensive operations
- Single database lookup per availability record

### 2. Caching Opportunities

- Time travel dates could be cached for identical requests
- Dynamic date calculations could be memoized within request scope
- Availability dimension parsing could be cached

### 3. Scalability

- OR logic means only one matching availability record is needed
- Dimension matching uses efficient array operations
- Time window checks are simple date comparisons

This availability system provides comprehensive, flexible content access control with advanced features like time travel and dynamic time windows, making it suitable for complex content distribution scenarios.
