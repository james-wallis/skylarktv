import { test, expect } from "../../fixtures/fixtures";

test.describe("Movies Page Screenshots", () => {
  test.beforeEach(async ({ page, pageActions }) => {
    await pageActions.goToMovies();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000); // Wait for movies to load
  });

  test.describe("Desktop Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("movies page desktop - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("movies-page-desktop-default.png");
    });

    test("movies page desktop - Action genre filter", async ({
      page,
      pageActions,
    }) => {
      await pageActions.filterMoviesByGenre("Action");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "movies-page-desktop-action-filter.png",
      );
    });

    test("movies page desktop - Comedy genre filter", async ({
      page,
      pageActions,
    }) => {
      await pageActions.filterMoviesByGenre("Comedy");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "movies-page-desktop-comedy-filter.png",
      );
    });

    test("movies page desktop - Drama genre filter", async ({
      page,
      pageActions,
    }) => {
      await pageActions.filterMoviesByGenre("Drama");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "movies-page-desktop-drama-filter.png",
      );
    });

    test("movies page desktop - English language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("movies-page-desktop-english.png");
    });

    test("movies page desktop - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("movies-page-desktop-portuguese.png");
    });

    test("movies page desktop - Arabic RTL (Middle East)", async ({
      page,
      pageActions,
    }) => {
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("movies-page-desktop-arabic-rtl.png");
    });
  });

  test.describe("Mobile Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setMobileViewport();
      await page.waitForTimeout(500);
    });

    test("movies page mobile - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("movies-page-mobile-default.png");
    });

    test("movies page mobile - Action genre filter", async ({
      page,
      pageActions,
    }) => {
      await pageActions.filterMoviesByGenre("Action");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "movies-page-mobile-action-filter.png",
      );
    });

    test("movies page mobile - Comedy genre filter", async ({
      page,
      pageActions,
    }) => {
      await pageActions.filterMoviesByGenre("Comedy");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "movies-page-mobile-comedy-filter.png",
      );
    });

    test("movies page mobile - English language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("movies-page-mobile-english.png");
    });

    test("movies page mobile - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("movies-page-mobile-portuguese.png");
    });

    test("movies page mobile - Arabic RTL (Middle East)", async ({
      page,
      pageActions,
    }) => {
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("movies-page-mobile-arabic-rtl.png");
    });
  });

  test.describe("Tablet Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setTabletViewport();
      await page.waitForTimeout(500);
    });

    test("movies page tablet - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("movies-page-tablet-default.png");
    });

    test("movies page tablet - Action genre filter", async ({
      page,
      pageActions,
    }) => {
      await pageActions.filterMoviesByGenre("Action");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "movies-page-tablet-action-filter.png",
      );
    });

    test("movies page tablet - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("movies-page-tablet-portuguese.png");
    });
  });

  test.describe("Special States Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("movies page with dimensions drawer open", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "movies-page-desktop-dimensions-drawer.png",
        );
      }
    });

    test("movies page scrolled down to show more movies", async ({ page }) => {
      // Scroll down to show more movies
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot("movies-page-desktop-scrolled.png");
    });

    test("movies page with search active if available", async ({
      page,
      pageActions,
    }) => {
      const searchPerformed = await pageActions.performSearch("1917");
      if (searchPerformed) {
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "movies-page-desktop-search-active.png",
        );
      }
    });

    test("movies page with hover state on movie thumbnail", async ({
      page,
    }) => {
      // Find first movie and hover over it
      const firstMovie = page.locator('a[href*="/movie/"].group').first();
      if (await firstMovie.isVisible()) {
        await firstMovie.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "movies-page-desktop-movie-hover.png",
        );
      }
    });

    test("movies page with multiple genre filters applied", async ({
      page,
      pageActions,
    }) => {
      // Try to apply multiple filters if possible
      await pageActions.filterMoviesByGenre("Action");
      await page.waitForTimeout(500);

      // Try to add another filter
      const dramaFilter = page.locator('text="Drama"').first();
      if (await dramaFilter.isVisible()) {
        await dramaFilter.click();
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "movies-page-desktop-multiple-filters.png",
        );
      }
    });
  });
});
