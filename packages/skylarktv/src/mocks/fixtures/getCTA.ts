import { graphql, HttpResponse } from "msw";
import { SAAS_API_ENDPOINT } from "../../constants/env";
import { airtableData } from "../airtableData";

export const getCTAHandlers = [
  graphql
    .link(SAAS_API_ENDPOINT)
    .query<
      object,
      { uid: string; externalId: string }
    >("GET_CTA", ({ variables }) => {
      const ctaId = variables.uid || variables.externalId;
      const cta = airtableData.callToActions?.find(
        (c) => c.id === ctaId || c.fields.external_id === ctaId,
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
            __typename: "CallToAction",
            external_id: cta.fields.external_id || cta.id,
            title: cta.fields.title,
            url: cta.fields.url,
            text: cta.fields.text,
          },
        },
      });
    }),
];
