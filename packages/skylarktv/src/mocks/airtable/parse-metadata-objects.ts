// Utilities for parsing Airtable metadata objects into GraphQL format
// eslint-disable-next-line import/no-extraneous-dependencies
import { Record as AirtableRecord, FieldSet } from "airtable";
import {
  assertString,
  assertSingleString,
  getImageUrl,
  findTranslationForObject,
  mergeTranslatedContent,
} from "./utils";
import {
  Genre,
  SkylarkImage,
  Theme,
  SkylarkTag,
  Rating,
  Person,
  Role,
  CallToAction,
} from "../../types";
import { airtableData } from "./data";

// Base options for metadata parsing with translation support
export interface MetadataParseOptions {
  languageCode?: string;
}

// Helper function to apply translations to metadata objects
const applyTranslations = (
  objectId: string,
  fields: FieldSet,
  translationsArray: AirtableRecord<FieldSet>[],
  languageCode?: string,
): FieldSet => {
  if (!languageCode || languageCode === "en-GB" || !translationsArray) {
    return fields;
  }

  const translation = findTranslationForObject(
    objectId,
    languageCode,
    translationsArray,
  );
  if (translation) {
    return mergeTranslatedContent(fields, translation.fields);
  }

  return fields;
};

// Image parsing utility
export const parseImage = (
  imgRecord: AirtableRecord<FieldSet> | undefined,
): SkylarkImage | null => {
  if (!imgRecord) return null;

  const url = getImageUrl(imgRecord);
  const typeValue = assertSingleString(imgRecord.fields.type);

  return {
    __typename: "SkylarkImage",
    uid: imgRecord.id,
    external_id: assertString(imgRecord.fields.external_id) || imgRecord.id,
    title:
      assertString(imgRecord.fields.title) ||
      assertString(imgRecord.fields["unique-title"]),
    type: typeValue || "IMAGE",
    url,
    external_url:
      assertString(imgRecord.fields.external_url) ||
      assertString(imgRecord.fields.external_url_old),
  };
};

// Genre parsing utility
export const parseGenre = (
  genreRecord: AirtableRecord<FieldSet> | undefined,
  options?: MetadataParseOptions,
): Genre | null => {
  if (!genreRecord) return null;

  const fields = applyTranslations(
    genreRecord.id,
    genreRecord.fields,
    airtableData.translations?.genres || [],
    options?.languageCode,
  );

  return {
    __typename: "Genre",
    uid: genreRecord.id,
    external_id: assertString(fields.external_id) || genreRecord.id,
    name: assertString(fields.name),
    slug: assertString(fields.slug),
  };
};

// Theme parsing utility
export const parseTheme = (
  themeRecord: AirtableRecord<FieldSet> | undefined,
  options?: MetadataParseOptions,
): Theme | null => {
  if (!themeRecord) return null;

  const fields = applyTranslations(
    themeRecord.id,
    themeRecord.fields,
    airtableData.translations?.themes || [],
    options?.languageCode,
  );

  return {
    __typename: "Theme",
    uid: themeRecord.id,
    external_id: assertString(fields.external_id) || themeRecord.id,
    name: assertString(fields.name),
  };
};

// Tag parsing utility
export const parseTag = (
  tagRecord: AirtableRecord<FieldSet> | undefined,
): SkylarkTag | null => {
  if (!tagRecord) return null;

  return {
    __typename: "SkylarkTag",
    uid: tagRecord.id,
    external_id: assertString(tagRecord.fields.external_id) || tagRecord.id,
    name: assertString(tagRecord.fields.name),
    type: assertString(tagRecord.fields.type),
  };
};

// Rating parsing utility
export const parseRating = (
  ratingRecord: AirtableRecord<FieldSet> | undefined,
): Rating | null => {
  if (!ratingRecord) return null;

  return {
    __typename: "Rating",
    uid: ratingRecord.id,
    external_id:
      assertString(ratingRecord.fields.external_id) || ratingRecord.id,
    value: assertString(ratingRecord.fields.value),
  };
};

// Person parsing utility
export const parsePerson = (
  personRecord: AirtableRecord<FieldSet> | undefined,
  options?: MetadataParseOptions,
): Person | null => {
  if (!personRecord) return null;

  const fields = applyTranslations(
    personRecord.id,
    personRecord.fields,
    airtableData.translations?.people || [],
    options?.languageCode,
  );

  return {
    __typename: "Person" as const,
    uid: personRecord.id,
    external_id: personRecord.id,
    slug: assertString(fields.slug),
    name: assertString(fields.name),
    abbreviation: assertString(fields.abbreviation),
    alias: assertString(fields.alias),
    bio_long: assertString(fields.bio_long),
    bio_medium: assertString(fields.bio_medium),
    bio_short: assertString(fields.bio_short),
    genre: assertString(fields.genre),
    date_of_birth: assertString(fields.date_of_birth),
    name_sort: assertString(fields.name_sort),
    place_of_birth: assertString(fields.place_of_birth),
  };
};

// Role parsing utility
export const parseRole = (
  roleRecord: AirtableRecord<FieldSet> | undefined,
  options?: MetadataParseOptions,
): Role | null => {
  if (!roleRecord) return null;

  const fields = applyTranslations(
    roleRecord.id,
    roleRecord.fields,
    airtableData.translations?.roles || [],
    options?.languageCode,
  );

  return {
    __typename: "Role" as const,
    uid: roleRecord.id,
    external_id: assertString(fields.external_id) || roleRecord.id,
    title: assertString(fields.title),
    title_sort: assertString(fields.title_sort),
    internal_title: assertString(fields.internal_title),
  };
};

// Call to Action parsing utility
export const parseCallToAction = (
  ctaRecord: AirtableRecord<FieldSet> | undefined,
  options?: MetadataParseOptions,
): CallToAction | null => {
  if (!ctaRecord) return null;

  const fields = applyTranslations(
    ctaRecord.id,
    ctaRecord.fields,
    airtableData.translations?.callToActions || [],
    options?.languageCode,
  );

  return {
    __typename: "CallToAction",
    uid: ctaRecord.id,
    external_id: assertString(fields.external_id) || ctaRecord.id,
    internal_title: assertString(fields.internal_title),
    type: assertString(fields.type),
    text: assertString(fields.text),
    text_short: assertString(fields.text_short),
    description: assertString(fields.description),
    description_short: assertString(fields.description_short),
    url: assertString(fields.url),
    url_path: assertString(fields.url_path),
  };
};
