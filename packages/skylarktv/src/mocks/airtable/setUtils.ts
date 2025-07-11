// Utilities for set handler creation and common patterns
import { extractRequestContext } from "./requestUtils";
import { createGraphQLResponse } from "./graphqlUtils";
import { getSetById } from "./data";
import { convertSetToGraphQL, resolveSetWithFallback } from "./sets";

export interface SetHandlerOptions {
  useReference?: boolean;
  depth?: number;
}

// Generic set handler creator
export const createSetHandler = (options: SetHandlerOptions = {}) => {
  const { useReference = true, depth = 0 } = options;

  return ({
    request,
    variables,
  }: {
    request: Request;
    variables: { uid?: string; externalId?: string };
  }) => {
    const setId = variables.uid || variables.externalId;
    const requestContext = extractRequestContext(request.headers);

    let actualSet = getSetById(setId as string);

    // Use reference resolution if enabled and set not found
    if (!actualSet && useReference) {
      actualSet = resolveSetWithFallback(setId as string) || undefined;
    }

    if (actualSet) {
      const setGraphQL = convertSetToGraphQL({
        airtableSet: actualSet,
        currentDepth: depth,
        ...requestContext,
      });

      if (setGraphQL) {
        return createGraphQLResponse(setGraphQL);
      }
    }

    return createGraphQLResponse(null);
  };
};
