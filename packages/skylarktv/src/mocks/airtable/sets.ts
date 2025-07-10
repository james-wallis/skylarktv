// eslint-disable-next-line import/no-extraneous-dependencies
import { Record as AirtableRecord, FieldSet } from "airtable";
import { airtableData, getSetById, getImageById } from "./data";
import { convertMediaObjectToGraphQL } from "./media-objects";
import { generateDynamicContent } from "./dynamic-content";
import {
  assertStringArray,
  DEPTH_LIMIT_CONFIG,
  wrapObjectsOrNull,
} from "./utils";
import {
  filterContentByAvailability,
  AvailabilityDimensions,
} from "./availability";
import { parseCallToAction, parseImage } from "./parse-metadata-objects";

export const getSetContent = (set: AirtableRecord<FieldSet>): string[] => {
  // First try the content field
  if (set.fields.content && Array.isArray(set.fields.content)) {
    return assertStringArray(set.fields.content) || [];
  }

  // If no content, try the sets field (which may reference other sets)
  if (set.fields.sets && Array.isArray(set.fields.sets)) {
    // For sets that reference other sets, we need to get the content from the referenced sets
    const setIds = assertStringArray(set.fields.sets) || [];
    const allContent = setIds.flatMap((setId) => {
      const referencedSet = getSetById(setId);
      return referencedSet ? getSetContent(referencedSet) : [];
    });
    return allContent;
  }

  // If no content or sets, try dynamic_content
  if (set.fields.dynamic_content || set.fields["Dynamic Content"]) {
    return generateDynamicContent(set);
  }

  return [];
};

// Helper function to resolve a set reference to the actual set
export const resolveSetReference = (setReferenceId: string) => {
  // First, find the media object that represents this set reference
  const setReference = airtableData.mediaObjects?.find(
    (obj) => obj.id === setReferenceId,
  );

  // Use the skylarkset_external_id field to find the matching set
  const skylarksetExternalId = setReference?.fields.skylarkset_external_id;

  // Find the actual set by matching skylarkset_external_id to external_id
  const actualSet =
    skylarksetExternalId &&
    airtableData.sets?.find(
      (set) => set.fields.external_id === skylarksetExternalId,
    );

  return actualSet;
};

// Helper function to get set metadata for a given set ID
const getSetMetadata = (setId: string) => {
  // First find the English language record
  const englishLanguage = airtableData.languages?.find(
    (lang) => lang.fields.code === "en-GB",
  );

  if (!englishLanguage) {
    return null;
  }

  // Find metadata for this set with English language
  const metadata = airtableData.setsMetadata?.find((meta) => {
    // Handle set field as either string or array
    const setIds = Array.isArray(meta.fields.set)
      ? meta.fields.set
      : [meta.fields.set];
    const hasMatchingSet = setIds.includes(setId);

    // Handle language field as either string or array
    const languageIds = Array.isArray(meta.fields.language)
      ? meta.fields.language
      : [meta.fields.language];
    const hasEnglishLanguage = languageIds.includes(englishLanguage.id);

    return hasMatchingSet && hasEnglishLanguage;
  });

  return metadata;
};

// Options for convertSetToGraphQL function
export interface ConvertSetToGraphQLOptions {
  airtableSet: AirtableRecord<FieldSet>;
  currentDepth?: number;
  languageCode?: string;
  requestedDimensions?: AvailabilityDimensions;
}

