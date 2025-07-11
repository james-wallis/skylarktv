import { airtableData } from "./data";
import { convertMediaObjectToGraphQL } from "./mediaObjects";
import {
  assertString,
  assertStringArray,
  assertSingleString,
  getImageUrl,
  highlightSearchTerm,
  flexibleTextMatch,
} from "./utils";
import {
  filterContentByAvailability,
  AvailabilityDimensions,
} from "./availability";

// Search across all objects (media objects, articles, people)
export const searchAllObjects = (
  query: string,
  languageCode?: string,
  requestedDimensions?: AvailabilityDimensions,
  timeTravelDate?: Date | null,
) => {
  const results = [];

  // Search media objects (Movies, Episodes, Brands, LiveStreams, etc. - excluding Seasons)
  const mediaResults = airtableData.mediaObjects
    .filter((obj) => {
      // Exclude Seasons from search results
      const objectType = obj.fields.skylark_object_type;
      if (objectType === "Season" || objectType === "seasons") {
        return false;
      }

      const { fields } = obj;
      const title = assertString(fields.title) || "";
      const titleShort = assertString(fields.title_short) || "";
      const synopsis = assertString(fields.synopsis) || "";
      const synopsisShort = assertString(fields.synopsis_short) || "";

      return (
        flexibleTextMatch(title, query) ||
        flexibleTextMatch(titleShort, query) ||
        flexibleTextMatch(synopsis, query) ||
        flexibleTextMatch(synopsisShort, query)
      );
    })
    .map((obj) => {
      const converted = convertMediaObjectToGraphQL({
        airtableObj: obj,
        currentDepth: 0,
        languageCode,
        requestedDimensions,
        timeTravelDate,
      }); // Search results are at depth 0 (root level)
      if (!converted) return null;

      // Apply highlighting to matching fields
      return {
        ...converted,
        title: highlightSearchTerm(converted.title, query),
        title_short: highlightSearchTerm(converted.title_short, query),
        synopsis: highlightSearchTerm(converted.synopsis, query),
        synopsis_short: highlightSearchTerm(converted.synopsis_short, query),
      } as typeof converted;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  results.push(...mediaResults);

  // Search articles
  const articleResults = (airtableData.articles || [])
    .filter((article) => {
      const { fields } = article;
      const title = assertString(fields.title) || "";
      const description = assertString(fields.description) || "";
      const body = assertString(fields.body) || "";

      // First check text matching
      const matchesSearch =
        flexibleTextMatch(title, query) ||
        flexibleTextMatch(description, query) ||
        flexibleTextMatch(body, query);

      if (!matchesSearch) return false;

      // Then check availability if dimensions are requested
      if (requestedDimensions) {
        const articleAvailabilityIds =
          assertStringArray(fields.availability) || [];
        return filterContentByAvailability(
          articleAvailabilityIds,
          requestedDimensions,
          airtableData,
          timeTravelDate,
        );
      }

      return true;
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
      const name = assertString(fields.name) || "";
      const bioLong = assertString(fields.bio_long) || "";
      const bioMedium = assertString(fields.bio_medium) || "";
      const bioShort = assertString(fields.bio_short) || "";

      return (
        flexibleTextMatch(name, query) ||
        flexibleTextMatch(bioLong, query) ||
        flexibleTextMatch(bioMedium, query) ||
        flexibleTextMatch(bioShort, query)
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
      obj.__typename &&
      [
        "Movie",
        "Episode",
        "Season",
        "Brand",
        "LiveStream",
        "SkylarkSet",
      ].includes(obj.__typename),
  );
