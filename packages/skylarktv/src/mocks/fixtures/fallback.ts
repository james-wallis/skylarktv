import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";

export const fallbackHandlers = [
  // Catch-all handler for any unhandled queries
  graphql.link(SAAS_API_ENDPOINT).query("*", ({ request, operationName }) => {
    console.warn(`Unhandled GraphQL query: ${operationName}`, {
      url: request.url,
      variables: request.body,
    });

    return HttpResponse.json({
      data: {},
      errors: [
        {
          message: `Mock handler not implemented for query: ${operationName}`,
        },
      ],
    });
  }),
];
