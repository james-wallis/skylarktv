import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";

export const getUserAccountHandlers = [
  // Handle GET_USER query
  graphql.link(SAAS_API_ENDPOINT).query("GET_USER", () =>
    HttpResponse.json({
      data: {
        getUser: {
          __typename: "User",
          account: "mock-user",
          role: "user",
          permissions: ["read"],
        },
      },
    }),
  ),

  graphql.link(SAAS_API_ENDPOINT).query("GET_USER_ACCOUNT", () =>
    HttpResponse.json({
      data: {
        getAccount: {
          __typename: "Account",
          uid: "mock-account",
          name: "Mock Account",
          status: "ACTIVE",
          users: {
            objects: [
              {
                __typename: "User",
                uid: "mock-user",
                first_name: "Mock",
                last_name: "User",
                email: "mock@example.com",
              },
            ],
          },
        },
      },
    }),
  ),
];
