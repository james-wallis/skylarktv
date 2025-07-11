// Utilities for media object fetching, parsing, and relationship resolution
// eslint-disable-next-line import/no-extraneous-dependencies
import { Record as AirtableRecord, FieldSet } from "airtable";
import { airtableData, getMediaObjectByUidOrExternalId } from "./data";
import { isObjectType } from "./utils";
import { MediaObjectParseOptions } from "./parse-media-objects";
import { convertMediaObjectToGraphQL } from "./media-objects";

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
