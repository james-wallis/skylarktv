import airtableDataRaw from "./skylark_airtable_data.json";

// Configuration for depth limiting
export const DEPTH_LIMIT_CONFIG = {
  MAX_DEPTH: 2, // Temporarily set to 2 for testing depth limiting
  MIN_DEPTH: 1,
};

// Reusable function to process nested relationships with depth limiting
export const processNestedRelationships = <T>(
  relationshipIds: string | string[] | null | undefined,
  processor: (id: string) => T | null,
  currentDepth: number,
  relationshipDepthCost: number = 1,
): T[] | null => {
  // If we're at or beyond the depth limit, return null
  if (currentDepth + relationshipDepthCost >= DEPTH_LIMIT_CONFIG.MAX_DEPTH) {
    return null;
  }

  if (!relationshipIds) {
    return [];
  }

  const idsArray = Array.isArray(relationshipIds)
    ? relationshipIds
    : [relationshipIds];

  return idsArray.map(processor).filter((item): item is T => item !== null);
};

// Reusable function to wrap objects in GraphQL objects structure or return null
export const wrapObjectsOrNull = <T>(
  items: T[] | null,
): { objects: T[] } | null => (items !== null ? { objects: items } : null);

// Type the Airtable data
interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: Record<string, any>;
  _table: { name: string };
}

interface AirtableData {
  dimensions: {
    customerTypes: AirtableRecord[];
    deviceTypes: AirtableRecord[];
    regions: AirtableRecord[];
  };
  languages: AirtableRecord[];
  translations: Record<string, AirtableRecord[]>;
  mediaObjects: AirtableRecord[];
  roles: AirtableRecord[];
  people: AirtableRecord[];
  credits: AirtableRecord[];
  genres: AirtableRecord[];
  themes: AirtableRecord[];
  ratings: AirtableRecord[];
  tags: AirtableRecord[];
  images: AirtableRecord[];
  availability: AirtableRecord[];
  audienceSegments?: AirtableRecord[];
  sets?: AirtableRecord[];
  setsMetadata: AirtableRecord[];
  assetTypes: AirtableRecord[];
  imageTypes: AirtableRecord[];
  tagTypes: AirtableRecord[];
  callToActions: AirtableRecord[];
  articles?: AirtableRecord[];
}

export const airtableData: AirtableData =
  airtableDataRaw.airtable_data as AirtableData;

// Debug logging to verify data is loaded correctly
console.log("AIRTABLE DATA LOADED:", {
  people: airtableData.people?.length || 0,
  roles: airtableData.roles?.length || 0,
  credits: airtableData.credits?.length || 0,
  mediaObjects: airtableData.mediaObjects?.length || 0,
});

// Helper function to get image URL from image object
export const getImageUrl = (img: AirtableRecord): string | null => {
  let url =
    img.fields.cloudinary_url ||
    img.fields.url ||
    img.fields.external_url ||
    img.fields.external_url_old;

  // If no direct URL, try to get from image attachments
  if (!url && img.fields.image && img.fields.image[0]) {
    url = img.fields.image[0].url;
  }

  return url || null;
};

// Helper function to check if an object matches a given type (handles both lowercase and capitalized variants)
export const isObjectType = (obj: AirtableRecord, type: string): boolean => {
  const objectType = obj.fields.skylark_object_type;
  if (!objectType) return false;

  // Handle plural/singular and case variations
  const typeVariants = [
    type,
    type.toLowerCase(),
    type.charAt(0).toUpperCase() + type.slice(1),
    // Handle specific plural/singular conversions
    type === "movie" || type === "movies" ? ["movie", "movies", "Movie"] : [],
    type === "episode" || type === "episodes"
      ? ["episode", "episodes", "Episode"]
      : [],
    type === "season" || type === "seasons"
      ? ["season", "seasons", "Season"]
      : [],
    type === "brand" || type === "brands" ? ["brand", "brands", "Brand"] : [],
    type === "live-stream" || type === "LiveStream"
      ? ["live-stream", "live-streams", "LiveStream"]
      : [],
  ].flat();

  return typeVariants.includes(objectType);
};

// Helper functions to convert Airtable data to GraphQL format
export const getMediaObjectBySlug = (slug: string) =>
  airtableData.mediaObjects.find((obj) => obj.fields.slug === slug);

