import { graphql } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  extractRequestContext,
  createGraphQLResponse,
  fetchAndParseMediaObject,
} from "../airtableData";
import { parseMovie } from "../airtable/parse-media-objects";

export const getMovieHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_MOVIE", ({ variables, request }) => {
      const requestContext = extractRequestContext(request.headers);

      const movie = fetchAndParseMediaObject(variables, "movie", parseMovie, {
        currentDepth: 0,
        ...requestContext,
      });

      return createGraphQLResponse(movie);
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_MOVIE_THUMBNAIL", ({ variables, request }) => {
      const requestContext = extractRequestContext(request.headers);

      const movie = fetchAndParseMediaObject(variables, "movie", parseMovie, {
        currentDepth: 0,
        ...requestContext,
      });

      if (movie) {
        // Return only thumbnail fields
        return createGraphQLResponse({
          uid: movie.uid,
          __typename: movie.__typename,
          slug: movie.slug,
          title: movie.title,
          title_short: movie.title_short,
          synopsis: movie.synopsis,
          synopsis_short: movie.synopsis_short,
          release_date: movie.release_date as string | null,
          images: movie.images,
          tags: movie.tags,
        });
      }

      return createGraphQLResponse(null);
    }),
];
