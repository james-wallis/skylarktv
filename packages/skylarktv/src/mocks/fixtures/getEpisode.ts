import { graphql } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  getObjectsByType,
  extractRequestContext,
  createGraphQLResponse,
  createGraphQLListResponse,
  fetchAndParseMediaObject,
  createListByMetadataHandler,
} from "../airtableData";
import { parseEpisode } from "../airtable/parse-media-objects";

export const getEpisodeHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_EPISODE", ({ variables, request }) => {
      const requestContext = extractRequestContext(request.headers);

      const episode = fetchAndParseMediaObject(
        variables,
        "episode",
        parseEpisode,
        {
          currentDepth: 0,
          ...requestContext,
        },
      );

      return createGraphQLResponse(episode);
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_EPISODE_THUMBNAIL", ({ variables, request }) => {
      const requestContext = extractRequestContext(request.headers);

      const episode = fetchAndParseMediaObject(
        variables,
        "episode",
        parseEpisode,
        {
          currentDepth: 0,
          ...requestContext,
        },
      );

      return createGraphQLResponse(episode);
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query(
      "GET_EPISODE_THUMBNAIL_WITH_ADDITIONAL_RELATIONSHIPS",
      ({ variables, request }) => {
        const requestContext = extractRequestContext(request.headers);

        const episode = fetchAndParseMediaObject(
          variables,
          "episode",
          parseEpisode,
          {
            currentDepth: 0,
            ...requestContext,
          },
        );

        return createGraphQLResponse(episode);
      },
    ),

  graphql.link(SAAS_API_ENDPOINT).query("LIST_EPISODES", ({ request }) => {
    const { languageCode } = extractRequestContext(request.headers);
    const episodes = getObjectsByType({
      type: "episodes",
      depth: 0,
      languageCode,
    });

    return createGraphQLListResponse(episodes, "listObjects");
  }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query(
      "LIST_EPISODES_BY_GENRE",
      createListByMetadataHandler(
        "genres",
        "episode",
        airtableData.genres || [],
        "Genre",
      ),
    ),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query(
      "LIST_EPISODES_BY_TAG",
      createListByMetadataHandler(
        "tags",
        "episode",
        airtableData.tags || [],
        "SkylarkTag",
      ),
    ),
];
