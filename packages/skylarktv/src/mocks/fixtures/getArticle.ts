import { graphql } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  extractRequestContext,
  createGraphQLResponse,
  createGraphQLListResponse,
  findObjectByUidOrExternalId,
  sortByProperty,
} from "../airtableData";
import { parseArticle } from "../airtable/parse-media-objects";

export const getArticleHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_ARTICLE_THUMBNAIL", ({ variables, request }) => {
      const requestContext = extractRequestContext(request.headers);

      const article = findObjectByUidOrExternalId(
        airtableData.articles || [],
        variables,
      );

      if (!article) {
        return createGraphQLResponse(null);
      }

      const parsedArticle = parseArticle({
        airtableObj: article,
        currentDepth: 0,
        ...requestContext,
      });

      if (!parsedArticle) {
        return createGraphQLResponse(null);
      }

      // Return only thumbnail fields
      return createGraphQLResponse({
        uid: parsedArticle.uid,
        __typename: parsedArticle.__typename,
        slug: parsedArticle.slug,
        title: parsedArticle.title,
        description: parsedArticle.description,
        images: parsedArticle.images,
      });
    }),

  graphql.link(SAAS_API_ENDPOINT).query("LIST_ARTICLES", ({ request }) => {
    const requestContext = extractRequestContext(request.headers);

    const articles = (airtableData.articles || [])
      .map((article) =>
        parseArticle({
          airtableObj: article,
          currentDepth: 0,
          ...requestContext,
        }),
      )
      .filter(
        (article): article is NonNullable<typeof article> => article !== null,
      );

    // Sort articles by publish_date in descending order (newest first)
    const sortedArticles = sortByProperty(
      articles as Record<string, unknown>[],
      "publish_date",
      undefined,
      "desc",
    );

    return createGraphQLListResponse(sortedArticles, "listObjects");
  }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_ARTICLE", ({ variables, request }) => {
      const requestContext = extractRequestContext(request.headers);

      const article = findObjectByUidOrExternalId(
        airtableData.articles || [],
        variables,
      );

      if (!article) {
        return createGraphQLResponse(null);
      }

      const parsedArticle = parseArticle({
        airtableObj: article,
        currentDepth: 0,
        ...requestContext,
      });

      return createGraphQLResponse(parsedArticle);
    }),
];
