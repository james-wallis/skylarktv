import { test, expect } from "../../fixtures/fixtures";

test.describe("Episode Detail Page Screenshots", () => {
  // Using "Winter is Coming" Game of Thrones episode - rich data: 220 credits, 57 synopsis sections, 11 rails
  const testEpisodeUrl = "/episode/recAfzpVLWlqKVGnK";

  test.beforeEach(async ({ page }) => {
    await page.goto(testEpisodeUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  });

  test.describe("Desktop Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("episode detail page desktop - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("episode-detail-desktop-default.png");
    });

    test("episode detail page desktop - with synopsis expanded", async ({
      page,
      pageActions,
    }) => {
      const synopsisExpanded = await pageActions.toggleShowMore();
      if (synopsisExpanded) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot(
        "episode-detail-desktop-synopsis-expanded.png",
      );
    });

    test("episode detail page desktop - scrolled to show credits", async ({
      page,
    }) => {
      // Scroll down to show credits section
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "episode-detail-desktop-credits-visible.png",
      );
    });

    test("episode detail page desktop - scrolled to show rails", async ({
      page,
    }) => {
      // Scroll down to show "More by" rails
      await page.evaluate(() => window.scrollBy(0, 1200));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "episode-detail-desktop-rails-visible.png",
      );
    });

    test("episode detail page desktop - English language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("episode-detail-desktop-english.png");
    });

    test("episode detail page desktop - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot(
        "episode-detail-desktop-portuguese.png",
      );
    });

    test("episode detail page desktop - Arabic RTL (Middle East)", async ({
      page,
      pageActions,
    }) => {
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot(
        "episode-detail-desktop-arabic-rtl.png",
      );
    });
  });

  test.describe("Mobile Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setMobileViewport();
      await page.waitForTimeout(500);
    });

    test("episode detail page mobile - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("episode-detail-mobile-default.png");
    });

    test("episode detail page mobile - with synopsis expanded", async ({
      page,
      pageActions,
    }) => {
      const synopsisExpanded = await pageActions.toggleShowMore();
      if (synopsisExpanded) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot(
        "episode-detail-mobile-synopsis-expanded.png",
      );
    });

    test("episode detail page mobile - scrolled to show credits", async ({
      page,
    }) => {
      // Scroll down to show credits section
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "episode-detail-mobile-credits-visible.png",
      );
    });

    test("episode detail page mobile - scrolled to show rails", async ({
      page,
    }) => {
      // Scroll down to show "More by" rails
      await page.evaluate(() => window.scrollBy(0, 1200));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "episode-detail-mobile-rails-visible.png",
      );
    });

    test("episode detail page mobile - English language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("episode-detail-mobile-english.png");
    });

    test("episode detail page mobile - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot(
        "episode-detail-mobile-portuguese.png",
      );
    });

    test("episode detail page mobile - Arabic RTL (Middle East)", async ({
      page,
      pageActions,
    }) => {
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot(
        "episode-detail-mobile-arabic-rtl.png",
      );
    });
  });

  test.describe("Tablet Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setTabletViewport();
      await page.waitForTimeout(500);
    });

    test("episode detail page tablet - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("episode-detail-tablet-default.png");
    });

    test("episode detail page tablet - with synopsis expanded", async ({
      page,
      pageActions,
    }) => {
      const synopsisExpanded = await pageActions.toggleShowMore();
      if (synopsisExpanded) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot(
        "episode-detail-tablet-synopsis-expanded.png",
      );
    });

    test("episode detail page tablet - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot(
        "episode-detail-tablet-portuguese.png",
      );
    });
  });

  test.describe("Special States Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("episode detail page with dimensions drawer open", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "episode-detail-desktop-dimensions-drawer.png",
        );
      }
    });

    test("episode detail page with credit hover state", async ({ page }) => {
      // Find first credit link and hover over it
      const firstCredit = page
        .locator('a[href*="/person/"], a[href*="/people/"]')
        .first();
      if (await firstCredit.isVisible()) {
        await firstCredit.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "episode-detail-desktop-credit-hover.png",
        );
      }
    });

    test("episode detail page with rail hover state", async ({ page }) => {
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
          "episode-detail-desktop-rail-hover.png",
        );
      }
    });

    test("episode detail page full page screenshot", async ({ page }) => {
      // Take full page screenshot to capture everything
      await expect(page).toHaveScreenshot(
        "episode-detail-desktop-full-page.png",
        {
          fullPage: true,
        },
      );
    });

    test("episode detail page with synopsis collapsed after expansion", async ({
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
            "episode-detail-desktop-synopsis-collapsed.png",
          );
        }
      }
    });

    test("episode detail page with search active if available", async ({
      page,
      pageActions,
    }) => {
      const searchPerformed =
        await pageActions.performSearch("Game of Thrones");
      if (searchPerformed) {
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "episode-detail-desktop-search-active.png",
        );
      }
    });

    test("episode detail page with season context if available", async ({
      page,
    }) => {
      // Check if there's season information displayed
      const seasonInfo = page.locator('text="Season", text="Episode"').first();
      if (await seasonInfo.isVisible()) {
        await seasonInfo.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "episode-detail-desktop-season-context.png",
        );
      }
    });

    test("episode detail page with brand context if available", async ({
      page,
    }) => {
      // Check if there's brand/series information displayed
      const brandInfo = page.locator('text="Game of Thrones"').first();
      if (await brandInfo.isVisible()) {
        await brandInfo.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "episode-detail-desktop-brand-context.png",
        );
      }
    });
  });
});
