import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  getMediaObjectByUidOrExternalId,
  convertMediaObjectToGraphQL,
  isObjectType,
} from "../airtableData";

export const getBrandHandlers = [
  graphql.link(SAAS_API_ENDPOINT).query("GET_BRAND", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const brand = airtableObj && isObjectType(airtableObj, 'brand')
      ? convertMediaObjectToGraphQL(airtableObj) 
      : null;

    if (brand) {
      console.log(`GET_BRAND: Looking for seasons and episodes for brand ${airtableObj.id}`);
      
      // Find seasons that belong to this brand
      // Check multiple possible relationship fields
      const seasons = airtableData.mediaObjects
        .filter(obj => {
          if (!isObjectType(obj, 'season')) return false;
          
          // Check various ways seasons might be linked to brands
          return (
            (obj.fields.brands && obj.fields.brands.includes(airtableObj.id)) ||
            (obj.fields.parent && Array.isArray(obj.fields.parent) && obj.fields.parent.includes(airtableObj.id)) ||
            (obj.fields.parent === airtableObj.id)
          );
        })
        .map(seasonObj => {
          const season = convertMediaObjectToGraphQL(seasonObj);
          
          // Find episodes for each season using the parent field
          const episodes = airtableData.mediaObjects
            .filter(obj => {
              if (!isObjectType(obj, 'episode')) return false;
              
              // Check if the episode's parent field contains this season's ID
              return (
                (obj.fields.parent && Array.isArray(obj.fields.parent) && obj.fields.parent.includes(seasonObj.id)) ||
                (obj.fields.parent === seasonObj.id)
              );
            })
            .map(ep => ({
              uid: ep.id,
              slug: ep.fields.slug,
              episode_number: ep.fields.episode_number,
            }))
            .sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
          
          console.log(`GET_BRAND: Season "${seasonObj.fields.title}" has ${episodes.length} episodes`);
          
          return {
            ...season,
            episodes: { objects: episodes },
          };
        })
        .sort((a, b) => (b.season_number || 0) - (a.season_number || 0)); // Descending order

      console.log(`GET_BRAND: Brand "${brand.title}" has ${seasons.length} seasons`);

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

  graphql.link(SAAS_API_ENDPOINT).query("GET_BRAND_THUMBNAIL", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const brand = airtableObj && isObjectType(airtableObj, 'brand')
      ? convertMediaObjectToGraphQL(airtableObj) 
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