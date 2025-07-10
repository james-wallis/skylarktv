import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import { getObjectsByType } from "../airtableData";

// Mock SkylarkTV Config
const mockSkylarkTVConfig = {
  getSkylarkSet: {
    content: {
      objects: [
        {
          uid: "config-1",
          __typename: "SkylarkLiveAsset",
          title: "Skylark TV Config",
          hls_url: null,
          url: "https://skylark-references-production.s3.eu-west-1.amazonaws.com/skylarktv/configs/default-config.json",
        },
      ],
    },
  },
};

// Create homepage set from Airtable data
const createHomepageSet = () => {
  const movies = getObjectsByType("movies", 0).slice(0, 10);
  const episodes = getObjectsByType("episodes", 0).slice(0, 10);
  const brands = getObjectsByType("brands", 0).slice(0, 5);

  const allContent = [...movies, ...episodes, ...brands];

  return {
    __typename: "SkylarkSet",
    uid: "homepage-set",
    title: "Homepage",
    content: {
      objects: allContent.map((obj, index) => ({
        __typename: "SetContent",
        dynamic: false,
        object: obj,
        position: index + 1,
      })),
    },
  };
};

export const skylarktvConfigHandlers = [
  graphql.link(SAAS_API_ENDPOINT).query("GET_SKYLARK_TV_CONFIG", () =>
    HttpResponse.json({
      data: mockSkylarkTVConfig,
    }),
  ),

  graphql.link(SAAS_API_ENDPOINT).query("GET_APP_CONFIG", () => {
    const homepageSet = createHomepageSet();

    return HttpResponse.json({
      data: {
        getSkylarkSet: homepageSet,
      },
    });
  }),

  graphql.link(SAAS_API_ENDPOINT).query("GET_STREAMTV_CONFIG", () =>
    HttpResponse.json({
      data: {
        getSkylarkSet: createHomepageSet(),
      },
    }),
  ),
];
