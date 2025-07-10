import { airtableData } from "./data";
import { isObjectType } from "./utils";
import {
  parseMovie,
  parseEpisode,
  parseSeason,
  parseBrand,
  parseLiveStream,
  MediaObjectParseOptions,
} from "./parse-media-objects";

// Options for convertMediaObjectToGraphQL function (alias for compatibility)
export type ConvertMediaObjectOptions = MediaObjectParseOptions;

// Re-export the media object parsing functions for backward compatibility
export {
  parseMovie,
  parseEpisode,
  parseSeason,
  parseBrand,
  parseLiveStream,
} from "./parse-media-objects";

export type { MediaObjectParseOptions } from "./parse-media-objects";

// Convert Airtable media object to GraphQL format
export const convertMediaObjectToGraphQL = (
  options: ConvertMediaObjectOptions,
) => {
  const { airtableObj } = options;

  if (!airtableObj || !airtableObj.fields) {
    return null;
  }

  const objectType = airtableObj.fields.skylark_object_type;

  // Dispatch to appropriate type-specific parser
  if (objectType === "episodes" || objectType === "Episode") {
    return parseEpisode(options);
  }
  if (objectType === "seasons" || objectType === "Season") {
    return parseSeason(options);
  }
  if (objectType === "brands" || objectType === "Brand") {
    return parseBrand(options);
  }
  if (objectType === "movies" || objectType === "Movie") {
    return parseMovie(options);
  }
  if (objectType === "live-streams" || objectType === "LiveStream") {
    return parseLiveStream(options);
  }

  // Default to movie parser for unknown types
  return parseMovie(options);
};

// Options for getObjectsByType function
export interface GetObjectsByTypeOptions {
  type: string;
  depth: number;
  languageCode?: string;
}

// Get all objects of a specific type
export const getObjectsByType = (options: GetObjectsByTypeOptions) => {
  const { type, depth, languageCode } = options;

  const filtered = airtableData.mediaObjects.filter((obj) =>
    isObjectType(obj, type),
  );

  return filtered
    .map((obj) =>
      convertMediaObjectToGraphQL({
        airtableObj: obj,
        currentDepth: depth,
        languageCode,
      }),
    )
    .filter(Boolean);
};
