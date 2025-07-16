import { test, expect } from "../../fixtures/fixtures";

test.describe("Movie Detail Page Screenshots", () => {
  // Using "1917" as it has rich data: 25 credits sections, 3 rails, 9766 characters
  const testMovieUrl = "/movie/recUVmOzaTc7EAcTB";

  test.beforeEach(async ({ page }) => {
    await page.goto(testMovieUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  });

  test.describe("Desktop Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("movie detail page desktop - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("movie-detail-desktop-default.png");
    });

    test("movie detail page desktop - with synopsis expanded", async ({
      page,
      pageActions,
    }) => {
      const synopsisExpanded = await pageActions.toggleShowMore();
      if (synopsisExpanded) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot(
        "movie-detail-desktop-synopsis-expanded.png",
      );
    });

    test("movie detail page desktop - scrolled to show credits", async ({
      page,
    }) => {
      // Scroll down to show credits section
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "movie-detail-desktop-credits-visible.png",
      );
    });

    test("movie detail page desktop - scrolled to show rails", async ({
      page,
    }) => {
      // Scroll down to show "More by" rails
      await page.evaluate(() => window.scrollBy(0, 1200));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "movie-detail-desktop-rails-visible.png",
      );
    });

    test("movie detail page desktop - English language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("movie-detail-desktop-english.png");
    });

    test("movie detail page desktop - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot(
        "movie-detail-desktop-portuguese.png",
      );
    });

    test("movie detail page desktop - Arabic RTL (Middle East)", async ({
      page,
      pageActions,
    }) => {
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot(
        "movie-detail-desktop-arabic-rtl.png",
      );
    });
  });

  test.describe("Mobile Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setMobileViewport();
      await page.waitForTimeout(500);
    });

    test("movie detail page mobile - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("movie-detail-mobile-default.png");
    });

    test("movie detail page mobile - with synopsis expanded", async ({
      page,
      pageActions,
    }) => {
      const synopsisExpanded = await pageActions.toggleShowMore();
      if (synopsisExpanded) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot(
        "movie-detail-mobile-synopsis-expanded.png",
      );
    });

    test("movie detail page mobile - scrolled to show credits", async ({
      page,
    }) => {
      // Scroll down to show credits section
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "movie-detail-mobile-credits-visible.png",
      );
    });

    test("movie detail page mobile - scrolled to show rails", async ({
      page,
    }) => {
      // Scroll down to show "More by" rails
      await page.evaluate(() => window.scrollBy(0, 1200));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "movie-detail-mobile-rails-visible.png",
      );
    });

    test("movie detail page mobile - English language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("movie-detail-mobile-english.png");
    });

    test("movie detail page mobile - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("movie-detail-mobile-portuguese.png");
    });

    test("movie detail page mobile - Arabic RTL (Middle East)", async ({
      page,
      pageActions,
    }) => {
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("movie-detail-mobile-arabic-rtl.png");
    });
  });

  test.describe("Tablet Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setTabletViewport();
      await page.waitForTimeout(500);
    });

    test("movie detail page tablet - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("movie-detail-tablet-default.png");
    });

    test("movie detail page tablet - with synopsis expanded", async ({
      page,
      pageActions,
    }) => {
      const synopsisExpanded = await pageActions.toggleShowMore();
      if (synopsisExpanded) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot(
        "movie-detail-tablet-synopsis-expanded.png",
      );
    });

    test("movie detail page tablet - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("movie-detail-tablet-portuguese.png");
    });
  });

  test.describe("Special States Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("movie detail page with dimensions drawer open", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "movie-detail-desktop-dimensions-drawer.png",
        );
      }
    });

    test("movie detail page with credit hover state", async ({ page }) => {
      // Find first credit link and hover over it
      const firstCredit = page
        .locator('a[href*="/person/"], a[href*="/people/"]')
        .first();
      if (await firstCredit.isVisible()) {
        await firstCredit.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "movie-detail-desktop-credit-hover.png",
        );
      }
    });

    test("movie detail page with rail hover state", async ({ page }) => {
      // Scroll to rails section
      await page.evaluate(() => window.scrollBy(0, 1200));
      await page.waitForTimeout(1000);

      // Find first rail item and hover over it
      const firstRailItem = page
        .locator('a[href*="/movie/"], a[href*="/episode/"]')
        .first();
      if (await firstRailItem.isVisible()) {
        await firstRailItem.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "movie-detail-desktop-rail-hover.png",
        );
      }
    });

    test("movie detail page full page screenshot", async ({ page }) => {
      // Take full page screenshot to capture everything
      await expect(page).toHaveScreenshot(
        "movie-detail-desktop-full-page.png",
        {
          fullPage: true,
        },
      );
    });

    test("movie detail page with synopsis collapsed after expansion", async ({
      page,
      pageActions,
    }) => {
      // Expand synopsis first
      const synopsisExpanded = await pageActions.toggleShowMore();
      if (synopsisExpanded) {
        await page.waitForTimeout(1000);

        // Then collapse it
        const synopsisCollapsed = await pageActions.toggleShowLess();
        if (synopsisCollapsed) {
          await page.waitForTimeout(1000);
          await expect(page).toHaveScreenshot(
            "movie-detail-desktop-synopsis-collapsed.png",
          );
        }
      }
    });

    test("movie detail page with search active if available", async ({
      page,
      pageActions,
    }) => {
      const searchPerformed = await pageActions.performSearch("1917");
      if (searchPerformed) {
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "movie-detail-desktop-search-active.png",
        );
      }
    });
  });
});
