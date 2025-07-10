import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import {
  airtableData,
  getImageUrl,
  assertString,
  assertStringArray,
  assertSingleString,
  convertMediaObjectToGraphQL,
} from "../airtableData";

export const getPersonHandlers = [
  // Handle Person queries
  graphql.link(SAAS_API_ENDPOINT).query("GET_PERSON", ({ variables }) => {
    const person = airtableData.people?.find(
      (p) => p.id === variables.uid || p.id === variables.externalId,
    );

    if (!person) {
      return HttpResponse.json({
        data: { getObject: null },
      });
    }

    // Get person images
    const imageIds = assertStringArray(person.fields.images) || [];
    const images = imageIds
      .map((imgId: string) => {
        const img = airtableData.images?.find((i) => i.id === imgId);
        if (!img) return null;

        const url = getImageUrl(img);

        const typeValue = assertSingleString(img.fields.type);

        return {
          __typename: "SkylarkImage",
          uid: img.id,
          title:
            assertString(img.fields.title) ||
            assertString(img.fields["unique-title"]),
          type: typeValue || "IMAGE",
          url,
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
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_PERSON_THUMBNAIL", ({ variables }) => {
      const person = airtableData.people?.find(
        (p) => p.id === variables.uid || p.id === variables.externalId,
      );

      if (!person) {
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      // Get person images
      const imageIds = assertStringArray(person.fields.images) || [];
      const images = imageIds
        .map((imgId: string) => {
          const img = airtableData.images?.find((i) => i.id === imgId);
          if (!img) return null;

          const url = getImageUrl(img);

          const typeValue = assertSingleString(img.fields.type);

          return {
            __typename: "SkylarkImage",
            uid: img.id,
            title:
              assertString(img.fields.title) ||
              assertString(img.fields["unique-title"]),
            type: typeValue || "IMAGE",
            url,
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
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_PERSON_FOR_RELATED_CREDITS", ({ variables }) => {
      const person = airtableData.people?.find(
        (p) => p.id === variables.uid || p.id === variables.externalId,
      );

      if (!person) {
        return HttpResponse.json({
          data: { getObject: null },
        });
      }

      // Find all credits for this person
      const personCredits =
        airtableData.credits?.filter((credit) => {
          const creditPeople = assertStringArray(credit.fields.person) || [];
          return creditPeople.includes(person.id);
        }) || [];

      // Convert credits to GraphQL format
      const creditObjects = personCredits.map((credit) => {
        // Find the role for this credit
        const roleIds = assertStringArray(credit.fields.role) || [];
        const roles = roleIds
          .map((roleId) => {
            const role = airtableData.roles?.find((r) => r.id === roleId);
            return role
              ? {
                  __typename: "Role",
                  uid: role.id,
                  internal_title: role.fields.internal_title,
                  title: role.fields.title,
                  title_sort: role.fields.title_sort,
                }
              : null;
          })
          .filter(Boolean);

        // Find movies and episodes linked to this credit
        const creditMovies =
          airtableData.mediaObjects
            ?.filter((mediaObj) => {
              const creditsIds =
                assertStringArray(mediaObj.fields.credits) || [];
              return (
                creditsIds.includes(credit.id) &&
                mediaObj.fields.skylark_object_type === "Movie"
              );
            })
            .map((movieObj) =>
              convertMediaObjectToGraphQL({
                airtableObj: movieObj,
                currentDepth: 0,
              }),
            )
            .filter(Boolean) || [];

        const creditEpisodes =
          airtableData.mediaObjects
            ?.filter((mediaObj) => {
              const creditsIds =
                assertStringArray(mediaObj.fields.credits) || [];
              return (
                creditsIds.includes(credit.id) &&
                mediaObj.fields.skylark_object_type === "Episode"
              );
            })
            .map((episodeObj) =>
              convertMediaObjectToGraphQL({
                airtableObj: episodeObj,
                currentDepth: 0,
              }),
            )
            .filter(Boolean) || [];

        return {
          __typename: "Credit",
          uid: credit.id,
          character: assertString(credit.fields.character),
          movies: { objects: creditMovies },
          episodes: { objects: creditEpisodes },
          articles: { objects: [] }, // No articles in current data
          roles: { objects: roles },
        };
      });

      return HttpResponse.json({
        data: {
          getObject: {
            external_id: person.id,
            slug: person.fields.slug,
            name: person.fields.name,
            name_sort: person.fields.name_sort,
            credits: { objects: creditObjects },
          },
        },
      });
    }),
];
