# Understanding Availability in Skylark - Part 2

**Date**: 2025-07-10  
**Learning Duration**: ~3 minutes  
**Research Method**: Official Skylark documentation analysis

## Learning Process

### Tools Used
- **WebFetch Tool**: To access official Skylark documentation
- **Website Accessed**: https://docs.skylarkplatform.com/docs/introduction-to-availability
- **Previous Knowledge**: Understanding-availability-1.md (airtable data analysis)

### Research Approach
1. **Official Documentation Review**: Read Skylark's introduction to availability
2. **Concept Mapping**: Compare official definitions to observed data patterns
3. **Gap Analysis**: Identify discrepancies between documentation and implementation
4. **Terminology Alignment**: Understand proper Skylark vocabulary

## How My Understanding Changed

### ✅ Concepts That Were Confirmed

#### 1. Multi-Dimensional Access Control
**Previous Understanding**: Identified 4 dimensions (customer, device, region, time)  
**Documentation Confirms**: Availability uses "Dimensions" and "Time Windows" as core concepts  
**Status**: ✅ **CORRECT** - My analysis correctly identified the dimensional approach

#### 2. Strict Matching Requirements
**Previous Understanding**: Assumed content needed to match availability records  
**Documentation Reveals**: "Extremely strict matching requirements" with **no partial matches**  
**Status**: ⚠️ **ENHANCED** - More restrictive than I initially thought

#### 3. Time-Based Controls
**Previous Understanding**: Found `starts` timestamps, assumed perpetual availability  
**Documentation Confirms**: Time Windows with start AND end times (ISO 8601 format)  
**Status**: ❌ **INCOMPLETE** - I missed that availability can have end times

### 🔄 Major Conceptual Shifts

#### 1. Terminology Alignment
**Before**: Called them "customer types", "device types", "regions"  
**After**: Official term is **"Dimensions"** - user/context-specific attributes  
**Impact**: More accurate vocabulary, better alignment with Skylark concepts

#### 2. Rule Reusability
**Before**: Thought each content item had unique availability settings  
**After**: **"Availability Rules can be named, saved, and reused across objects"**  
**Impact**: Indicates a more scalable, template-based approach

#### 3. Query Requirements
**Before**: Assumed system would filter content based on user context  
**After**: **"Queries must exactly match all defined dimension values"**  
**Impact**: Requires explicit dimension specification in every query

#### 4. Time Travel Capability
**Before**: Only considered current timestamp for availability  
**After**: **"Time Travel: Ability to query object availability at specific points in time"**  
**Impact**: Historical and future availability queries are supported

### 🆕 New Concepts Discovered

#### 1. Availability Rules as Objects
```
Previously: Thought availability was just metadata on content
Now: Availability Rules are first-class objects that can be:
- Named and saved
- Reused across multiple objects  
- Managed independently
```

#### 2. Strict No-Default Policy
```
Previously: Expected graceful fallbacks or wildcards
Now: "No partial matches or default/wildcard access allowed"
- Every dimension must be explicitly specified
- Missing dimensions = no access
- Zero tolerance for ambiguous access patterns
```

#### 3. Business-Focused Use Cases
```
Previously: Focused on technical implementation
Now: Clear business applications:
- Content merchandising
- Precise content curation  
- Targeted content delivery
- Granular access control across user segments
```

#### 4. Integration with Skylark Features
```
Previously: Saw availability as standalone system
Now: Integrates with:
- Content modeling
- Versioning and drafts
- Sophisticated content management strategies
```

### 📊 Updated Understanding Matrix

| Aspect | Previous Understanding | Official Documentation | Status |
|--------|----------------------|----------------------|---------|
| **Core Purpose** | Access control system | Determines if object can be viewed by end-users | ✅ Aligned |
| **Dimensions** | 4 separate systems | Unified "Dimensions" concept | 🔄 Terminology updated |
| **Time Control** | Start times only | Start AND end times required | ❌ Incomplete - missed end times |
| **Matching Logic** | Flexible matching | Extremely strict matching, no partials | ⚠️ More restrictive |
| **Rule Management** | Per-content configuration | Reusable named rules | 🆕 New concept |
| **Query Requirements** | Implicit user context | Explicit dimension specification required | 🆕 New requirement |
| **Time Travel** | Current timestamp only | Historical/future querying supported | 🆕 New capability |

