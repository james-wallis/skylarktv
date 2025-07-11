// Utilities for GraphQL response creation and common patterns
import {
  AsyncResponseResolverReturnType,
  GraphQLQuery,
  HttpResponse,
} from "msw";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Record as AirtableRecord, FieldSet } from "airtable";
import { extractRequestContext } from "./requestUtils";
import { findObjectsByMetadata } from "./mediaObjectUtils";

// Create standardized GraphQL response with proper typing
export const createGraphQLResponse = (
  data: unknown,
  fieldName = "getObject",
): AsyncResponseResolverReturnType<GraphQLQuery> =>
  HttpResponse.json({
    data: {
      [fieldName]: data,
    },
  });

// Create list response with metadata
export const createGraphQLListResponse = (
  objects: unknown[],
  fieldName = "listObjects",
): AsyncResponseResolverReturnType<GraphQLQuery> =>
  HttpResponse.json({
    data: {
      [fieldName]: {
        count: objects.length,
        hasNextPage: false,
        objects,
      },
    },
  });

// Generic list-by-metadata handler creator
export const createListByMetadataHandler =
  (
    metadataType: "genres" | "tags",
    objectType: string,
    metadataCollection: AirtableRecord<FieldSet>[],
    metadataTypename: string,
  ) =>
  ({
    variables,
    request,
  }: {
    variables: { uid?: string; externalId?: string };
    request: Request;
  }) => {
    const metadataId = variables.uid || variables.externalId;
    const metadata = metadataCollection.find((item) => item.id === metadataId);

    if (!metadata) {
      return createGraphQLResponse(null);
    }

    const requestContext = extractRequestContext(request.headers);
    const objectsWithMetadata = findObjectsByMetadata(
      metadataType,
      metadataId as string,
      objectType,
      {
        currentDepth: 0,
        ...requestContext,
      },
    );

    return createGraphQLResponse({
      __typename: metadataTypename,
      uid: metadata.id,
      name: metadata.fields.name as string,
      [`${objectType}s`]: {
        next_token: null,
        objects: objectsWithMetadata,
      },
    });
  };
