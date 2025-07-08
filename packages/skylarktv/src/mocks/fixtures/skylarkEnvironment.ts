import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";

// Mock Skylark Environment
const mockSkylarkEnvironment = {
  getSkylarkObjectTypeConfiguration: {
    name: "Development Environment",
    colour: "#2563eb",
    player_settings: null,
  },
};

export const skylarkEnvironmentHandlers = [
  graphql.link(SAAS_API_ENDPOINT).query("GET_SKYLARK_ENVIRONMENT", () =>
    HttpResponse.json({
      data: mockSkylarkEnvironment,
    })
  ),
];