// eslint-disable-next-line import/no-extraneous-dependencies
import { Record as AirtableRecord, FieldSet } from "airtable";
import { airtableData } from "./data";
import {
  assertString,
  assertStringArray,
  assertSingleString,
  isObjectType,
} from "./utils";

const findObjectsMatchingRules = (
  rules: {
    object_types: string[];
    uid: string | string[] | null;
    relationship_name: string | null;
  }[],
  contentTypes: string[],
): string[] => {
  // Start with all objects of the desired types
  let candidates = airtableData.mediaObjects.filter((obj) =>
    contentTypes.some((type) => isObjectType(obj, type)),
  );

  // Apply each rule in sequence
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < rules.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rule = rules[i];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/naming-convention
    const { object_types, uid: unparsedUid, relationship_name } = rule;
    const uid = assertSingleString(unparsedUid || []);

    if (!relationship_name) {
      // This is the base object type filter (already applied above)
      // eslint-disable-next-line no-continue
      continue;
    }

    // Filter candidates based on relationship
    candidates = candidates.filter((candidate) => {
      // Handle the chained relationship: Movie -> Credits -> Person
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      if (relationship_name === "credits" && object_types.includes("Credit")) {
        // This is the first part of the chain - check if movie has credits
        const creditsIds = candidate.fields.credits;

        if (!creditsIds) {
          return false;
        }

        // If no specific UID required, just check that credits exist
        if (!uid) {
          return true;
        }

        // If specific UIDs required, check if any credits match
        const creditIdsArray = Array.isArray(creditsIds)
          ? creditsIds
          : [creditsIds];
        const hasMatch = creditIdsArray.includes(uid);
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

          // If no specific UID required, just check that credits exist
          if (!uid) {
            return true;
          }

          const creditPeople = credit.fields.person;
          const creditPeopleArray = assertStringArray(creditPeople) || [];

          const personMatch = creditPeopleArray.includes(uid);

          return personMatch;
        });

        return hasPersonInCredits;
      }

      // Direct relationship check for other types
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
          (type: string) =>
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

// Helper function to generate dynamic content based on rules
export const generateDynamicContent = (
  set: AirtableRecord<FieldSet>,
): string[] => {
  try {
    // Parse the dynamic content JSON (try both field names)
    const dynamicContentStr =
      assertString(set.fields.dynamic_content) ||
      assertString(set.fields["Dynamic Content"]);
    if (!dynamicContentStr) {
      return [];
    }
    const dynamicContent = JSON.parse(dynamicContentStr) as {
      dynamic_content_types: string[];
      dynamic_content_rules: [];
    };

    if (!dynamicContent) {
      return [];
    }

    const dynamicContentTypes = Array.isArray(
      dynamicContent.dynamic_content_types,
    )
      ? dynamicContent.dynamic_content_types
      : null;
    const dynamicContentRules = Array.isArray(
      dynamicContent.dynamic_content_rules,
    )
      ? dynamicContent.dynamic_content_rules
      : null;

    if (!dynamicContentRules || !dynamicContentTypes) {
      return [];
    }

    const matchingObjects = new Set<string>();

    // For each rule set, find objects that match all conditions
    dynamicContentRules.forEach((ruleSet) => {
      const currentMatches = findObjectsMatchingRules(
        ruleSet,
        dynamicContentTypes,
      );
      currentMatches.forEach((id) => matchingObjects.add(id));
    });

    const result = Array.from(matchingObjects);
    return result;
  } catch (error) {
    return [];
  }
};
