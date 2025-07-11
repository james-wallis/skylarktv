// Utilities for handling MSW request objects

import { AvailabilityDimensions } from "./availability";

// Extract language code from request headers (case insensitive)
export const getLanguageFromRequest = (headers: Headers): string => {
  const language = headers.get("x-language");
  return language ? language.toLowerCase() : "en-gb";
};

export const getAvailabilityDimensionsFromRequest = (
  headers: Headers,
): AvailabilityDimensions => {
  const customerTypes = headers.get("x-sl-dimension-customer-types");
  const deviceTypes = headers.get("x-sl-dimension-device-types");
  const regions = headers.get("x-sl-dimension-regions");

  return {
    customerTypes: customerTypes
      ? customerTypes
          .toLowerCase()
          .split(",")
          .map((s) => s.trim())
      : [],
    deviceTypes: deviceTypes
      ? deviceTypes
          .toLowerCase()
          .split(",")
          .map((s) => s.trim())
      : [],
    regions: regions
      ? regions
          .toLowerCase()
          .split(",")
          .map((s) => s.trim())
      : [],
  };
};

export const getTimeTravelFromRequest = (headers: Headers): Date | null => {
  const timeTravel = headers.get("x-time-travel");
  if (!timeTravel || timeTravel.trim() === "") {
    return null;
  }

  try {
    return new Date(timeTravel);
  } catch {
    return null;
  }
};

// Request context interface for consolidated header extraction
export interface RequestContext {
  languageCode: string;
  requestedDimensions: AvailabilityDimensions;
  timeTravelDate: Date | null;
}

// Extract all common request context from headers in one call
export const extractRequestContext = (headers: Headers): RequestContext => ({
  languageCode: getLanguageFromRequest(headers),
  requestedDimensions: getAvailabilityDimensionsFromRequest(headers),
  timeTravelDate: getTimeTravelFromRequest(headers),
});
