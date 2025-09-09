import { test, expect } from "@playwright/test";

test.describe("SkylarkTV Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");

    // Check that the page title contains SkylarkTV
    await expect(page).toHaveTitle(/SkylarkTV/);

    // Check that main content is visible
    await expect(page.locator("main")).toBeVisible();

    // Check that navigation is present
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("homepage contains expected content", async ({ page }) => {
    await page.goto("/");

    // Check for hero section
    await expect(page.locator('[data-testid="hero"]')).toBeVisible();

    // Check for content rails
    await expect(page.locator('[data-testid="rail"]').first()).toBeVisible();

    // Check for thumbnails
    await expect(
      page.locator('[data-testid="thumbnail"]').first(),
    ).toBeVisible();
  });

  test("navigation menu works", async ({ page }) => {
    await page.goto("/");

    // Check main navigation links are present and functional
    const moviesLink = page.getByRole("link", { name: /movies/i });
    await expect(moviesLink).toBeVisible();

    const showsLink = page.getByRole("link", { name: /shows/i });
    await expect(showsLink).toBeVisible();

    const articlesLink = page.getByRole("link", { name: /articles/i });
    await expect(articlesLink).toBeVisible();
  });

  test("movies page loads", async ({ page }) => {
    await page.goto("/movies");

    // Check page loads successfully
    await expect(page).toHaveTitle(/Movies.*SkylarkTV/);

    // Check that movie thumbnails are displayed
    await expect(
      page.locator('[data-testid="thumbnail"]').first(),
    ).toBeVisible();
  });

  test("shows page loads", async ({ page }) => {
    await page.goto("/shows");

    // Check page loads successfully
    await expect(page).toHaveTitle(/Shows.*SkylarkTV/);

    // Check that show/brand content is displayed
    await expect(
      page.locator('[data-testid="thumbnail"]').first(),
    ).toBeVisible();
  });

  test("articles page loads", async ({ page }) => {
    await page.goto("/articles");

    // Check page loads successfully
    await expect(page).toHaveTitle(/Articles.*SkylarkTV/);

    // Check that article thumbnails are displayed
    await expect(
      page.locator('[data-testid="thumbnail"]').first(),
    ).toBeVisible();
  });

  test("search functionality is accessible", async ({ page }) => {
    await page.goto("/");

    // Look for search input or search trigger
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], [data-testid="search"]',
    );
    await expect(searchInput.first()).toBeVisible();
  });

  test("responsive design works on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that content is still visible and functional on mobile
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("navigation")).toBeVisible();

    // Check that thumbnails adapt to mobile layout
    await expect(
      page.locator('[data-testid="thumbnail"]').first(),
    ).toBeVisible();
  });

  test("no console errors on homepage", async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Check that there are no console errors
    expect(consoleErrors).toHaveLength(0);
  });
});