export const getMediaObjectByUidOrExternalId = (
  uid?: string,
  externalId?: string,
) => {
  if (uid) {
    return airtableData.mediaObjects.find(
      (obj) => obj.id === uid || obj.fields["Airtable ID"] === uid,
    );
  }
  if (externalId) {
    return airtableData.mediaObjects.find(
      (obj) =>
        obj.id === externalId || obj.fields["Airtable ID"] === externalId,
    );
  }
  return null;
};

export const getImageById = (id: string) =>
  airtableData.images?.find((img) => img.id === id);

export const getGenreById = (id: string) =>
  airtableData.genres?.find((genre) => genre.id === id);

export const getThemeById = (id: string) =>
  airtableData.themes?.find((theme) => theme.id === id);

export const getRatingById = (id: string) =>
  airtableData.ratings?.find((rating) => rating.id === id);

export const getTagById = (id: string) =>
  airtableData.tags?.find((tag) => tag.id === id);

export const getPersonById = (id: string) =>
  airtableData.people?.find((person) => person.id === id);

export const getCreditById = (id: string) =>
  airtableData.credits?.find((credit) => credit.id === id);

export const getRoleById = (id: string) =>
  airtableData.roles?.find((role) => role.id === id);

// Convert Airtable media object to GraphQL format
export const convertMediaObjectToGraphQL = (
  airtableObj: AirtableRecord,
  currentDepth: number = 0,
) => {
  if (!airtableObj || !airtableObj.fields) {
    console.error(
      "convertMediaObjectToGraphQL: Invalid airtableObj",
      airtableObj,
    );
    return null;
  }

  // Check if we've reached maximum depth
  if (currentDepth >= DEPTH_LIMIT_CONFIG.MAX_DEPTH) {
    console.log(
      `convertMediaObjectToGraphQL: Reached max depth ${DEPTH_LIMIT_CONFIG.MAX_DEPTH}, returning null for ${airtableObj.fields.title || airtableObj.id}`,
    );
    return null;
  }

  console.log(
    `convertMediaObjectToGraphQL: Processing ${airtableObj.fields.title || airtableObj.id} at depth ${currentDepth}`,
  );

  const { fields } = airtableObj;
  const objectType = fields.skylark_object_type;

  // Determine __typename based on skylark_object_type
  let __typename = "Movie"; // default
  if (objectType === "episodes" || objectType === "Episode")
    __typename = "Episode";
  else if (objectType === "seasons" || objectType === "Season")
    __typename = "Season";
  else if (objectType === "brands" || objectType === "Brand")
    __typename = "Brand";
  else if (objectType === "movies" || objectType === "Movie")
    __typename = "Movie";
  else if (objectType === "live-streams" || objectType === "LiveStream")
    __typename = "LiveStream";

  // Get related objects
  const images = fields.images
    ? (Array.isArray(fields.images) ? fields.images : [fields.images])
        .map((imgId: string) => {
          const img = getImageById(imgId);
          if (!img) return null;

          const url = getImageUrl(img);

          // Handle type field which might be an array
          let { type } = img.fields;
          if (Array.isArray(type)) {
            type = type[0];
          }

          return {
            __typename: "SkylarkImage",
            uid: img.id,
            title: img.fields.title || img.fields["unique-title"],
            type: type || "IMAGE",
            url,
          };
        })
        .filter(Boolean)
    : [];

  const genres = processNestedRelationships(
    fields.genres,
    (genreId: string) => {
      const genre = getGenreById(genreId);
      return genre
        ? {
            __typename: "Genre",
            uid: genre.id,
            name: genre.fields.name,
          }
        : null;
    },
    currentDepth,
    1,
  );

  const themes = processNestedRelationships(
    fields.themes,
    (themeId: string) => {
      const theme = getThemeById(themeId);
      return theme
        ? {
            __typename: "Theme",
            uid: theme.id,
            name: theme.fields.name,
          }
        : null;
    },
    currentDepth,
    1,
  );

  const tags = processNestedRelationships(
    fields.tags,
    (tagId: string) => {
      const tag = getTagById(tagId);
      return tag
        ? {
            __typename: "SkylarkTag",
            uid: tag.id,
            name: tag.fields.name,
            type: tag.fields.type,
          }
        : null;
    },
    currentDepth,
    1,
  );

  const ratings = processNestedRelationships(
    fields.ratings,
    (ratingId: string) => {
      const rating = getRatingById(ratingId);
      return rating
        ? {
            uid: rating.id,
            value: rating.fields.value,
          }
        : null;
    },
    currentDepth,
    1,
  );

  const creditsRaw = processNestedRelationships(
    fields.credits,
    (creditId: string) => {
      const credit = getCreditById(creditId);
      if (!credit) return null;

      // Handle single person (not array) - depth cost of 2 (Credit -> Person)
      const people = processNestedRelationships(
        credit.fields.person,
        (personId: string) => {
          const person = getPersonById(personId);
          return person
            ? {
                __typename: "Person",
                uid: person.id,
                name: person.fields.name,
              }
            : null;
        },
        currentDepth,
        2,
      );

      // Handle single role (not array) - depth cost of 2 (Credit -> Role)
      const roles = processNestedRelationships(
        credit.fields.role,
        (roleId: string) => {
          const role = getRoleById(roleId);
          return role
            ? {
                __typename: "Role",
                uid: role.id,
                title: role.fields.title,
                title_sort: role.fields.title_sort,
                internal_title: role.fields.internal_title,
              }
            : null;
        },
        currentDepth,
        2,
      );

      return {
        __typename: "Credit",
        uid: credit.id,
        character: credit.fields.character,
        people: wrapObjectsOrNull(people),
        roles: wrapObjectsOrNull(roles),
      };
    },
    currentDepth,
    1,
  );

  // Remove entire credits if they contain duplicate people (keep duplicate roles)
  const seenPeople = new Set();
  const credits =
    creditsRaw !== null
      ? creditsRaw.filter((credit) => {
          // Skip duplicate checking if people is null (depth limit reached)
          if (credit.people === null) {
            return true; // Keep this credit
          }

          // Check if any person in this credit has already been seen
          const hasDuplicatePerson = credit.people.objects.some((person) =>
            seenPeople.has(person.uid),
          );

          if (hasDuplicatePerson) {
            return false; // Remove entire credit if it contains a duplicate person
          }

          // Add all people from this credit to the seen set
          credit.people.objects.forEach((person) => {
            seenPeople.add(person.uid);
          });

          return true; // Keep this credit
        })
      : null;

  // Base object structure
  const baseObject = {
    uid: airtableObj.id,
    external_id: fields.external_id || airtableObj.id,
    __typename,
    slug: fields.slug,
    title: fields.title,
    title_short: fields.title_short,
    synopsis: fields.synopsis,
    synopsis_short: fields.synopsis_short,
    release_date: fields.release_date,
    images: { objects: images },
    genres: wrapObjectsOrNull(genres),
    themes: wrapObjectsOrNull(themes),
    tags: wrapObjectsOrNull(tags),
    ratings: wrapObjectsOrNull(ratings),
    credits: wrapObjectsOrNull(credits),
    availability: { objects: [] },
  };

  // Add type-specific fields
  if (__typename === "Episode") {
    return {
      ...baseObject,
      episode_number: fields.episode_number,
    };
  }
  if (__typename === "Season") {
    return {
      ...baseObject,
      season_number: fields.season_number,
    };
  }

  // Add assets for movies/episodes
  if (__typename === "Movie" || __typename === "Episode") {
    return {
      ...baseObject,
      assets: { objects: [] }, // Would need asset data
      brands: { objects: [] }, // Would need to link parent brands
    };
  }

  return baseObject;
};

