// Utilities for handling MSW request objects

// Extract language code from request headers (case insensitive)
export const getLanguageFromRequest = (headers: Headers): string => {
  const language = headers.get("x-language");
  return language ? language.toLowerCase() : "en-gb";
};

// Could add more request utilities here in the future:
// - getUserFromRequest
// - getDeviceFromRequest
// - getRegionFromRequest
// etc.
