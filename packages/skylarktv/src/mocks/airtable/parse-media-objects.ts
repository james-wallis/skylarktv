// Utilities for parsing Airtable media objects into GraphQL format
// eslint-disable-next-line import/no-extraneous-dependencies
import { Record as AirtableRecord, FieldSet } from "airtable";
import {
  assertString,
  assertNumber,
  assertStringArray,
  processNestedRelationships,
  wrapObjectsOrNull,
  findTranslationForObject,
  mergeTranslatedContent,
  DEPTH_LIMIT_CONFIG,
} from "./utils";
import {
  filterContentByAvailability,
  AvailabilityDimensions,
  parseAvailability,
} from "./availability";
import {
  Credit,
  Episode,
  Movie,
  Season,
  Brand,
  LiveStream,
  Article,
  Availability,
  CallToAction,
  SkylarkTVAdditionalFields,
} from "../../types";
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
  parseImage,
  parseGenre,
  parseTheme,
  parseTag,
  parseRating,
  parsePerson,
  parseRole,
  parseCallToAction,
} from "./parse-metadata-objects";

// Media object parsing options
export interface MediaObjectParseOptions {
  airtableObj: AirtableRecord<FieldSet>;
  currentDepth?: number;
  languageCode?: string;
  requestedDimensions?: AvailabilityDimensions;
  timeTravelDate?: Date | null;
}