// Convert Airtable set to GraphQL format with content
export const convertSetToGraphQL = (
  options: ConvertSetToGraphQLOptions,
): object | null => {
  const {
    airtableSet,
    currentDepth = 0,
    languageCode,
    requestedDimensions,
  } = options;
  const { fields } = airtableSet;

  // Get metadata for this set (English language)
  const metadata = getSetMetadata(airtableSet.id);

  // Use metadata fields if available, fallback to base set fields
  const finalFields = metadata ? { ...fields, ...metadata.fields } : fields;

  // Check if any dimensions are actually requested for set-level filtering
  const hasDimensionsRequested =
    requestedDimensions &&
    ((requestedDimensions.customerTypes?.length ?? 0) > 0 ||
      (requestedDimensions.deviceTypes?.length ?? 0) > 0 ||
      (requestedDimensions.regions?.length ?? 0) > 0);

  // Filter the set itself by availability if dimensions are requested
  if (hasDimensionsRequested && requestedDimensions) {
    const setAvailabilityIds =
      assertStringArray(finalFields.availability) || [];
    const hasSetAccess = filterContentByAvailability(
      setAvailabilityIds,
      requestedDimensions,
      airtableData,
    );

    // If the set doesn't have access, return null to filter it out
    if (!hasSetAccess) {
      return null;
    }
  }

  // Use the set_type field from Airtable data, fallback to type field, then default
  // and convert to uppercase if needed (Airtable might have lowercase values)
  const setType = (
    (finalFields.set_type || finalFields.type || "RAIL") as string
  ).toUpperCase();

  // Get content for this set
  const contentIds = getSetContent(airtableSet);
  const isDynamic = !!airtableSet.fields.dynamic_content;

  // Build content objects with SetContent wrapper - only if within depth limit
  const contentObjects =
    currentDepth + 1 < DEPTH_LIMIT_CONFIG.MAX_DEPTH
      ? contentIds
          .map((contentId: string, index: number) => {
            let contentObj: object | null = null;

            // Check if this content ID refers to a set reference in mediaObjects
            const setReference = airtableData.mediaObjects.find(
              (obj) => obj.id === contentId,
            );

            if (
              setReference &&
              setReference.fields.skylark_object_type === "SkylarkSet"
            ) {
              // This is a set reference, resolve it to the actual set
              const referencedSet = resolveSetReference(contentId);
              if (referencedSet) {
                contentObj = convertSetToGraphQL({
                  airtableSet: referencedSet,
                  currentDepth: currentDepth + 1,
                  languageCode,
                  requestedDimensions,
                });
                // Note: contentObj could be null if the nested set is filtered out by availability
              }
            } else {
              // Otherwise try to find it directly as a media object
              const mediaObj = airtableData.mediaObjects.find(
                (obj) => obj.id === contentId,
              );
              contentObj = mediaObj
                ? convertMediaObjectToGraphQL({
                    airtableObj: mediaObj,
                    currentDepth: currentDepth + 1,
                    languageCode,
                    requestedDimensions,
                  })
                : null;
            }

            if (!contentObj) return null;

            return {
              __typename: "SetContent",
              dynamic: isDynamic,
              object: contentObj,
              position: index + 1,
            };
          })
          .filter(Boolean)
      : null;

  // Process images for sets (same logic as media objects)
  const images = finalFields.images
    ? (Array.isArray(finalFields.images)
        ? finalFields.images
        : [finalFields.images]
      )
        .map((imgId: string) => {
          const img = getImageById(imgId);
          return parseImage(img);
        })
        .filter(Boolean)
    : [];

  // Process call to actions for sets
  const callToActionIds = assertStringArray(finalFields.call_to_actions) || [];
  const callToActionObjects = callToActionIds
    .map((ctaId) => {
      const ctaRecord = airtableData.callToActions?.find(
        (cta) => cta.id === ctaId,
      );
      return parseCallToAction(ctaRecord, { languageCode });
    })
    .filter(Boolean);

  return {
    __typename: "SkylarkSet",
    uid: airtableSet.id,
    external_id: finalFields.external_id || airtableSet.id,
    title: finalFields.title || finalFields.internal_title || finalFields.name,
    title_short: finalFields.title_short,
    type: setType,
    slug: finalFields.slug,
    set_type_slug: finalFields.set_type_slug,
    internal_title: finalFields.internal_title,
    images: { objects: images },
    content: wrapObjectsOrNull(contentObjects),
    call_to_actions: { objects: callToActionObjects },
  };
};
