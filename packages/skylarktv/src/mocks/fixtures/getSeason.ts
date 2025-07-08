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
  graphql.link(SAAS_API_ENDPOINT).query("GET_SEASON_AND_EPISODES", ({ variables }) => {
    console.log(`GET_SEASON_AND_EPISODES: Looking for season with uid="${variables.uid}", externalId="${variables.externalId}"`);
    
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const season = airtableObj && isObjectType(airtableObj, 'season')
      ? convertMediaObjectToGraphQL(airtableObj) 
      : null;

    if (!season) {
      console.log(`GET_SEASON_AND_EPISODES: Season not found`);
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    console.log(`GET_SEASON_AND_EPISODES: Found season "${season.title}"`);

    // Find episodes that belong to this season using the parent field
    const episodes = airtableData.mediaObjects
      .filter(obj => {
        if (!isObjectType(obj, 'episode')) return false;
        
        // Check if the episode's parent field contains this season's ID
        return (
          (obj.fields.parent && Array.isArray(obj.fields.parent) && obj.fields.parent.includes(airtableObj.id)) ||
          (obj.fields.parent === airtableObj.id)
        );
      })
      .map(convertMediaObjectToGraphQL)
      .sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));

    console.log(`GET_SEASON_AND_EPISODES: Found ${episodes.length} episodes for season`);

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

  graphql.link(SAAS_API_ENDPOINT).query("GET_SEASON_THUMBNAIL", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const season = airtableObj && isObjectType(airtableObj, 'season')
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
            season_number: season.season_number,
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