// Get all objects of a specific type
export const getObjectsByType = (type: string) => {
  console.log(`getObjectsByType: Looking for type "${type}"`);

  const filtered = airtableData.mediaObjects.filter((obj) =>
    isObjectType(obj, type),
  );
  console.log(
    `getObjectsByType: Found ${filtered.length} objects of type "${type}"`,
  );

  return filtered.map(convertMediaObjectToGraphQL).filter(Boolean);
};

// Helper function to highlight search terms in text
const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!text || !searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, '<span class="search-highlight">$1</span>');
};

// Search across all objects (media objects, articles, people)
export const searchAllObjects = (query: string) => {
  const searchTerm = query.toLowerCase();
  const results = [];

  // Search media objects (Movies, Episodes, Seasons, Brands, LiveStreams, etc.)
  const mediaResults = airtableData.mediaObjects
    .filter((obj) => {
      const { fields } = obj;
      return (
        fields.title?.toLowerCase().includes(searchTerm) ||
        fields.title_short?.toLowerCase().includes(searchTerm) ||
        fields.synopsis?.toLowerCase().includes(searchTerm) ||
        fields.synopsis_short?.toLowerCase().includes(searchTerm)
      );
    })
    .map((obj) => {
      const converted = convertMediaObjectToGraphQL(obj);
      // Apply highlighting to matching fields
      return {
        ...converted,
        title: highlightSearchTerm(converted.title, query),
        title_short: highlightSearchTerm(converted.title_short, query),
        synopsis: highlightSearchTerm(converted.synopsis, query),
        synopsis_short: highlightSearchTerm(converted.synopsis_short, query),
      };
    });

  results.push(...mediaResults);

  // Search articles
  const articleResults = (airtableData.articles || [])
    .filter((article) => {
      const { fields } = article;
      return (
        fields.title?.toLowerCase().includes(searchTerm) ||
        fields.description?.toLowerCase().includes(searchTerm) ||
        fields.body?.toLowerCase().includes(searchTerm)
      );
    })
    .map((article) => {
      // Get article images
      const images = (article.fields.images || [])
        .map((imgId: string) => {
          const img = airtableData.images?.find((i) => i.id === imgId);
          if (!img) return null;

          const url = getImageUrl(img);

          let { type } = img.fields;
          if (Array.isArray(type)) {
            type = type[0];
          }

          return {
            __typename: "SkylarkImage",
            uid: img.id,
            title: img.fields.title || img.fields["unique-title"],
            type: type || "IMAGE",
            url,
          };
        })
        .filter(Boolean);

      return {
        uid: article.id,
        __typename: "Article",
        external_id: article.id,
        title: highlightSearchTerm(article.fields.title, query),
        description: highlightSearchTerm(article.fields.description, query),
        body: highlightSearchTerm(article.fields.body, query),
        type: article.fields.type,
        publish_date: article.fields.publish_date,
        images: { objects: images },
      };
    });

  results.push(...articleResults);

  // Search people
  const peopleResults = (airtableData.people || [])
    .filter((person) => {
      const { fields } = person;
      return (
        fields.name?.toLowerCase().includes(searchTerm) ||
        fields.bio_long?.toLowerCase().includes(searchTerm) ||
        fields.bio_medium?.toLowerCase().includes(searchTerm) ||
        fields.bio_short?.toLowerCase().includes(searchTerm)
      );
    })
    .map((person) => {
      // Get person images
      const images = (person.fields.images || [])
        .map((imgId: string) => {
          const img = airtableData.images?.find((i) => i.id === imgId);
          if (!img) return null;

          const url = getImageUrl(img);

          let { type } = img.fields;
          if (Array.isArray(type)) {
            type = type[0];
          }

          return {
            __typename: "SkylarkImage",
            uid: img.id,
            title: img.fields.title || img.fields["unique-title"],
            type: type || "IMAGE",
            url,
          };
        })
        .filter(Boolean);

      return {
        uid: person.id,
        __typename: "Person",
        external_id: person.id,
        name: highlightSearchTerm(person.fields.name, query),
        bio_long: highlightSearchTerm(person.fields.bio_long, query),
        bio_medium: highlightSearchTerm(person.fields.bio_medium, query),
        bio_short: highlightSearchTerm(person.fields.bio_short, query),
        images: { objects: images },
      };
    });

  results.push(...peopleResults);

  return results;
};

