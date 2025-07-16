import { test, expect, testData } from "../fixtures/fixtures";

test.describe("Homepage Content Validation Framework", () => {
  test("homepage validation fixture infrastructure is working", async ({
    pageActions,
  }) => {
    await pageActions.goToHomepage();

    // Test that rail title detection works
    const railTitles = await pageActions.getRailTitles();
    expect(railTitles.length).toBeGreaterThan(0);
    // eslint-disable-next-line no-console
    console.log("Detected rail titles:", railTitles);

    // Test that content title detection works
    const contentTitles = await pageActions.getContentTitles();
    // eslint-disable-next-line no-console
    console.log("Detected content count:", contentTitles.length);

    // Test that rail counting works
    const anyRailCount =
      railTitles.length > 0
        ? await pageActions.countRailItems(railTitles[0])
        : 0;
    // eslint-disable-next-line no-console
    console.log(`Rail "${railTitles[0]}" has ${anyRailCount} items`);

    // Test that testData structure exists
    expect(testData.homepageContent).toBeDefined();
    expect(testData.homepageContent.premium).toBeDefined();
    expect(testData.homepageContent.standard).toBeDefined();
    expect(testData.homepageContent.kids).toBeDefined();

    // Test that validation function works (with mock data)
    const mockExpectations = {
      requiredRails: railTitles,
      forbiddenRails: ["NonExistentRail"],
      railCounts: {},
      allowedContentTypes: ["Movie", "Episode"],
      forbiddenContent: ["NonExistentContent"],
    };

    const validation = await pageActions.validateHomepageContent(
      "premium",
      mockExpectations,
    );
    expect(validation).toBeDefined();
    expect(validation.success).toBe(true);
    expect(validation.requiredRailsPresent.length).toBeGreaterThan(0);
  });

  test("testData homepage content expectations are properly structured", () => {
    // Verify Premium expectations
    const { premium } = testData.homepageContent;
    expect(premium.requiredRails).toBeInstanceOf(Array);
    expect(premium.forbiddenRails).toBeInstanceOf(Array);
    expect(premium.railCounts).toBeInstanceOf(Object);
    expect(premium.allowedContentTypes).toBeInstanceOf(Array);
    expect(premium.forbiddenContent).toBeInstanceOf(Array);

    // Verify Standard expectations
    const { standard } = testData.homepageContent;
    expect(standard.requiredRails).toBeInstanceOf(Array);
    expect(standard.forbiddenRails).toBeInstanceOf(Array);
    expect(standard.railCounts).toBeInstanceOf(Object);
    expect(standard.allowedContentTypes).toBeInstanceOf(Array);
    expect(standard.forbiddenContent).toBeInstanceOf(Array);

    // Verify Kids expectations
    const { kids } = testData.homepageContent;
    expect(kids.requiredRails).toBeInstanceOf(Array);
    expect(kids.forbiddenRails).toBeInstanceOf(Array);
    expect(kids.railCounts).toBeInstanceOf(Object);
    expect(kids.allowedContentTypes).toBeInstanceOf(Array);
    expect(kids.forbiddenContent).toBeInstanceOf(Array);
    expect(kids.allowedContent).toBeInstanceOf(Array);

    // Verify that customer types have different requirements
    expect(premium.requiredRails).not.toEqual(kids.requiredRails);
    expect(standard.requiredRails).not.toEqual(kids.requiredRails);

    // eslint-disable-next-line no-console
    console.log("Premium required rails:", premium.requiredRails);
    // eslint-disable-next-line no-console
    console.log("Standard required rails:", standard.requiredRails);
    // eslint-disable-next-line no-console
    console.log("Kids required rails:", kids.requiredRails);
  });

  test("customer type switching functionality exists (mock test)", async ({
    pageActions,
  }) => {
    await pageActions.goToHomepage();

    // This test verifies the setCustomerType method exists and runs without errors
    // Even if the actual customer type switching isn't available in the test environment

    const result = await pageActions.setCustomerType("premium");
    // eslint-disable-next-line no-console
    console.log("setCustomerType result:", result);
    // Result might be false if UI isn't available, but method should not throw
    expect(typeof result).toBe("boolean");

    // Test that the homepage still loads after attempting customer type switch
    await pageActions.validatePageLoaded();
  });

  test("validation identifies content violations correctly", async ({
    pageActions,
  }) => {
    await pageActions.goToHomepage();

    // Test with expectations that should fail
    const impossibleExpectations = {
      requiredRails: ["NonExistentRequiredRail"],
      forbiddenRails: [],
      railCounts: {
        NonExistentRail: 999,
      },
      allowedContentTypes: ["Movie"],
      forbiddenContent: [],
    };

    const validation = await pageActions.validateHomepageContent(
      "premium",
      impossibleExpectations,
    );

    // Should fail because required rail doesn't exist
    expect(validation.success).toBe(false);
    expect(validation.requiredRailsMissing).toContain(
      "NonExistentRequiredRail",
    );

    // Test with expectations that should pass
    const currentRails = await pageActions.getRailTitles();
    const passingExpectations = {
      requiredRails: currentRails.slice(0, 1), // Use first detected rail
      forbiddenRails: ["NonExistentForbiddenRail"],
      railCounts: {},
      allowedContentTypes: ["Movie", "Episode"],
      forbiddenContent: ["NonExistentContent"],
    };

    const passingValidation = await pageActions.validateHomepageContent(
      "premium",
      passingExpectations,
    );
    expect(passingValidation.success).toBe(true);
    expect(passingValidation.requiredRailsPresent.length).toBeGreaterThan(0);
  });

  test("fixture methods handle edge cases gracefully", async ({
    pageActions,
  }) => {
    await pageActions.goToHomepage();

    // Test with empty rail name
    const emptyRailCount = await pageActions.countRailItems("");
    expect(emptyRailCount).toBe(0);

    // Test with non-existent rail name
    const nonExistentRailCount = await pageActions.countRailItems(
      "ThisRailDoesNotExist",
    );
    expect(nonExistentRailCount).toBe(0);

    // Test rail titles detection returns array
    const railTitles = await pageActions.getRailTitles();
    expect(Array.isArray(railTitles)).toBe(true);

    // Test content titles detection returns array
    const contentTitles = await pageActions.getContentTitles();
    expect(Array.isArray(contentTitles)).toBe(true);

    // Test validation with minimal expectations
    const minimalExpectations = {
      requiredRails: [],
      forbiddenRails: [],
      railCounts: {},
      allowedContentTypes: [],
      forbiddenContent: [],
    };

    const validation = await pageActions.validateHomepageContent(
      "premium",
      minimalExpectations,
    );
    expect(validation.success).toBe(true); // Should pass with no requirements
  });

  test("README: How to use homepage validation fixtures", async ({
    pageActions,
  }) => {
    // This test serves as documentation for how to use the fixtures

    await pageActions.goToHomepage();

    // 1. Set customer type (if dimension controls are available)
    const customerTypeSet = await pageActions.setCustomerType("premium");
    // eslint-disable-next-line no-console
    console.log("Customer type set:", customerTypeSet);

    // 2. Get current rail titles
    const railTitles = await pageActions.getRailTitles();
    // eslint-disable-next-line no-console
    console.log("Current rail titles:", railTitles);

    // 3. Get current content titles
    const contentTitles = await pageActions.getContentTitles();
    // eslint-disable-next-line no-console
    console.log("Content titles count:", contentTitles.length);

    // 4. Count items in a specific rail
    if (railTitles.length > 0) {
      const itemCount = await pageActions.countRailItems(railTitles[0]);
      // eslint-disable-next-line no-console
      console.log(`"${railTitles[0]}" rail has ${itemCount} items`);
    }

    // 5. Validate homepage content against expectations
    const expectations = testData.homepageContent.premium;
    const validation = await pageActions.validateHomepageContent(
      "premium",
      expectations,
    );

    // eslint-disable-next-line no-console
    console.log("Validation results:", {
      success: validation.success,
      requiredRailsPresent: validation.requiredRailsPresent,
      requiredRailsMissing: validation.requiredRailsMissing,
      forbiddenRailsPresent: validation.forbiddenRailsPresent,
      railCountsActual: validation.railCountsActual,
    });

    // This test always passes - it's for documentation
    expect(true).toBe(true);
  });
});
