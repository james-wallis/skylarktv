# Understanding Availability in Skylark - Part 1

**Date**: 2025-07-10  
**Learning Duration**: ~5 minutes  
**Research Method**: Automated analysis using Task tool

## Learning Process

### Tools Used

- **Task Tool**: Primary research agent for comprehensive data analysis
- **Files Analyzed**:
  - `/Users/jameswallis/github/ostmodern/skylarktv/packages/skylarktv/src/mocks/skylark_airtable_data.json`
  - Mock implementation files in `/src/mocks/` directory
  - GraphQL handlers and airtable conversion functions

### Research Approach

1. **Data Structure Discovery**: Searched for availability-related tables and fields
2. **Relationship Mapping**: Identified connections between availability, customers, devices, regions
3. **Pattern Analysis**: Examined real availability records and their configurations
4. **Implementation Gap Analysis**: Compared data structure to current mock implementation

## Current Understanding of Availability System

### Core Architecture

Skylark's availability system is a sophisticated multi-dimensional access control mechanism built around these key components:

#### 1. Primary Data Tables

- **`availability`** - Main scheduling/licensing records
- **`customerTypes`** - Subscription tiers (Kids, Standard, Premium)
- **`deviceTypes`** - Hardware platforms (SmartPhone, PC)
- **`regions`** - Geographic territories (Europe, North America, MENA)

#### 2. Access Control Dimensions

**Customer Tiers (Subscription-based access)**:

- **Kids** (`rec4VuxS9fnyg4wqh`): Family-safe content only
- **Standard** (`recXQtdEI4DpFkw76`): General catalog access
- **Premium** (`recD4WfhAYw4gFnJh`): Full catalog including exclusives

**Device Types (Platform restrictions)**:

- **SmartPhone** (`rec50TFQHwT76pY2K`): Mobile access
- **PC** (`recPOR7ivzMd90XLe`): Desktop/web access

**Regions (Geographic licensing)**:

- **Europe** (`rec91RQH79i9AO3Qf`)
- **North America** (`reclbGDlUj4Ap84cZ`)
- **MENA** (`recRZGagXS8YbkYrR`): Middle East/North Africa

#### 3. Temporal Controls

- **`starts`** field: ISO 8601 timestamps defining when content becomes available
- **Perpetual availability**: Most content starts from "2000-01-01" or "2022-01-01"
- **No end dates**: Suggests indefinite availability once started

### Real-World Availability Examples

#### Example 1: Broad Access Content

```json
{
  "id": "recXNjJNyc6nKQIYa",
  "title": "Always - Premium/Standard, Europe/North America",
  "customers": ["recD4WfhAYw4gFnJh", "recXQtdEI4DpFkw76"],
  "devices": ["recPOR7ivzMd90XLe", "rec50TFQHwT76pY2K"],
  "regions": ["rec91RQH79i9AO3Qf", "reclbGDlUj4Ap84cZ"],
  "starts": "2000-01-01T00:00:00.000Z"
}
```

**Translation**: Content available to Premium + Standard subscribers on PC + Mobile in Europe + North America since 2000.

#### Example 2: Kids-Only Content

```json
{
  "id": "recyySS4ixXlyGG48",
  "title": "Always - Kids, Europe/North America",
  "customers": ["rec4VuxS9fnyg4wqh"],
  "regions": ["rec91RQH79i9AO3Qf", "reclbGDlUj4Ap84cZ"]
}
```

**Translation**: Family-safe content restricted to Kids subscription tier.

#### Example 3: Premium Exclusives

```json
{
  "id": "recMdBZyVPsIGqAYq",
  "title": "Always - Premium, Europe/North America",
  "customers": ["recD4WfhAYw4gFnJh"],
  "devices": ["recPOR7ivzMd90XLe", "rec50TFQHwT76pY2K"],
  "regions": ["rec91RQH79i9AO3Qf", "reclbGDlUj4Ap84cZ"]
}
```