// Legacy function for backward compatibility
export const searchMediaObjects = (query: string) =>
  searchAllObjects(query).filter((obj) =>
    [
      "Movie",
      "Episode",
      "Season",
      "Brand",
      "LiveStream",
      "SkylarkSet",
    ].includes(obj.__typename),
  );

// Get set by ID or external ID
export const getSetById = (id: string) => {
  const sets = airtableData.sets || [];

  // Debug logging
  if (id.startsWith("rec")) {
    console.log(`getSetById: Looking for ID "${id}"`);
    console.log(`getSetById: Total sets available: ${sets.length}`);
    console.log(
      `getSetById: Available sets:`,
      sets.map((s) => ({
        id: s.id,
        external_id: s.fields.external_id,
        internal_title: s.fields.internal_title,
      })),
    );
  }

  // First try to find in the dedicated sets array
  let foundSet = sets.find(
    (s) => s.id === id || s.fields.external_id === id || s.fields.slug === id,
  );

  // If not found, check in mediaObjects for SkylarkSet type
  if (!foundSet) {
    foundSet = airtableData.mediaObjects?.find(
      (obj) =>
        obj.fields.skylark_object_type === "SkylarkSet" &&
        (obj.id === id ||
          obj.fields.external_id === id ||
          obj.fields.slug === id),
    );

    if (foundSet) {
      console.log(
        `getSetById: Found SkylarkSet in mediaObjects: ${foundSet.fields.internal_title}`,
      );
    }
  }

  return foundSet;
};

