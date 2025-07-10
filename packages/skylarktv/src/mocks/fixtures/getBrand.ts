import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  getMediaObjectByUidOrExternalId,
  convertMediaObjectToGraphQL,
  isObjectType,
  assertNumber,
  assertStringArray,
} from "../airtableData";

export const getBrandHandlers = [
  graphql.link(SAAS_API_ENDPOINT).query("GET_BRAND", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      variables.uid,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      variables.externalId,
    );
    const brand =
      airtableObj && isObjectType(airtableObj, "brand")
        ? convertMediaObjectToGraphQL(airtableObj, 0) // Brand is at depth 0 (root level)
        : null;

    if (brand && airtableObj) {
      console.log(
        `GET_BRAND: Looking for seasons and episodes for brand ${airtableObj.id}`,
      );

      // Find seasons that belong to this brand
      // Check multiple possible relationship fields
      const seasons = airtableData.mediaObjects
        .filter((obj) => {
          if (!isObjectType(obj, "season")) return false;

          // Check various ways seasons might be linked to brands
          return (
            (obj.fields.brands &&
              assertStringArray(obj.fields.brands)?.includes(airtableObj.id)) ||
            (obj.fields.parent &&
              Array.isArray(obj.fields.parent) &&
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
              obj.fields.parent.includes(airtableObj!.id)) ||
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            obj.fields.parent === airtableObj!.id
          );
        })
        .map((seasonObj) => {
          const season = convertMediaObjectToGraphQL(seasonObj, 1); // Seasons are at depth 1 (Brand -> Seasons)
          if (!season) return null;

          // Find episodes for each season using the parent field
          const episodes = airtableData.mediaObjects
            .filter((obj) => {
              if (!isObjectType(obj, "episode")) return false;

              // Check if the episode's parent field contains this season's ID
              return (
                (obj.fields.parent &&
                  Array.isArray(obj.fields.parent) &&
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                  obj.fields.parent.includes(seasonObj.id)) ||
                obj.fields.parent === seasonObj.id
              );
            })
            .map((ep) => ({
              __typename: "Episode",
              uid: ep.id,
              slug: ep.fields.slug,
              episode_number: assertNumber(ep.fields.episode_number),
            }))
            .sort((a, b) => {
              const aNum =
                typeof a.episode_number === "number" ? a.episode_number : 0;
              const bNum =
                typeof b.episode_number === "number" ? b.episode_number : 0;
              return aNum - bNum;
            });

          return {
            ...season,
            episodes: { objects: episodes },
          };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null)
        .sort((a, b) => {
          const aNum =
            "season_number" in a && typeof a.season_number === "number"
              ? a.season_number
              : 0;
          const bNum =
            "season_number" in b && typeof b.season_number === "number"
              ? b.season_number
              : 0;
          return bNum - aNum;
        }); // Descending order

      return HttpResponse.json({
        data: {
          getObject: {
            ...brand,
            seasons: { objects: seasons },
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
    .query("GET_BRAND_THUMBNAIL", ({ variables }) => {
      const airtableObj = getMediaObjectByUidOrExternalId(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        variables.uid,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        variables.externalId,
      );
      const brand =
        airtableObj && isObjectType(airtableObj, "brand")
          ? convertMediaObjectToGraphQL(airtableObj, 0) // Brand is at depth 0 (root level)
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
              release_date: brand.release_date,
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
