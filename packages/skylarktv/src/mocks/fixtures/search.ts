import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import { searchAllObjects } from "../airtableData";

export const searchHandlers = [
  // Handle search queries
  graphql.link(SAAS_API_ENDPOINT).query("SEARCH", ({ variables }) => {
    const query = variables.query || "";
    const limit = variables.limit || 20;
    
    console.log(`SEARCH: Searching for "${query}" with limit ${limit}`);
    
    const searchResults = searchAllObjects(query);
    
    return HttpResponse.json({
      data: {
        search: {
          results: searchResults.slice(0, limit),
        },
      },
    });
  }),
];