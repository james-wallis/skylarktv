import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../constants/env";
import {
  airtableData,
  convertMediaObjectToGraphQL,
  getMediaObjectBySlug,
  getMediaObjectByUidOrExternalId,
  getObjectsByType,
  searchMediaObjects,
  searchAllObjects,
  getImageUrl,
  isObjectType,
  getSetById,
  convertSetToGraphQL,
  resolveSetReference,
} from "./airtableData";

// Mock SkylarkTV Config
const mockSkylarkTVConfig = {
  getSkylarkSet: {
    content: {
      objects: [
        {
          uid: "config-1",
          __typename: "SkylarkLiveAsset",
          title: "Skylark TV Config",
          hls_url: null,
          url: "https://skylark-references-production.s3.eu-west-1.amazonaws.com/skylarktv/configs/default-config.json",
        },
      ],
    },
  },
};

// Mock Skylark Environment
const mockSkylarkEnvironment = {
  getSkylarkObjectTypeConfiguration: {
    name: "Development Environment",
    colour: "#2563eb",
    player_settings: null,
  },
};

// Create homepage set from Airtable data
const createHomepageSet = () => {
  const movies = getObjectsByType("movies").slice(0, 10);
  const episodes = getObjectsByType("episodes").slice(0, 10);
  const brands = getObjectsByType("brands").slice(0, 5);

  return {
    uid: "set-homepage",
    __typename: "SkylarkSet",
    slug: "homepage",
    title: "Homepage",
    type: "PAGE",
    set_type_slug: "homepage",
    internal_title: "Homepage Set",
    content: {
      objects: [
        {
          uid: "set-featured",
          __typename: "SkylarkSet",
          slug: "featured",
          title: "Featured Content",
          type: "rail",
          set_type_slug: "slider_landscape",
          content: {
            objects: [...movies.slice(0, 5), ...episodes.slice(0, 5)],
          },
        },
        {
          uid: "set-movies",
          __typename: "SkylarkSet",
          slug: "movies",
          title: "Movies",
          type: "rail",
          set_type_slug: "slider_portrait",
          content: {
            objects: movies,
          },
        },
        {
          uid: "set-episodes",
          __typename: "SkylarkSet",
          slug: "latest-episodes",
          title: "Latest Episodes",
          type: "rail",
          set_type_slug: "slider_landscape",
          content: {
            objects: episodes,
          },
        },
        {
          uid: "set-brands",
          __typename: "SkylarkSet",
          slug: "brands",
          title: "Brands",
          type: "rail",
          set_type_slug: "slider_portrait",
          content: {
            objects: brands,
          },
        },
      ],
    },
  };
};

