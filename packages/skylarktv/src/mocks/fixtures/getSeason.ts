import { graphql } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  convertMediaObjectToGraphQL,
  extractRequestContext,
  createGraphQLResponse,
  fetchAndParseMediaObject,
  findChildObjects,
  sortByProperty,
  findObjectByUidOrExternalId,
} from "../airtableData";
import { parseSeason } from "../airtable/parse-media-objects";

export const getSeasonHandlers = [
  // Handle Season and Episodes query
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_SEASON_AND_EPISODES", ({ variables, request }) => {
      const requestContext = extractRequestContext(request.headers);

      // First get the airtable object to ensure we have it for finding episodes
      const airtableObj = findObjectByUidOrExternalId(
        airtableData.mediaObjects,
        variables,
      );

      if (!airtableObj) {
        return createGraphQLResponse(null);
      }

      const season = fetchAndParseMediaObject(
        variables,
        "season",
        parseSeason,
        {
          currentDepth: 0,
          ...requestContext,
        },
      );

      if (!season) {
        return createGraphQLResponse(null);
      }

      // Find episodes that belong to this season using the parent field
      const episodes = findChildObjects(airtableObj.id, "episode")
        .map((episodeObj) =>
          convertMediaObjectToGraphQL({
            airtableObj: episodeObj,
            currentDepth: 1,
            ...requestContext,
          }),
        )
        .filter((ep): ep is NonNullable<typeof ep> => ep !== null);

      // Sort episodes by episode_number
      const sortedEpisodes = sortByProperty(
        episodes as Record<string, unknown>[],
        "episode_number",
      );

      // Add episodes to the season object
      const seasonWithEpisodes = {
        ...season,
        episodes: {
          objects: sortedEpisodes,
        },
      };

      return createGraphQLResponse(seasonWithEpisodes);
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_SEASON_THUMBNAIL", ({ variables, request }) => {
      const requestContext = extractRequestContext(request.headers);

      const season = fetchAndParseMediaObject(
        variables,
        "season",
        parseSeason,
        {
          currentDepth: 0,
          ...requestContext,
        },
      );

      if (season) {
        // Return only thumbnail fields
        return createGraphQLResponse({
          uid: season.uid,
          __typename: season.__typename,
          slug: season.slug,
          title: season.title,
          title_short: season.title_short,
          synopsis: season.synopsis,
          synopsis_short: season.synopsis_short,
          release_date: season.release_date as string | null,
          season_number:
            "season_number" in season ? season.season_number : undefined,
          images: season.images,
        });
      }

      return createGraphQLResponse(null);
    }),
];
