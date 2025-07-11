import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";

import { UserDetails, SkylarkApiPermission } from "../../types";

const user: UserDetails = {
  __typename: "userDetails",
  account: "skylark",
  permissions: [
    SkylarkApiPermission.AccountSetup,
    SkylarkApiPermission.IgnoreAvailability,
    SkylarkApiPermission.KeyManagement,
    SkylarkApiPermission.Read,
    SkylarkApiPermission.SelfConfig,
    SkylarkApiPermission.TimeTravel,
    SkylarkApiPermission.Write,
  ],
  role: "admin",
};

export const getUserAccountHandlers = [
  // Handle GET_USER query
  graphql.link(SAAS_API_ENDPOINT).query("GET_USER", () =>
    HttpResponse.json({
      data: {
        getUser: user,
      },
    }),
  ),
];