export const handlers = [
  // Handle SkylarkTV Config query
  graphql.link(SAAS_API_ENDPOINT).query("GET_SKYLARK_TV_CONFIG", () =>
    HttpResponse.json({
      data: mockSkylarkTVConfig,
    }),
  ),

  // Handle Skylark Environment query
  graphql.link(SAAS_API_ENDPOINT).query("GET_SKYLARK_ENVIRONMENT", () =>
    HttpResponse.json({
      data: mockSkylarkEnvironment,
    }),
  ),

  // Handle Movie queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_MOVIE", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const movie = airtableObj && isObjectType(airtableObj, 'movie')
      ? convertMediaObjectToGraphQL(airtableObj) 
      : null;

    return HttpResponse.json({
      data: {
        getObject: movie,
      },
    });
  }),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_MOVIE_THUMBNAIL", ({ variables }) => {
      const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
      const movie = airtableObj
        ? convertMediaObjectToGraphQL(airtableObj)
        : null;

      if (movie) {
        // Return only thumbnail fields
        return HttpResponse.json({
          data: {
            getObject: {
              uid: movie.uid,
              __typename: movie.__typename,
              slug: movie.slug,
              title: movie.title,
              title_short: movie.title_short,
              synopsis: movie.synopsis,
              synopsis_short: movie.synopsis_short,
              release_date: movie.release_date,
              images: movie.images,
              tags: movie.tags,
            },
          },
        });
      }

      return HttpResponse.json({
        data: { getObject: null },
      });
    }),

  // Handle Episode queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_EPISODE", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const episode = airtableObj && isObjectType(airtableObj, 'episode')
      ? convertMediaObjectToGraphQL(airtableObj) 
      : null;

    return HttpResponse.json({
      data: {
        getObject: episode,
      },
    });
  }),

  graphql.link(SAAS_API_ENDPOINT).query("GET_EPISODE_THUMBNAIL", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const episode = airtableObj && isObjectType(airtableObj, 'episode')
      ? convertMediaObjectToGraphQL(airtableObj) 
      : null;

    if (episode) {
      // Return only thumbnail fields
      return HttpResponse.json({
        data: {
          getObject: {
            uid: episode.uid,
            __typename: episode.__typename,
            slug: episode.slug,
            title: episode.title,
            title_short: episode.title_short,
            synopsis: episode.synopsis,
            synopsis_short: episode.synopsis_short,
            episode_number: episode.episode_number,
            release_date: episode.release_date,
            images: episode.images,
            tags: episode.tags,
          },
        },
      });
    }

    return HttpResponse.json({
      data: { getObject: null },
    });
  }),

  // Handle Brand queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_BRAND", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const brand = airtableObj && isObjectType(airtableObj, 'brand')
      ? convertMediaObjectToGraphQL(airtableObj) 
      : null;

    if (brand) {
      console.log(`GET_BRAND: Looking for seasons and episodes for brand ${airtableObj.id}`);
      
      // Find seasons that belong to this brand
      // Check multiple possible relationship fields
      const seasons = airtableData.mediaObjects
        .filter(obj => {
          if (!isObjectType(obj, 'season')) return false;
          
          // Check various ways seasons might be linked to brands
          return (
            (obj.fields.brands && obj.fields.brands.includes(airtableObj.id)) ||
            (obj.fields.parent && Array.isArray(obj.fields.parent) && obj.fields.parent.includes(airtableObj.id)) ||
            (obj.fields.parent === airtableObj.id)
          );
        })
        .map(seasonObj => {
          const season = convertMediaObjectToGraphQL(seasonObj);
          
          // Find episodes for each season using the parent field
          const episodes = airtableData.mediaObjects
            .filter(obj => {
              if (!isObjectType(obj, 'episode')) return false;
              
              // Check if the episode's parent field contains this season's ID
              return (
                (obj.fields.parent && Array.isArray(obj.fields.parent) && obj.fields.parent.includes(seasonObj.id)) ||
                (obj.fields.parent === seasonObj.id)
              );
            })
            .map(ep => ({
              uid: ep.id,
              slug: ep.fields.slug,
              episode_number: ep.fields.episode_number,
            }))
            .sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));
          
          console.log(`GET_BRAND: Season "${seasonObj.fields.title}" has ${episodes.length} episodes`);
          
          return {
            ...season,
            episodes: { objects: episodes },
          };
        })
        .sort((a, b) => (b.season_number || 0) - (a.season_number || 0)); // Descending order

      console.log(`GET_BRAND: Brand "${brand.title}" has ${seasons.length} seasons`);

      return HttpResponse.json({
        data: {
          getObject: {
            ...brand,
            seasons: { objects: seasons },
          },
        },
      });
    }

    return HttpResponse.json({
      data: {
        getObject: null,
      },
    });
  }),

  graphql.link(SAAS_API_ENDPOINT).query("GET_BRAND_THUMBNAIL", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const brand = airtableObj && isObjectType(airtableObj, 'brand')
      ? convertMediaObjectToGraphQL(airtableObj) 
      : null;

    if (brand) {
      // Return only thumbnail fields
      return HttpResponse.json({
        data: {
          getObject: {
            uid: brand.uid,
            __typename: brand.__typename,
            slug: brand.slug,
            title: brand.title,
            title_short: brand.title_short,
            synopsis: brand.synopsis,
            synopsis_short: brand.synopsis_short,
            images: brand.images,
            tags: brand.tags,
          },
        },
      });
    }

    return HttpResponse.json({
      data: { getObject: null },
    });
  }),

  // Handle Season queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_SEASON", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const season = airtableObj && isObjectType(airtableObj, 'season')
      ? convertMediaObjectToGraphQL(airtableObj) 
      : null;

    return HttpResponse.json({
      data: {
        getObject: season,
      },
    });
  }),

  // Handle Season and Episodes query
  graphql.link(SAAS_API_ENDPOINT).query("GET_SEASON_AND_EPISODES", ({ variables }) => {
    console.log(`GET_SEASON_AND_EPISODES: Looking for season with uid="${variables.uid}", externalId="${variables.externalId}"`);
    
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const season = airtableObj && isObjectType(airtableObj, 'season')
      ? convertMediaObjectToGraphQL(airtableObj) 
      : null;

    if (!season) {
      console.log(`GET_SEASON_AND_EPISODES: Season not found`);
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    console.log(`GET_SEASON_AND_EPISODES: Found season "${season.title}"`);

    // Find episodes that belong to this season using the parent field
    const episodes = airtableData.mediaObjects
      .filter(obj => {
        if (!isObjectType(obj, 'episode')) return false;
        
        // Check if the episode's parent field contains this season's ID
        return (
          (obj.fields.parent && Array.isArray(obj.fields.parent) && obj.fields.parent.includes(airtableObj.id)) ||
          (obj.fields.parent === airtableObj.id)
        );
      })
      .map(convertMediaObjectToGraphQL)
      .sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0));

    console.log(`GET_SEASON_AND_EPISODES: Found ${episodes.length} episodes for season`);

    // Add episodes to the season object
    const seasonWithEpisodes = {
      ...season,
      episodes: {
        objects: episodes,
      },
    };

    return HttpResponse.json({
      data: {
        getObject: seasonWithEpisodes,
      },
    });
  }),

  graphql.link(SAAS_API_ENDPOINT).query("GET_SEASON_THUMBNAIL", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const season = airtableObj && isObjectType(airtableObj, 'season')
      ? convertMediaObjectToGraphQL(airtableObj) 
      : null;

    if (season) {
      // Return only thumbnail fields
      return HttpResponse.json({
        data: {
          getObject: {
            uid: season.uid,
            __typename: season.__typename,
            slug: season.slug,
            title: season.title,
            title_short: season.title_short,
            synopsis: season.synopsis,
            synopsis_short: season.synopsis_short,
            season_number: season.season_number,
            release_date: season.release_date,
            images: season.images,
          },
        },
      });
    }

    return HttpResponse.json({
      data: { getObject: null },
    });
  }),

  // Handle Set queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_SET", ({ variables }) => {
    if (variables.slug === "homepage" || variables.uid === "set-homepage") {
      return HttpResponse.json({
        data: {
          getObject: createHomepageSet(),
        },
      });
    }

    // Return null for other sets for now
    return HttpResponse.json({
      data: { getObject: null },
    });
  }),

  // Handle Set for Carousel queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_SET_FOR_CAROUSEL", ({ variables }) => {
    console.log(`GET_SET_FOR_CAROUSEL: Looking for set with uid="${variables.uid}", externalId="${variables.externalId}"`);
    
    const setId = variables.uid || variables.externalId;
    
    // First try to find the set directly in the sets array
    let actualSet = getSetById(setId);
    
    // If not found, try the reference resolution (mediaObjects -> sets mapping)
    if (!actualSet) {
      console.log(`GET_SET_FOR_CAROUSEL: Direct set lookup failed, trying reference resolution`);
      actualSet = resolveSetReference(setId);
    }
    
    if (!actualSet) {
      console.log(`GET_SET_FOR_CAROUSEL: Could not find set for ID: ${setId}`);
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    console.log(`GET_SET_FOR_CAROUSEL: Resolved to actual set "${actualSet.fields.internal_title}" (${actualSet.id})`);

    // Convert set to GraphQL format
    const carouselSet = convertSetToGraphQL(actualSet);
    
    // Get content IDs from the actual set
    const contentIds = actualSet.fields.content || [];
    console.log(`GET_SET_FOR_CAROUSEL: Actual set contains ${contentIds.length} content IDs`);
    
    // Always look in mediaObjects first for content
    const setContentObjects = contentIds.map(contentId => {
      const obj = airtableData.mediaObjects?.find(o => o.id === contentId);
      if (!obj) {
        console.warn(`GET_SET_FOR_CAROUSEL: Could not find media object with ID: ${contentId}`);
      }
      return obj;
    }).filter(Boolean);
    
    console.log(`GET_SET_FOR_CAROUSEL: Found ${setContentObjects.length} content objects for carousel set`);
    
    // Convert content objects to the format expected by GET_SET_FOR_CAROUSEL
    const contentItems = setContentObjects.map(contentObj => {
      try {
        if (contentObj.fields.skylark_object_type === "SkylarkSet") {
          // This is a set reference, resolve it to the actual set
          const resolvedSet = resolveSetReference(contentObj.id);
          if (resolvedSet) {
            const childSet = convertSetToGraphQL(resolvedSet);
            return { object: childSet };
          }
          console.warn(`GET_SET_FOR_CAROUSEL: Could not resolve set reference ${contentObj.id}`);
          return null;
        } else if (contentObj.fields.skylark_object_type) {
          // This is a regular media object - convert and add call_to_actions for carousel
          const converted = convertMediaObjectToGraphQL(contentObj);
          if (converted && converted.__typename) {
            // Add call_to_actions field (empty for now, could be populated from callToActions data)
            converted.call_to_actions = { objects: [] };
            return { object: converted };
          }
        }
        return null;
      } catch (error) {
        console.error(`Error processing carousel content object ${contentObj.id}:`, error);
        return null;
      }
    }).filter(Boolean);
    
    carouselSet.content = { objects: contentItems };
    
    console.log(`GET_SET_FOR_CAROUSEL: Returning carousel set with ${contentItems.length} content items`);
    
    return HttpResponse.json({
      data: {
        getObject: carouselSet,
      },
    });
  }),

  // Handle Set for Rail queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_SET_FOR_RAIL", ({ variables }) => {
    console.log(`GET_SET_FOR_RAIL: Looking for set with uid="${variables.uid}", externalId="${variables.externalId}"`);
    
    const setId = variables.uid || variables.externalId;
    
    // First try to find the set directly in the sets array
    let actualSet = getSetById(setId);
    
    // If not found, try the reference resolution (mediaObjects -> sets mapping)
    if (!actualSet) {
      console.log(`GET_SET_FOR_RAIL: Direct set lookup failed, trying reference resolution`);
      actualSet = resolveSetReference(setId);
    }
    
    if (!actualSet) {
      console.log(`GET_SET_FOR_RAIL: Could not find set for ID: ${setId}`);
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    console.log(`GET_SET_FOR_RAIL: Resolved to actual set "${actualSet.fields.internal_title}" (${actualSet.id})`);

    // Convert set to GraphQL format
    const railSet = convertSetToGraphQL(actualSet);
    
    // Get content IDs from the actual set
    const contentIds = actualSet.fields.content || [];
    console.log(`GET_SET_FOR_RAIL: Actual set contains ${contentIds.length} content IDs`);
    
    // Always look in mediaObjects first for content
    const setContentObjects = contentIds.map(contentId => {
      const obj = airtableData.mediaObjects?.find(o => o.id === contentId);
      if (!obj) {
        console.warn(`GET_SET_FOR_RAIL: Could not find media object with ID: ${contentId}`);
      }
      return obj;
    }).filter(Boolean);
    
    console.log(`GET_SET_FOR_RAIL: Found ${setContentObjects.length} content objects for rail set`);
    
    // Convert content objects to the format expected by GET_SET_FOR_RAIL
    const contentItems = setContentObjects.map(contentObj => {
      try {
        if (contentObj.fields.skylark_object_type === "SkylarkSet") {
          // This is a set reference, resolve it to the actual set
          const resolvedSet = resolveSetReference(contentObj.id);
          if (resolvedSet) {
            const childSet = convertSetToGraphQL(resolvedSet);
            return { object: childSet };
          }
          console.warn(`GET_SET_FOR_RAIL: Could not resolve set reference ${contentObj.id}`);
          return null;
        } else if (contentObj.fields.skylark_object_type) {
          // This is a regular media object
          const converted = convertMediaObjectToGraphQL(contentObj);
          if (converted && converted.__typename) {
            return { object: converted };
          }
        }
        return null;
      } catch (error) {
        console.error(`Error processing rail content object ${contentObj.id}:`, error);
        return null;
      }
    }).filter(Boolean);
    
    railSet.content = { objects: contentItems };
    
    console.log(`GET_SET_FOR_RAIL: Returning rail set with ${contentItems.length} content items`);
    
    return HttpResponse.json({
      data: {
        getObject: railSet,
      },
    });
  }),

  // Handle Page Set queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_PAGE_SET", ({ variables }) => {
    const setId = variables.uid || variables.externalId;
    
    console.log(`GET_PAGE_SET: Looking for set with ID "${setId}"`);
    
    // Find the set in Airtable data
    const set = getSetById(setId);
    
    if (!set) {
      console.log(`GET_PAGE_SET: Set not found for ID "${setId}"`);
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    console.log(`GET_PAGE_SET: Found set "${set.fields.internal_title || set.id}" with type "${set.fields.type}"`);
    console.log(`GET_PAGE_SET: Set fields:`, Object.keys(set.fields));
    console.log(`GET_PAGE_SET: set_type field:`, set.fields.set_type);

    // Convert set to GraphQL format
    const pageSet = convertSetToGraphQL(set);
    
    // Process the content items
    const contentItems = [];
    
    // Get content IDs directly from the set's content field
    const contentIds = set.fields.content || [];
    console.log(`GET_PAGE_SET: Set contains ${contentIds.length} content IDs`);
    
    // Always look in mediaObjects first for content
    const setContentObjects = contentIds.map(contentId => {
      const obj = airtableData.mediaObjects?.find(o => o.id === contentId);
      if (!obj) {
        console.warn(`GET_PAGE_SET: Could not find media object with ID: ${contentId}`);
      }
      return obj;
    }).filter(Boolean);
    
    console.log(`GET_PAGE_SET: Found ${setContentObjects.length} content objects for set`);
    
    // Convert content objects to GraphQL format
    for (const contentObj of setContentObjects) {
      try {
        if (contentObj.fields.skylark_object_type === "SkylarkSet") {
          // This is a set reference, resolve it to the actual set
          const resolvedSet = resolveSetReference(contentObj.id);
          if (resolvedSet) {
            const childSet = convertSetToGraphQL(resolvedSet);
            contentItems.push({ object: childSet });
          } else {
            console.warn(`GET_PAGE_SET: Could not resolve set reference ${contentObj.id}`);
          }
        } else if (contentObj.fields.skylark_object_type) {
          // It's a media object (Movie, Episode, Season, etc.)
          const converted = convertMediaObjectToGraphQL(contentObj);
          if (converted && converted.__typename) {
            contentItems.push({ object: converted });
          }
        }
      } catch (error) {
        console.error(`Error processing content object ${contentObj.id}:`, error);
      }
    }
    
    pageSet.content = { objects: contentItems };
    
    console.log(`GET_PAGE_SET: Returning set with ${contentItems.length} content items`);
    console.log(`GET_PAGE_SET: Content item types:`, contentItems.map(item => item.object?.__typename + (item.object?.type ? ` (${item.object.type})` : '')));
    console.log(`GET_PAGE_SET: Content item UIDs:`, contentItems.map(item => `${item.object?.uid} (${item.object?.title})`));
    
    return HttpResponse.json({
      data: {
        getObject: pageSet,
      },
    });
  }),

  // Handle List queries
  graphql.link(SAAS_API_ENDPOINT).query("LIST_MOVIES", ({ variables }) => {
    const movies = getObjectsByType("movies");
    const limit = variables?.limit || 20;
    const offset = variables?.offset || 0;

    console.log(`LIST_MOVIES: Found ${movies.length} movies`);

    return HttpResponse.json({
      data: {
        listObjects: {
          count: movies.length,
          hasNextPage: offset + limit < movies.length,
          objects: movies.slice(offset, offset + limit),
        },
      },
    });
  }),

  graphql.link(SAAS_API_ENDPOINT).query("LIST_EPISODES", ({ variables }) => {
    const episodes = getObjectsByType("episodes");
    const limit = variables?.limit || 20;
    const offset = variables?.offset || 0;

    return HttpResponse.json({
      data: {
        listObjects: {
          count: episodes.length,
          hasNextPage: offset + limit < episodes.length,
          objects: episodes.slice(offset, offset + limit),
        },
      },
    });
  }),

  // Handle Genre list
  graphql.link(SAAS_API_ENDPOINT).query("LIST_GENRES", ({ variables }) => {
    const genres = (airtableData.genres || []).map((genre) => ({
      uid: genre.id,
      name: genre.fields.name,
      slug: genre.fields.slug,
    }));

    return HttpResponse.json({
      data: {
        listObjects: {
          next_token: null,
          objects: genres,
        },
      },
    });
  }),

  // Handle Movies by Genre
  graphql.link(SAAS_API_ENDPOINT).query("LIST_MOVIES_BY_GENRE", ({ variables }) => {
    const genreId = variables.uid || variables.externalId;
    const genre = (airtableData.genres || []).find(g => g.id === genreId);
    
    if (!genre) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Find all movies that have this genre
    const moviesWithGenre = airtableData.mediaObjects
      .filter(obj => 
        isObjectType(obj, 'movie') &&
        obj.fields.genres && 
        obj.fields.genres.includes(genreId)
      )
      .map(convertMediaObjectToGraphQL);

    return HttpResponse.json({
      data: {
        getObject: {
          uid: genre.id,
          name: genre.fields.name,
          movies: {
            next_token: null,
            objects: moviesWithGenre,
          },
        },
      },
    });
  }),

  // Handle Movies by Tag
  graphql.link(SAAS_API_ENDPOINT).query("LIST_MOVIES_BY_TAG", ({ variables }) => {
    const tagId = variables.uid || variables.externalId;
    const tag = (airtableData.tags || []).find(t => t.id === tagId);
    
    if (!tag) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Find all movies that have this tag
    const moviesWithTag = airtableData.mediaObjects
      .filter(obj => 
        isObjectType(obj, 'movie') &&
        obj.fields.tags && 
        obj.fields.tags.includes(tagId)
      )
      .map(convertMediaObjectToGraphQL);

    return HttpResponse.json({
      data: {
        getObject: {
          uid: tag.id,
          name: tag.fields.name,
          movies: {
            next_token: null,
            objects: moviesWithTag,
          },
        },
      },
    });
  }),

  // Handle Article Thumbnail query
  graphql.link(SAAS_API_ENDPOINT).query("GET_ARTICLE_THUMBNAIL", ({ variables }) => {
    const articles = airtableData.articles || [];
    const article = articles.find((a) => 
      a.id === variables.uid || a.id === variables.externalId
    );

    if (!article) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Get article images
    const images = (article.fields.images || [])
      .map((imgId: string) => {
        const img = airtableData.images?.find(i => i.id === imgId);
        if (!img) return null;
        
        const url = getImageUrl(img);
        
        let type = img.fields.type;
        if (Array.isArray(type)) {
          type = type[0];
        }
        
        return {
          uid: img.id,
          title: img.fields.title || img.fields["unique-title"],
          type: type || "IMAGE",
          url: url,
        };
      })
      .filter(Boolean);

    return HttpResponse.json({
      data: {
        getObject: {
          uid: article.id,
          __typename: "Article",
          external_id: article.id,
          slug: article.fields.slug,
          title: article.fields.title,
          type: article.fields.type,
          description: article.fields.description,
          publish_date: article.fields.publish_date,
          images: { objects: images },
        },
      },
    });
  }),

  // Handle Articles list
  graphql.link(SAAS_API_ENDPOINT).query("LIST_ARTICLES", ({ variables }) => {
    const articles = (airtableData.articles || []).map((article) => {
      // Get article images
      const images = (article.fields.images || [])
        .map((imgId: string) => {
          const img = airtableData.images?.find(i => i.id === imgId);
          if (!img) return null;
          
          let url = img.fields.url || img.fields.external_url || img.fields.external_url_old;
          if (!url && img.fields.image && img.fields.image[0]) {
            url = img.fields.image[0].url;
          }
          
          let type = img.fields.type;
          if (Array.isArray(type)) {
            type = type[0];
          }
          
          return {
            uid: img.id,
            title: img.fields.title || img.fields["unique-title"],
            type: type || "IMAGE",
            url: url,
          };
        })
        .filter(Boolean);

      return {
        uid: article.id,
        __typename: "Article",
        external_id: article.id,
        slug: article.fields.slug,
        title: article.fields.title,
        type: article.fields.type,
        description: article.fields.description,
        body: article.fields.body,
        publish_date: article.fields.publish_date,
        images: { objects: images },
      };
    });

    const limit = variables?.limit || 50;
    const offset = 0; // Simplified for now

    return HttpResponse.json({
      data: {
        listObjects: {
          next_token: null,
          objects: articles.slice(offset, offset + limit),
        },
      },
    });
  }),

  // Handle Article query
  graphql.link(SAAS_API_ENDPOINT).query("GET_ARTICLE", ({ variables }) => {
    const articles = airtableData.articles || [];
    const article = articles.find(
      (a) => a.id === variables.uid || a.id === variables.externalId,
    );

    if (!article) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Get article images
    const images = (article.fields.images || [])
      .map((imgId: string) => {
        const img = airtableData.images?.find(i => i.id === imgId);
        if (!img) return null;
        
        const url = getImageUrl(img);
        
        let type = img.fields.type;
        if (Array.isArray(type)) {
          type = type[0];
        }
        
        return {
          uid: img.id,
          title: img.fields.title || img.fields["unique-title"],
          type: type || "IMAGE",
          url: url,
        };
      })
      .filter(Boolean);

    console.log(`GET_ARTICLE: Found article ${article.id} with body length: ${article.fields.body?.length || 0}`);
    
    return HttpResponse.json({
      data: {
        getObject: {
          uid: article.id,
          __typename: "Article",
          external_id: article.id,
          slug: article.fields.slug,
          title: article.fields.title,
          type: article.fields.type,
          description: article.fields.description,
          body: article.fields.body,
          publish_date: article.fields.publish_date,
          images: { objects: images },
          credits: { objects: [] }, // Add credits field as it's in the query
        },
      },
    });
  }),

  // Handle Search query
  graphql.link(SAAS_API_ENDPOINT).query("SEARCH", ({ variables }) => {
    const results = variables.query ? searchAllObjects(variables.query) : [];

    // Add required search context fields
    const searchResults = results.map(obj => ({
      ...obj,
      _context: {
        typename_highlight: obj.__typename,
      },
    }));

    return HttpResponse.json({
      data: {
        search: {
          total_count: searchResults.length,
          objects: searchResults,
        },
      },
    });
  }),

  // Handle GET_USER query
  graphql.link(SAAS_API_ENDPOINT).query("GET_USER", () => {
    return HttpResponse.json({
      data: {
        getUser: {
          account: "mock-user",
          role: "user",
          permissions: ["read"],
        },
      },
    });
  }),

  // Handle Person queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_PERSON", ({ variables }) => {
    const person = airtableData.people?.find(p => 
      p.id === variables.uid || p.id === variables.externalId
    );

    if (!person) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Get person images
    const images = (person.fields.images || [])
      .map((imgId: string) => {
        const img = airtableData.images?.find(i => i.id === imgId);
        if (!img) return null;
        
        const url = getImageUrl(img);
        
        let type = img.fields.type;
        if (Array.isArray(type)) {
          type = type[0];
        }
        
        return {
          uid: img.id,
          title: img.fields.title || img.fields["unique-title"],
          type: type || "IMAGE",
          url: url,
        };
      })
      .filter(Boolean);

    return HttpResponse.json({
      data: {
        getObject: {
          uid: person.id,
          __typename: "Person",
          external_id: person.id,
          slug: person.fields.slug,
          name: person.fields.name,
          abbreviation: person.fields.abbreviation,
          alias: person.fields.alias,
          bio_long: person.fields.bio_long,
          bio_medium: person.fields.bio_medium,
          bio_short: person.fields.bio_short,
          genre: person.fields.genre,
          date_of_birth: person.fields.date_of_birth,
          name_sort: person.fields.name_sort,
          place_of_birth: person.fields.place_of_birth,
          images: { objects: images },
          credits: { objects: [] }, // Would need to implement credit relationships
        },
      },
    });
  }),

  // Handle Person Thumbnail query
  graphql.link(SAAS_API_ENDPOINT).query("GET_PERSON_THUMBNAIL", ({ variables }) => {
    const person = airtableData.people?.find(p => 
      p.id === variables.uid || p.id === variables.externalId
    );

    if (!person) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Get person images
    const images = (person.fields.images || [])
      .map((imgId: string) => {
        const img = airtableData.images?.find(i => i.id === imgId);
        if (!img) return null;
        
        const url = getImageUrl(img);
        
        let type = img.fields.type;
        if (Array.isArray(type)) {
          type = type[0];
        }
        
        return {
          uid: img.id,
          title: img.fields.title || img.fields["unique-title"],
          type: type || "IMAGE",
          url: url,
        };
      })
      .filter(Boolean);

    return HttpResponse.json({
      data: {
        getObject: {
          uid: person.id,
          __typename: "Person",
          name: person.fields.name,
          bio_long: person.fields.bio_long,
          bio_medium: person.fields.bio_medium,
          bio_short: person.fields.bio_short,
          images: { objects: images },
        },
      },
    });
  }),

  // Handle GET_PERSON_FOR_RELATED_CREDITS query
  graphql.link(SAAS_API_ENDPOINT).query("GET_PERSON_FOR_RELATED_CREDITS", ({ variables }) => {
    const person = airtableData.people?.find(p => 
      p.id === variables.uid || p.id === variables.externalId
    );

    if (!person) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    return HttpResponse.json({
      data: {
        getObject: {
          external_id: person.id,
          slug: person.fields.slug,
          name: person.fields.name,
          name_sort: person.fields.name_sort,
          credits: { objects: [] }, // Would need to implement full credit relationships with movies/episodes/articles
        },
      },
    });
  }),

  // Handle LiveStream queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_LIVE_STREAM", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const liveStream = airtableObj && isObjectType(airtableObj, 'LiveStream')
      ? convertMediaObjectToGraphQL(airtableObj) 
      : null;

    if (liveStream) {
      // Add LiveStream-specific fields
      return HttpResponse.json({
        data: {
          getObject: {
            ...liveStream,
            live_assets: { objects: [] }, // Would need live asset data
          },
        },
      });
    }

    return HttpResponse.json({
      data: { getObject: null },
    });
  }),

  // Handle LiveStream Thumbnail query
  graphql.link(SAAS_API_ENDPOINT).query("GET_LIVE_STREAM_THUMBNAIL", ({ variables }) => {
    const airtableObj = getMediaObjectByUidOrExternalId(variables.uid, variables.externalId);
    const liveStream = airtableObj && isObjectType(airtableObj, 'LiveStream')
      ? convertMediaObjectToGraphQL(airtableObj) 
      : null;

    if (liveStream) {
      return HttpResponse.json({
        data: {
          getObject: {
            uid: liveStream.uid,
            __typename: liveStream.__typename,
            slug: liveStream.slug,
            title: liveStream.title,
            title_short: liveStream.title_short,
            synopsis: liveStream.synopsis,
            synopsis_short: liveStream.synopsis_short,
            images: liveStream.images,
            tags: liveStream.tags,
          },
        },
      });
    }

    return HttpResponse.json({
      data: { getObject: null },
    });
  }),

  // Handle User Account query
  graphql.link(SAAS_API_ENDPOINT).query("GET_USER_ACCOUNT", () =>
    HttpResponse.json({
      data: {
        getUserAccount: {
          account_id: "mock-user-id",
          provider: "auth0",
          provider_id: "auth0|123456",
          __typename: "UserAccount",
        },
      },
    }),
  ),

  // Handle Purge Cache mutation
  graphql.link(SAAS_API_ENDPOINT).mutation("PURGE_CACHE", () =>
    HttpResponse.json({
      data: {
        purgeCache: {
          status: "success",
        },
      },
    }),
  ),

  // Handle CallToAction queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_CTA", ({ variables }) => {
    const ctas = airtableData.callToActions || [];
    const cta = ctas.find(c => 
      c.id === variables.uid || 
      c.id === variables.externalId ||
      c.fields.external_id === variables.externalId
    );

    if (!cta) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    return HttpResponse.json({
      data: {
        getObject: {
          uid: cta.id,
          text: cta.fields.text,
          text_short: cta.fields.text_short,
          description: cta.fields.description,
          description_short: cta.fields.description_short,
          url: cta.fields.url,
          url_path: cta.fields.url_path,
        },
      },
    });
  }),

  // Handle Asset queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_ASSET", ({ variables }) => {
    // Assets might be stored in a separate collection or as part of media objects
    // For now, return null as we don't have asset data in the Airtable export
    return HttpResponse.json({
      data: { getObject: null },
    });
  }),

  // Handle Collection Set queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_COLLECTION_SET", ({ variables }) => {
    console.log(`GET_COLLECTION_SET: Looking for set with uid="${variables.uid}", externalId="${variables.externalId}"`);
    
    const setId = variables.uid || variables.externalId;
    
    // First try to find the set directly in the sets array
    let actualSet = getSetById(setId);
    
    // If not found, try the reference resolution (mediaObjects -> sets mapping)
    if (!actualSet) {
      console.log(`GET_COLLECTION_SET: Direct set lookup failed, trying reference resolution`);
      actualSet = resolveSetReference(setId);
    }
    
    if (!actualSet) {
      console.log(`GET_COLLECTION_SET: Could not find set for ID: ${setId}`);
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    console.log(`GET_COLLECTION_SET: Found collection set "${actualSet.fields.internal_title}"`);

    // Convert set to GraphQL format
    const collectionSet = convertSetToGraphQL(actualSet);
    
    // Get content IDs from the actual set but return minimal content for collections
    const contentIds = actualSet.fields.content || [];
    const contentItems = contentIds.map(contentId => {
      const obj = airtableData.mediaObjects?.find(o => o.id === contentId);
      if (obj) {
        return {
          object: {
            __typename: obj.fields.skylark_object_type === "SkylarkSet" ? "SkylarkSet" : 
                      obj.fields.skylark_object_type === "movies" || obj.fields.skylark_object_type === "Movie" ? "Movie" :
                      obj.fields.skylark_object_type === "episodes" || obj.fields.skylark_object_type === "Episode" ? "Episode" :
                      obj.fields.skylark_object_type === "seasons" || obj.fields.skylark_object_type === "Season" ? "Season" :
                      obj.fields.skylark_object_type === "brands" || obj.fields.skylark_object_type === "Brand" ? "Brand" : "Movie",
            uid: obj.id,
          },
        };
      }
      return null;
    }).filter(Boolean);
    
    collectionSet.content = { objects: contentItems };
    
    return HttpResponse.json({
      data: {
        getObject: collectionSet,
      },
    });
  }),

  // Handle Episodes by Genre
  graphql.link(SAAS_API_ENDPOINT).query("LIST_EPISODES_BY_GENRE", ({ variables }) => {
    const genreId = variables.uid || variables.externalId;
    const genre = (airtableData.genres || []).find(g => g.id === genreId);
    
    if (!genre) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Find all episodes that have this genre
    const episodesWithGenre = airtableData.mediaObjects
      .filter(obj => 
        isObjectType(obj, 'episode') &&
        obj.fields.genres && 
        obj.fields.genres.includes(genreId)
      )
      .map(convertMediaObjectToGraphQL);

    return HttpResponse.json({
      data: {
        getObject: {
          uid: genre.id,
          name: genre.fields.name,
          episodes: {
            next_token: null,
            objects: episodesWithGenre,
          },
        },
      },
    });
  }),

  // Handle Episodes by Tag
  graphql.link(SAAS_API_ENDPOINT).query("LIST_EPISODES_BY_TAG", ({ variables }) => {
    const tagId = variables.uid || variables.externalId;
    const tag = (airtableData.tags || []).find(t => t.id === tagId);
    
    if (!tag) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Find all episodes that have this tag
    const episodesWithTag = airtableData.mediaObjects
      .filter(obj => 
        isObjectType(obj, 'episode') &&
        obj.fields.tags && 
        obj.fields.tags.includes(tagId)
      )
      .map(convertMediaObjectToGraphQL);

    return HttpResponse.json({
      data: {
        getObject: {
          uid: tag.id,
          name: tag.fields.name,
          episodes: {
            next_token: null,
            objects: episodesWithTag,
          },
        },
      },
    });
  }),

  // Handle App Config queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_APP_CONFIG", () => {
    return HttpResponse.json({
      data: {
        getSkylarkAppConfig: {
          theme: "dark",
          language: "en",
          region: "global",
          features: {
            search: true,
            recommendations: true,
            watchlist: true,
          },
        },
      },
    });
  }),

  // Handle StreamTV Config queries (legacy fallback)
  graphql.link(SAAS_API_ENDPOINT).query("GET_STREAMTV_CONFIG", () => {
    return HttpResponse.json({
      data: mockSkylarkTVConfig,
    });
  }),

  // Catch-all handler for unhandled queries
  graphql.link(SAAS_API_ENDPOINT).query("*", ({ request, operationName }) => {
    console.warn(`Unhandled GraphQL query: ${operationName}`, { request });
    return HttpResponse.json({
      data: {},
      errors: [
        {
          message: `Query ${operationName} is not implemented in MSW handlers`,
        },
      ],
    });
  }),

  // Catch-all handler for unhandled mutations
  graphql.link(SAAS_API_ENDPOINT).mutation("*", ({ request, operationName }) => {
    console.warn(`Unhandled GraphQL mutation: ${operationName}`, { request });
    return HttpResponse.json({
      data: {},
      errors: [
        {
          message: `Mutation ${operationName} is not implemented in MSW handlers`,
        },
      ],
    });
  }),
];