// Helper function to get content from a set, checking content, sets, and dynamic_content fields
export const getSetContent = (set: AirtableRecord): string[] => {
  // First try the content field
  if (set.fields.content && Array.isArray(set.fields.content)) {
    return set.fields.content;
  }

  // If no content, try the sets field (which may reference other sets)
  if (set.fields.sets && Array.isArray(set.fields.sets)) {
    console.log(
      `getSetContent: Set "${set.fields.internal_title}" has no content, but references sets:`,
      set.fields.sets,
    );

    // For sets that reference other sets, we need to get the content from the referenced sets
    const allContent: string[] = [];
    for (const setId of set.fields.sets) {
      const referencedSet = getSetById(setId);
      if (referencedSet) {
        const referencedContent = getSetContent(referencedSet);
        allContent.push(...referencedContent);
      }
    }
    return allContent;
  }

  // If no content or sets, try dynamic_content
  if (set.fields.dynamic_content || set.fields["Dynamic Content"]) {
    console.log(
      `getSetContent: Set "${set.fields.internal_title}" has dynamic content, generating content dynamically`,
    );
    return generateDynamicContent(set);
  }

  return [];
};

// Helper function to generate dynamic content based on rules
const generateDynamicContent = (set: AirtableRecord): string[] => {
  try {
    // Parse the dynamic content JSON (try both field names)
    const dynamicContentStr =
      set.fields.dynamic_content || set.fields["Dynamic Content"];
    const dynamicContent = JSON.parse(dynamicContentStr);

    const { dynamic_content_types, dynamic_content_rules } = dynamicContent;
    console.log(
      `generateDynamicContent: Looking for ${dynamic_content_types.join(", ")} with rules:`,
      dynamic_content_rules,
    );

    const matchingObjects = new Set<string>();

    // For each rule set, find objects that match all conditions
    for (const ruleSet of dynamic_content_rules) {
      const currentMatches = findObjectsMatchingRules(
        ruleSet,
        dynamic_content_types,
      );
      currentMatches.forEach((id) => matchingObjects.add(id));
    }

    const result = Array.from(matchingObjects);
    console.log(
      `generateDynamicContent: Found ${result.length} matching objects for set "${set.fields.internal_title}"`,
    );
    return result;
  } catch (error) {
    console.error(
      `generateDynamicContent: Error parsing dynamic content for set "${set.fields.internal_title}":`,
      error,
    );
    return [];
  }
};

