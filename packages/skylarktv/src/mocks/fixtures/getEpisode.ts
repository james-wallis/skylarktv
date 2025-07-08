import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  getMediaObjectByUidOrExternalId,
  convertMediaObjectToGraphQL,
  isObjectType,
  getObjectsByType,
} from "../airtableData";

export const getEpisodeHandlers = [
  graphql.link(SAAS_API_ENDPOINT).query("LIST_EPISODES", ({ variables }) => {
    const episodes = getObjectsByType("episodes");
    const limit = variables?.limit || 20;
    const offset = variables?.offset || 0;

    return HttpResponse.json({
      data: {
        listObjects: {
          count: episodes.length,
          hasNextPage: offset + limit < episodes.length,
          objects: episodes.slice(offset, offset + limit),
        },
      },
    });
  }),

  graphql.link(SAAS_API_ENDPOINT).query("LIST_EPISODES_BY_GENRE", ({ variables }) => {
    const genreId = variables.uid || variables.externalId;
    const genre = (airtableData.genres || []).find(g => g.id === genreId);
    
    if (!genre) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Find all episodes that have this genre
    const episodesWithGenre = airtableData.mediaObjects
      .filter(obj => 
        isObjectType(obj, 'episode') &&
        obj.fields.genres && 
        (Array.isArray(obj.fields.genres) ? obj.fields.genres : [obj.fields.genres]).includes(genreId)
      )
      .map(convertMediaObjectToGraphQL);

    return HttpResponse.json({
      data: {
        getObject: {
          uid: genre.id,
          name: genre.fields.name,
          episodes: {
            next_token: null,
            objects: episodesWithGenre,
          },
        },
      },
    });
  }),

  graphql.link(SAAS_API_ENDPOINT).query("LIST_EPISODES_BY_TAG", ({ variables }) => {
    const tagId = variables.uid || variables.externalId;
    const tag = (airtableData.tags || []).find(t => t.id === tagId);
    
    if (!tag) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Find all episodes that have this tag
    const episodesWithTag = airtableData.mediaObjects
      .filter(obj => 
        isObjectType(obj, 'episode') &&
        obj.fields.tags && 
        (Array.isArray(obj.fields.tags) ? obj.fields.tags : [obj.fields.tags]).includes(tagId)
      )
      .map(convertMediaObjectToGraphQL);

    return HttpResponse.json({
      data: {
        getObject: {
          uid: tag.id,
          name: tag.fields.name,
          episodes: {
            next_token: null,
            objects: episodesWithTag,
          },
        },
      },
    });
  }),
];