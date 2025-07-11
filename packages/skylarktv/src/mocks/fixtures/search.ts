import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  searchAllObjects,
  getLanguageFromRequest,
  getAvailabilityDimensionsFromRequest,
  getTimeTravelFromRequest,
} from "../airtableData";

export const searchHandlers = [
  // Handle search queries
  graphql
    .link(SAAS_API_ENDPOINT)
    .query(
      "SEARCH",
      ({
        variables,
        request,
      }: {
        variables: { query?: string; limit?: number };
        request: Request;
      }) => {
        const query = variables.query || "";
        const limit = variables.limit || 20;
        const languageCode = getLanguageFromRequest(request.headers);
        const requestedDimensions = getAvailabilityDimensionsFromRequest(
          request.headers,
        );
        const timeTravelDate = getTimeTravelFromRequest(request.headers);

        const searchResults = searchAllObjects(
          query,
          languageCode,
          requestedDimensions,
          timeTravelDate,
        );

        const limitedResults = searchResults.slice(0, limit);

        // Add _context field for UI highlighting
        const resultsWithContext = limitedResults.map((result) => ({
          ...result,
          _context: {
            typename_highlight: result.__typename,
          },
        }));

        return HttpResponse.json({
          data: {
            search: {
              total_count: searchResults.length,
              objects: resultsWithContext,
            },
          },
        });
      },
    ),
];
