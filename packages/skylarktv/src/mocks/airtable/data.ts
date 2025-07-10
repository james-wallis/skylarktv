import { Airtables } from "../../types/airtable";
import airtableDataRaw from "../skylark_airtable_data.json";

// Type the imported data - we use type assertion because JSON doesn't include Airtable Record methods
export const airtableData = (airtableDataRaw as { airtable_data: unknown })
  .airtable_data as Airtables;

// Helper functions to get objects by ID
export const getImageById = (id: string) =>
  airtableData.images?.find((img) => img.id === id);

export const getGenreById = (id: string) =>
  airtableData.genres?.find((genre) => genre.id === id);

export const getThemeById = (id: string) =>
  airtableData.themes?.find((theme) => theme.id === id);

export const getRatingById = (id: string) =>
  airtableData.ratings?.find((rating) => rating.id === id);

export const getTagById = (id: string) =>
  airtableData.tags?.find((tag) => tag.id === id);

export const getPersonById = (id: string) =>
  airtableData.people?.find((person) => person.id === id);

export const getCreditById = (id: string) =>
  airtableData.credits?.find((credit) => credit.id === id);

export const getRoleById = (id: string) =>
  airtableData.roles?.find((role) => role.id === id);

// Helper functions to convert Airtable data to GraphQL format
export const getMediaObjectBySlug = (slug: string) =>
  airtableData.mediaObjects.find((obj) => obj.fields.slug === slug);

export const getMediaObjectByUidOrExternalId = (
  uid?: string,
  externalId?: string,
) => {
  if (uid) {
    return airtableData.mediaObjects.find(
      (obj) => obj.id === uid || obj.fields["Airtable ID"] === uid,
    );
  }
  if (externalId) {
    return airtableData.mediaObjects.find(
      (obj) =>
        obj.id === externalId || obj.fields["Airtable ID"] === externalId,
    );
  }
  return null;
};

// Get set by ID or external ID
export const getSetById = (id: string) => {
  const sets = airtableData.sets || [];

  // First try to find in the dedicated sets array
  let foundSet = sets.find(
    (s) => s.id === id || s.fields.external_id === id || s.fields.slug === id,
  );

  // If not found, check in mediaObjects for SkylarkSet type
  if (!foundSet) {
    foundSet = airtableData.mediaObjects?.find(
      (obj) =>
        obj.fields.skylark_object_type === "SkylarkSet" &&
        (obj.id === id ||
          obj.fields.external_id === id ||
          obj.fields.slug === id),
    );
  }

  return foundSet;
};
