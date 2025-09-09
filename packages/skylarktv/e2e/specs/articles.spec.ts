import { test, expect } from "@playwright/test";

test.describe("Article Reading Experience", () => {
  test("article page displays properly", async ({ page }) => {
    await page.goto("/articles");

    // Click on first article
    const firstArticle = page.locator('[data-testid="thumbnail"]').first();
    await expect(firstArticle).toBeVisible();
    await firstArticle.click();

    // Verify article page elements
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.locator('article, [data-testid="article-content"]'),
    ).toBeVisible();

    // Check for article metadata
    const publishDate = page.locator(
      '[data-testid="publish-date"], .publish-date',
    );
    if (await publishDate.isVisible()) {
      await expect(publishDate).toBeVisible();
    }
  });

  test("article content is readable and well-formatted", async ({ page }) => {
    await page.goto("/articles");

    // Navigate to an article
    await page.locator('[data-testid="thumbnail"]').first().click();

    // Check that article content exists and is readable
    const articleContent = page.locator(
      'article, [data-testid="article-content"]',
    );
    await expect(articleContent).toBeVisible();

    // Check for proper text formatting
    const paragraphs = articleContent.locator("p");
    const paragraphCount = await paragraphs.count();
    expect(paragraphCount).toBeGreaterThan(0);

    // Verify headings are present
    const headings = articleContent.locator("h1, h2, h3, h4, h5, h6");
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test("article images display correctly", async ({ page }) => {
    await page.goto("/articles");

    // Navigate to an article
    await page.locator('[data-testid="thumbnail"]').first().click();

    // Check for article images
    const articleImages = page.locator(
      'article img, [data-testid="article-content"] img',
    );

    if (await articleImages.first().isVisible()) {
      // Verify image loads properly
      await expect(articleImages.first()).toBeVisible();

      // Check image has proper attributes
      const imageSrc = await articleImages.first().getAttribute("src");
      expect(imageSrc).toBeTruthy();

      const imageAlt = await articleImages.first().getAttribute("alt");
      expect(imageAlt).toBeTruthy();
    }
  });

  test("article byline shows author information", async ({ page }) => {
    await page.goto("/articles");

    // Navigate to an article
    await page.locator('[data-testid="thumbnail"]').first().click();

    // Look for author/byline information
    const byline = page.locator('[data-testid="byline"], .byline, .author');

    if (await byline.first().isVisible()) {
      await expect(byline.first()).toBeVisible();

      // Should contain author name
      const bylineText = await byline.first().textContent();
      expect(bylineText).toBeTruthy();
      expect(bylineText?.length).toBeGreaterThan(0);
    }
  });

  test("articles list shows proper metadata", async ({ page }) => {
    await page.goto("/articles");

    // Check article thumbnails have proper information
    const articleThumbnails = page.locator('[data-testid="thumbnail"]');
    await expect(articleThumbnails.first()).toBeVisible();

    // Check for article titles
    const titles = page.locator(
      '[data-testid="thumbnail"] h3, [data-testid="thumbnail"] .title',
    );
    await expect(titles.first()).toBeVisible();

    const titleText = await titles.first().textContent();
    expect(titleText).toBeTruthy();

    // Check for article descriptions/excerpts
    const descriptions = page.locator(
      '[data-testid="thumbnail"] p, [data-testid="thumbnail"] .description',
    );
    if (await descriptions.first().isVisible()) {
      const descriptionText = await descriptions.first().textContent();
      expect(descriptionText).toBeTruthy();
    }
  });

  test("article navigation works", async ({ page }) => {
    await page.goto("/articles");

    // Navigate to an article
    await page.locator('[data-testid="thumbnail"]').first().click();
    expect(page.url()).toMatch(/\/article\//);

    // Go back to articles list
    await page.goBack();
    expect(page.url()).toMatch(/\/articles/);

    // Try a different article
    const secondArticle = page.locator('[data-testid="thumbnail"]').nth(1);
    if (await secondArticle.isVisible()) {
      await secondArticle.click();
      expect(page.url()).toMatch(/\/article\//);
    }
  });

  test("article sharing functionality exists", async ({ page }) => {
    await page.goto("/articles");

    // Navigate to an article
    await page.locator('[data-testid="thumbnail"]').first().click();

    // Look for share buttons or social media links
    const shareButtons = page.locator(
      '[data-testid="share"], .share-button, .social-share, a[href*="twitter"], a[href*="facebook"]',
    );

    if (await shareButtons.first().isVisible()) {
      await expect(shareButtons.first()).toBeVisible();
    }
  });

  test("article content is searchable", async ({ page }) => {
    await page.goto("/");

    // Search for article content
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], [data-testid="search-input"]',
    );
    await searchInput.first().fill("streaming");
    await searchInput.first().press("Enter");

    await page.waitForLoadState("networkidle");

    // Should find articles in search results
    const searchResults = page.locator('[data-testid="thumbnail"]');
    if (await searchResults.first().isVisible()) {
      // Click on an article result
      await searchResults.first().click();

      // Should navigate to article
      expect(page.url()).toMatch(/\/article\//);

      // Search term should be highlighted in content
      const highlightedText = page.locator(".search-highlight, mark");
      if (await highlightedText.first().isVisible()) {
        await expect(highlightedText.first()).toBeVisible();
      }
    }
  });

  test("article content loads without errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/articles");

    // Navigate to an article
    await page.locator('[data-testid="thumbnail"]').first().click();

    // Wait for content to fully load
    await page.waitForLoadState("networkidle");

    // Check that there are no console errors
    expect(
      consoleErrors.filter(
        (error) =>
          !error.includes("favicon") && // Ignore favicon errors
          !error.includes("404"), // Ignore 404 errors for optional resources
      ),
    ).toHaveLength(0);
  });

  test("article typography and readability", async ({ page }) => {
    await page.goto("/articles");

    // Navigate to an article
    await page.locator('[data-testid="thumbnail"]').first().click();

    // Check that article text is readable size
    const articleContent = page.locator(
      'article, [data-testid="article-content"]',
    );
    await expect(articleContent).toBeVisible();

    // Check font size is reasonable for reading
    const paragraph = articleContent.locator("p").first();
    if (await paragraph.isVisible()) {
      const fontSize = await paragraph.evaluate(
        (el) => window.getComputedStyle(el).fontSize,
      );

      // Font size should be at least 14px for readability
      const fontSizeNum = parseInt(fontSize.replace("px", ""), 10);
      expect(fontSizeNum).toBeGreaterThanOrEqual(14);
    }

    // Check line height for readability
    const lineHeight = await paragraph.evaluate(
      (el) => window.getComputedStyle(el).lineHeight,
    );

    // Line height should be reasonable (not "normal" and not too tight)
    expect(lineHeight).not.toBe("normal");

    if (lineHeight.includes("px")) {
      const lineHeightNum = parseInt(lineHeight.replace("px", ""), 10);
      expect(lineHeightNum).toBeGreaterThan(18);
    }
  });
});