### 🔍 Key Revelations

#### 1. **Strictness Level**
The documentation emphasizes **"extremely strict"** matching. This is more restrictive than typical access control systems:
- Every dimension must be explicitly provided
- No fuzzy matching or wildcards
- No graceful degradation to broader access

#### 2. **Business vs Technical Focus**
My initial analysis was very technical (data structures, relationships). The documentation emphasizes **business outcomes**:
- Content merchandising strategies
- Precise editorial control
- Targeted audience delivery

#### 3. **Platform Philosophy**
Skylark prioritizes **precision over convenience**:
- Explicit over implicit behavior
- Strict over permissive access
- Predictable over flexible outcomes

### 📝 Corrected Data Structure Understanding

#### Before (from airtable analysis):
```json
{
  "availability": {
    "customers": ["premium", "standard"], 
    "devices": ["mobile", "pc"],
    "regions": ["europe", "north-america"],
    "starts": "2000-01-01T00:00:00.000Z"
  }
}
```

#### After (documentation-informed):
```json
{
  "availabilityRule": {
    "name": "Premium Content - EU/NA",
    "dimensions": {
      "customerType": ["premium", "standard"],
      "deviceType": ["mobile", "pc"], 
      "region": ["europe", "north-america"]
    },
    "timeWindow": {
      "start": "2000-01-01T00:00:00.000Z",
      "end": "2030-12-31T23:59:59.000Z"
    }
  }
}
```

### 🎯 Updated Implementation Requirements

#### 1. **Dimension Validation**
```typescript
// Previous approach (partial matching)
if (userRegion.includes(availableRegions)) { /* allow */ }

// Correct approach (strict matching)  
if (availableRegions.includes(userRegion) && 
    availableDevices.includes(userDevice) && 
    availableCustomers.includes(userCustomer)) { /* allow */ }
```

#### 2. **Time Window Checking**
```typescript
// Previous approach (start time only)
if (currentTime >= availability.starts) { /* allow */ }

// Correct approach (start and end times)
if (currentTime >= availability.starts && 
    currentTime <= availability.ends) { /* allow */ }
```

#### 3. **Query Structure**
```typescript
// Previous approach (implicit context)
getContent() // assumes user context available

// Correct approach (explicit dimensions)
getContent({
  dimensions: {
    customerType: "premium",
    deviceType: "mobile", 
    region: "europe"
  },
  timestamp: "2025-07-10T10:00:00.000Z"
})
```

### 🚀 Enhanced Implementation Strategy

#### 1. **Availability Rule Processing**
- Parse availability records as reusable rules
- Implement strict dimension matching logic
- Add time window validation with start AND end times

#### 2. **Query Enhancement**
- Require explicit dimension specification in GraphQL queries
- Add timestamp parameter for time travel queries
- Implement strict "all-or-nothing" matching logic

#### 3. **Business Use Case Support**
- Enable content merchandising workflows
- Support precise content curation
- Implement targeted content delivery patterns

## Key Differences Summary

| Learning Source | Strength | Gap |
|----------------|----------|-----|
| **Airtable Analysis** | Accurate data structure identification | Missing business context and strictness requirements |
| **Official Documentation** | Clear business purpose and strict requirements | Less detail on implementation specifics |
| **Combined Understanding** | Complete technical + business picture | Implementation still needs to be built |

## Updated Questions for Future Learning

1. **Time Travel Implementation**: How exactly do time travel queries work in GraphQL?
2. **Dimension Discovery**: How do clients know what dimensions are available?
3. **Rule Management**: How are availability rules created, updated, and managed?
4. **Performance**: How does strict matching affect query performance at scale?
5. **Error Handling**: What happens when queries don't specify all required dimensions?

## Next Steps

1. **Update Mock Implementation**: Apply strict matching and time window logic
2. **Add Time Travel Support**: Implement timestamp-based availability queries  
3. **Enhance Query Structure**: Require explicit dimension specification
4. **Business Use Case Testing**: Validate content merchandising scenarios
5. **Documentation Alignment**: Ensure implementation matches official behavior

---

*After reviewing official documentation, my understanding has significantly evolved from a technical data-structure focus to a business-oriented, strictly-controlled access system. The key insight is that Skylark prioritizes precision and predictability over convenience and flexibility.*