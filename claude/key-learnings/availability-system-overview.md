# Availability System Overview

## Core Concepts

### 1. Availability Dimensions

The availability system controls content access based on three dimension types:

- **Customer Types**: premium, standard, kids
- **Device Types**: pc, smartphone, smarttv
- **Regions**: europe, north-america, mena

### 2. Availability Records

Each piece of content can have multiple availability records that define:

- Which customer types can access it
- Which devices it can be viewed on
- Which regions it's available in
- Optional end date for time-limited availability

### 3. Audience Segments

Segments are reusable groups of dimensions that can be referenced by availability records:

- Example: "TV for Kids" segment includes kids customers on smartphone and PC devices
- Segments simplify management by avoiding repetition across multiple availability records

## How It Works

### Request Processing

1. Client sends headers with requested dimensions:

   ```
   x-sl-dimension-customer-types: premium
   x-sl-dimension-device-types: pc
   x-sl-dimension-regions: north-america
   ```

2. System extracts and normalizes these dimensions

3. Content is filtered based on availability matching

### Availability Matching Logic

- Content is available if ANY of its availability records match ALL requested dimensions
- If content has no availability records, it uses the default availability record
- Matching is done by comparing dimension IDs, names, or slugs

### Special Cases

1. **Default Availability**: Content without explicit availability uses the record with `fields.default = true`
2. **Empty Dimensions**: If no specific dimension is requested, it's treated as "no restriction"
3. **Segment Resolution**: Segments are expanded to their constituent dimensions during matching

## Common Patterns

### Regional Content

```javascript
// Content only for MENA region
availability: ["rec9zC5XQf7TV9CQs"]; // Premium/Standard customers in MENA
```

### Kids Content

```javascript
// Kids content in specific regions
availability: ["recyySS4ixXlyGG48"]; // Kids customers in Europe/North America
```

### Universal Content

```javascript
// Available everywhere (uses default availability)
availability: []; // Falls back to default availability record
```

## Benefits

1. **Flexibility**: Fine-grained control over content access
2. **Reusability**: Segments reduce duplication
3. **Scalability**: Easy to add new dimensions or regions
4. **Business Logic**: Supports complex access rules (e.g., kids content only in certain regions)
