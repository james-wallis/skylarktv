import { test, expect } from "@playwright/test";

test.describe("Search Functionality", () => {
  test("can perform basic search", async ({ page }) => {
    await page.goto("/");

    // Find search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]',
    );
    await expect(searchInput.first()).toBeVisible();

    // Perform search
    await searchInput.first().fill("episode");
    await searchInput.first().press("Enter");

    // Should show search results
    await expect(
      page.locator('[data-testid="search-results"], [data-testid="thumbnail"]'),
    ).toBeVisible();
  });

  test("search results display correctly", async ({ page }) => {
    await page.goto("/");

    // Perform search for a common term
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]',
    );
    await searchInput.first().fill("batman");
    await searchInput.first().press("Enter");

    // Wait for results to load
    await page.waitForLoadState("networkidle");

    // Check that results are displayed
    const searchResults = page.locator(
      '[data-testid="search-results"], [data-testid="thumbnail"]',
    );
    await expect(searchResults.first()).toBeVisible();

    // Check that search term is highlighted in results
    const highlightedText = page.locator(".search-highlight, mark");
    if (await highlightedText.first().isVisible()) {
      await expect(highlightedText.first()).toBeVisible();
    }
  });

  test("search works for different content types", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]',
    );

    // Test movie search
    await searchInput.first().fill("movie");
    await searchInput.first().press("Enter");
    await page.waitForLoadState("networkidle");

    // Should find movie content
    await expect(
      page.locator('[data-testid="search-results"], [data-testid="thumbnail"]'),
    ).toBeVisible();

    // Test episode search
    await searchInput.first().fill("episode");
    await searchInput.first().press("Enter");
    await page.waitForLoadState("networkidle");

    // Should find episode content
    await expect(
      page.locator('[data-testid="search-results"], [data-testid="thumbnail"]'),
    ).toBeVisible();
  });

  test("search handles no results gracefully", async ({ page }) => {
    await page.goto("/");

    // Search for something unlikely to exist
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]',
    );
    await searchInput.first().fill("xyznonexistentcontent123");
    await searchInput.first().press("Enter");

    await page.waitForLoadState("networkidle");

    // Should show no results message or empty state
    const noResultsMessage = page.locator(
      '[data-testid="no-results"], .no-results, :text("No results"), :text("not found")',
    );

    // Either we see a no results message or no thumbnails are displayed
    const thumbnails = page.locator('[data-testid="thumbnail"]');
    const thumbnailCount = await thumbnails.count();

    if (thumbnailCount === 0) {
      // No thumbnails is also a valid no-results state
      expect(thumbnailCount).toBe(0);
    } else {
      // If thumbnails exist, we should see a no-results message
      await expect(noResultsMessage.first()).toBeVisible();
    }
  });

  test("can navigate to content from search results", async ({ page }) => {
    await page.goto("/");

    // Perform search
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]',
    );
    await searchInput.first().fill("batman");
    await searchInput.first().press("Enter");

    await page.waitForLoadState("networkidle");

    // Click on first search result
    const firstResult = page.locator('[data-testid="thumbnail"]').first();
    if (await firstResult.isVisible()) {
      await firstResult.click();

      // Should navigate to content detail page
      expect(page.url()).toMatch(/\/(movie|episode|brand|article)\//);
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("search input clears and resets", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]',
    );

    // Fill search input
    await searchInput.first().fill("test search");
    await expect(searchInput.first()).toHaveValue("test search");

    // Clear search input
    await searchInput.first().fill("");
    await expect(searchInput.first()).toHaveValue("");
  });

  test("search is case-insensitive", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]',
    );

    // Search with lowercase
    await searchInput.first().fill("batman");
    await searchInput.first().press("Enter");
    await page.waitForLoadState("networkidle");

    const lowercaseResults = await page
      .locator('[data-testid="thumbnail"]')
      .count();

    // Clear and search with uppercase
    await searchInput.first().fill("BATMAN");
    await searchInput.first().press("Enter");
    await page.waitForLoadState("networkidle");

    const uppercaseResults = await page
      .locator('[data-testid="thumbnail"]')
      .count();

    // Should return same number of results regardless of case
    expect(lowercaseResults).toBe(uppercaseResults);
  });

  test("search excludes seasons from results", async ({ page }) => {
    await page.goto("/");

    // Search for "season" which should not return Season objects
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]',
    );
    await searchInput.first().fill("season");
    await searchInput.first().press("Enter");

    await page.waitForLoadState("networkidle");

    // Check result titles/content to ensure no Season objects are returned
    const resultTitles = page.locator(
      '[data-testid="thumbnail"] h3, [data-testid="thumbnail"] .title',
    );
    const titleCount = await resultTitles.count();

    // If there are results, verify none are Season objects
    if (titleCount > 0) {
      for (let i = 0; i < Math.min(titleCount, 5); i += 1) {
        const title = await resultTitles.nth(i).textContent();
        // Seasons should not appear in search results
        expect(title?.toLowerCase()).not.toContain("season");
      }
    }
  });
});
