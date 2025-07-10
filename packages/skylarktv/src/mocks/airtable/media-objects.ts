// eslint-disable-next-line import/no-extraneous-dependencies
import { Record as AirtableRecord, FieldSet } from "airtable";
import { Credit } from "../../types";
import {
  airtableData,
  getImageById,
  getGenreById,
  getThemeById,
  getRatingById,
  getTagById,
  getCreditById,
  getPersonById,
  getRoleById,
} from "./data";
import {
  assertString,
  assertStringArray,
  assertSingleString,
  DEPTH_LIMIT_CONFIG,
  processNestedRelationships,
  wrapObjectsOrNull,
  getImageUrl,
  isObjectType,
  findTranslationForObject,
  mergeTranslatedContent,
  filterContentByAvailability,
} from "./utils";
import { AvailabilityDimensions } from "./requestUtils";

// Options for convertMediaObjectToGraphQL function
export interface ConvertMediaObjectOptions {
  airtableObj: AirtableRecord<FieldSet>;
  currentDepth?: number;
  languageCode?: string;
  requestedDimensions?: AvailabilityDimensions;
}

// Convert Airtable media object to GraphQL format
export const convertMediaObjectToGraphQL = (
  options: ConvertMediaObjectOptions,
) => {
  const { airtableObj, currentDepth = 0, languageCode, requestedDimensions } = options;
  if (!airtableObj || !airtableObj.fields) {
    return null;
  }

  // Check if we've reached maximum depth
  if (currentDepth >= DEPTH_LIMIT_CONFIG.MAX_DEPTH) {
    return null;
  }

  // Apply translations if language code is provided
  let { fields } = airtableObj;
  if (languageCode && languageCode !== "en-GB") {
    const translation = findTranslationForObject(
      airtableObj.id,
      languageCode,
      airtableData.translations?.mediaObjects || [],
    );

    if (translation) {
      fields = mergeTranslatedContent(airtableObj.fields, translation.fields);
    }
  }
  const objectType = fields.skylark_object_type;

  // Determine typename based on skylark_object_type
  let typename = "Movie"; // default
  if (objectType === "episodes" || objectType === "Episode")
    typename = "Episode";
  else if (objectType === "seasons" || objectType === "Season")
    typename = "Season";
  else if (objectType === "brands" || objectType === "Brand")
    typename = "Brand";
  else if (objectType === "movies" || objectType === "Movie")
    typename = "Movie";
  else if (objectType === "live-streams" || objectType === "LiveStream")
    typename = "LiveStream";

  // Get related objects
  const imageIds = fields.images
    ? assertStringArray(
        Array.isArray(fields.images) ? fields.images : [fields.images],
      )
    : null;
  const images = imageIds
    ? imageIds
        .map((imgId: string) => {
          const img = getImageById(imgId);
          if (!img) return null;

          const url = getImageUrl(img);

          // Handle type field which might be an array
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
        .filter(Boolean)
    : [];

  const genres = processNestedRelationships(
    fields.genres,
    (genreId: string) => {
      const genre = getGenreById(genreId);
      return genre
        ? {
            __typename: "Genre",
            uid: genre.id,
            name: assertString(genre.fields.name),
          }
        : null;
    },
    currentDepth,
    1,
  );

  const themes = processNestedRelationships(
    fields.themes,
    (themeId: string) => {
      const theme = getThemeById(themeId);
      return theme
        ? {
            __typename: "Theme",
            uid: theme.id,
            name: assertString(theme.fields.name),
          }
        : null;
    },
    currentDepth,
    1,
  );

  const tags = processNestedRelationships(
    fields.tags,
    (tagId: string) => {
      const tag = getTagById(tagId);
      return tag
        ? {
            __typename: "SkylarkTag",
            uid: tag.id,
            name: assertString(tag.fields.name),
            type: assertString(tag.fields.type),
          }
        : null;
    },
    currentDepth,
    1,
  );

  const ratings = processNestedRelationships(
    fields.ratings,
    (ratingId: string) => {
      const rating = getRatingById(ratingId);
      return rating
        ? {
            uid: rating.id,
            value: assertString(rating.fields.value),
          }
        : null;
    },
    currentDepth,
    1,
  );

  const creditsRaw = processNestedRelationships(
    fields.credits,
    (creditId: string) => {
      const credit = getCreditById(creditId);
      if (!credit) return null;

      // Handle single person (not array) - depth cost of 2 (Credit -> Person)
      const people = processNestedRelationships(
        credit.fields.person,
        (personId: string) => {
          const person = getPersonById(personId);
          return person
            ? {
                __typename: "Person" as const,
                uid: person.id,
                name: assertString(person.fields.name),
              }
            : null;
        },
        currentDepth,
        2,
      );

      // Handle single role (not array) - depth cost of 2 (Credit -> Role)
      const roles = processNestedRelationships(
        credit.fields.role,
        (roleId: string) => {
          const role = getRoleById(roleId);
          return role
            ? {
                __typename: "Role" as const,
                uid: role.id,
                title: assertString(role.fields.title),
                title_sort: assertString(role.fields.title_sort),
                internal_title: assertString(role.fields.internal_title),
              }
            : null;
        },
        currentDepth,
        2,
      );

      return {
        __typename: "Credit",
        uid: credit.id,
        character: assertString(credit.fields.character),
        people: wrapObjectsOrNull(people),
        roles: wrapObjectsOrNull(roles),
      } satisfies Credit;
    },
    currentDepth,
    1,
  );

  // Remove entire credits if they contain duplicate people (keep duplicate roles)
  const seenPeople = new Set();
  const credits =
    creditsRaw !== null
      ? creditsRaw.filter((credit) => {
          // Skip duplicate checking if people is null (depth limit reached)
          if (credit.people === null) {
            return true; // Keep this credit
          }

          // Check if any person in this credit has already been seen
          const hasDuplicatePerson = credit.people.objects.some((person) =>
            seenPeople.has(person.uid),
          );

          if (hasDuplicatePerson) {
            return false; // Remove entire credit if it contains a duplicate person
          }

          // Add all people from this credit to the seen set
          credit.people.objects.forEach((person) => {
            seenPeople.add(person.uid);
          });

          return true; // Keep this credit
        })
      : null;

  // Base object structure
  const baseObject = {
    uid: airtableObj.id,
    external_id: fields.external_id || airtableObj.id,
    __typename: typename,
    slug: fields.slug,
    title: fields.title,
    title_short: fields.title_short,
    synopsis: fields.synopsis,
    synopsis_short: fields.synopsis_short,
    release_date: fields.release_date,
    images: { objects: images },
    genres: wrapObjectsOrNull(genres),
    themes: wrapObjectsOrNull(themes),
    tags: wrapObjectsOrNull(tags),
    ratings: wrapObjectsOrNull(ratings),
    credits: wrapObjectsOrNull(credits),
    availability: { objects: [] }, // Will be processed below
  };

  // Add type-specific fields
  if (typename === "Episode") {
    return {
      ...baseObject,
      episode_number: fields.episode_number,
    };
  }
  if (typename === "Season") {
    return {
      ...baseObject,
      season_number: fields.season_number,
    };
  }

  // Process availability records if requested dimensions are provided
  if (requestedDimensions) {
    const contentAvailabilityIds = assertStringArray(fields.availability) || [];
    const hasAccess = filterContentByAvailability(
      contentAvailabilityIds,
      requestedDimensions,
      airtableData,
    );
    
    // If no access, return null to filter out this content
    if (!hasAccess) {
      return null;
    }
    
    // Convert availability IDs to availability objects
    const availabilityObjects = contentAvailabilityIds
      .map(availId => {
        const availRecord = airtableData.availability?.find(
          (avail: any) => avail.id === availId
        );
        if (!availRecord) return null;
        
        return {
          __typename: "Availability",
          uid: availRecord.id,
          title: assertString(availRecord.fields.title) || "",
          slug: assertString(availRecord.fields.slug) || "",
        };
      })
      .filter(Boolean);
    
    baseObject.availability = { objects: availabilityObjects };
  }

  // Add assets for movies/episodes
  if (typename === "Movie" || typename === "Episode") {
    return {
      ...baseObject,
      assets: { objects: [] }, // Would need asset data
      brands: { objects: [] }, // Would need to link parent brands
    };
  }

  return baseObject;
};

// Options for getObjectsByType function
export interface GetObjectsByTypeOptions {
  type: string;
  depth: number;
  languageCode?: string;
}

// Get all objects of a specific type
export const getObjectsByType = (options: GetObjectsByTypeOptions) => {
  const { type, depth, languageCode } = options;

  const filtered = airtableData.mediaObjects.filter((obj) =>
    isObjectType(obj, type),
  );

  return filtered
    .map((obj) =>
      convertMediaObjectToGraphQL({
        airtableObj: obj,
        currentDepth: depth,
        languageCode,
      }),
    )
    .filter(Boolean);
};
