import { airtableData } from "./data";
import { convertMediaObjectToGraphQL } from "./media-objects";
import {
  assertString,
  assertStringArray,
  assertSingleString,
  getImageUrl,
  highlightSearchTerm,
} from "./utils";

// Search across all objects (media objects, articles, people)
export const searchAllObjects = (query: string) => {
  const searchTerm = query.toLowerCase();
  const results = [];

  // Search media objects (Movies, Episodes, Seasons, Brands, LiveStreams, etc.)
  const mediaResults = airtableData.mediaObjects
    .filter((obj) => {
      const { fields } = obj;
      return (
        assertString(fields.title)?.toLowerCase().includes(searchTerm) ||
        assertString(fields.title_short)?.toLowerCase().includes(searchTerm) ||
        assertString(fields.synopsis)?.toLowerCase().includes(searchTerm) ||
        assertString(fields.synopsis_short)?.toLowerCase().includes(searchTerm)
      );
    })
    .map((obj) => {
      const converted = convertMediaObjectToGraphQL(obj, 0); // Search results are at depth 0 (root level)
      if (!converted) return null;

      // Apply highlighting to matching fields
      return {
        ...converted,
        title: highlightSearchTerm(converted.title, query),
        title_short: highlightSearchTerm(converted.title_short, query),
        synopsis: highlightSearchTerm(converted.synopsis, query),
        synopsis_short: highlightSearchTerm(converted.synopsis_short, query),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  results.push(...mediaResults);

  // Search articles
  const articleResults = (airtableData.articles || [])
    .filter((article) => {
      const { fields } = article;
      return (
        assertString(fields.title)?.toLowerCase().includes(searchTerm) ||
        assertString(fields.description)?.toLowerCase().includes(searchTerm) ||
        assertString(fields.body)?.toLowerCase().includes(searchTerm)
      );
    })
    .map((article) => {
      // Get article images
      const articleImageIds = assertStringArray(article.fields.images) || [];
      const images = articleImageIds
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

      return {
        uid: article.id,
        __typename: "Article",
        external_id: article.id,
        title: highlightSearchTerm(article.fields.title, query),
        description: highlightSearchTerm(article.fields.description, query),
        body: highlightSearchTerm(article.fields.body, query),
        type: assertString(article.fields.type),
        publish_date: assertString(article.fields.publish_date),
        images: { objects: images },
      };
    });

  results.push(...articleResults);

  // Search people
  const peopleResults = (airtableData.people || [])
    .filter((person) => {
      const { fields } = person;
      return (
        assertString(fields.name)?.toLowerCase().includes(searchTerm) ||
        assertString(fields.bio_long)?.toLowerCase().includes(searchTerm) ||
        assertString(fields.bio_medium)?.toLowerCase().includes(searchTerm) ||
        assertString(fields.bio_short)?.toLowerCase().includes(searchTerm)
      );
    })
    .map((person) => {
      // Get person images
      const personImageIds = assertStringArray(person.fields.images) || [];
      const images = personImageIds
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

      return {
        uid: person.id,
        __typename: "Person",
        external_id: person.id,
        name: highlightSearchTerm(person.fields.name, query),
        bio_long: highlightSearchTerm(person.fields.bio_long, query),
        bio_medium: highlightSearchTerm(person.fields.bio_medium, query),
        bio_short: highlightSearchTerm(person.fields.bio_short, query),
        images: { objects: images },
      };
    });

  results.push(...peopleResults);

  return results;
};

// Legacy function for backward compatibility
export const searchMediaObjects = (query: string) =>
  searchAllObjects(query).filter(
    (obj) =>
      obj &&
      "__typename" in obj &&
      [
        "Movie",
        "Episode",
        "Season",
        "Brand",
        "LiveStream",
        "SkylarkSet",
      ].includes(obj.__typename),
  );