// Helper function to find objects matching a set of rules
const findObjectsMatchingRules = (
  rules: any[],
  contentTypes: string[],
): string[] => {
  // Start with all objects of the desired types
  let candidates = airtableData.mediaObjects.filter((obj) =>
    contentTypes.some((type) => isObjectType(obj, type)),
  );

  // Apply each rule in sequence
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const { object_types, uid, relationship_name } = rule;

    if (!relationship_name) {
      // This is the base object type filter (already applied above)
      continue;
    }

    // Filter candidates based on relationship
    candidates = candidates.filter((candidate) => {
      // Handle the chained relationship: Movie -> Credits -> Person
      if (relationship_name === "credits" && object_types.includes("Credit")) {
        // This is the first part of the chain - check if movie has credits
        const creditsIds = candidate.fields.credits;

        if (!creditsIds) {
          return false;
        }

        // If no specific UID required, just check that credits exist
        if (!uid || uid.length === 0) {
          return true;
        }

        // If specific UIDs required, check if any credits match
        const creditIdsArray = Array.isArray(creditsIds)
          ? creditsIds
          : [creditsIds];
        const hasMatch = uid.some((targetId) =>
          creditIdsArray.includes(targetId),
        );
        return hasMatch;
      }

      if (relationship_name === "people" && object_types.includes("Person")) {
        // This is the second part of the chain - check if credits have the specified person
        const creditsIds = candidate.fields.credits;

        if (!creditsIds) {
          return false;
        }

        const creditIdsArray = Array.isArray(creditsIds)
          ? creditsIds
          : [creditsIds];

        const hasPersonInCredits = creditIdsArray.some((creditId) => {
          const credit = airtableData.credits?.find((c) => c.id === creditId);
          if (!credit) {
            return false;
          }

          const creditPeople = credit.fields.person;
          const creditPeopleArray = Array.isArray(creditPeople)
            ? creditPeople
            : [creditPeople];

          const personMatch = uid.some((targetPersonId) =>
            creditPeopleArray.includes(targetPersonId),
          );

          return personMatch;
        });

        return hasPersonInCredits;
      }

      // Direct relationship check for other types
      const relationshipIds = candidate.fields[relationship_name];

      if (!relationshipIds) {
        return false;
      }

      const idsArray = Array.isArray(relationshipIds)
        ? relationshipIds
        : [relationshipIds];

      // If rule specifies specific UIDs, check if any of them are in the relationship
      if (uid && Array.isArray(uid)) {
        const hasMatch = uid.some((targetId) => idsArray.includes(targetId));
        return hasMatch;
      }

      // If no specific UID, just check that the relationship exists and has the right type
      return idsArray.some((relId) => {
        const relatedObj =
          airtableData.mediaObjects.find((obj) => obj.id === relId) ||
          airtableData.people?.find((obj) => obj.id === relId) ||
          airtableData.credits?.find((obj) => obj.id === relId);

        if (!relatedObj) return false;

        return object_types.some(
          (type) =>
            isObjectType(relatedObj, type) ||
            relatedObj.fields?.skylark_object_type === type ||
            (type === "Person" &&
              airtableData.people?.find((p) => p.id === relId)) ||
            (type === "Credit" &&
              airtableData.credits?.find((c) => c.id === relId)),
        );
      });
    });
  }

  const result = candidates.map((obj) => obj.id);
  return result;
};

// Helper function to resolve a set reference to the actual set
export const resolveSetReference = (setReferenceId: string) => {
  console.log(
    `resolveSetReference: Looking for set reference ${setReferenceId}`,
  );

  // First, find the media object that represents this set reference
  const setReference = airtableData.mediaObjects?.find(
    (obj) => obj.id === setReferenceId,
  );

  if (!setReference) {
    console.log(
      `resolveSetReference: No media object found with ID ${setReferenceId}`,
    );
    return null;
  }

  if (setReference.fields.skylark_object_type !== "SkylarkSet") {
    console.log(
      `resolveSetReference: Media object ${setReferenceId} is not a SkylarkSet, it's ${setReference.fields.skylark_object_type}`,
    );
    return null;
  }

  console.log(
    `resolveSetReference: Found SkylarkSet reference "${setReference.fields.internal_title || setReference.fields.title}"`,
  );
  console.log(
    `resolveSetReference: Available fields:`,
    Object.keys(setReference.fields),
  );

  // Use the skylarkset_external_id field to find the matching set
  const skylarksetExternalId = setReference.fields.skylarkset_external_id;
  if (!skylarksetExternalId) {
    console.warn(
      `resolveSetReference: No skylarkset_external_id found for set reference ${setReferenceId}`,
    );
    return null;
  }

  console.log(
    `resolveSetReference: Looking for set with external_id "${skylarksetExternalId}"`,
  );

  // Find the actual set by matching skylarkset_external_id to external_id
  const actualSet = airtableData.sets?.find(
    (set) => set.fields.external_id === skylarksetExternalId,
  );

  if (!actualSet) {
    console.warn(
      `resolveSetReference: No set found with external_id "${skylarksetExternalId}" for reference ${setReferenceId}`,
    );
    return null;
  }

  console.log(
    `resolveSetReference: Successfully resolved to set "${actualSet.fields.internal_title}"`,
  );
  return actualSet;
};

