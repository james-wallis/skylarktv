import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import { airtableData } from "../airtableData";

export const listGenresHandlers = [
  // Handle Genre list
  graphql.link(SAAS_API_ENDPOINT).query("LIST_GENRES", () => {
    const genres = (airtableData.genres || []).map((genre) => ({
      __typename: "Genre",
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
];
