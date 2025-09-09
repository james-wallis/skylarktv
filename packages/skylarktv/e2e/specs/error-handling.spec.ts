import { test, expect, testData } from "../fixtures/fixtures";

test.describe("Error Handling", () => {
  test("pages load without critical JavaScript errors", async ({
    pageActions,
  }) => {
    const criticalErrors = pageActions.monitorConsoleErrors({
      ignoreFavicon: true,
      ignore404: true,
      ignoreTracking: true,
    });

    await pageActions.goToHomepage();

    // Should not have critical JavaScript errors
    expect(criticalErrors).toHaveLength(0);
  });

  test("handles non-existent content gracefully", async ({ pageActions }) => {
    const criticalErrors = pageActions.monitorConsoleErrors({
      ignore404: true,
      ignoreTracking: true,
    });

    // Test various non-existent content types
    await pageActions.navigateToPageSafely("/movie/non-existent-movie");
    await pageActions.navigateToPageSafely("/episode/non-existent-episode");
    await pageActions.navigateToPageSafely("/brand/non-existent-brand");
    await pageActions.navigateToPageSafely("/article/non-existent-article");

    // Should not have critical JavaScript errors
    expect(criticalErrors).toHaveLength(0);
  });

  test("handles network errors gracefully", async ({ pageActions }) => {
    // Test with potentially slow or failing requests
    await pageActions.goToHomepage();

    // Try to navigate to different pages to test error handling
    await pageActions.navigateToPageSafely(testData.pages.movies);
    await pageActions.navigateToPageSafely(testData.pages.articles);
    await pageActions.navigateToPageSafely(testData.pages.shows);

    // All pages should load without crashing
    await pageActions.validatePageLoaded();
  });

  test("handles malformed URLs gracefully", async ({ pageActions }) => {
    const criticalErrors = pageActions.monitorConsoleErrors({
      ignore404: true,
      ignoreTracking: true,
    });

    // Test with malformed URLs
    await pageActions.navigateToPageSafely("/movie/");
    await pageActions.navigateToPageSafely("/episode/");
    await pageActions.navigateToPageSafely("/invalid-page");

    // Should not have critical JavaScript errors
    expect(criticalErrors).toHaveLength(0);
  });

  test("handles missing assets gracefully", async ({ pageActions }) => {
    const assetErrors = pageActions.monitorConsoleErrors({
      ignoreFavicon: true,
      ignoreTracking: true,
    });

    await pageActions.goToHomepage();

    // Filter out expected asset errors (favicon, etc.)
    const criticalAssetErrors = assetErrors.filter(
      (error) =>
        !error.includes("favicon") &&
        !error.includes("404") &&
        !error.includes("Failed to load resource"),
    );

    expect(criticalAssetErrors).toHaveLength(0);
  });

  test("search with invalid input handles errors", async ({ pageActions }) => {
    const criticalErrors = pageActions.monitorConsoleErrors({
      ignore404: true,
      ignoreTracking: true,
    });

    await pageActions.goToHomepage();

    // Test search with potentially problematic input
    const problemQueries = [
      '<script>alert("test")</script>',
      '"; DROP TABLE users; --',
      "very long query that might cause issues ".repeat(100),
    ];

    for (const query of problemQueries) {
      const searchPerformed = await pageActions.performSearch(query);

      if (searchPerformed) {
        await pageActions.validatePageLoaded();
      }
    }

    // Should not have critical JavaScript errors
    expect(criticalErrors).toHaveLength(0);
  });
});
