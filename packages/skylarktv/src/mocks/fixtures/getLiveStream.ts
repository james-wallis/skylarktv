import { graphql } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  extractRequestContext,
  createGraphQLResponse,
  fetchAndParseMediaObject,
} from "../airtableData";
import { parseLiveStream } from "../airtable/parse-media-objects";

export const getLiveStreamHandlers = [
  // Handle LiveStream queries
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_LIVE_STREAM", ({ variables, request }) => {
      const requestContext = extractRequestContext(request.headers);

      const liveStream = fetchAndParseMediaObject(
        variables,
        "LiveStream",
        parseLiveStream,
        {
          currentDepth: 0,
          ...requestContext,
        },
      );

      if (liveStream) {
        // Add LiveStream-specific fields
        return createGraphQLResponse({
          ...liveStream,
          live_assets: { objects: [] }, // Would need live asset data
        });
      }

      return createGraphQLResponse(null);
    }),

  // Handle LiveStream Thumbnail query
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_LIVE_STREAM_THUMBNAIL", ({ variables, request }) => {
      const requestContext = extractRequestContext(request.headers);

      const liveStream = fetchAndParseMediaObject(
        variables,
        "LiveStream",
        parseLiveStream,
        {
          currentDepth: 0,
          ...requestContext,
        },
      );

      if (liveStream) {
        return createGraphQLResponse({
          uid: liveStream.uid,
          __typename: liveStream.__typename,
          slug: liveStream.slug,
          title: liveStream.title,
          title_short: liveStream.title_short,
          synopsis: liveStream.synopsis,
          synopsis_short: liveStream.synopsis_short,
          images: liveStream.images,
          tags: liveStream.tags,
        });
      }

      return createGraphQLResponse(null);
    }),
];
