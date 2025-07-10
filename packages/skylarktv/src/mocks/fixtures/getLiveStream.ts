import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  getMediaObjectByUidOrExternalId,
  isObjectType,
  getLanguageFromRequest,
  getAvailabilityDimensionsFromRequest,
} from "../airtableData";
import { parseLiveStream } from "../airtable/parse-media-objects";

export const getLiveStreamHandlers = [
  // Handle LiveStream queries
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_LIVE_STREAM", ({ variables, request }) => {
      const airtableObj = getMediaObjectByUidOrExternalId(
        variables.uid,
        variables.externalId,
      );
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );

      const liveStream =
        airtableObj && isObjectType(airtableObj, "LiveStream")
          ? parseLiveStream({
              airtableObj,
              currentDepth: 0,
              languageCode,
              requestedDimensions,
            })
          : null;

      if (liveStream) {
        // Add LiveStream-specific fields
        return HttpResponse.json({
          data: {
            getObject: {
              ...liveStream,
              live_assets: { objects: [] }, // Would need live asset data
            },
          },
        });
      }

      return HttpResponse.json({
        data: { getObject: null },
      });
    }),

  // Handle LiveStream Thumbnail query
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_LIVE_STREAM_THUMBNAIL", ({ variables, request }) => {
      const airtableObj = getMediaObjectByUidOrExternalId(
        variables.uid,
        variables.externalId,
      );
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );

      const liveStream =
        airtableObj && isObjectType(airtableObj, "LiveStream")
          ? parseLiveStream({
              airtableObj,
              currentDepth: 0,
              languageCode,
              requestedDimensions,
            })
          : null;

      if (liveStream) {
        return HttpResponse.json({
          data: {
            getObject: {
              uid: liveStream.uid,
              __typename: liveStream.__typename,
              slug: liveStream.slug,
              title: liveStream.title,
              title_short: liveStream.title_short,
              synopsis: liveStream.synopsis,
              synopsis_short: liveStream.synopsis_short,
              images: liveStream.images,
              tags: liveStream.tags,
            },
          },
        });
      }

      return HttpResponse.json({
        data: { getObject: null },
      });
    }),
];
