import { test, testData } from "../fixtures/fixtures";

test.describe("Search Functionality", () => {
  test("search input works when available", async ({ pageActions }) => {
    await pageActions.goToHomepage();

    // Try to perform search using fixture
    const searchPerformed = await pageActions.performSearch(
      testData.searchQueries.batman,
    );

    if (searchPerformed) {
      // Should not cause errors
      await pageActions.validatePageLoaded();
    }
  });

  test("search with different queries", async ({ pageActions }) => {
    await pageActions.goToHomepage();

    // Test multiple search queries
    const queries = [
      testData.searchQueries.batman,
      testData.searchQueries.streaming,
      testData.searchQueries.episode,
    ];

    for (const query of queries) {
      const searchPerformed = await pageActions.performSearch(query);

      if (searchPerformed) {
        await pageActions.validatePageLoaded();
        // Go back to homepage for next search
        await pageActions.goToHomepage();
      }
    }
  });

  test("search results are accessible", async ({ pageActions }) => {
    await pageActions.goToHomepage();

    const searchPerformed = await pageActions.performSearch(
      testData.searchQueries.streaming,
    );

    if (searchPerformed) {
      // Check if we can interact with search results
      const thumbnailCount = await pageActions.getThumbnailCount();

      if (thumbnailCount > 0) {
        const clicked = await pageActions.clickFirstThumbnail();
        if (clicked) {
          await pageActions.validatePageLoaded();
        }
      }
    }
  });

  test("search handles empty results gracefully", async ({ pageActions }) => {
    await pageActions.goToHomepage();

    // Search for something that likely won't exist
    const searchPerformed = await pageActions.performSearch(
      "nonexistentcontentquery123",
    );

    if (searchPerformed) {
      // Should still load without errors
      await pageActions.validatePageLoaded();
    }
  });
});
