// Import all fixture handlers
import { getMovieHandlers } from "./getMovie";
import { getBrandHandlers } from "./getBrand";
import { getSeasonHandlers } from "./getSeason";
import { getEpisodeHandlers } from "./getEpisode";
import { listMoviesHandlers } from "./listMovies";
import { listGenresHandlers } from "./listGenres";
import { getSetHandlers } from "./getSet";
import { getArticleHandlers } from "./getArticle";
import { getPersonHandlers } from "./getPerson";
import { searchHandlers } from "./search";
import { skylarkEnvironmentHandlers } from "./skylarkEnvironment";
import { skylarktvConfigHandlers } from "./skylarktvConfig";
import { getUserAccountHandlers } from "./getUserAccount";
import { getLiveStreamHandlers } from "./getLiveStream";
import { getCTAHandlers } from "./getCTA";
import { getAssetHandlers } from "./getAsset";
import { fallbackHandlers } from "./fallback";

// Combine all handlers into a single array
export const allHandlers = [
  ...getMovieHandlers,
  ...getBrandHandlers,
  ...getSeasonHandlers,
  ...getEpisodeHandlers,
  ...listMoviesHandlers,
  ...listGenresHandlers,
  ...getSetHandlers,
  ...getArticleHandlers,
  ...getPersonHandlers,
  ...searchHandlers,
  ...skylarkEnvironmentHandlers,
  ...skylarktvConfigHandlers,
  ...getUserAccountHandlers,
  ...getLiveStreamHandlers,
  ...getCTAHandlers,
  ...getAssetHandlers,
  ...fallbackHandlers, // Keep fallback last
];

// Export individual handler groups for selective use
export {
  getMovieHandlers,
  getBrandHandlers,
  getSeasonHandlers,
  getEpisodeHandlers,
  listMoviesHandlers,
  listGenresHandlers,
  getSetHandlers,
  getArticleHandlers,
  getPersonHandlers,
  searchHandlers,
  skylarkEnvironmentHandlers,
  skylarktvConfigHandlers,
  getUserAccountHandlers,
  getLiveStreamHandlers,
  getCTAHandlers,
  getAssetHandlers,
  fallbackHandlers,
};
