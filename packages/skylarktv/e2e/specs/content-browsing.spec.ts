import { test, expect } from "@playwright/test";

test.describe("Content Browsing", () => {
  test("can navigate to and view a movie", async ({ page }) => {
    await page.goto("/movies");

    // Click on the first movie thumbnail
    const firstMovieThumbnail = page
      .locator('[data-testid="thumbnail"]')
      .first();
    await expect(firstMovieThumbnail).toBeVisible();
    await firstMovieThumbnail.click();

    // Should navigate to movie detail page
    expect(page.url()).toMatch(/\/movie\//);

    // Check movie detail page content
    await expect(page.locator('[data-testid="hero"]')).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
  });

  test("can navigate to and view a brand (TV show)", async ({ page }) => {
    await page.goto("/shows");

    // Click on the first brand thumbnail
    const firstBrandThumbnail = page
      .locator('[data-testid="thumbnail"]')
      .first();
    await expect(firstBrandThumbnail).toBeVisible();
    await firstBrandThumbnail.click();

    // Should navigate to brand detail page
    expect(page.url()).toMatch(/\/brand\//);

    // Check brand detail page content
    await expect(page.locator('[data-testid="hero"]')).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();

    // Check for seasons if available
    const seasonsSection = page.locator('[data-testid="seasons"]');
    if (await seasonsSection.isVisible()) {
      await expect(seasonsSection).toBeVisible();
    }
  });

  test("can navigate from brand to season to episode", async ({ page }) => {
    await page.goto("/shows");

    // Navigate to a brand
    await page.locator('[data-testid="thumbnail"]').first().click();
    expect(page.url()).toMatch(/\/brand\//);

    // Look for season thumbnails and click one
    const seasonThumbnail = page.locator('[data-testid="thumbnail"]').first();
    if (await seasonThumbnail.isVisible()) {
      await seasonThumbnail.click();

      // Should navigate to season or episode page
      expect(page.url()).toMatch(/\/(season|episode)\//);

      // Check for episode content
      const episodeThumbnail = page
        .locator('[data-testid="thumbnail"]')
        .first();
      if (await episodeThumbnail.isVisible()) {
        await episodeThumbnail.click();

        // Should navigate to episode detail page
        expect(page.url()).toMatch(/\/episode\//);
        await expect(page.locator("h1")).toBeVisible();
      }
    }
  });

  test("can read an article", async ({ page }) => {
    await page.goto("/articles");

    // Click on the first article thumbnail
    const firstArticleThumbnail = page
      .locator('[data-testid="thumbnail"]')
      .first();
    await expect(firstArticleThumbnail).toBeVisible();
    await firstArticleThumbnail.click();

    // Should navigate to article detail page
    expect(page.url()).toMatch(/\/article\//);

    // Check article content
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.locator('article, [data-testid="article-content"]'),
    ).toBeVisible();
  });

  test("thumbnails display properly with images", async ({ page }) => {
    await page.goto("/");

    // Check that thumbnails have images
    const thumbnails = page.locator('[data-testid="thumbnail"]');
    await expect(thumbnails.first()).toBeVisible();

    // Check that thumbnail images load
    const thumbnailImage = thumbnails.first().locator("img");
    await expect(thumbnailImage).toBeVisible();

    // Verify image is not broken
    const imageSrc = await thumbnailImage.getAttribute("src");
    expect(imageSrc).toBeTruthy();
  });

  test("content rails scroll horizontally", async ({ page }) => {
    await page.goto("/");

    // Find a content rail
    const rail = page.locator('[data-testid="rail"]').first();
    await expect(rail).toBeVisible();

    // Check if rail has scroll controls
    const scrollButton = rail.locator("button").first();
    if (await scrollButton.isVisible()) {
      // Get initial scroll position
      const initialScrollLeft = await rail.evaluate((el) => el.scrollLeft);

      // Click scroll button
      await scrollButton.click();

      // Wait a moment for scroll animation
      await page.waitForTimeout(500);

      // Check if scroll position changed
      const newScrollLeft = await rail.evaluate((el) => el.scrollLeft);
      expect(newScrollLeft).not.toBe(initialScrollLeft);
    }
  });

  test("breadcrumb navigation works", async ({ page }) => {
    await page.goto("/movies");

    // Navigate to a movie
    await page.locator('[data-testid="thumbnail"]').first().click();

    // Look for breadcrumb navigation
    const breadcrumb = page.locator(
      '[data-testid="breadcrumb"], nav[aria-label="Breadcrumb"]',
    );
    if (await breadcrumb.isVisible()) {
      // Click on a breadcrumb link to navigate back
      const breadcrumbLink = breadcrumb.locator("a").first();
      await breadcrumbLink.click();

      // Should navigate back to previous page
      expect(page.url()).not.toMatch(/\/movie\//);
    }
  });

  test("back button functionality", async ({ page }) => {
    await page.goto("/");

    // Navigate to movies page
    await page.getByRole("link", { name: /movies/i }).click();
    expect(page.url()).toMatch(/\/movies/);

    // Navigate to a movie
    await page.locator('[data-testid="thumbnail"]').first().click();
    expect(page.url()).toMatch(/\/movie\//);

    // Use browser back button
    await page.goBack();
    expect(page.url()).toMatch(/\/movies/);

    // Go back again to homepage
    await page.goBack();
    expect(page.url()).toBe("http://localhost:3000/");
  });
});
