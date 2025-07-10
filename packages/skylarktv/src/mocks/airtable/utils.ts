// eslint-disable-next-line import/no-extraneous-dependencies
import { Record as AirtableRecord, Attachment, FieldSet } from "airtable";
import { Airtables } from "../../types/airtable";
import { Maybe } from "../../types";

// Extract availability dimensions from request headers (case insensitive)
export interface AvailabilityDimensions {
  customerTypes: string[];
  deviceTypes: string[];
  regions: string[];
}

export type AirtableField = FieldSet[string];

// Utility functions for type assertions
export const assertString = (value: Maybe<AirtableField>): string | null =>
  typeof value === "string" ? value : null;

export const assertNumber = (value: Maybe<AirtableField>): number | null =>
  typeof value === "number" ? value : null;

export const assertStringArray = (
  value: Maybe<AirtableField>,
): string[] | null => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return null;
};

export const assertSingleString = (
  value: Maybe<AirtableField>,
): string | null => {
  if (Array.isArray(value)) {
    return value.length > 0 ? assertString(value[0] as AirtableField) : null;
  }
  return assertString(value);
};

// Configuration for depth limiting
export const DEPTH_LIMIT_CONFIG = {
  MAX_DEPTH: 5,
};

// Reusable function to process nested relationships with depth limiting
export const processNestedRelationships = <T>(
  relationshipIds: AirtableField,
  processor: (id: string) => T | null,
  currentDepth: number,
  relationshipDepthCost: number = 1,
): T[] | null => {
  // If we're at or beyond the depth limit, return null
  if (currentDepth + relationshipDepthCost >= DEPTH_LIMIT_CONFIG.MAX_DEPTH) {
    return null;
  }

  if (!relationshipIds) {
    return [];
  }

  // Handle different types of relationship fields
  let idsArray: string[] = [];

  if (Array.isArray(relationshipIds)) {
    // Filter to only string values
    idsArray = relationshipIds.filter(
      (id): id is string => typeof id === "string",
    );
  } else if (typeof relationshipIds === "string") {
    idsArray = [relationshipIds];
  }

  // If we couldn't extract any string IDs, return empty array
  if (idsArray.length === 0) {
    return [];
  }

  return idsArray.map(processor).filter((item): item is T => item !== null);
};

// Reusable function to wrap objects in GraphQL objects structure or return null
export const wrapObjectsOrNull = <T>(
  items: T[] | null,
): { objects: T[]; count: number; next_token: null } | null =>
  items !== null
    ? { objects: items, count: items.length, next_token: null }
    : null;

// Helper function to get image URL from image object
export const getImageUrl = (img: AirtableRecord<FieldSet>): string | null => {
  let url =
    assertString(img.fields.cloudinary_url) ||
    assertString(img.fields.url) ||
    assertString(img.fields.external_url) ||
    assertString(img.fields.external_url_old);

  // If no direct URL, try to get from image attachments
  if (
    !url &&
    img.fields.image &&
    Array.isArray(img.fields.image) &&
    img.fields.image[0] &&
    "url" in img.fields.image[0] &&
    assertString((img.fields.image[0] as Attachment).url)
  ) {
    url = (img.fields.image[0] as Attachment).url;
  }

  return url || null;
};

// Helper function to check if an object matches a given type (handles both lowercase and capitalized variants)
export const isObjectType = (
  obj: AirtableRecord<FieldSet>,
  type: string,
): boolean => {
  const objectType = obj.fields.skylark_object_type;
  if (!objectType || typeof objectType !== "string") return false;

  // Handle plural/singular and case variations
  const typeVariants = [
    type,
    type.toLowerCase(),
    type.charAt(0).toUpperCase() + type.slice(1),
    // Handle specific plural/singular conversions
    type === "movie" || type === "movies" ? ["movie", "movies", "Movie"] : [],
    type === "episode" || type === "episodes"
      ? ["episode", "episodes", "Episode"]
      : [],
    type === "season" || type === "seasons"
      ? ["season", "seasons", "Season"]
      : [],
    type === "brand" || type === "brands" ? ["brand", "brands", "Brand"] : [],
    type === "live-stream" || type === "LiveStream"
      ? ["live-stream", "live-streams", "LiveStream"]
      : [],
  ].flat();

  return typeVariants.includes(objectType);
};

// Helper function to highlight search terms in text
export const highlightSearchTerm = (
  text: Maybe<AirtableField>,
  searchTerm: string,
): string | null => {
  const textStr = assertString(text);
  if (!textStr || !searchTerm) return textStr;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return textStr.replace(regex, '<span class="search-highlight">$1</span>');
};

// Normalize text for flexible searching (handles punctuation differences)
export const normalizeSearchText = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
    .replace(/[^\w\s]/g, "") // Remove other punctuation
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim();

// Flexible search that handles punctuation differences
export const flexibleTextMatch = (
  text: string,
  searchTerm: string,
): boolean => {
  const normalizedText = normalizeSearchText(text);
  const normalizedSearch = normalizeSearchText(searchTerm);
  return normalizedText.includes(normalizedSearch);
};

// Translation support functions
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

// Merge translated fields with main object fields
export const mergeTranslatedContent = (
  mainFields: FieldSet,
  translationFields: FieldSet | null,
): FieldSet => {
  if (!translationFields) {
    return mainFields;
  }

  // Fields that can be translated
  const translatableFields = [
    "title",
    "title_short",
    "synopsis",
    "synopsis_short",
    // Call to action fields
    "text",
    "text_short",
    "description",
    "description_short",
    "internal_title",
    // Person/People fields
    "name",
    "bio_long",
    "bio_medium",
    "bio_short",
  ];

  const mergedFields = { ...mainFields };

  // Override with translated content where available
  translatableFields.forEach((field) => {
    const translatedValue = translationFields[field];
    if (translatedValue) {
      mergedFields[field] = translatedValue;
    }
  });

  return mergedFields;
};

