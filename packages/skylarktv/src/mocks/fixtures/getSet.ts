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
    
    const contentIds = getSetContent(actualSet);
    console.log(`GET_PAGE_SET: Found PAGE set "${actualSet.fields.title}" with ${contentIds.length} content items`);
    
    // Check if this set has dynamic content
    const isDynamic = !!actualSet.fields.dynamic_content;
    
    // Get the content objects from the set - these should be references to other sets (rails)
    const contentObjects = contentIds
      .map((contentId: string, index: number) => {
        let contentObj = null;
        
        // Check if this content ID refers to a set reference in mediaObjects
        const setReference = airtableData.mediaObjects.find(obj => obj.id === contentId);
        
        if (setReference && setReference.fields.skylark_object_type === "SkylarkSet") {
          // This is a set reference, resolve it to the actual set
          const referencedSet = resolveSetReference(contentId);
          if (referencedSet) {
            contentObj = convertSetToGraphQL(referencedSet);
          }
        } else {
          // Otherwise try to find it directly as a media object
          const mediaObj = airtableData.mediaObjects.find(obj => obj.id === contentId);
          contentObj = mediaObj ? convertMediaObjectToGraphQL(mediaObj) : null;
        }
        
        if (!contentObj) return null;
        
        return {
          __typename: "SetContent",
          dynamic: false,
          object: contentObj,
          position: index + 1,
        };
      })
      .filter(Boolean);
    
    const setGraphQL = convertSetToGraphQL(actualSet);
    setGraphQL.content.objects = contentObjects;
    
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