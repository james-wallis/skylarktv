import { test, expect } from "../../fixtures/fixtures";

test.describe("Person Page Screenshots", () => {
  // Using a person from the "1917" movie credits for consistency

  test.beforeEach(async ({ page }) => {
    // First navigate to the movie detail page to find a person link
    await page.goto("/movie/recUVmOzaTc7EAcTB"); // 1917 movie
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Find the first person link and navigate to it
    const firstPersonLink = page
      .locator('a[href*="/person/"], a[href*="/people/"]')
      .first();
    if (await firstPersonLink.isVisible()) {
      const personHref = await firstPersonLink.getAttribute("href");
      if (personHref) {
        await page.goto(personHref);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);
      }
    } else {
      // Fallback - try to navigate to a known person page
      await page.goto("/person/recPersonExample123");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
    }
  });

  test.describe("Desktop Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("person page desktop - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("person-page-desktop-default.png");
    });

    test("person page desktop - scrolled to show filmography", async ({
      page,
    }) => {
      // Scroll down to show filmography section
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "person-page-desktop-filmography-visible.png",
      );
    });

    test("person page desktop - scrolled to show biography", async ({
      page,
    }) => {
      // Scroll down to show biography section
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "person-page-desktop-biography-visible.png",
      );
    });

    test("person page desktop - English language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("person-page-desktop-english.png");
    });

    test("person page desktop - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("person-page-desktop-portuguese.png");
    });

    test("person page desktop - Arabic RTL (Middle East)", async ({
      page,
      pageActions,
    }) => {
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("person-page-desktop-arabic-rtl.png");
    });
  });

  test.describe("Mobile Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setMobileViewport();
      await page.waitForTimeout(500);
    });

    test("person page mobile - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("person-page-mobile-default.png");
    });

    test("person page mobile - scrolled to show filmography", async ({
      page,
    }) => {
      // Scroll down to show filmography section
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "person-page-mobile-filmography-visible.png",
      );
    });

    test("person page mobile - scrolled to show biography", async ({
      page,
    }) => {
      // Scroll down to show biography section
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "person-page-mobile-biography-visible.png",
      );
    });

    test("person page mobile - English language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("person-page-mobile-english.png");
    });

    test("person page mobile - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("person-page-mobile-portuguese.png");
    });

    test("person page mobile - Arabic RTL (Middle East)", async ({
      page,
      pageActions,
    }) => {
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("person-page-mobile-arabic-rtl.png");
    });
  });

  test.describe("Tablet Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setTabletViewport();
      await page.waitForTimeout(500);
    });

    test("person page tablet - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("person-page-tablet-default.png");
    });

    test("person page tablet - scrolled to show filmography", async ({
      page,
    }) => {
      // Scroll down to show filmography section
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "person-page-tablet-filmography-visible.png",
      );
    });

    test("person page tablet - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("person-page-tablet-portuguese.png");
    });
  });

  test.describe("Special States Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("person page with dimensions drawer open", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "person-page-desktop-dimensions-drawer.png",
        );
      }
    });

    test("person page with filmography item hover state", async ({ page }) => {
      // Scroll to filmography section
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(1000);

      // Find first filmography item and hover over it
      const firstFilmographyItem = page
        .locator('a[href*="/movie/"], a[href*="/episode/"]')
        .first();
      if (await firstFilmographyItem.isVisible()) {
        await firstFilmographyItem.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "person-page-desktop-filmography-hover.png",
        );
      }
    });

    test("person page full page screenshot", async ({ page }) => {
      // Take full page screenshot to capture everything
      await expect(page).toHaveScreenshot("person-page-desktop-full-page.png", {
        fullPage: true,
      });
    });

    test("person page with biography expanded if available", async ({
      page,
    }) => {
      // Look for "Show more" button in biography section
      const showMoreButton = page
        .locator('button:has-text("Show more"), button:has-text("show more")')
        .first();
      if (await showMoreButton.isVisible()) {
        await showMoreButton.click();
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "person-page-desktop-biography-expanded.png",
        );
      }
    });

    test("person page with search active if available", async ({
      page,
      pageActions,
    }) => {
      const searchPerformed = await pageActions.performSearch("actor");
      if (searchPerformed) {
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "person-page-desktop-search-active.png",
        );
      }
    });

    test("person page with different sections visible", async ({ page }) => {
      // Check what sections are available and scroll to each
      const sections = [
        "Biography",
        "Filmography",
        "Born",
        "Career",
        "Awards",
        "TV Shows",
        "Movies",
      ];

      for (const section of sections) {
        const sectionElement = page.locator(`text="${section}"`).first();
        if (await sectionElement.isVisible()) {
          await sectionElement.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          await expect(page).toHaveScreenshot(
            `person-page-desktop-${section.toLowerCase()}-section.png`,
          );
        }
      }
    });
  });

  test.describe("Navigation Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("person page navigation back to movie if available", async ({
      page,
    }) => {
      // Look for back to movie link
      const backToMovieLink = page.locator('a[href*="/movie/"]').first();
      if (await backToMovieLink.isVisible()) {
        await backToMovieLink.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "person-page-desktop-back-to-movie-hover.png",
        );
      }
    });

    test("person page with related content links", async ({ page }) => {
      // Look for related content links
      const relatedLinks = page.locator(
        'a[href*="/movie/"], a[href*="/episode/"], a[href*="/person/"]',
      );
      const linkCount = await relatedLinks.count();

      if (linkCount > 0) {
        await relatedLinks.first().hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "person-page-desktop-related-content-hover.png",
        );
      }
    });
  });
});
