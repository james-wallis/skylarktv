import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  getMediaObjectByUidOrExternalId,
  isObjectType,
  getLanguageFromRequest,
  getAvailabilityDimensionsFromRequest,
} from "../airtableData";
import { parseMovie } from "../airtable/parse-media-objects";

export const getMovieHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_MOVIE", ({ variables, request }) => {
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );

      const airtableObj = getMediaObjectByUidOrExternalId(
        variables.uid,
        variables.externalId,
      );
      const movie =
        airtableObj && isObjectType(airtableObj, "movie")
          ? parseMovie({
              airtableObj,
              currentDepth: 0,
              languageCode,
              requestedDimensions,
            })
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
    >("GET_MOVIE_THUMBNAIL", ({ variables, request }) => {
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );

      const airtableObj = getMediaObjectByUidOrExternalId(
        variables.uid,
        variables.externalId,
      );
      const movie = airtableObj
        ? parseMovie({
            airtableObj,
            currentDepth: 0,
            languageCode,
            requestedDimensions,
          })
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
              release_date: movie.release_date as string | null,
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
