import { airtableData, getSetById } from "./data";
import { convertSetToGraphQL } from "./sets";
import { getObjectsByType } from "./mediaObjects";
import { AvailabilityDimensions } from "./availability";
import { findChildObjects, isMediaObjectAvailable } from "./mediaObjectUtils";
import { parseArticle, parseEpisode } from "./parseMediaObjects";

// Wes Anderson collection contains movies with time-limited availability
const WES_ANDERSON_SET_ID = "recee5pYWoOelq5PB";
const FUTURE_MOVIE_ID = "recW6yqLu6RI3KDWw"; // active-next-sunday
const EXPIRED_MOVIE_ID = "recZMJczC9ECyekAT"; // active-in-the-past
const EXPIRES_SOON_MOVIE_ID = "recctDEqWOXlAJ0nY"; // active-until-next-sunday
const ALL_AVAILABILITIES_MOVIE_ID = "recudCnvsnLP4PEeJ";

// House of the Dragon
const HOTD_SEASON_2_ID = "recMv18rCOfpht8yA";
const HOTD_S2E1_ID = "recgGV0rP0yxow7GV"; // always available
const HOTD_S2E2_ID = "recHotDS2E2Cruel0"; // active-next-sunday
const HOTD_RECAP_ARTICLE_ID = "recqHgNdM9TIlSevG"; // active-until-next-sunday
const HOTD_REVIEWS_ARTICLE_ID = "recmNbib5jHVgn6Hu"; // active-next-sunday

