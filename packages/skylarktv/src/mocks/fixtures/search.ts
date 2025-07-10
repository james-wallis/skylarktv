import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import { searchAllObjects } from "../airtableData";

export const searchHandlers = [
  // Handle search queries
  graphql
    .link(SAAS_API_ENDPOINT)
    .query(
      "SEARCH",
      ({ variables }: { variables: { query?: string; limit?: number } }) => {
        const query = variables.query || "";
        const limit = variables.limit || 20;

        const searchResults = searchAllObjects(query);

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
