import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";

export const getAssetHandlers = [
  graphql.link(SAAS_API_ENDPOINT).query("GET_ASSET", ({ variables }) =>
    // Mock asset response - would need real asset data
    HttpResponse.json({
      data: {
        getObject: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          uid: variables.uid || "mock-asset",
          __typename: "Asset",
          url: "https://example.com/mock-video.mp4",
          hls_url: "https://example.com/mock-video.m3u8",
        },
      },
    }),
  ),
];
