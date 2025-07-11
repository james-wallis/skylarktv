import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";

export const fallbackHandlers = [
  // Catch-all handler for any unhandled queries
  graphql.link(SAAS_API_ENDPOINT).query("*", ({ operationName }) =>
    HttpResponse.json({
      data: {},
      errors: [
        {
          message: `Mock handler not implemented for query: ${operationName}`,
        },
      ],
    }),
  ),
];
