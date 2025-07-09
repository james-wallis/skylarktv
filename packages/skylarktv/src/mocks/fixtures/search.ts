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

        return HttpResponse.json({
          data: {
            search: {
              results: searchResults.slice(0, limit),
            },
          },
        });
      },
    ),
];