// Helper function to get set metadata for a given set ID
const getSetMetadata = (setId: string) => {
  // First find the English language record
  const englishLanguage = airtableData.languages?.find(
    (lang) => lang.fields.code === "en-GB",
  );

  if (!englishLanguage) {
    console.warn(
      `getSetMetadata: No English language record found with code 'en-GB'`,
    );
    return null;
  }

  // Find metadata for this set with English language
  const metadata = airtableData.setsMetadata?.find((meta) => {
    // Handle set field as either string or array
    const setIds = Array.isArray(meta.fields.set)
      ? meta.fields.set
      : [meta.fields.set];
    const hasMatchingSet = setIds.includes(setId);

    // Handle language field as either string or array
    const languageIds = Array.isArray(meta.fields.language)
      ? meta.fields.language
      : [meta.fields.language];
    const hasEnglishLanguage = languageIds.includes(englishLanguage.id);

    return hasMatchingSet && hasEnglishLanguage;
  });

  if (metadata) {
    console.log(
      `getSetMetadata: Found English metadata for set ${setId}:`,
      metadata.fields.title,
    );
  } else {
    console.log(`getSetMetadata: No English metadata found for set ${setId}`);
  }

  return metadata;
};

// Convert Airtable set to GraphQL format with content
export const convertSetToGraphQL = (
  airtableSet: AirtableRecord,
  currentDepth: number = 0,
): any => {
  console.log(
    `convertSetToGraphQL: Processing ${airtableSet.fields.title || airtableSet.fields.internal_title || airtableSet.id} at depth ${currentDepth}`,
  );

  const { fields } = airtableSet;

  // Get metadata for this set (English language)
  const metadata = getSetMetadata(airtableSet.id);

  // Use metadata fields if available, fallback to base set fields
  const finalFields = metadata ? { ...fields, ...metadata.fields } : fields;

  // Use the set_type field from Airtable data, fallback to type field, then default
  let setType = finalFields.set_type || finalFields.type || "RAIL";

  // Convert to uppercase if needed (Airtable might have lowercase values)
  setType = setType.toUpperCase();

  // Get content for this set
  const contentIds = getSetContent(airtableSet);
  const isDynamic = !!airtableSet.fields.dynamic_content;

  // Build content objects with SetContent wrapper - only if within depth limit
  const contentObjects =
    currentDepth + 1 < DEPTH_LIMIT_CONFIG.MAX_DEPTH
      ? contentIds
          .map((contentId: string, index: number) => {
            let contentObj = null;

            // Check if this content ID refers to a set reference in mediaObjects
            const setReference = airtableData.mediaObjects.find(
              (obj) => obj.id === contentId,
            );

            if (
              setReference &&
              setReference.fields.skylark_object_type === "SkylarkSet"
            ) {
              // This is a set reference, resolve it to the actual set
              const referencedSet = resolveSetReference(contentId);
              if (referencedSet) {
                contentObj = convertSetToGraphQL(
                  referencedSet,
                  currentDepth + 1,
                );
              }
            } else {
              // Otherwise try to find it directly as a media object
              const mediaObj = airtableData.mediaObjects.find(
                (obj) => obj.id === contentId,
              );
              contentObj = mediaObj
                ? convertMediaObjectToGraphQL(mediaObj, currentDepth + 1)
                : null;
            }

            if (!contentObj) return null;

            return {
              __typename: "SetContent",
              dynamic: isDynamic,
              object: contentObj,
              position: index + 1,
            };
          })
          .filter(Boolean)
      : null;

  // Process images for sets (same logic as media objects)
  const images = finalFields.images
    ? (Array.isArray(finalFields.images)
        ? finalFields.images
        : [finalFields.images]
      )
        .map((imgId: string) => {
          const img = getImageById(imgId);
          if (!img) return null;

          const url = getImageUrl(img);

          // Handle type field which might be an array
          let { type } = img.fields;
          if (Array.isArray(type)) {
            type = type[0];
          }

          return {
            __typename: "SkylarkImage",
            uid: img.id,
            title: img.fields.title || img.fields["unique-title"],
            type: type || "IMAGE",
            url,
          };
        })
        .filter(Boolean)
    : [];

  return {
    __typename: "SkylarkSet",
    uid: airtableSet.id,
    external_id: finalFields.external_id || airtableSet.id,
    title: finalFields.title || finalFields.internal_title || finalFields.name,
    title_short: finalFields.title_short,
    type: setType,
    slug: finalFields.slug,
    set_type_slug: finalFields.set_type_slug,
    internal_title: finalFields.internal_title,
    images: { objects: images },
    content: wrapObjectsOrNull(contentObjects),
  };
};
