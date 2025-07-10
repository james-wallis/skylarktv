// eslint-disable-next-line import/no-extraneous-dependencies
import { Record as AirtableRecord, FieldSet } from "airtable";
import { Airtables } from "../../types/airtable";
import { assertString, assertStringArray } from "./utils";
import { Availability } from "../../types";

// Extract availability dimensions from request headers (case insensitive)
export interface AvailabilityDimensions {
  customerTypes: string[];
  deviceTypes: string[];
  regions: string[];
}

// Helper function to get the next Sunday at 9 PM
const getNextSundayAt9PM = (): Date => {
  const now = new Date();
  const nextSunday = new Date(now);

  // Calculate days until next Sunday (0 = Sunday, 1 = Monday, etc.)
  const daysUntilSunday = (7 - now.getDay()) % 7;

  // If today is Sunday, get next Sunday (add 7 days)
  const daysToAdd = daysUntilSunday === 0 ? 7 : daysUntilSunday;

  nextSunday.setDate(now.getDate() + daysToAdd);
  nextSunday.setHours(21, 0, 0, 0); // 9 PM

  return nextSunday;
};

// Helper function to compute dynamic dates for special availability slugs
const computeDynamicDates = (availabilityRecord: AirtableRecord<FieldSet>) => {
  const slug = assertString(availabilityRecord.fields.slug);

  if (slug === "active-next-sunday") {
    const nextSunday = getNextSundayAt9PM();
    return {
      starts: nextSunday,
      ends: null,
    };
  }

  if (slug === "active-until-next-sunday") {
    const nextSunday = getNextSundayAt9PM();
    return {
      starts: null,
      ends: nextSunday,
    };
  }

  // Return original dates for non-dynamic availability records
  const starts = availabilityRecord.fields.starts
    ? new Date(availabilityRecord.fields.starts as string)
    : null;
  const ends = availabilityRecord.fields.ends
    ? new Date(availabilityRecord.fields.ends as string)
    : null;

  return { starts, ends };
};

// Helper function to check if availability is currently active based on time constraints
const isAvailabilityTimeActive = (
  availabilityRecord: AirtableRecord<FieldSet>,
): boolean => {
  const { starts, ends } = computeDynamicDates(availabilityRecord);
  const now = new Date();

  // Check start time constraint
  if (starts && now < starts) {
    return false; // Not yet active
  }

  // Check end time constraint
  if (ends && now >= ends) {
    return false; // No longer active
  }

  return true; // Currently active
};

// Availability support functions
export const checkAvailabilityMatch = (
  availabilityRecord: AirtableRecord<FieldSet>,
  requestedDimensions: AvailabilityDimensions,
  airtableData: Airtables,
): boolean => {
  // First check if this availability is currently time-active
  if (!isAvailabilityTimeActive(availabilityRecord)) {
    return false;
  }

  // Get the availability record's dimensions
  let availabilityCustomers =
    assertStringArray(availabilityRecord.fields.customers) || [];
  let availabilityDevices =
    assertStringArray(availabilityRecord.fields.devices) || [];
  let availabilityRegions =
    assertStringArray(availabilityRecord.fields.regions) || [];

  // If no direct dimensions, check if this availability uses segments
  const availabilitySegments =
    assertStringArray(availabilityRecord.fields.segments) || [];

  // If segments are used, resolve them to all dimension types
  if (availabilitySegments.length > 0) {
    availabilitySegments.forEach((segmentId) => {
      const segment = airtableData.audienceSegments?.find(
        (s) => s.id === segmentId,
      );
      if (segment) {
        const segmentCustomers =
          assertStringArray(segment.fields.customers) || [];
        const segmentDevices = assertStringArray(segment.fields.devices) || [];
        const segmentRegions = assertStringArray(segment.fields.regions) || [];

        // Merge segment dimensions with existing dimensions
        if (availabilityCustomers.length === 0) {
          availabilityCustomers = [...segmentCustomers];
        }
        if (availabilityDevices.length === 0) {
          availabilityDevices = [...segmentDevices];
        }
        if (availabilityRegions.length === 0) {
          availabilityRegions = [...segmentRegions];
        }
      }
    });
  }

  // Helper function to check if any requested dimension matches any available dimension (case insensitive)
  const hasMatchingDimension = (
    requested: string[],
    available: string[],
    dimensionType: string,
  ) => {
    if (requested.length === 0) return true; // No dimensions requested means no restriction
    if (available.length === 0) return false; // No dimensions available means no access

    // Get dimension names from IDs for comparison
    const getNameFromId = (id: string, type: string) => {
      // Type-safe access to airtable data arrays
      let dataArray: AirtableRecord<FieldSet>[] | undefined;
      if (type === "customerTypes")
        dataArray = airtableData.dimensions?.customerTypes;
      else if (type === "deviceTypes")
        dataArray = airtableData.dimensions?.deviceTypes;
      else if (type === "regions") dataArray = airtableData.dimensions?.regions;
      else dataArray = undefined;

      if (!dataArray) return id;

      const record = dataArray.find((item) => item.id === id);
      if (!record) return id;

      // Try different possible name fields - prioritize slug for machine-readable identifiers
      const name =
        record.fields.slug || record.fields.name || record.fields.title || id;
      return typeof name === "string" ? name.toLowerCase() : id;
    };

    const availableNames = available.map((id) =>
      getNameFromId(id, dimensionType),
    );
    return requested.some((reqDim) =>
      availableNames.some(
        (availName) => availName.includes(reqDim) || reqDim.includes(availName),
      ),
    );
  };

  // Check all dimensions - all must match for strict availability
  const customerMatch = hasMatchingDimension(
    requestedDimensions.customerTypes,
    availabilityCustomers,
    "customerTypes",
  );

  const deviceMatch = hasMatchingDimension(
    requestedDimensions.deviceTypes,
    availabilityDevices,
    "deviceTypes",
  );

  const regionMatch = hasMatchingDimension(
    requestedDimensions.regions,
    availabilityRegions,
    "regions",
  );

  return customerMatch && deviceMatch && regionMatch;
};

export const filterContentByAvailability = (
  contentAvailabilityIds: string[],
  requestedDimensions: AvailabilityDimensions,
  airtableData: Airtables,
): boolean => {
  let availabilityIdsToCheck = contentAvailabilityIds;

  // If no availability records, use the default availability record
  if (!contentAvailabilityIds || contentAvailabilityIds.length === 0) {
    const defaultAvailability = airtableData.availability?.find(
      (avail) => avail.fields.default === true,
    );

    if (defaultAvailability) {
      availabilityIdsToCheck = [defaultAvailability.id];
    } else {
      return false; // No availability and no default means no access
    }
  }

  // Content is available if ANY of its availability records match the requested dimensions
  const hasMatch = availabilityIdsToCheck.some((availabilityId) => {
    const availabilityRecord = airtableData.availability?.find(
      (avail) => avail.id === availabilityId,
    );

    if (!availabilityRecord) return false;

    return checkAvailabilityMatch(
      availabilityRecord,
      requestedDimensions,
      airtableData,
    );
  });

  return hasMatch;
};

// Availability parsing utility
export const parseAvailability = (
  availRecord: AirtableRecord<FieldSet> | undefined,
): Availability | null => {
  if (!availRecord) return null;

  return {
    __typename: "Availability",
    uid: availRecord.id,
    external_id: assertString(availRecord.fields.external_id) || availRecord.id,
    title: assertString(availRecord.fields.title),
    slug: assertString(availRecord.fields.slug),
    end: assertString(availRecord.fields.end),
  };
};
