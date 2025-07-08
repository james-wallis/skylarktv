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
    
    console.log(`GET_SET_FOR_CAROUSEL: Found set "${actualSet.fields.title}" with ${actualSet.fields.content?.length || 0} content items`);
    
    // Get the content objects from the set
    const contentObjects = (actualSet.fields.content || [])
      .map((contentId: string) => {
        // Find the content in mediaObjects
        const mediaObj = airtableData.mediaObjects.find(obj => obj.id === contentId);
        return mediaObj ? convertMediaObjectToGraphQL(mediaObj) : null;
      })
      .filter(Boolean);
    
    return HttpResponse.json({
      data: {
        getObject: {
          uid: actualSet.id,
          external_id: actualSet.fields.external_id || actualSet.id,
          title: actualSet.fields.title,
          content: {
            objects: contentObjects,
          },
        },
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
    
    console.log(`GET_SET_FOR_RAIL: Found set "${actualSet.fields.title}" with ${actualSet.fields.content?.length || 0} content items`);
    
    // Get the content objects from the set
    const contentObjects = (actualSet.fields.content || [])
      .map((contentId: string) => {
        // Find the content in mediaObjects
        const mediaObj = airtableData.mediaObjects.find(obj => obj.id === contentId);
        return mediaObj ? convertMediaObjectToGraphQL(mediaObj) : null;
      })
      .filter(Boolean);
    
    return HttpResponse.json({
      data: {
        getObject: {
          uid: actualSet.id,
          external_id: actualSet.fields.external_id || actualSet.id,
          title: actualSet.fields.title,
          content: {
            objects: contentObjects,
          },
        },
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
    
    console.log(`GET_PAGE_SET: Found PAGE set "${actualSet.fields.title}" with ${actualSet.fields.content?.length || 0} content items`);
    
    // Get the content objects from the set - these should be references to other sets (rails)
    const contentObjects = (actualSet.fields.content || [])
      .map((contentId: string) => {
        // Check if this content ID refers to a set reference in mediaObjects
        const setReference = airtableData.mediaObjects.find(obj => obj.id === contentId);
        
        if (setReference && setReference.fields.skylark_object_type === "SkylarkSet") {
          // This is a set reference, resolve it to the actual set
          const referencedSet = resolveSetReference(contentId);
          if (referencedSet) {
            return {
              uid: referencedSet.id,
              external_id: referencedSet.fields.external_id || referencedSet.id,
              title: referencedSet.fields.title,
              set_type: referencedSet.fields.set_type,
            };
          }
        }
        
        // Otherwise try to find it directly as a media object
        const mediaObj = airtableData.mediaObjects.find(obj => obj.id === contentId);
        return mediaObj ? convertMediaObjectToGraphQL(mediaObj) : null;
      })
      .filter(Boolean);
    
    return HttpResponse.json({
      data: {
        getObject: {
          uid: actualSet.id,
          external_id: actualSet.fields.external_id || actualSet.id,
          title: actualSet.fields.title,
          set_type: actualSet.fields.set_type,
          content: {
            objects: contentObjects,
          },
        },
      },
    });
  }),

  graphql.link(SAAS_API_ENDPOINT).query("GET_COLLECTION_SET", ({ variables }) => {
    const setId = variables.uid || variables.externalId;
    
    // First try to find the set directly in the sets array
    let actualSet = getSetById(setId);
    
    // If not found, try the reference resolution (mediaObjects -> sets mapping)
    if (!actualSet) {
      actualSet = resolveSetReference(setId);
    }
    
    if (!actualSet) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }
    
    // Get the content objects from the set
    const contentObjects = (actualSet.fields.content || [])
      .map((contentId: string) => {
        // Find the content in mediaObjects
        const mediaObj = airtableData.mediaObjects.find(obj => obj.id === contentId);
        return mediaObj ? convertMediaObjectToGraphQL(mediaObj) : null;
      })
      .filter(Boolean);
    
    return HttpResponse.json({
      data: {
        getObject: {
          uid: actualSet.id,
          external_id: actualSet.fields.external_id || actualSet.id,
          title: actualSet.fields.title,
          content: {
            objects: contentObjects,
          },
        },
      },
    });
  }),
];