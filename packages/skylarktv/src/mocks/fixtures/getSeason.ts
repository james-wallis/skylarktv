import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  getMediaObjectByUidOrExternalId,
  convertMediaObjectToGraphQL,
  isObjectType,
} from "../airtableData";

export const getSeasonHandlers = [
  // Handle Season and Episodes query
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_SEASON_AND_EPISODES", ({ variables }) => {
      const airtableObj = getMediaObjectByUidOrExternalId(
        variables.uid,
        variables.externalId,
      );
      const season =
        airtableObj && isObjectType(airtableObj, "season")
          ? convertMediaObjectToGraphQL(airtableObj)
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
        .map(convertMediaObjectToGraphQL)
        .filter((ep): ep is NonNullable<typeof ep> => ep !== null)
        .sort((a, b) => {
          const aNum =
            "episode_number" in a && typeof a.episode_number === "number"
              ? a.episode_number
              : 0;
          const bNum =
            "episode_number" in b && typeof b.episode_number === "number"
              ? b.episode_number
              : 0;
          return aNum - bNum;
        });

      // Add episodes to the season object
      const seasonWithEpisodes = {
        ...season,
        episodes: {
          objects: episodes,
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
    >("GET_SEASON_THUMBNAIL", ({ variables }) => {
      const airtableObj = getMediaObjectByUidOrExternalId(
        variables.uid,
        variables.externalId,
      );
      const season =
        airtableObj && isObjectType(airtableObj, "season")
          ? convertMediaObjectToGraphQL(airtableObj)
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
              release_date: season.release_date,
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
