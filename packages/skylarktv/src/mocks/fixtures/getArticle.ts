import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  getImageUrl,
  searchAllObjects,
} from "../airtableData";

export const getArticleHandlers = [
  graphql.link(SAAS_API_ENDPOINT).query("GET_ARTICLE_THUMBNAIL", ({ variables }) => {
    const articleId = variables.uid || variables.externalId;
    const article = airtableData.articles?.find(a => 
      a.id === articleId || a.fields.external_id === articleId
    );

    if (!article) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Get article images
    const images = (article.fields.images || [])
      .map((imgId: string) => {
        const img = airtableData.images?.find(i => i.id === imgId);
        if (!img) return null;
        
        const url = getImageUrl(img);
        
        let type = img.fields.type;
        if (Array.isArray(type)) {
          type = type[0];
        }
        
        return {
          __typename: "SkylarkImage",
          uid: img.id,
          title: img.fields.title || img.fields["unique-title"],
          type: type || "IMAGE",
          url: url,
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

  graphql.link(SAAS_API_ENDPOINT).query("LIST_ARTICLES", ({ variables }) => {
    const articles = (airtableData.articles || []).map(article => {
      // Get article images
      const images = (article.fields.images || [])
        .map((imgId: string) => {
          const img = airtableData.images?.find(i => i.id === imgId);
          if (!img) return null;
          
          const url = getImageUrl(img);
          
          let type = img.fields.type;
          if (Array.isArray(type)) {
            type = type[0];
          }
          
          return {
            uid: img.id,
            title: img.fields.title || img.fields["unique-title"],
            type: type || "IMAGE",
            url: url,
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

    const limit = variables?.limit || 20;
    const offset = variables?.offset || 0;

    return HttpResponse.json({
      data: {
        listObjects: {
          count: articles.length,
          hasNextPage: offset + limit < articles.length,
          objects: articles.slice(offset, offset + limit),
        },
      },
    });
  }),

  graphql.link(SAAS_API_ENDPOINT).query("GET_ARTICLE", ({ variables }) => {
    const articleId = variables.uid || variables.externalId;
    const article = airtableData.articles?.find(a => 
      a.id === articleId || a.fields.external_id === articleId
    );

    if (!article) {
      console.log(`GET_ARTICLE: Article not found for ID: ${articleId}`);
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Get article images
    const images = (article.fields.images || [])
      .map((imgId: string) => {
        const img = airtableData.images?.find(i => i.id === imgId);
        if (!img) return null;
        
        const url = getImageUrl(img);
        
        let type = img.fields.type;
        if (Array.isArray(type)) {
          type = type[0];
        }
        
        return {
          __typename: "SkylarkImage",
          uid: img.id,
          title: img.fields.title || img.fields["unique-title"],
          type: type || "IMAGE",
          url: url,
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