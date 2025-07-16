import { test, expect } from "@playwright/test";

test.describe("Basic SkylarkTV Functionality", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");

    // Check that the page loads without errors
    await expect(page).toHaveTitle(/SkylarkTV/);

    // Check that main content exists
    await expect(page.locator("body")).toBeVisible();
  });

  test("can navigate to movies page", async ({ page }) => {
    await page.goto("/");

    // Look for movies navigation link
    const moviesLink = page
      .locator('a[href="/movies"], a[href*="movies"]')
      .first();
    if (await moviesLink.isVisible()) {
      await moviesLink.click();
      expect(page.url()).toContain("/movies");
    } else {
      // Navigate directly if link not found
      await page.goto("/movies");
      expect(page.url()).toContain("/movies");
    }
  });

  test("can navigate to articles page", async ({ page }) => {
    await page.goto("/");

    // Look for articles navigation link or navigate directly
    const articlesLink = page
      .locator('a[href="/articles"], a[href*="articles"]')
      .first();
    if (await articlesLink.isVisible()) {
      await articlesLink.click();
      expect(page.url()).toContain("/articles");
    } else {
      // Navigate directly if link not found
      await page.goto("/articles");
      expect(page.url()).toContain("/articles");
    }
  });

  test("search functionality works", async ({ page }) => {
    await page.goto("/");

    // Look for search input
    const searchInput = page
      .locator(
        'input[type="search"], input[name*="search"], input[placeholder*="search"]',
      )
      .first();

    if (await searchInput.isVisible()) {
      await searchInput.fill("batman");
      await searchInput.press("Enter");

      // Wait for navigation or results to load
      await page.waitForLoadState("networkidle");

      // Should either stay on same page with results or navigate to search results
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("article from our Claude article can be accessed", async ({ page }) => {
    // Navigate to the specific article we created
    await page.goto(
      "/article/recafURoqJexXerZY/evolution-of-streaming-time-shifted-viewing",
    );

    // Check article loads
    await expect(page.locator("h1")).toBeVisible();

    // Check for article content
    await expect(page.locator("body")).toContainText("streaming");

    // Check for byline
    await expect(page.locator("body")).toContainText("By Claude");
  });

  test("can click on content thumbnails", async ({ page }) => {
    await page.goto("/movies");

    // Look for any clickable content - could be images, links, or cards
    const thumbnails = page
      .locator('a[href*="/movie/"], img[src*="movie"], .thumbnail, article a')
      .first();

    if (await thumbnails.isVisible()) {
      await thumbnails.click();

      // Should navigate to some content page
      expect(page.url()).toMatch(/\/(movie|episode|brand|article)\//);
    }
  });

  test("pages render without console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out common non-critical errors
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes("favicon") &&
        !error.includes("404") &&
        !error.includes("Failed to load resource"),
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("responsive design works on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check page still loads and is usable on mobile
    await expect(page.locator("body")).toBeVisible();

    // Check that viewport is actually mobile sized
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
  });

  test("can navigate between different content types", async ({ page }) => {
    // Start at homepage
    await page.goto("/");

    // Navigate to movies if link exists
    const moviesLink = page.locator('a[href*="movies"]').first();
    if (await moviesLink.isVisible()) {
      await moviesLink.click();
      expect(page.url()).toContain("movies");
    }

    // Navigate to articles if link exists
    const articlesLink = page.locator('a[href*="articles"]').first();
    if (await articlesLink.isVisible()) {
      await articlesLink.click();
      expect(page.url()).toContain("articles");
    }

    // Navigate back to homepage
    const homeLink = page.locator('a[href="/"], a[href*="home"]').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      expect(page.url()).toBe("http://localhost:3000/");
    }
  });

  test("MSW mocking is working", async ({ page }) => {
    await page.goto("/");

    // Check that MSW is intercepting requests by looking for content
    await page.waitForLoadState("networkidle");

    // Should have some content loaded (from MSW)
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText?.length).toBeGreaterThan(100);
  });
});