// Availability support functions
export const checkAvailabilityMatch = (
  availabilityRecord: AirtableRecord<FieldSet>,
  requestedDimensions: AvailabilityDimensions,
  airtableData: Airtables,
): boolean => {
  // Get the availability record's dimensions
  let availabilityCustomers =
    assertStringArray(availabilityRecord.fields.customers) || [];
  let availabilityDevices =
    assertStringArray(availabilityRecord.fields.devices) || [];
  let availabilityRegions =
    assertStringArray(availabilityRecord.fields.regions) || [];

  // If no direct dimensions, check if this availability uses segments
  const availabilitySegments =
    assertStringArray(availabilityRecord.fields.segments) || [];

  // If segments are used, resolve them to all dimension types
  if (availabilitySegments.length > 0) {
    availabilitySegments.forEach((segmentId) => {
      const segment = airtableData.audienceSegments?.find(
        (s) => s.id === segmentId,
      );
      if (segment) {
        const segmentCustomers =
          assertStringArray(segment.fields.customers) || [];
        const segmentDevices = assertStringArray(segment.fields.devices) || [];
        const segmentRegions = assertStringArray(segment.fields.regions) || [];

        // Merge segment dimensions with existing dimensions
        if (availabilityCustomers.length === 0) {
          availabilityCustomers = [...segmentCustomers];
        }
        if (availabilityDevices.length === 0) {
          availabilityDevices = [...segmentDevices];
        }
        if (availabilityRegions.length === 0) {
          availabilityRegions = [...segmentRegions];
        }
      }
    });
  }

  // Helper function to check if any requested dimension matches any available dimension (case insensitive)
  const hasMatchingDimension = (
    requested: string[],
    available: string[],
    dimensionType: string,
  ) => {
    if (requested.length === 0) return true; // No dimensions requested means no restriction
    if (available.length === 0) return false; // No dimensions available means no access

    // Get dimension names from IDs for comparison
    const getNameFromId = (id: string, type: string) => {
      // Type-safe access to airtable data arrays
      let dataArray: AirtableRecord<FieldSet>[] | undefined;
      if (type === "customerTypes")
        dataArray = airtableData.dimensions?.customerTypes;
      else if (type === "deviceTypes")
        dataArray = airtableData.dimensions?.deviceTypes;
      else if (type === "regions") dataArray = airtableData.dimensions?.regions;
      else dataArray = undefined;

      if (!dataArray) return id;

      const record = dataArray.find((item) => item.id === id);
      if (!record) return id;

      // Try different possible name fields - prioritize slug for machine-readable identifiers
      const name =
        record.fields.slug || record.fields.name || record.fields.title || id;
      return typeof name === "string" ? name.toLowerCase() : id;
    };

    const availableNames = available.map((id) =>
      getNameFromId(id, dimensionType),
    );
    return requested.some((reqDim) =>
      availableNames.some(
        (availName) => availName.includes(reqDim) || reqDim.includes(availName),
      ),
    );
  };

  // Check all dimensions - all must match for strict availability
  const customerMatch = hasMatchingDimension(
    requestedDimensions.customerTypes,
    availabilityCustomers,
    "customerTypes",
  );

  const deviceMatch = hasMatchingDimension(
    requestedDimensions.deviceTypes,
    availabilityDevices,
    "deviceTypes",
  );

  const regionMatch = hasMatchingDimension(
    requestedDimensions.regions,
    availabilityRegions,
    "regions",
  );

  return customerMatch && deviceMatch && regionMatch;
};

export const filterContentByAvailability = (
  contentAvailabilityIds: string[],
  requestedDimensions: AvailabilityDimensions,
  airtableData: Airtables,
): boolean => {
  let availabilityIdsToCheck = contentAvailabilityIds;

  // If no availability records, use the default availability record
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

  // Content is available if ANY of its availability records match the requested dimensions
  const hasMatch = availabilityIdsToCheck.some((availabilityId) => {
    const availabilityRecord = airtableData.availability?.find(
      (avail) => avail.id === availabilityId,
    );

    if (!availabilityRecord) return false;

    return checkAvailabilityMatch(
      availabilityRecord,
      requestedDimensions,
      airtableData,
    );
  });

  return hasMatch;
};

// Generic sorting function that handles different property types
export const sortByProperty = <T extends object>(
  objects: T[],
  primaryProperty: keyof T,
  fallbackProperty?: keyof T,
  order: "asc" | "desc" = "asc",
): T[] =>
  objects.sort((a, b) => {
    let aValue = a[primaryProperty];
    let bValue = b[primaryProperty];

    // Use fallback if primary value is missing
    if ((aValue === undefined || aValue === null) && fallbackProperty) {
      aValue = a[fallbackProperty];
    }
    if ((bValue === undefined || bValue === null) && fallbackProperty) {
      bValue = b[fallbackProperty];
    }

    // Handle undefined/null values
    if (aValue === undefined || aValue === null) aValue = "" as T[keyof T];
    if (bValue === undefined || bValue === null) bValue = "" as T[keyof T];

    // Numeric comparison for numbers
    if (typeof aValue === "number" && typeof bValue === "number") {
      return order === "asc" ? aValue - bValue : bValue - aValue;
    }

    // String comparison for strings (with numeric awareness)
    const comparison = String(aValue).localeCompare(String(bValue), undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return order === "asc" ? comparison : -comparison;
  });

// Convenience function for title sorting
export const sortByTitle = <T extends { title_sort?: string; title?: string }>(
  objects: T[],
): T[] => sortByProperty(objects, "title_sort", "title");
