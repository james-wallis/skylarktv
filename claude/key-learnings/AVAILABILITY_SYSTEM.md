# Availability System: Rules, Dimensions, and Segments

## Overview

The availability system controls which content is accessible to which users based on their customer type, device, and geographic region. It uses a three-tier architecture: **Dimensions** → **Segments** → **Availability Rules**.

## Core Concepts

### 1. Dimensions

Dimensions are the basic building blocks that define user characteristics:

- **Customer Types**: `premium`, `standard`, `kids`
- **Device Types**: `pc`, `smartphone`, `tablet`, etc.
- **Regions**: `europe`, `north-america`, `mena`, etc.

Each dimension has:

```json
{
  "id": "rec4VuxS9fnyg4wqh",
  "fields": {
    "title": "Kids",
    "slug": "kids"
  }
}
```

### 2. Segments

Segments are reusable groups of dimensions that prevent duplication and ensure consistency. Instead of adding the same dimensions to multiple availability rules, you create a segment once and reference it.

Example - "TV for Kids" segment:

```json
{
  "id": "recQTnZzIfKXuLtmH",
  "fields": {
    "title": "TV for Kids",
    "slug": "tv-for-kids",
    "customers": ["rec4VuxS9fnyg4wqh"], // Kids customer type
    "devices": ["rec50TFQHwT76pY2K", "recPOR7ivzMd90XLe"], // Smartphone + PC
    "regions": ["rec91RQH79i9AO3Qf", "reclbGDlUj4Ap84cZ"] // Europe + North America
  }
}
```

### 3. Availability Rules

Availability rules determine content access. They can reference dimensions directly OR use segments for cleaner management.

#### Direct Dimension Reference:

```json
{
  "id": "recXNjJNyc6nKQIYa",
  "fields": {
    "title": "Always - Premium/Standard, Europe/North America",
    "customers": ["recD4WfhAYw4gFnJh", "recXQtdEI4DpFkw76"], // Premium + Standard
    "devices": ["recPOR7ivzMd90XLe", "rec50TFQHwT76pY2K"], // PC + Smartphone
    "regions": ["rec91RQH79i9AO3Qf", "reclbGDlUj4Ap84cZ"] // Europe + North America
  }
}
```

#### Segment Reference:

```json
{
  "id": "recyySS4ixXlyGG48",
  "fields": {
    "title": "Always - Kids, Europe/North America",
    "segments": ["recQTnZzIfKXuLtmH"], // References "TV for Kids" segment
    "regions": ["rec91RQH79i9AO3Qf", "reclbGDlUj4Ap84cZ"] // Can still add direct dimensions
  }
}
```

## Request Flow

### 1. Client Request Headers

```
x-sl-dimension-customer-types: kids
x-sl-dimension-device-types: pc
x-sl-dimension-regions: europe
```

### 2. Dimension Resolution

```typescript
// Extract from headers
{
  customerTypes: ["kids"],    // String slugs
  deviceTypes: ["pc"],
  regions: ["europe"]
}
```

### 3. Availability Matching Process

For each piece of content:

1. **Get content's availability IDs**:

   ```typescript
   const availabilityIds = content.fields.availability; // ["recyySS4ixXlyGG48"]
   ```

2. **Resolve availability rule dimensions**:

   ```typescript
   // Check for direct dimensions
   let customers = availability.fields.customers || [];

   // If no direct customers, resolve segments
   if (customers.length === 0 && availability.fields.segments) {
     customers = segments.flatMap((segmentId) => {
       const segment = findSegment(segmentId);
       return segment.fields.customers || [];
     });
   }
   ```

3. **Match requested vs available dimensions**:

   ```typescript
   // Convert IDs to slugs and match
   const customerMatch = hasMatchingDimension(
     ["kids"], // Requested
     ["rec4VuxS9fnyg4wqh"], // Available (resolved from segment)
     "customerTypes",
   );

   // Slug matching: "kids" matches customer record with slug "kids"
   ```

## Benefits of Segments

### ✅ **Consistency**

- Define "TV for Kids" once, use everywhere
- Changes to kids dimensions update all rules automatically

### ✅ **Maintainability**

- No duplication of dimension lists
- Clear separation of concerns

### ✅ **Flexibility**

- Can combine segments with direct dimensions
- Can reference multiple segments in one rule

### ✅ **Reduced Errors**

- Less chance of missing dimensions when creating new rules
- Centralized management of dimension groups

## Content Filtering

### Sets (Carousels)

Sets themselves can have availability rules:

```json
{
  "id": "recKidsCarousel",
  "fields": {
    "title": "Kids Shows",
    "availability": ["recyySS4ixXlyGG48"], // Kids-only carousel
    "content": ["recMovie1", "recMovie2"]
  }
}
```

If a set doesn't match availability, it's filtered out completely (no ghost content).

### Media Objects

Individual content items have their own availability:

```json
{
  "id": "recKidsMovie",
  "fields": {
    "title": "Kids Movie",
    "availability": ["recyySS4ixXlyGG48"] // Kids-only content
  }
}
```

## Implementation Notes

### Matching Logic

- **ALL** dimension types must match (customer AND device AND region)
- **ANY** value within a dimension type can match (premium OR standard customers)
- Empty requested dimensions = no restrictions
- Empty available dimensions = no access

### Fallback Behavior

- Content with no availability records = filtered out when dimensions are requested
- Content with invalid availability IDs = filtered out
- Missing segments = treated as empty customer list

### Performance Considerations

- Segment resolution happens at request time
- Dimension slug lookups are cached per request
- Filtering is applied recursively (sets → content → nested sets)

## Common Patterns

### 1. Geographic Content

```json
{
  "title": "EU Premium Content",
  "customers": ["premium", "standard"],
  "regions": ["europe"]
}
```

### 2. Device-Specific Content

```json
{
  "title": "Mobile-Only Content",
  "devices": ["smartphone", "tablet"],
  "segments": ["all-customers"]
}
```

### 3. Kids Content

```json
{
  "title": "Kids Content",
  "segments": ["tv-for-kids"] // Handles customer+device+region
}
```

### 4. Premium Features

```json
{
  "title": "Premium Features",
  "customers": ["premium"],
  "segments": ["all-regions-all-devices"]
}
```

This architecture provides a flexible, maintainable system for managing complex content availability rules while minimizing duplication and configuration errors.
