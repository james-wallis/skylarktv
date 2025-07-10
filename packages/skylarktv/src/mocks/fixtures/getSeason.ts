import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  getMediaObjectByUidOrExternalId,
  convertMediaObjectToGraphQL,
  isObjectType,
  getLanguageFromRequest,
  getAvailabilityDimensionsFromRequest,
  sortByProperty,
} from "../airtableData";
import { parseSeason } from "../airtable/parse-media-objects";

export const getSeasonHandlers = [
  // Handle Season and Episodes query
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_SEASON_AND_EPISODES", ({ variables, request }) => {
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );

      const airtableObj = getMediaObjectByUidOrExternalId(
        variables.uid,
        variables.externalId,
      );
      const season =
        airtableObj && isObjectType(airtableObj, "season")
          ? parseSeason({
              airtableObj,
              currentDepth: 0,
              languageCode,
              requestedDimensions,
            })
          : null;

      if (!season || !airtableObj) {
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      // Find episodes that belong to this season using the parent field
      const episodes = airtableData.mediaObjects
        .filter((obj) => {
          if (!isObjectType(obj, "episode")) return false;

          // Check if the episode's parent field contains this season's ID
          return (
            (obj.fields.parent &&
              Array.isArray(obj.fields.parent) &&
              obj.fields.parent.includes(airtableObj.id)) ||
            obj.fields.parent === airtableObj.id
          );
        })
        .map((episodeObj) =>
          convertMediaObjectToGraphQL({
            airtableObj: episodeObj,
            currentDepth: 1,
            languageCode,
            requestedDimensions,
          }),
        ) // Episodes are at depth 1 (Season -> Episodes)
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

      return HttpResponse.json({
        data: {
          getObject: seasonWithEpisodes,
        },
      });
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_SEASON_THUMBNAIL", ({ variables, request }) => {
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );

      const airtableObj = getMediaObjectByUidOrExternalId(
        variables.uid,
        variables.externalId,
      );
      const season =
        airtableObj && isObjectType(airtableObj, "season")
          ? parseSeason({
              airtableObj,
              currentDepth: 0,
              languageCode,
              requestedDimensions,
            })
          : null;

      if (season) {
        // Return only thumbnail fields
        return HttpResponse.json({
          data: {
            getObject: {
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
            },
          },
        });
      }

      return HttpResponse.json({
        data: { getObject: null },
      });
    }),
];
