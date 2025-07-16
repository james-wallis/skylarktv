import { test, expect, helpers } from "../fixtures/fixtures";

test.describe("Homepage Functionality", () => {
  test("loads successfully with proper title", async ({
    page,
    pageActions,
  }) => {
    await pageActions.goToHomepage();

    // Check that the page loads with title
    await expect(page).toHaveTitle(/SkylarkTV/);

    // Validate page loaded and has content
    await pageActions.validatePageLoaded();
    await pageActions.validatePageHasContent();
  });

  test("MSW mocking provides content", async ({ page, pageActions }) => {
    await pageActions.goToHomepage();
    await helpers.waitForMSW(page);

    // Check for any content - images, links, or text
    const images = await page.locator("img").count();
    const links = await page.locator("a").count();

    // Should have some content from MSW
    expect(images + links).toBeGreaterThan(0);
    await pageActions.validatePageHasContent(200);
  });

  test("loads without critical JavaScript errors", async ({ pageActions }) => {
    const criticalErrors = pageActions.monitorConsoleErrors({
      ignoreFavicon: true,
      ignore404: true,
      ignoreTracking: true,
    });

    await pageActions.goToHomepage();

    // Should not have critical JavaScript errors
    expect(criticalErrors).toHaveLength(0);
  });
});
