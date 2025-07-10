# Understanding Availability System - Version 3

## Key Learnings Since Version 2

### 1. Region Matching Bug and Resolution

**Issue**: Content wasn't being returned for "north-america" region despite being configured.

**Root Cause**: The dimension matching logic was using `title` field ("North America") instead of `slug` field ("north-america"), causing a mismatch due to space vs hyphen.

**Fix**: Changed field priority in `getNameFromId` to check `slug` first:

```typescript
// Before: name || title || slug || id
// After: slug || name || title || id
```

**Learning**: Machine-readable identifiers (slugs) should always take precedence over human-readable titles in API matching logic.

### 2. Default Availability Implementation

**Initial Understanding**: Content without availability was always available.

**Corrected Understanding**: Content without availability records should use the default availability record (`fields.default = true`).

**Implementation**:

```typescript
if (!contentAvailabilityIds || contentAvailabilityIds.length === 0) {
  const defaultAvailability = airtableData.availability?.find(
    (avail) => avail.fields.default === true,
  );
  if (defaultAvailability) {
    availabilityIdsToCheck = [defaultAvailability.id];
  } else {
    return false; // No availability and no default means no access
  }
}
```

### 3. Set-Level Availability Filtering

**Issue**: Empty kids carousels were appearing for premium customers (ghost content).

**Root Cause**: Only set content was being filtered, not the sets themselves.

**Fix**: Added availability filtering to `convertSetToGraphQL`:

```typescript
if (hasDimensionsRequested) {
  const setAvailabilityIds = assertStringArray(finalFields.availability) || [];
  const hasSetAccess = filterContentByAvailability(
    setAvailabilityIds,
    requestedDimensions,
    airtableData,
  );
  if (!hasSetAccess) {
    return null;
  }
}
```

### 4. Segment Resolution Completeness

**Issue**: Kids dimension filtering wasn't working properly.

**Root Cause**: Segment resolution was only copying customer types, not devices and regions.

**Fix**: Updated to copy all dimension types from segments:

```typescript
// Now properly copies:
// - segmentCustomers
// - segmentDevices
// - segmentRegions
```

### 5. Content Distribution Insights

**Kids Content**:

- Available only in Europe and North America
- No kids content configured for MENA region
- Includes movies like The Lion King, E.T., and series like Miraculous, Bluey

**MENA Content**:

- Only available to Premium/Standard customers
- No kids-specific content
- Represents a content gap for the kids segment

### 6. Sorting Implementation for Different Object Types

**New Feature**: Implemented proper sorting based on object type characteristics:

- **People**: Sort by `name_sort` → `name`
- **Genres/Themes/Tags**: Sort by `name`
- **Media Objects**: Sort by `title_sort` → `title`
- **Episodes**: Sort by `episode_number`
- **Seasons**: Sort by `season_number`

**Generic Function**: Created `sortByProperty` for flexible sorting with fallback support.

## Architecture Understanding

### Request Flow

1. Headers parsed: `x-sl-dimension-*`
2. Dimensions extracted and normalized (lowercase, trimmed)
3. Content filtered through `filterContentByAvailability`
4. Segments resolved to full dimension sets
5. Matching performed using ID/slug/name comparison

### Data Relationships

```
Content → Availability Records → Dimensions (direct)
                              ↘ Segments → Dimensions (indirect)
```

### Matching Strategy

- **OR logic between availability records**: Any matching record grants access
- **AND logic within dimensions**: All requested dimensions must match
- **Fallback chain**: ID → slug → name → title for flexible matching

## Best Practices Discovered

1. **Always filter at appropriate levels**: Both containers (sets) and content
2. **Use machine-readable identifiers**: Prioritize slugs over display names
3. **Implement proper defaults**: Explicit default records instead of implicit behavior
4. **Complete segment resolution**: Copy all dimension types, not just subsets
5. **Sort consistently**: Use appropriate fields for each object type

## Common Pitfalls to Avoid

1. **Incomplete dimension checking**: Forgetting to check if dimensions are actually requested
2. **Partial segment resolution**: Only copying some dimension types
3. **String matching issues**: Not accounting for format differences (spaces vs hyphens)
4. **Missing null checks**: Not handling cases where availability arrays are empty
5. **Inconsistent sorting**: Using title fields for objects that have name fields

## Testing Considerations

Key test scenarios:

1. Content with no availability → should use default
2. Region names with different formats (north-america vs North America)
3. Empty dimension requests → should show all content
4. Multiple availability records → should OR them together
5. Segment-based availability → should expand properly
6. Ghost content → containers without accessible content should be hidden

## Future Improvements Suggested

1. **Caching**: Availability checks are performed frequently and could benefit from caching
2. **Validation**: Add validation for dimension names to catch typos early
3. **Debugging**: Add optional debug mode to trace availability decisions
4. **Performance**: Pre-compute availability for common dimension combinations
5. **Content Gaps**: Automated reporting for missing content in region/customer combinations
