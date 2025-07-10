import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  getMediaObjectByUidOrExternalId,
  convertMediaObjectToGraphQL,
  isObjectType,
} from "../airtableData";

export const getMovieHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_MOVIE", ({ variables }) => {
      const airtableObj = getMediaObjectByUidOrExternalId(
        variables.uid,
        variables.externalId,
      );
      const movie =
        airtableObj && isObjectType(airtableObj, "movie")
          ? convertMediaObjectToGraphQL(airtableObj, 0) // Movie is at depth 0 (root level)
          : null;

      return HttpResponse.json({
        data: {
          getObject: movie,
        },
      });
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_MOVIE_THUMBNAIL", ({ variables }) => {
      const airtableObj = getMediaObjectByUidOrExternalId(
        variables.uid,
        variables.externalId,
      );
      const movie = airtableObj
        ? convertMediaObjectToGraphQL(airtableObj, 0) // Movie is at depth 0 (root level)
        : null;

      if (movie) {
        // Return only thumbnail fields
        return HttpResponse.json({
          data: {
            getObject: {
              uid: movie.uid,
              __typename: movie.__typename,
              slug: movie.slug,
              title: movie.title,
              title_short: movie.title_short,
              synopsis: movie.synopsis,
              synopsis_short: movie.synopsis_short,
              release_date: movie.release_date,
              images: movie.images,
              tags: movie.tags,
            },
          },
        });
      }

      return HttpResponse.json({
        data: { getObject: null },
      });
    }),
];
