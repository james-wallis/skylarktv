import { graphql } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  searchAllObjects,
  extractRequestContext,
  createGraphQLResponse,
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
        const { languageCode, requestedDimensions, timeTravelDate } =
          extractRequestContext(request.headers);

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

        return createGraphQLResponse(
          {
            total_count: searchResults.length,
            objects: resultsWithContext,
          },
          "search",
        );
      },
    ),
];
