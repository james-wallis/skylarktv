import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  getSetById,
  convertSetToGraphQL,
  resolveSetReference,
  convertMediaObjectToGraphQL,
  isObjectType,
  getObjectsByType,
  getSetContent,
} from "../airtableData";

export const getSetHandlers = [
  graphql.link(SAAS_API_ENDPOINT).query("GET_SET", ({ variables }) => {
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

  graphql.link(SAAS_API_ENDPOINT).query("GET_SET_THUMBNAIL", ({ variables }) => {
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

  graphql.link(SAAS_API_ENDPOINT).query("GET_SET_FOR_CAROUSEL", ({ variables }) => {
    const setId = variables.uid || variables.externalId;
    
    // First try to find the set directly in the sets array
    let actualSet = getSetById(setId);
    
    // If not found, try the reference resolution (mediaObjects -> sets mapping)
    if (!actualSet) {
      console.log(`GET_SET_FOR_CAROUSEL: Direct set lookup failed, trying reference resolution`);
      actualSet = resolveSetReference(setId);
    }
    
    if (!actualSet) {
      console.log(`GET_SET_FOR_CAROUSEL: Set not found for ID: ${setId}`);
      return HttpResponse.json({
        data: { getObject: null },
      });
    }
    
    console.log(`GET_SET_FOR_CAROUSEL: Found set "${actualSet.fields.title}"`);
    
    return HttpResponse.json({
      data: {
        getObject: convertSetToGraphQL(actualSet),
      },
    });
  }),

  // Handle Set for Rail queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_SET_FOR_RAIL", ({ variables }) => {
    const setId = variables.uid || variables.externalId;
    
    // First try to find the set directly in the sets array
    let actualSet = getSetById(setId);
    
    // If not found, try the reference resolution (mediaObjects -> sets mapping)
    if (!actualSet) {
      console.log(`GET_SET_FOR_RAIL: Direct set lookup failed, trying reference resolution`);
      actualSet = resolveSetReference(setId);
    }
    
    if (!actualSet) {
      console.log(`GET_SET_FOR_RAIL: Set not found for ID: ${setId}`);
      return HttpResponse.json({
        data: { getObject: null },
      });
    }
    
    console.log(`GET_SET_FOR_RAIL: Found set "${actualSet.fields.title}"`);
    
    return HttpResponse.json({
      data: {
        getObject: convertSetToGraphQL(actualSet),
      },
    });
  }),

  graphql.link(SAAS_API_ENDPOINT).query("GET_PAGE_SET", ({ variables }) => {
    const setId = variables.uid || variables.externalId;
    console.log(`GET_PAGE_SET: Looking for page set with ID: ${setId}`);
    
    // First try to find the set directly in the sets array
    let actualSet = getSetById(setId);
    
    // If not found, try the reference resolution (mediaObjects -> sets mapping)
    if (!actualSet) {
      console.log(`GET_PAGE_SET: Direct set lookup failed, trying reference resolution`);
      actualSet = resolveSetReference(setId);
    }
    
    if (!actualSet) {
      console.log(`GET_PAGE_SET: Set not found for ID: ${setId}`);
      return HttpResponse.json({
        data: { getObject: null },
      });
    }
    
    // Check if this is a PAGE type set
    if (actualSet.fields.set_type !== 'PAGE') {
      console.log(`GET_PAGE_SET: Set "${actualSet.fields.title}" is not of type PAGE (actual: ${actualSet.fields.set_type})`);
      return HttpResponse.json({
        data: { getObject: null },
      });
    }
    
    console.log(`GET_PAGE_SET: Found PAGE set "${actualSet.fields.title}"`);
    
    // Use convertSetToGraphQL with depth limiting
    const setGraphQL = convertSetToGraphQL(actualSet);
    
    return HttpResponse.json({
      data: {
        getObject: setGraphQL,
      },
    });
  }),

  graphql.link(SAAS_API_ENDPOINT).query("GET_COLLECTION_SET", ({ variables }) => {
    const setId = variables.uid || variables.externalId;
    console.log(`GET_COLLECTION_SET: Looking for collection set with ID: ${setId}`);
    
    // First try to find the set directly in the sets array
    let actualSet = getSetById(setId);
    
    // If not found, try the reference resolution (mediaObjects -> sets mapping)
    if (!actualSet) {
      console.log(`GET_COLLECTION_SET: Direct set lookup failed, trying reference resolution`);
      actualSet = resolveSetReference(setId);
    }
    
    if (!actualSet) {
      console.log(`GET_COLLECTION_SET: Set not found for ID: ${setId}`);
      return HttpResponse.json({
        data: { getObject: null },
      });
    }
    
    console.log(`GET_COLLECTION_SET: Found set "${actualSet.fields.internal_title || actualSet.fields.title}"`);
    
    return HttpResponse.json({
      data: {
        getObject: convertSetToGraphQL(actualSet),
      },
    });
  }),
];