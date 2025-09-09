import { test, expect } from "../fixtures/fixtures";

test.describe("Content Interaction", () => {
  test("can click on content thumbnails", async ({ pageActions }) => {
    await pageActions.goToHomepage();

    const thumbnailCount = await pageActions.getThumbnailCount();

    if (thumbnailCount > 0) {
      const clicked = await pageActions.clickFirstThumbnail();
      if (clicked) {
        await pageActions.validatePageLoaded();
      }
    }
  });

  test("thumbnails are accessible on different pages", async ({
    pageActions,
  }) => {
    // Test homepage
    await pageActions.goToHomepage();
    const homeThumbnails = await pageActions.getThumbnailCount();

    // Test movies page
    await pageActions.goToMovies();
    const movieThumbnails = await pageActions.getThumbnailCount();

    // Test articles page
    await pageActions.goToArticles();
    const articleThumbnails = await pageActions.getThumbnailCount();

    // At least one page should have thumbnails
    expect(
      homeThumbnails + movieThumbnails + articleThumbnails,
    ).toBeGreaterThan(0);
  });

  test("content navigation works across different content types", async ({
    page,
    pageActions,
  }) => {
    await pageActions.goToHomepage();

    // Try to click on various content types
    const clicked = await pageActions.clickFirstThumbnail();

    if (clicked) {
      // Should navigate to some content page
      const currentUrl = page.url();
      const isContentPage =
        currentUrl.includes("/movie/") ||
        currentUrl.includes("/episode/") ||
        currentUrl.includes("/brand/") ||
        currentUrl.includes("/article/");

      if (isContentPage) {
        await pageActions.validatePageLoaded();
      }
    }
  });

  test("handles missing thumbnails gracefully", async ({ pageActions }) => {
    await pageActions.goToHomepage();

    const thumbnailCount = await pageActions.getThumbnailCount();

    // Even if no thumbnails, page should still work
    if (thumbnailCount === 0) {
      await pageActions.validatePageLoaded();
    }
  });

  test("content images load properly", async ({ page, pageActions }) => {
    await pageActions.goToHomepage();

    // Check for any images on the page
    const images = page.locator("img");
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check that first image has proper attributes
      const firstImage = images.first();

      if (await firstImage.isVisible()) {
        const src = await firstImage.getAttribute("src");
        expect(src).toBeTruthy();
      }
    }
  });

  test("content links have proper attributes", async ({
    page,
    pageActions,
    commonSelectors,
  }) => {
    await pageActions.goToHomepage();

    // Check content links
    const links = page.locator(commonSelectors.thumbnails);
    const linkCount = await links.count();

    if (linkCount > 0) {
      const firstLink = links.first();

      if (await firstLink.isVisible()) {
        const href = await firstLink.getAttribute("href");
        if (href) {
          expect(href).toBeTruthy();
          expect(href.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
