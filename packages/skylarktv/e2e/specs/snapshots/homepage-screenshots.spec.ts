import { test, expect } from "../../fixtures/fixtures";

test.describe("Homepage Screenshots", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000); // Wait for content to fully load and stabilize
  });

  test.describe("Desktop Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("homepage desktop - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("homepage-desktop-default.png");
    });

    test("homepage desktop - premium customer type", async ({
      page,
      pageActions,
    }) => {
      await pageActions.setCustomerType("premium");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot("homepage-desktop-premium.png");
    });

    test("homepage desktop - kids customer type", async ({
      page,
      pageActions,
    }) => {
      await pageActions.setCustomerType("kids");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot("homepage-desktop-kids.png");
    });

    test("homepage desktop - English language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("homepage-desktop-english.png");
    });

    test("homepage desktop - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("homepage-desktop-portuguese.png");
    });

    test("homepage desktop - Arabic RTL (Middle East)", async ({
      page,
      pageActions,
    }) => {
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("homepage-desktop-arabic-rtl.png");
    });
  });

  test.describe("Mobile Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setMobileViewport();
      await page.waitForTimeout(500);
    });

    test("homepage mobile - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("homepage-mobile-default.png");
    });

    test("homepage mobile - premium customer type", async ({
      page,
      pageActions,
    }) => {
      await pageActions.setCustomerType("premium");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot("homepage-mobile-premium.png");
    });

    test("homepage mobile - kids customer type", async ({
      page,
      pageActions,
    }) => {
      await pageActions.setCustomerType("kids");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot("homepage-mobile-kids.png");
    });

    test("homepage mobile - English language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("homepage-mobile-english.png");
    });

    test("homepage mobile - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("homepage-mobile-portuguese.png");
    });

    test("homepage mobile - Arabic RTL (Middle East)", async ({
      page,
      pageActions,
    }) => {
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("homepage-mobile-arabic-rtl.png");
    });
  });

  test.describe("Tablet Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setTabletViewport();
      await page.waitForTimeout(500);
    });

    test("homepage tablet - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("homepage-tablet-default.png");
    });

    test("homepage tablet - premium customer type", async ({
      page,
      pageActions,
    }) => {
      await pageActions.setCustomerType("premium");
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot("homepage-tablet-premium.png");
    });

    test("homepage tablet - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("homepage-tablet-portuguese.png");
    });
  });

  test.describe("Special States Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("homepage with dimensions drawer open", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "homepage-desktop-dimensions-drawer.png",
        );
      }
    });

    test("homepage scrolled down to show more content", async ({ page }) => {
      // Scroll down to show more rails
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot("homepage-desktop-scrolled.png");
    });

    test("homepage with search open if available", async ({
      page,
      pageActions,
    }) => {
      const searchPerformed = await pageActions.performSearch("movie");
      if (searchPerformed) {
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "homepage-desktop-search-active.png",
        );
      }
    });
  });
});
