import { graphql } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  assertNumber,
  extractRequestContext,
  createGraphQLResponse,
  fetchAndParseMediaObject,
  findChildObjects,
  sortByProperty,
  findObjectByUidOrExternalId,
} from "../airtableData";
import { parseBrand, parseSeason } from "../airtable/parse-media-objects";

export const getBrandHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_BRAND", ({ variables, request }) => {
      const requestContext = extractRequestContext(request.headers);

      const brand = fetchAndParseMediaObject(variables, "brand", parseBrand, {
        currentDepth: 0,
        ...requestContext,
      });

      const airtableObj = brand
        ? findObjectByUidOrExternalId(airtableData.mediaObjects, variables)
        : null;

      if (brand && airtableObj) {
        // Find seasons that belong to this brand
        const seasons = findChildObjects(airtableObj.id, "season")
          .map((seasonObj) => {
            const season = parseSeason({
              airtableObj: seasonObj,
              currentDepth: 1,
              ...requestContext,
            });
            if (!season) return null;

            // Find episodes for each season using the parent field
            const episodes = findChildObjects(seasonObj.id, "episode").map(
              (ep) => ({
                __typename: "Episode",
                uid: ep.id,
                slug: ep.fields.slug,
                episode_number: assertNumber(ep.fields.episode_number),
              }),
            );

            // Sort episodes by episode_number
            const sortedEpisodes = sortByProperty(
              episodes as Record<string, unknown>[],
              "episode_number",
            );

            return {
              ...season,
              episodes: { objects: sortedEpisodes },
            };
          })
          .filter((s): s is NonNullable<typeof s> => s !== null);

        // Sort seasons by season_number
        const sortedSeasons = sortByProperty(
          seasons as Record<string, unknown>[],
          "season_number",
        );

        return createGraphQLResponse({
          ...brand,
          seasons: { objects: sortedSeasons },
        });
      }

      return createGraphQLResponse(null);
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_BRAND_THUMBNAIL", ({ variables, request }) => {
      const requestContext = extractRequestContext(request.headers);

      const brand = fetchAndParseMediaObject(variables, "brand", parseBrand, {
        currentDepth: 0,
        ...requestContext,
      });

      if (brand) {
        // Return only thumbnail fields
        return createGraphQLResponse({
          uid: brand.uid,
          __typename: brand.__typename,
          slug: brand.slug,
          title: brand.title,
          title_short: brand.title_short,
          synopsis: brand.synopsis,
          synopsis_short: brand.synopsis_short,
          release_date: brand.release_date as string | null,
          images: brand.images,
          tags: brand.tags,
        });
      }

      return createGraphQLResponse(null);
    }),
];
