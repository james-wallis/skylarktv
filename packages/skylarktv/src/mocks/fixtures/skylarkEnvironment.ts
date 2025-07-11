import { graphql } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import { createGraphQLResponse } from "../airtableData";
import { SkylarkTVAdditionalFields } from "../../types";

// Mock Skylark Environment Response
const skylarkEnvironmentData = {
  seasonFields: {
    name: "Season",
    kind: "OBJECT",
    fields: [
      { name: "uid" },
      { name: "title" },
      { name: "season_number" },
      { name: SkylarkTVAdditionalFields.PreferredImageType }, // This enables hasUpdatedSeason: true
      { name: "synopsis" },
      { name: "release_date" },
    ],
  },
  objectTypes: {
    possibleTypes: [
      // leave commented as we don't need streamtvconfig
      // { name: "Season" },
      // { name: "Brand" },
      // { name: "Episode" },
      // { name: "Movie" },
      // { name: "SkylarkSet" },
      // { name: "StreamtvConfig" },
      // { name: "AppConfig" },
    ],
  },
};

export const skylarkEnvironmentHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_SKYLARK_ENVIRONMENT", () =>
      createGraphQLResponse(skylarkEnvironmentData),
    ),
];
