import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  getSetById,
  convertSetToGraphQL,
  resolveSetReference,
  getLanguageFromRequest,
  getAvailabilityDimensionsFromRequest,
} from "../airtableData";

export const getSetHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_SET", ({ request, variables }) => {
      const setId = variables.uid || variables.externalId;
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );
      const set = getSetById(setId);

      if (set) {
        const setGraphQL = convertSetToGraphQL({
          airtableSet: set,
          currentDepth: 0,
          languageCode,
          requestedDimensions,
        }); // Set is at depth 0 (root level)

        if (setGraphQL) {
          return HttpResponse.json({
            data: {
              getObject: setGraphQL,
            },
          });
        }
      }

      return HttpResponse.json({
        data: { getObject: null },
      });
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_SET_THUMBNAIL", ({ request, variables }) => {
      const setId = variables.uid || variables.externalId;
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );
      const set = getSetById(setId);

      if (set) {
        const setGraphQL = convertSetToGraphQL({
          airtableSet: set,
          currentDepth: 0,
          languageCode,
          requestedDimensions,
        }); // Set is at depth 0 (root level)

        if (setGraphQL) {
          return HttpResponse.json({
            data: {
              getObject: setGraphQL,
            },
          });
        }
      }

      return HttpResponse.json({
        data: { getObject: null },
      });
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_SET_FOR_CAROUSEL", ({ request, variables }) => {
      const setId = variables.uid || variables.externalId;
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );

      // First try to find the set directly in the sets array
      let actualSet = getSetById(setId);

      // If not found, try the reference resolution (mediaObjects -> sets mapping)
      if (!actualSet) {
        actualSet = resolveSetReference(setId) || undefined;
      }

      if (!actualSet) {
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      const setGraphQL = convertSetToGraphQL({
        airtableSet: actualSet,
        currentDepth: 0,
        languageCode,
        requestedDimensions,
      }); // Set is at depth 0 (root level)

      if (setGraphQL) {
        return HttpResponse.json({
          data: {
            getObject: setGraphQL,
          },
        });
      }

      return HttpResponse.json({
        data: { getObject: null },
      });
    }),

  // Handle Set for Rail queries
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_SET_FOR_RAIL", ({ request, variables }) => {
      const setId = variables.uid || variables.externalId;
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );

      // First try to find the set directly in the sets array
      let actualSet = getSetById(setId);

      // If not found, try the reference resolution (mediaObjects -> sets mapping)
      if (!actualSet) {
        actualSet = resolveSetReference(setId) || undefined;
      }

      if (!actualSet) {
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      const setGraphQL = convertSetToGraphQL({
        airtableSet: actualSet,
        currentDepth: 0,
        languageCode,
        requestedDimensions,
      }); // Set is at depth 0 (root level)

      if (setGraphQL) {
        return HttpResponse.json({
          data: {
            getObject: setGraphQL,
          },
        });
      }

      return HttpResponse.json({
        data: { getObject: null },
      });
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_PAGE_SET", ({ request, variables }) => {
      const setId = variables.uid || variables.externalId;
      const languageCode = getLanguageFromRequest(request.headers);

      // First try to find the set directly in the sets array
      let actualSet = getSetById(setId);

      // If not found, try the reference resolution (mediaObjects -> sets mapping)
      if (!actualSet) {
        actualSet = resolveSetReference(setId) || undefined;
      }

      if (!actualSet) {
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      // Use convertSetToGraphQL with depth limiting
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );
      const setGraphQL = convertSetToGraphQL({
        airtableSet: actualSet,
        currentDepth: 0,
        languageCode,
        requestedDimensions,
      }); // Set is at depth 0 (root level)

      if (setGraphQL) {
        return HttpResponse.json({
          data: {
            getObject: setGraphQL,
          },
        });
      }

      return HttpResponse.json({
        data: { getObject: null },
      });
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_COLLECTION_SET", ({ request, variables }) => {
      const setId = variables.uid || variables.externalId;
      const languageCode = getLanguageFromRequest(request.headers);
      const requestedDimensions = getAvailabilityDimensionsFromRequest(
        request.headers,
      );

      // First try to find the set directly in the sets array
      let actualSet = getSetById(setId);

      // If not found, try the reference resolution (mediaObjects -> sets mapping)
      if (!actualSet) {
        actualSet = resolveSetReference(setId) || undefined;
      }

      if (!actualSet) {
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      const setGraphQL = convertSetToGraphQL({
        airtableSet: actualSet,
        currentDepth: 0,
        languageCode,
        requestedDimensions,
      }); // Set is at depth 0 (root level)

      if (setGraphQL) {
        return HttpResponse.json({
          data: {
            getObject: setGraphQL,
          },
        });
      }

      return HttpResponse.json({
        data: { getObject: null },
      });
    }),
];