const requestedDimensions: AvailabilityDimensions = {
  customerTypes: ["premium"],
  deviceTypes: ["pc"],
  regions: ["europe"],
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const getForward7Days = () => new Date(Date.now() + SEVEN_DAYS_MS);

const getSetContentUids = (timeTravelDate: Date | null) => {
  const set = getSetById(WES_ANDERSON_SET_ID);
  if (!set) throw new Error("Wes Anderson set missing from mock data");

  const result = convertSetToGraphQL({
    airtableSet: set,
    languageCode: "en-gb",
    requestedDimensions,
    timeTravelDate,
  }) as { content: { objects: { object: { uid: string } }[] } } | null;

  return result?.content.objects.map(({ object }) => object.uid) || [];
};

describe("MSW mocks - time travel", () => {
  it("has the expected fixture data", () => {
    expect(getSetById(WES_ANDERSON_SET_ID)).toBeTruthy();
    expect(
      airtableData.mediaObjects.find(({ id }) => id === FUTURE_MOVIE_ID),
    ).toBeTruthy();
  });

  describe("sets", () => {
    it("shows currently available content when not time travelling", () => {
      const uids = getSetContentUids(null);

      expect(uids).toContain(EXPIRES_SOON_MOVIE_ID);
      expect(uids).toContain(ALL_AVAILABILITIES_MOVIE_ID);
      expect(uids).not.toContain(FUTURE_MOVIE_ID);
      expect(uids).not.toContain(EXPIRED_MOVIE_ID);
    });

    it("shows future content and hides expiring content when travelling forward 7 days", () => {
      const uids = getSetContentUids(getForward7Days());

      expect(uids).toContain(FUTURE_MOVIE_ID);
      expect(uids).toContain(ALL_AVAILABILITIES_MOVIE_ID);
      expect(uids).not.toContain(EXPIRES_SOON_MOVIE_ID);
      expect(uids).not.toContain(EXPIRED_MOVIE_ID);
    });

    it("returns to the current content when travelling back to now", () => {
      const initial = getSetContentUids(null);
      const forward = getSetContentUids(getForward7Days());
      const back = getSetContentUids(null);

      expect(forward).not.toEqual(initial);
      expect(back).toEqual(initial);
    });

    // "Next Sunday" is a dynamic date, so check the edge cases around Sunday
    describe.each([
      ["Sunday morning", new Date(2026, 10, 15, 10, 0)],
      ["Sunday night (after 9 PM)", new Date(2026, 10, 15, 22, 0)],
      ["Saturday night", new Date(2026, 10, 14, 23, 0)],
      ["Monday morning", new Date(2026, 10, 16, 9, 0)],
    ])("on %s", (_, systemTime) => {
      beforeEach(() => {
        jest.useFakeTimers().setSystemTime(systemTime);
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it("swaps future and expiring content when travelling forward 7 days", () => {
        const nowUids = getSetContentUids(null);
        const forwardUids = getSetContentUids(getForward7Days());

        expect(nowUids).toContain(EXPIRES_SOON_MOVIE_ID);
        expect(nowUids).not.toContain(FUTURE_MOVIE_ID);
        expect(forwardUids).toContain(FUTURE_MOVIE_ID);
        expect(forwardUids).not.toContain(EXPIRES_SOON_MOVIE_ID);
      });
    });
  });

  describe("listing objects by type", () => {
    it("filters movies by time travel date", () => {
      const nowUids = getObjectsByType({
        type: "movie",
        depth: 0,
        requestedDimensions,
      }).map(({ uid }) => uid);
      const forwardUids = getObjectsByType({
        type: "movie",
        depth: 0,
        requestedDimensions,
        timeTravelDate: getForward7Days(),
      }).map(({ uid }) => uid);

      expect(nowUids).toContain(EXPIRES_SOON_MOVIE_ID);
      expect(nowUids).not.toContain(FUTURE_MOVIE_ID);
      expect(forwardUids).toContain(FUTURE_MOVIE_ID);
      expect(forwardUids).not.toContain(EXPIRES_SOON_MOVIE_ID);
    });
  });

  describe("House of the Dragon Season 2", () => {
    const getAvailableEpisodeIds = (timeTravelDate: Date | null) =>
      findChildObjects(HOTD_SEASON_2_ID, "episode")
        .filter((ep) =>
          isMediaObjectAvailable(ep, { requestedDimensions, timeTravelDate }),
        )
        .map(({ id }) => id);

    it("only has episode 1 available now", () => {
      expect(getAvailableEpisodeIds(null)).toEqual([HOTD_S2E1_ID]);
    });

    it("has episodes 1 and 2 available when travelling forward 7 days", () => {
      expect(getAvailableEpisodeIds(getForward7Days()).sort()).toEqual(
        [HOTD_S2E1_ID, HOTD_S2E2_ID].sort(),
      );
    });

    it("parses episode 2 only when it is available", () => {
      const airtableObj = airtableData.mediaObjects.find(
        ({ id }) => id === HOTD_S2E2_ID,
      );
      if (!airtableObj) throw new Error("S2E2 missing from mock data");

      expect(parseEpisode({ airtableObj, requestedDimensions })).toBeNull();
      expect(
        parseEpisode({
          airtableObj,
          requestedDimensions,
          timeTravelDate: getForward7Days(),
        }),
      ).toMatchObject({
        title: "Rhaenyra the Cruel",
        episode_number: 2,
      });
    });
  });

  describe("House of the Dragon Episode 2 articles", () => {
    const parse = (articleId: string, timeTravelDate: Date | null) => {
      const airtableObj = airtableData.articles.find(
        ({ id }) => id === articleId,
      );
      if (!airtableObj) throw new Error(`${articleId} missing from mock data`);
      return parseArticle({ airtableObj, requestedDimensions, timeTravelDate });
    };

    it("shows the recap now, published now", () => {
      const recap = parse(HOTD_RECAP_ARTICLE_ID, null);
      const publishDate = new Date(recap?.publish_date as string);

      expect(parse(HOTD_REVIEWS_ARTICLE_ID, null)).toBeNull();
      expect(publishDate.getTime()).toBeLessThanOrEqual(Date.now());
      expect(Date.now() - publishDate.getTime()).toBeLessThan(60 * 60 * 1000);
    });

    it("shows the reviews in the future, published when they become available", () => {
      const forward = getForward7Days();
      const reviews = parse(HOTD_REVIEWS_ARTICLE_ID, forward);
      const publishDate = new Date(reviews?.publish_date as string);

      expect(parse(HOTD_RECAP_ARTICLE_ID, forward)).toBeNull();
      expect(publishDate.getTime()).toBeGreaterThan(Date.now());
      expect(publishDate.getTime()).toBeLessThanOrEqual(forward.getTime());
      expect(publishDate.getDay()).toBe(0); // Sunday
      expect(publishDate.getHours()).toBe(21);
    });
  });
});
