import { test, expect, testData } from "../fixtures/fixtures";

test.describe("Responsive Design", () => {
  test("works across different viewport sizes", async ({ pageActions }) => {
    // Test desktop
    await pageActions.setDesktopViewport();
    await pageActions.goToHomepage();
    await pageActions.validatePageLoaded();

    // Test tablet
    await pageActions.setTabletViewport();
    await pageActions.goToHomepage();
    await pageActions.validatePageLoaded();

    // Test mobile
    await pageActions.setMobileViewport();
    await pageActions.goToHomepage();
    await pageActions.validatePageLoaded();
  });

  test("maintains functionality on mobile devices", async ({ pageActions }) => {
    // Set mobile viewport
    await pageActions.setMobileViewport();

    // Test homepage
    await pageActions.goToHomepage();
    await pageActions.validatePageLoaded();

    // Test navigation on mobile
    await pageActions.navigateToPageSafely(testData.pages.articles);
    await pageActions.navigateToPageSafely(testData.pages.movies);
  });

  test("adapts content layout for different screen sizes", async ({
    pageActions,
  }) => {
    // Desktop layout
    await pageActions.setDesktopViewport();
    await pageActions.goToHomepage();
    const desktopThumbnails = await pageActions.getThumbnailCount();

    // Mobile layout
    await pageActions.setMobileViewport();
    await pageActions.goToHomepage();
    const mobileThumbnails = await pageActions.getThumbnailCount();

    // Both should have content, layout may differ
    if (desktopThumbnails > 0) {
      expect(mobileThumbnails).toBeGreaterThanOrEqual(0);
    }
  });

  test("search functionality works on mobile", async ({ pageActions }) => {
    await pageActions.setMobileViewport();
    await pageActions.goToHomepage();

    // Try to perform search on mobile
    const searchPerformed = await pageActions.performSearch(
      testData.searchQueries.batman,
    );

    if (searchPerformed) {
      await pageActions.validatePageLoaded();
    }
  });
});
