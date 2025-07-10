import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  getMediaObjectByUidOrExternalId,
  isObjectType,
  assertNumber,
  assertStringArray,
  getLanguageFromRequest,
  getAvailabilityDimensionsFromRequest,
  sortByProperty,
} from "../airtableData";
import { parseBrand, parseSeason } from "../airtable/parse-media-objects";

export const getBrandHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_BRAND", ({ variables, request }) => {
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );

      const airtableObj = getMediaObjectByUidOrExternalId(
        variables.uid as string,
        variables.externalId as string,
      );
      const brand =
        airtableObj && isObjectType(airtableObj, "brand")
          ? parseBrand({
              airtableObj,
              currentDepth: 0,
              languageCode,
              requestedDimensions,
            })
          : null;

      if (brand && airtableObj) {
        // Find seasons that belong to this brand
        // Check multiple possible relationship fields
        const seasons = airtableData.mediaObjects
          .filter((obj) => {
            if (!isObjectType(obj, "season")) return false;

            // Check various ways seasons might be linked to brands
            return (
              (obj.fields.brands &&
                assertStringArray(obj.fields.brands)?.includes(
                  airtableObj.id,
                )) ||
              (obj.fields.parent &&
                Array.isArray(obj.fields.parent) &&
                obj.fields.parent.includes(airtableObj.id)) ||
              obj.fields.parent === airtableObj.id
            );
          })
          .map((seasonObj) => {
            const season = parseSeason({
              airtableObj: seasonObj,
              currentDepth: 1,
              languageCode,
              requestedDimensions,
            });
            if (!season) return null;

            // Find episodes for each season using the parent field
            const episodes = airtableData.mediaObjects
              .filter((obj) => {
                if (!isObjectType(obj, "episode")) return false;

                // Check if the episode's parent field contains this season's ID
                return (
                  (obj.fields.parent &&
                    Array.isArray(obj.fields.parent) &&
                    obj.fields.parent.includes(seasonObj.id)) ||
                  obj.fields.parent === seasonObj.id
                );
              })
              .map((ep) => ({
                __typename: "Episode",
                uid: ep.id,
                slug: ep.fields.slug,
                episode_number: assertNumber(ep.fields.episode_number),
              }));

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

        return HttpResponse.json({
          data: {
            getObject: {
              ...brand,
              seasons: { objects: sortedSeasons },
            },
          },
        });
      }

      return HttpResponse.json({
        data: {
          getObject: null,
        },
      });
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_BRAND_THUMBNAIL", ({ variables, request }) => {
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );

      const airtableObj = getMediaObjectByUidOrExternalId(
        variables.uid as string,
        variables.externalId as string,
      );
      const brand =
        airtableObj && isObjectType(airtableObj, "brand")
          ? parseBrand({
              airtableObj,
              currentDepth: 0,
              languageCode,
              requestedDimensions,
            })
          : null;

      if (brand) {
        // Return only thumbnail fields
        return HttpResponse.json({
          data: {
            getObject: {
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
            },
          },
        });
      }

      return HttpResponse.json({
        data: { getObject: null },
      });
    }),
];