// Base media object parser - handles all common fields and processing
export const parseMediaObject = (options: MediaObjectParseOptions) => {
  const {
    airtableObj,
    currentDepth = 0,
    languageCode,
    requestedDimensions,
    timeTravelDate,
  } = options;

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
          return parseImage(img);
        })
        .filter(Boolean)
    : [];

  const genres = processNestedRelationships(
    fields.genres,
    (genreId: string) => {
      const genre = getGenreById(genreId);
      return parseGenre(genre, { languageCode });
    },
    currentDepth,
    1,
  );

  const themes = processNestedRelationships(
    fields.themes,
    (themeId: string) => {
      const theme = getThemeById(themeId);
      return parseTheme(theme, { languageCode });
    },
    currentDepth,
    1,
  );

  const tags = processNestedRelationships(
    fields.tags,
    (tagId: string) => {
      const tag = getTagById(tagId);
      return parseTag(tag);
    },
    currentDepth,
    1,
  );

  const ratings = processNestedRelationships(
    fields.ratings,
    (ratingId: string) => {
      const rating = getRatingById(ratingId);
      return parseRating(rating);
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
          return parsePerson(person, { languageCode });
        },
        currentDepth,
        2,
      );

      // Handle single role (not array) - depth cost of 2 (Credit -> Role)
      const roles = processNestedRelationships(
        credit.fields.role,
        (roleId: string) => {
          const role = getRoleById(roleId);
          return parseRole(role, { languageCode });
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

  // Process availability records if requested dimensions are provided
  let availabilityObjects: Availability[] = [];

  // Check if any dimensions are actually requested
  const hasDimensionsRequested =
    requestedDimensions &&
    ((requestedDimensions.customerTypes &&
      requestedDimensions.customerTypes.length > 0) ||
      (requestedDimensions.deviceTypes &&
        requestedDimensions.deviceTypes.length > 0) ||
      (requestedDimensions.regions && requestedDimensions.regions.length > 0));

  if (hasDimensionsRequested) {
    const contentAvailabilityIds = assertStringArray(fields.availability) || [];
    const hasAccess = filterContentByAvailability(
      contentAvailabilityIds,
      requestedDimensions,
      airtableData,
      timeTravelDate,
    );

    // If no access, return null to filter out this content
    if (!hasAccess) {
      return null;
    }

    // Convert availability IDs to availability objects
    const tempAvailabilityObjects = contentAvailabilityIds
      .map((availId) => {
        const availRecord = airtableData.availability?.find(
          (avail) => avail.id === availId,
        );
        if (!availRecord) return null;

        return parseAvailability(availRecord);
      })
      .filter((avail): avail is Availability => !!avail);
    availabilityObjects = tempAvailabilityObjects;
  }

  // Process call to actions
  let callToActionObjects: CallToAction[] = [];
  const callToActionIds = assertStringArray(fields.call_to_actions) || [];
  if (callToActionIds.length > 0) {
    const tempCallToActionObjects = callToActionIds
      .map((ctaId) => {
        const ctaRecord = airtableData.callToActions?.find(
          (cta) => cta.id === ctaId,
        );
        return parseCallToAction(ctaRecord, { languageCode });
      })
      .filter((cta): cta is CallToAction => !!cta);
    callToActionObjects = tempCallToActionObjects;
  }

  return {
    uid: airtableObj.id,
    external_id: assertString(fields.external_id) || airtableObj.id,
    slug: assertString(fields.slug),
    title: assertString(fields.title),
    title_short: assertString(fields.title_short),
    title_sort: assertString(fields.title_sort),
    synopsis: assertString(fields.synopsis),
    synopsis_short: assertString(fields.synopsis_short),
    release_date: assertString(fields.release_date),
    images: { objects: images },
    genres: wrapObjectsOrNull(genres),
    themes: wrapObjectsOrNull(themes),
    tags: wrapObjectsOrNull(tags),
    ratings: wrapObjectsOrNull(ratings),
    credits: wrapObjectsOrNull(credits),
    availability: { objects: availabilityObjects },
    call_to_actions: { objects: callToActionObjects },
    fields, // Expose fields for type-specific parsers
  };
};

// Movie parsing utility
export const parseMovie = (options: MediaObjectParseOptions): Movie | null => {
  const baseObject = parseMediaObject(options);
  if (!baseObject) return null;

  return {
    ...baseObject,
    __typename: "Movie",
    [SkylarkTVAdditionalFields.Budget]: assertNumber(baseObject.fields.budget),
    [SkylarkTVAdditionalFields.AudienceRating]: assertNumber(
      baseObject.fields.audience_rating,
    ),
    assets: { objects: [] }, // Would need asset data
    brands: { objects: [] }, // Would need to link parent brands
  };
};

// Episode parsing utility
export const parseEpisode = (
  options: MediaObjectParseOptions,
): Episode | null => {
  const baseObject = parseMediaObject(options);
  if (!baseObject) return null;

  return {
    ...baseObject,
    __typename: "Episode",
    episode_number: assertNumber(baseObject.fields.episode_number),
    [SkylarkTVAdditionalFields.AudienceRating]: assertNumber(
      baseObject.fields.audience_rating,
    ),
    assets: { objects: [] }, // Would need asset data
    brands: { objects: [] }, // Would need to link parent brands
  };
};

// Season parsing utility
export const parseSeason = (
  options: MediaObjectParseOptions,
): Season | null => {
  const baseObject = parseMediaObject(options);
  if (!baseObject) return null;

  return {
    ...baseObject,
    __typename: "Season",
    season_number: assertNumber(baseObject.fields.season_number),
    [SkylarkTVAdditionalFields.PreferredImageType]: assertString(
      baseObject.fields.preferred_image_type,
    ),
  };
};

// Brand parsing utility
export const parseBrand = (options: MediaObjectParseOptions): Brand | null => {
  const baseObject = parseMediaObject(options);
  if (!baseObject) return null;

  return {
    ...baseObject,
    __typename: "Brand",
  };
};

// LiveStream parsing utility
export const parseLiveStream = (
  options: MediaObjectParseOptions,
): LiveStream | null => {
  const baseObject = parseMediaObject(options);
  if (!baseObject) return null;

  return {
    ...baseObject,
    __typename: "LiveStream",
  };
};

// Article parsing utility
export const parseArticle = (
  options: MediaObjectParseOptions,
): Article | null => {
  const {
    airtableObj,
    currentDepth = 0,
    languageCode,
    requestedDimensions,
    timeTravelDate,
  } = options;

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
      airtableData.translations?.articles || [],
    );

    if (translation) {
      fields = mergeTranslatedContent(airtableObj.fields, translation.fields);
    }
  }

  // Check availability if dimensions are requested
  if (requestedDimensions) {
    const articleAvailabilityIds = assertStringArray(fields.availability) || [];
    const hasAccess = filterContentByAvailability(
      articleAvailabilityIds,
      requestedDimensions,
      airtableData,
      timeTravelDate,
    );

    if (!hasAccess) {
      return null;
    }
  }

  // Get related objects (images, credits, tags)
  const imageIds = fields.images
    ? assertStringArray(
        Array.isArray(fields.images) ? fields.images : [fields.images],
      )
    : null;
  const images = imageIds
    ? imageIds
        .map((imgId: string) => {
          const img = getImageById(imgId);
          return parseImage(img);
        })
        .filter(Boolean)
    : [];

  // Process availability records if requested dimensions are provided
  let availabilityObjects: Availability[] = [];
  const hasDimensionsRequested =
    requestedDimensions &&
    ((requestedDimensions.customerTypes &&
      requestedDimensions.customerTypes.length > 0) ||
      (requestedDimensions.deviceTypes &&
        requestedDimensions.deviceTypes.length > 0) ||
      (requestedDimensions.regions && requestedDimensions.regions.length > 0));

  if (hasDimensionsRequested) {
    const contentAvailabilityIds = assertStringArray(fields.availability) || [];
    const tempAvailabilityObjects = contentAvailabilityIds
      .map((availId) => {
        const availRecord = airtableData.availability?.find(
          (avail) => avail.id === availId,
        );
        if (!availRecord) return null;
        return parseAvailability(availRecord);
      })
      .filter((avail): avail is Availability => !!avail);
    availabilityObjects = tempAvailabilityObjects;
  }

  return {
    __typename: "Article",
    uid: airtableObj.id,
    external_id: assertString(fields.external_id) || airtableObj.id,
    slug: assertString(fields.slug),
    title: assertString(fields.title),
    description: assertString(fields.description),
    body: assertString(fields.body),
    type: assertString(fields.type),
    publish_date: assertString(fields.publish_date),
    internal_title: assertString(fields.internal_title),
    images: { objects: images },
    availability: { objects: availabilityObjects },
    credits: { objects: [] }, // Would need credit relationships
    tags: { objects: [] }, // Would need tag relationships
  };
};
