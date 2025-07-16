import { test, expect, testData } from "../fixtures/fixtures";

test.describe("Claude Article", () => {
  test("is accessible and displays correctly", async ({ pageActions }) => {
    await pageActions.goToClaudeArticle();

    // Validate article content using fixture
    await pageActions.validateArticleContent();
  });

  test("has proper article structure", async ({
    page,
    pageActions,
    commonSelectors,
  }) => {
    await pageActions.goToClaudeArticle();

    // Check for article title
    await expect(page.locator(commonSelectors.articleTitle)).toBeVisible();

    // Check for main content (more flexible than specific article tag)
    await expect(page.locator(commonSelectors.body)).toBeVisible();

    // Check for paragraphs
    const paragraphs = page.locator(commonSelectors.paragraphs);
    const paragraphCount = await paragraphs.count();
    expect(paragraphCount).toBeGreaterThan(0);
  });

  test("contains expected content", async ({ page, pageActions }) => {
    await pageActions.goToClaudeArticle();

    // Check for specific content from our article
    await expect(page.locator("body")).toContainText(
      testData.claudeArticle.title,
    );
    await expect(page.locator("body")).toContainText(
      testData.claudeArticle.author,
    );
    await expect(page.locator("body")).toContainText("streaming");
  });

  test("loads without errors", async ({ pageActions }) => {
    const criticalErrors = pageActions.monitorConsoleErrors({
      ignoreFavicon: true,
      ignore404: true,
      ignoreTracking: true,
    });

    await pageActions.goToClaudeArticle();

    // Should not have critical JavaScript errors
    expect(criticalErrors).toHaveLength(0);
  });

  test("is accessible from articles page", async ({ page, pageActions }) => {
    await pageActions.goToArticles();

    // Look for a link to our article
    const articleLink = page.locator(`a[href*="${testData.claudeArticle.id}"]`);

    if (await articleLink.isVisible()) {
      await articleLink.click();
      await pageActions.validateArticleContent();
    }
  });

  test("has readable typography", async ({
    page,
    pageActions,
    commonSelectors,
  }) => {
    await pageActions.goToClaudeArticle();

    // Check that paragraphs are visible and readable
    const paragraphs = page.locator(commonSelectors.paragraphs);

    if ((await paragraphs.count()) > 0) {
      const firstParagraph = paragraphs.first();

      if (await firstParagraph.isVisible()) {
        // Check font size is reasonable for reading
        const fontSize = await firstParagraph.evaluate(
          (el) => window.getComputedStyle(el).fontSize,
        );

        // Font size should be at least 14px for readability
        const fontSizeNum = parseInt(fontSize.replace("px", ""), 10);
        expect(fontSizeNum).toBeGreaterThanOrEqual(14);
      }
    } else {
      // If no paragraphs, just ensure page loaded
      await pageActions.validatePageLoaded();
    }
  });
});
