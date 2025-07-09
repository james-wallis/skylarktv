import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  getImageUrl,
  assertString,
  assertStringArray,
  assertSingleString,
} from "../airtableData";

export const getArticleHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_ARTICLE_THUMBNAIL", ({ variables }) => {
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

      // Get article images
      const imageIds = assertStringArray(article.fields.images) || [];
      const images = imageIds
        .map((imgId: string) => {
          const img = airtableData.images?.find((i) => i.id === imgId);
          if (!img) return null;

          const url = getImageUrl(img);

          const typeValue = assertSingleString(img.fields.type);

          return {
            __typename: "SkylarkImage",
            uid: img.id,
            title:
              assertString(img.fields.title) ||
              assertString(img.fields["unique-title"]),
            type: typeValue || "IMAGE",
            url,
          };
        })
        .filter(Boolean);

      return HttpResponse.json({
        data: {
          getObject: {
            uid: article.id,
            __typename: "Article",
            slug: article.fields.slug,
            title: article.fields.title,
            title_short: article.fields.title_short,
            synopsis: article.fields.synopsis,
            synopsis_short: article.fields.synopsis_short,
            images: { objects: images },
          },
        },
      });
    }),

  graphql.link(SAAS_API_ENDPOINT).query("LIST_ARTICLES", () => {
    const articles = (airtableData.articles || []).map((article) => {
      // Get article images
      const articleImageIds = assertStringArray(article.fields.images) || [];
      const images = articleImageIds
        .map((imgId: string) => {
          const img = airtableData.images?.find((i) => i.id === imgId);
          if (!img) return null;

          const url = getImageUrl(img);

          // eslint-disable-next-line prefer-destructuring
          let type = img.fields.type;
          if (Array.isArray(type)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, prefer-destructuring
            type = type[0];
          }

          return {
            uid: img.id,
            // eslint-disable-next-line object-shorthand
            title: img.fields.title || img.fields["unique-title"],
            // eslint-disable-next-line object-shorthand
            type: type || "IMAGE",
            url,
          };
        })
        .filter(Boolean);

      return {
        uid: article.id,
        __typename: "Article",
        external_id: article.fields.external_id || article.id,
        slug: article.fields.slug,
        title: article.fields.title,
        title_short: article.fields.title_short,
        synopsis: article.fields.synopsis,
        synopsis_short: article.fields.synopsis_short,
        body: article.fields.body,
        release_date: article.fields.release_date,
        images: { objects: images },
        tags: { objects: [] }, // Would need tag relationships
        people: { objects: [] }, // Would need people relationships
      };
    });

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

  graphql.link(SAAS_API_ENDPOINT).query("GET_ARTICLE", ({ variables }) => {
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

    // Get article images
    const imageIds = assertStringArray(article.fields.images) || [];
    const images = imageIds
      .map((imgId: string) => {
        const img = airtableData.images?.find((i) => i.id === imgId);
        if (!img) return null;

        const url = getImageUrl(img);

        const typeValue = assertSingleString(img.fields.type);

        return {
          __typename: "SkylarkImage",
          uid: img.id,
          title:
            assertString(img.fields.title) ||
            assertString(img.fields["unique-title"]),
          type: typeValue || "IMAGE",
          url,
        };
      })
      .filter(Boolean);

    return HttpResponse.json({
      data: {
        getObject: {
          uid: article.id,
          __typename: "Article",
          external_id: article.fields.external_id || article.id,
          slug: article.fields.slug,
          title: article.fields.title,
          title_short: article.fields.title_short,
          synopsis: article.fields.synopsis,
          synopsis_short: article.fields.synopsis_short,
          body: article.fields.body,
          release_date: article.fields.release_date,
          images: { objects: images },
          tags: { objects: [] }, // Would need tag relationships
          people: { objects: [] }, // Would need people relationships
        },
      },
    });
  }),
];
