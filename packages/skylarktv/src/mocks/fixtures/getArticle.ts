import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  getLanguageFromRequest,
  getAvailabilityDimensionsFromRequest,
  getTimeTravelFromRequest,
} from "../airtableData";
import { parseArticle } from "../airtable/parse-media-objects";

export const getArticleHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_ARTICLE_THUMBNAIL", ({ variables, request }) => {
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );
      const timeTravelDate = getTimeTravelFromRequest(request.headers);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const articleId = variables.uid || variables.externalId;
      const article = airtableData.articles?.find(
        (a) => a.id === articleId || a.fields.external_id === articleId,
      );

      if (!article) {
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      const parsedArticle = parseArticle({
        airtableObj: article,
        currentDepth: 0,
        languageCode,
        requestedDimensions,
        timeTravelDate,
      });

      if (!parsedArticle) {
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      // Return only thumbnail fields
      return HttpResponse.json({
        data: {
          getObject: {
            uid: parsedArticle.uid,
            __typename: parsedArticle.__typename,
            slug: parsedArticle.slug,
            title: parsedArticle.title,
            description: parsedArticle.description,
            images: parsedArticle.images,
          },
        },
      });
    }),

  graphql.link(SAAS_API_ENDPOINT).query("LIST_ARTICLES", ({ request }) => {
    const languageCode = getLanguageFromRequest(request.headers);
    const requestedDimensions = getAvailabilityDimensionsFromRequest(
      request.headers,
    );
    const timeTravelDate = getTimeTravelFromRequest(request.headers);

    const articles = (airtableData.articles || [])
      .map((article) =>
        parseArticle({
          airtableObj: article,
          currentDepth: 0,
          languageCode,
          requestedDimensions,
          timeTravelDate,
        }),
      )
      .filter(
        (article): article is NonNullable<typeof article> => article !== null,
      );

    return HttpResponse.json({
      data: {
        listObjects: {
          count: articles.length,
          hasNextPage: false,
          objects: articles,
        },
      },
    });
  }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_ARTICLE", ({ variables, request }) => {
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );
      const timeTravelDate = getTimeTravelFromRequest(request.headers);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const articleId = variables.uid || variables.externalId;
      const article = airtableData.articles?.find(
        (a) => a.id === articleId || a.fields.external_id === articleId,
      );

      if (!article) {
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      const parsedArticle = parseArticle({
        airtableObj: article,
        currentDepth: 0,
        languageCode,
        requestedDimensions,
        timeTravelDate,
      });

      return HttpResponse.json({
        data: {
          getObject: parsedArticle,
        },
      });
    }),
];
