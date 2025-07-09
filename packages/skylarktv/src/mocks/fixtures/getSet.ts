import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  getSetById,
  convertSetToGraphQL,
  resolveSetReference,
} from "../airtableData";

export const getSetHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_SET", ({ variables }) => {
      const setId = variables.uid || variables.externalId;
      const set = getSetById(setId);

      if (set) {
        return HttpResponse.json({
          data: {
            getObject: convertSetToGraphQL(set),
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
    >("GET_SET_THUMBNAIL", ({ variables }) => {
      const setId = variables.uid || variables.externalId;
      const set = getSetById(setId);

      if (set) {
        return HttpResponse.json({
          data: {
            getObject: convertSetToGraphQL(set),
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
    >("GET_SET_FOR_CAROUSEL", ({ variables }) => {
      const setId = variables.uid || variables.externalId;

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

      return HttpResponse.json({
        data: {
          getObject: convertSetToGraphQL(actualSet),
        },
      });
    }),

  // Handle Set for Rail queries
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_SET_FOR_RAIL", ({ variables }) => {
      const setId = variables.uid || variables.externalId;

      // First try to find the set directly in the sets array
      let actualSet = getSetById(setId);

      // If not found, try the reference resolution (mediaObjects -> sets mapping)
      if (!actualSet) {
        console.log(
          `GET_SET_FOR_RAIL: Direct set lookup failed, trying reference resolution`,
        );
        actualSet = resolveSetReference(setId) || undefined;
      }

      if (!actualSet) {
        console.log(`GET_SET_FOR_RAIL: Set not found for ID: ${setId}`);
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      return HttpResponse.json({
        data: {
          getObject: convertSetToGraphQL(actualSet),
        },
      });
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_PAGE_SET", ({ variables }) => {
      const setId = variables.uid || variables.externalId;
      console.log(`GET_PAGE_SET: Looking for page set with ID: ${setId}`);

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
      const setGraphQL = convertSetToGraphQL(actualSet);

      return HttpResponse.json({
        data: {
          getObject: setGraphQL,
        },
      });
    }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_COLLECTION_SET", ({ variables }) => {
      const setId = variables.uid || variables.externalId;
      console.log(
        `GET_COLLECTION_SET: Looking for collection set with ID: ${setId}`,
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

      return HttpResponse.json({
        data: {
          getObject: convertSetToGraphQL(actualSet),
        },
      });
    }),
];
