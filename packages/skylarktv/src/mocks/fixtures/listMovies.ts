import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  convertMediaObjectToGraphQL,
  isObjectType,
  getObjectsByType,
  getLanguageFromRequest,
  getAvailabilityDimensionsFromRequest,
} from "../airtableData";

export const listMoviesHandlers = [
  graphql.link(SAAS_API_ENDPOINT).query("LIST_MOVIES", ({ request }) => {
    const languageCode = getLanguageFromRequest(request.headers);
    const requestedDimensions = getAvailabilityDimensionsFromRequest(
      request.headers,
    );
    const movies = getObjectsByType({
      type: "movies",
      depth: 0,
      languageCode,
      requestedDimensions,
    }); // Movies are at depth 0 (root level)

    return HttpResponse.json({
      data: {
        listObjects: {
          count: movies.length,
          next_token: null,
          objects: movies,
        },
      },
    });
  }),

  // Handle Movies by Genre
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("LIST_MOVIES_BY_GENRE", ({ variables, request }) => {
      const genreId = variables.uid || variables.externalId;
      const genre = (airtableData.genres || []).find((g) => g.id === genreId);

      if (!genre) {
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      // Find all movies that have this genre
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );
      const moviesWithGenre = airtableData.mediaObjects
        .filter(
          (obj) =>
            isObjectType(obj, "movie") &&
            obj.fields.genres &&
            (Array.isArray(obj.fields.genres)
              ? obj.fields.genres
              : [obj.fields.genres]
            ).includes(genreId),
        )
        .map((movieObj) =>
          convertMediaObjectToGraphQL({
            airtableObj: movieObj,
            currentDepth: 0,
            languageCode,
            requestedDimensions,
          }),
        ); // Movies are at depth 0 (root level)

      return HttpResponse.json({
        data: {
          getObject: {
            __typename: "Genre",
            uid: genre.id,
            name: genre.fields.name,
            movies: {
              next_token: null,
              objects: moviesWithGenre,
            },
          },
        },
      });
    }),

  // Handle Movies by Tag
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("LIST_MOVIES_BY_TAG", ({ variables, request }) => {
      const tagId = variables.uid || variables.externalId;
      const tag = (airtableData.tags || []).find((t) => t.id === tagId);

      if (!tag) {
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      // Find all movies that have this tag
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );
      const moviesWithTag = airtableData.mediaObjects
        .filter(
          (obj) =>
            isObjectType(obj, "movie") &&
            obj.fields.tags &&
            (Array.isArray(obj.fields.tags)
              ? obj.fields.tags
              : [obj.fields.tags]
            ).includes(tagId),
        )
        .map((movieObj) =>
          convertMediaObjectToGraphQL({
            airtableObj: movieObj,
            currentDepth: 0,
            languageCode,
            requestedDimensions,
          }),
        ); // Movies are at depth 0 (root level)

      return HttpResponse.json({
        data: {
          getObject: {
            __typename: "SkylarkTag",
            uid: tag.id,
            name: tag.fields.name,
            movies: {
              next_token: null,
              objects: moviesWithTag,
            },
          },
        },
      });
    }),
];
