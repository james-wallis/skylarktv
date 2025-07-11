import { graphql } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import { createSetHandler } from "../airtableData";

export const getSetHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_SET", createSetHandler({ useReference: false })),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_SET_THUMBNAIL", createSetHandler({ useReference: false })),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_SET_FOR_CAROUSEL", createSetHandler()),

  graphql.link(SAAS_API_ENDPOINT).query("GET_SET_FOR_RAIL", createSetHandler()),

  graphql.link(SAAS_API_ENDPOINT).query("GET_PAGE_SET", createSetHandler()),

  graphql
    .link(SAAS_API_ENDPOINT)
    .query("GET_COLLECTION_SET", createSetHandler()),
];
