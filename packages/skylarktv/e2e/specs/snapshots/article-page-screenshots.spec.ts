import { test, expect } from "../../fixtures/fixtures";

test.describe("Article Page Screenshots", () => {
  // Using the Claude article for consistency with existing tests

  test.beforeEach(async ({ page, pageActions }) => {
    await pageActions.goToClaudeArticle();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  });

  test.describe("Desktop Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("article page desktop - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("article-page-desktop-default.png");
    });

    test("article page desktop - scrolled to show article content", async ({
      page,
    }) => {
      // Scroll down to show article content
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "article-page-desktop-content-visible.png",
      );
    });

    test("article page desktop - scrolled to show author and metadata", async ({
      page,
    }) => {
      // Scroll down to show author section
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "article-page-desktop-author-visible.png",
      );
    });

    test("article page desktop - English language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("article-page-desktop-english.png");
    });

    test("article page desktop - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot(
        "article-page-desktop-portuguese.png",
      );
    });

    test("article page desktop - Arabic RTL (Middle East)", async ({
      page,
      pageActions,
    }) => {
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot(
        "article-page-desktop-arabic-rtl.png",
      );
    });
  });

  test.describe("Mobile Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setMobileViewport();
      await page.waitForTimeout(500);
    });

    test("article page mobile - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("article-page-mobile-default.png");
    });

    test("article page mobile - scrolled to show article content", async ({
      page,
    }) => {
      // Scroll down to show article content
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "article-page-mobile-content-visible.png",
      );
    });

    test("article page mobile - scrolled to show author and metadata", async ({
      page,
    }) => {
      // Scroll down to show author section
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "article-page-mobile-author-visible.png",
      );
    });

    test("article page mobile - English language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("article-page-mobile-english.png");
    });

    test("article page mobile - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("article-page-mobile-portuguese.png");
    });

    test("article page mobile - Arabic RTL (Middle East)", async ({
      page,
      pageActions,
    }) => {
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(1000);
      }
      await expect(page).toHaveScreenshot("article-page-mobile-arabic-rtl.png");
    });
  });

  test.describe("Tablet Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setTabletViewport();
      await page.waitForTimeout(500);
    });

    test("article page tablet - default state", async ({ page }) => {
      await expect(page).toHaveScreenshot("article-page-tablet-default.png");
    });

    test("article page tablet - scrolled to show article content", async ({
      page,
    }) => {
      // Scroll down to show article content
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot(
        "article-page-tablet-content-visible.png",
      );
    });

    test("article page tablet - Portuguese language", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("pt-pt");
        await page.waitForTimeout(2000);
      }
      await expect(page).toHaveScreenshot("article-page-tablet-portuguese.png");
    });
  });

  test.describe("Special States Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("article page with dimensions drawer open", async ({
      page,
      pageActions,
    }) => {
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "article-page-desktop-dimensions-drawer.png",
        );
      }
    });

    test("article page full page screenshot", async ({ page }) => {
      // Take full page screenshot to capture everything
      await expect(page).toHaveScreenshot(
        "article-page-desktop-full-page.png",
        {
          fullPage: true,
        },
      );
    });

    test("article page with search active if available", async ({
      page,
      pageActions,
    }) => {
      const searchPerformed = await pageActions.performSearch("streaming");
      if (searchPerformed) {
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot(
          "article-page-desktop-search-active.png",
        );
      }
    });

    test("article page with hover states on links", async ({ page }) => {
      // Find first link in article content and hover over it
      const articleLink = page.locator("article a, .article-content a").first();
      if (await articleLink.isVisible()) {
        await articleLink.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "article-page-desktop-link-hover.png",
        );
      }
    });

    test("article page with different reading positions", async ({ page }) => {
      // Test various scroll positions to show reading progress
      const scrollPositions = [0, 25, 50, 75, 100];

      for (const position of scrollPositions) {
        await page.evaluate((pos) => {
          const scrollHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo(0, (scrollHeight * pos) / 100);
        }, position);

        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          `article-page-desktop-scroll-${position}percent.png`,
        );
      }
    });

    test("article page with related articles if available", async ({
      page,
    }) => {
      // Scroll to bottom to find related articles
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      // Look for related articles section
      const relatedArticles = page
        .locator(
          'text="Related", text="More Articles", text="You might also like"',
        )
        .first();
      if (await relatedArticles.isVisible()) {
        await expect(page).toHaveScreenshot(
          "article-page-desktop-related-articles.png",
        );
      }
    });

    test("article page with social sharing if available", async ({ page }) => {
      // Look for social sharing buttons
      const socialButtons = page
        .locator(
          'button[aria-label*="Share"], a[href*="twitter"], a[href*="facebook"]',
        )
        .first();
      if (await socialButtons.isVisible()) {
        await socialButtons.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "article-page-desktop-social-sharing.png",
        );
      }
    });

    test("article page with time-travel context if available", async ({
      page,
    }) => {
      // Check if this is a time-travel article (like House of the Dragon)
      const timeContext = page
        .locator(
          'text="time travel", text="Time Travel", text="House of the Dragon"',
        )
        .first();
      if (await timeContext.isVisible()) {
        await timeContext.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "article-page-desktop-time-travel-context.png",
        );
      }
    });
  });

  test.describe("Navigation Screenshots", () => {
    test.beforeEach(async ({ page, pageActions }) => {
      await pageActions.setDesktopViewport();
      await page.waitForTimeout(500);
    });

    test("article page navigation back to articles list", async ({ page }) => {
      // Look for back to articles link
      const backToArticlesLink = page
        .locator('a[href="/articles"], a[href*="articles"]')
        .first();
      if (await backToArticlesLink.isVisible()) {
        await backToArticlesLink.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "article-page-desktop-back-to-articles-hover.png",
        );
      }
    });

    test("article page breadcrumb navigation if available", async ({
      page,
    }) => {
      // Look for breadcrumb navigation
      const breadcrumbs = page
        .locator('nav[aria-label="breadcrumb"], .breadcrumb, .breadcrumbs')
        .first();
      if (await breadcrumbs.isVisible()) {
        await breadcrumbs.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "article-page-desktop-breadcrumbs.png",
        );
      }
    });

    test("article page with article categories if available", async ({
      page,
    }) => {
      // Look for article categories or tags
      const categories = page
        .locator('text="Category", text="Tag", text="Filed under"')
        .first();
      if (await categories.isVisible()) {
        await categories.hover();
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot(
          "article-page-desktop-categories.png",
        );
      }
    });
  });
});
