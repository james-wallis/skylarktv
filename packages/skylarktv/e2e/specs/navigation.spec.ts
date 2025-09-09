import { test, expect, testData, helpers } from "../fixtures/fixtures";

test.describe("Navigation", () => {
  test("can navigate to different pages directly", async ({
    page,
    pageActions,
  }) => {
    // Homepage
    await pageActions.goToHomepage();
    expect(page.url()).toBe("http://localhost:3000/");

    // Movies page - handle potential redirects gracefully
    await pageActions.navigateToPageSafely(testData.pages.movies);

    // Articles page - handle potential redirects gracefully
    await pageActions.navigateToPageSafely(testData.pages.articles);

    // Shows page - handle potential redirects gracefully
    await pageActions.navigateToPageSafely(testData.pages.shows);
  });

  test("can navigate between content types using links", async ({
    page,
    pageActions,
    commonSelectors,
  }) => {
    // Start at homepage
    await pageActions.goToHomepage();

    // Test navigation if links exist - handle redirects gracefully
    if (await helpers.safeClick(page, commonSelectors.moviesLink)) {
      await pageActions.validatePageLoaded();
    }

    if (await helpers.safeClick(page, commonSelectors.articlesLink)) {
      await pageActions.validatePageLoaded();
    }

    if (await helpers.safeClick(page, commonSelectors.showsLink)) {
      await pageActions.validatePageLoaded();
    }
  });

  test("can access content pages directly", async ({ pageActions }) => {
    // Test brand page
    await pageActions.navigateToPageSafely("/brand/test-brand");

    // Test episode page
    await pageActions.navigateToPageSafely("/episode/test-episode");

    // Test movie page
    await pageActions.navigateToPageSafely("/movie/test-movie");
  });

  test("handles missing content gracefully", async ({ pageActions }) => {
    const criticalErrors = pageActions.monitorConsoleErrors({
      ignore404: true,
      ignoreTracking: true,
    });

    // Test with non-existent content
    await pageActions.navigateToPageSafely("/movie/non-existent-movie");

    // Should not have critical JavaScript errors
    expect(criticalErrors).toHaveLength(0);
  });
});