**Translation**: Premium-exclusive content requiring highest subscription tier.

#### Example 4: Regional Content

```json
{
  "id": "rec9zC5XQf7TV9CQs",
  "title": "Always - Premium/Standard, MENA",
  "customers": ["recD4WfhAYw4gFnJh", "recXQtdEI4DpFkw76"],
  "regions": ["recRZGagXS8YbkYrR"]
}
```

**Translation**: Content licensed only for Middle East/North Africa region.

### Content-Availability Linking

**Data Structure**:

```json
{
  "mediaObject": {
    "id": "recVtNWfwnLgE8sV5",
    "fields": {
      "title": "Asteroid City",
      "availability": ["recXNjJNyc6nKQIYa", "recMdBZyVPsIGqAYq"]
    }
  }
}
```

**Logic**: Content can reference multiple availability records to support:

- Different customer tiers accessing the same content
- Regional licensing variations
- Device-specific restrictions
- Time-based windowing

### Intended Access Control Flow

1. **User Context Extraction**:

   - Customer type (from subscription/authentication)
   - Device type (from user agent/platform detection)
   - Region (from IP geolocation or user preference)

2. **Availability Filtering**:

   - Find all availability records matching user's profile
   - Apply time-based filtering (content past `starts` timestamp)
   - Create allowlist of valid availability IDs

3. **Content Filtering**:

   - Only return media objects with at least one matching availability record
   - Apply this filtering at all levels (individual content, sets, search results)

4. **Response Delivery**:
   - Return filtered content catalog appropriate for user's access level

### Current Implementation Status

#### ✅ What's Working

- Complete data structure with all relationships properly defined
- Rich availability examples covering various access patterns
- Content properly references availability records via arrays

#### ❌ Implementation Gaps

1. **No Availability Processing**: `convertMediaObjectToGraphQL` hardcodes `availability: { objects: [] }`
2. **Missing Access Control**: No user context or filtering logic in request handlers
3. **No Temporal Filtering**: `starts` timestamps not evaluated
4. **No Geographic Restrictions**: Region-based filtering not implemented
5. **No Customer Tier Logic**: Subscription level not considered

#### 🔧 Required Enhancements

- Add availability processing to media object conversion
- Implement user context extraction from request headers
- Create availability matching and filtering functions
- Add time-based availability checks
- Integrate access control into all GraphQL handlers

## Key Insights

### 1. Multi-Dimensional Access Control

Skylark's availability system operates on **four dimensions simultaneously**: customer tier, device type, geographic region, and time. This enables sophisticated content licensing and business model support.

### 2. Hierarchical Customer Access

The customer tier system appears hierarchical:

- **Premium**: Access to Premium + Standard + Kids content
- **Standard**: Access to Standard + Kids content
- **Kids**: Access to Kids content only

### 3. Flexible Content Distribution

Content can have multiple availability records, enabling:

- Staggered releases (Premium early access, Standard later)
- Regional licensing variations
- Device-specific content strategies

### 4. Business Model Enablement

The system supports various monetization strategies:

- Subscription tiers with different content access
- Geographic market segmentation
- Device-specific offerings
- Time-based content windows

## Questions for Future Learning

1. **User Context**: How are customer type, device, and region determined from requests?
2. **Inheritance Rules**: Do child objects inherit parent availability (e.g., episodes from seasons)?
3. **Availability Conflicts**: What happens when content has conflicting availability records?
4. **Caching Strategy**: How is availability data cached for performance?
5. **Admin Controls**: How do content managers configure and test availability rules?

## Next Steps

To fully understand and implement availability:

1. Learn how user context is extracted from requests
2. Understand availability inheritance patterns
3. Implement availability filtering in mock handlers
4. Test edge cases and conflict resolution
5. Document complete availability implementation patterns

---

_This represents my initial understanding of Skylark's availability system after 5 minutes of automated analysis. The system appears sophisticated and well-designed, with clear separation of concerns and flexible multi-dimensional access control._
