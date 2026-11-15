// Utilities for media object fetching, parsing, and relationship resolution
// eslint-disable-next-line import/no-extraneous-dependencies
import { Record as AirtableRecord, FieldSet } from "airtable";
import { airtableData, getMediaObjectByUidOrExternalId } from "./data";
import { assertStringArray, isObjectType } from "./utils";
import {
  AvailabilityDimensions,
  filterContentByAvailability,
  hasDimensionsRequested,
} from "./availability";
import { MediaObjectParseOptions } from "./parseMediaObjects";
import { convertMediaObjectToGraphQL } from "./mediaObjects";

// Fetch and parse media object with type checking
export const fetchAndParseMediaObject = <T>(
  variables: { uid?: string; externalId?: string },
  objectType: string,
  parser: (options: MediaObjectParseOptions) => T | null,
  parseOptions: Omit<MediaObjectParseOptions, "airtableObj">,
): T | null => {
  const airtableObj = getMediaObjectByUidOrExternalId(
    variables.uid,
    variables.externalId,
  );

  if (!airtableObj || !isObjectType(airtableObj, objectType)) {
    return null;
  }

  return parser({
    ...parseOptions,
    airtableObj,
  });
};

// Find child objects by parent ID and type
export const findChildObjects = (
  parentId: string,
  childType: string,
): AirtableRecord<FieldSet>[] =>
  airtableData.mediaObjects.filter((obj) => {
    if (!isObjectType(obj, childType)) return false;

    const { parent } = obj.fields;
    if (!parent) return false;

    // Handle both array and single value parent fields
    if (Array.isArray(parent)) {
      return parent.includes(parentId);
    }

    return parent === parentId;
  });

// Check a raw Airtable media object against the request's availability
// dimensions and time travel date (mirrors the check in parseMediaObject)
export const isMediaObjectAvailable = (
  airtableObj: AirtableRecord<FieldSet>,
  {
    requestedDimensions,
    timeTravelDate,
  }: {
    requestedDimensions?: AvailabilityDimensions;
    timeTravelDate?: Date | null;
  },
): boolean =>
  !hasDimensionsRequested(requestedDimensions) ||
  filterContentByAvailability(
    assertStringArray(airtableObj.fields.availability) || [],
    requestedDimensions,
    airtableData,
    timeTravelDate,
  );

// Find objects by metadata field (genres, tags, etc.)
export const findObjectsByMetadata = (
  metadataField: string,
  metadataId: string,
  objectType: string,
  parseOptions: Omit<MediaObjectParseOptions, "airtableObj">,
): ReturnType<typeof convertMediaObjectToGraphQL>[] =>
  airtableData.mediaObjects
    .filter((obj) => {
      if (!isObjectType(obj, objectType)) return false;

      const metadata = obj.fields[metadataField];
      if (!metadata) return false;

      // Handle both array and single value metadata fields
      const metadataArray = Array.isArray(metadata) ? metadata : [metadata];
      return metadataArray.includes(metadataId);
    })
    .map((obj) =>
      convertMediaObjectToGraphQL({
        ...parseOptions,
        airtableObj: obj,
      }),
    )
    .filter((item): item is NonNullable<typeof item> => item !== null);
