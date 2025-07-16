import { test, expect, testData } from "../fixtures/fixtures";

test.describe("Homepage Content Validation by Customer Type", () => {
  test("Premium customers see correct rails and content with no kids content leakage", async ({
    pageActions,
  }) => {
    // Step 1: Go to homepage and set Premium customer type
    await pageActions.goToHomepage();
    await pageActions.setCustomerType("premium");

    // Step 2: Validate homepage content using fixtures
    const validation = await pageActions.validateHomepageContent(
      "premium",
      testData.homepageContent.premium,
    );

    // Step 3: Assert validation results
    expect(validation.success).toBe(true);

    // Check that all required rails are present
    expect(validation.requiredRailsMissing).toHaveLength(0);
    for (const requiredRail of testData.homepageContent.premium.requiredRails) {
      expect(validation.requiredRailsPresent).toContain(requiredRail);
    }

    // Check that no forbidden rails are present
    expect(validation.forbiddenRailsPresent).toHaveLength(0);

    // Check that no forbidden (kids) content is present
    expect(validation.forbiddenContentPresent).toHaveLength(0);

    // Check rail counts are correct
    for (const [, isCorrect] of Object.entries(validation.railCountsCorrect)) {
      expect(isCorrect).toBe(true);
    }

    // Log results for debugging if needed
    if (!validation.success) {
      // eslint-disable-next-line no-console
      console.log("Premium validation failed:", {
        requiredRailsMissing: validation.requiredRailsMissing,
        forbiddenRailsPresent: validation.forbiddenRailsPresent,
        forbiddenContentPresent: validation.forbiddenContentPresent,
        railCountsActual: validation.railCountsActual,
      });
    }
  });

  test("Standard customers see correct rails and content with no premium or kids content leakage", async ({
    pageActions,
  }) => {
    // Step 1: Go to homepage and set Standard customer type
    await pageActions.goToHomepage();
    await pageActions.setCustomerType("standard");

    // Step 2: Validate homepage content using fixtures
    const validation = await pageActions.validateHomepageContent(
      "standard",
      testData.homepageContent.standard,
    );

    // Step 3: Assert validation results
    expect(validation.success).toBe(true);

    // Check that all required rails are present
    expect(validation.requiredRailsMissing).toHaveLength(0);
    for (const requiredRail of testData.homepageContent.standard
      .requiredRails) {
      expect(validation.requiredRailsPresent).toContain(requiredRail);
    }

    // Check that no forbidden rails are present (including premium-only and kids-only)
    expect(validation.forbiddenRailsPresent).toHaveLength(0);

    // Check that no forbidden content is present (premium-only or kids-only)
    expect(validation.forbiddenContentPresent).toHaveLength(0);

    // Check rail counts are correct
    for (const [, isCorrect] of Object.entries(validation.railCountsCorrect)) {
      expect(isCorrect).toBe(true);
    }

    // Log results for debugging if needed
    if (!validation.success) {
      // eslint-disable-next-line no-console
      console.log("Standard validation failed:", {
        requiredRailsMissing: validation.requiredRailsMissing,
        forbiddenRailsPresent: validation.forbiddenRailsPresent,
        forbiddenContentPresent: validation.forbiddenContentPresent,
        railCountsActual: validation.railCountsActual,
      });
    }
  });

  test("Kids customers see correct rails and content with no adult content leakage", async ({
    pageActions,
  }) => {
    // Step 1: Go to homepage and set Kids customer type
    await pageActions.goToHomepage();
    await pageActions.setCustomerType("kids");

    // Step 2: Validate homepage content using fixtures
    const validation = await pageActions.validateHomepageContent(
      "kids",
      testData.homepageContent.kids,
    );

    // Step 3: Assert validation results
    expect(validation.success).toBe(true);

    // Check that all required rails are present
    expect(validation.requiredRailsMissing).toHaveLength(0);
    for (const requiredRail of testData.homepageContent.kids.requiredRails) {
      expect(validation.requiredRailsPresent).toContain(requiredRail);
    }

    // Check that no forbidden rails are present (adult content rails)
    expect(validation.forbiddenRailsPresent).toHaveLength(0);

    // Check that no forbidden (adult) content is present
    expect(validation.forbiddenContentPresent).toHaveLength(0);

    // Check that some allowed kids content is present
    expect(validation.allowedContentPresent.length).toBeGreaterThan(0);

    // Check rail counts are correct
    for (const [, isCorrect] of Object.entries(validation.railCountsCorrect)) {
      expect(isCorrect).toBe(true);
    }

    // Log results for debugging if needed
    if (!validation.success) {
      // eslint-disable-next-line no-console
      console.log("Kids validation failed:", {
        requiredRailsMissing: validation.requiredRailsMissing,
        forbiddenRailsPresent: validation.forbiddenRailsPresent,
        forbiddenContentPresent: validation.forbiddenContentPresent,
        allowedContentPresent: validation.allowedContentPresent,
        railCountsActual: validation.railCountsActual,
      });
    }
  });

  test("Premium customer type has exact rail counts as defined in fixtures", async ({
    pageActions,
  }) => {
    await pageActions.goToHomepage();
    await pageActions.setCustomerType("premium");

    // Check specific rail counts
    const tvShowsCount = await pageActions.countRailItems(
      "TV Shows on SkylarkTV",
    );
    expect(tvShowsCount).toBe(
      testData.homepageContent.premium.railCounts["TV Shows on SkylarkTV"],
    );

    const newTvReleasesCount =
      await pageActions.countRailItems("New TV Releases");
    const newTvReleasesExpected =
      testData.homepageContent.premium.railCounts["New TV Releases"];
    if (typeof newTvReleasesExpected === "object") {
      expect(newTvReleasesCount).toBeGreaterThanOrEqual(
        newTvReleasesExpected.min,
      );
      expect(newTvReleasesCount).toBeLessThanOrEqual(newTvReleasesExpected.max);
    }
  });

  test("Standard customer type has exact rail counts as defined in fixtures", async ({
    pageActions,
  }) => {
    await pageActions.goToHomepage();
    await pageActions.setCustomerType("standard");

    // Check specific rail counts
    const tvShowsCount = await pageActions.countRailItems(
      "TV Shows on SkylarkTV",
    );
    expect(tvShowsCount).toBe(
      testData.homepageContent.standard.railCounts["TV Shows on SkylarkTV"],
    );

    // Verify New TV Releases rail is not present
    const newTvReleasesCount =
      await pageActions.countRailItems("New TV Releases");
    expect(newTvReleasesCount).toBe(0);
  });

  test("Kids customer type has exact rail counts as defined in fixtures", async ({
    pageActions,
  }) => {
    await pageActions.goToHomepage();
    await pageActions.setCustomerType("kids");

    // Check specific rail counts
    const tvShowsCount = await pageActions.countRailItems(
      "TV Shows on SkylarkTV",
    );
    expect(tvShowsCount).toBe(
      testData.homepageContent.kids.railCounts["TV Shows on SkylarkTV"],
    );

    const classicKidsCount =
      await pageActions.countRailItems("Classic kids shows");
    expect(classicKidsCount).toBe(
      testData.homepageContent.kids.railCounts["Classic kids shows"],
    );

    const miraculousCount = await pageActions.countRailItems(
      "Miraculous Season 5",
    );
    expect(miraculousCount).toBe(
      testData.homepageContent.kids.railCounts["Miraculous Season 5"],
    );

    // Verify adult rails are not present
    const featuredMoviesCount =
      await pageActions.countRailItems("Featured Movies");
    expect(featuredMoviesCount).toBe(0);
  });

  test("No content leakage when switching between customer types", async ({
    pageActions,
  }) => {
    await pageActions.goToHomepage();

    // Test Premium first
    await pageActions.setCustomerType("premium");
    const premiumRails = await pageActions.getRailTitles();
    const premiumContent = await pageActions.getContentTitles();

    // Verify Premium has adult content but not kids content
    expect(premiumRails.some((rail) => rail.includes("New TV Releases"))).toBe(
      true,
    );
    expect(
      premiumRails.some((rail) => rail.includes("Classic kids shows")),
    ).toBe(false);
    expect(
      premiumContent.some((content) => content.includes("Teletubbies")),
    ).toBe(false);

    // Switch to Kids
    await pageActions.setCustomerType("kids");
    const kidsRails = await pageActions.getRailTitles();
    const kidsContent = await pageActions.getContentTitles();

    // Verify Kids has kids content but not adult content
    expect(kidsRails.some((rail) => rail.includes("Classic kids shows"))).toBe(
      true,
    );
    expect(kidsRails.some((rail) => rail.includes("New TV Releases"))).toBe(
      false,
    );
    expect(
      kidsContent.some((content) => content.includes("The Dark Knight")),
    ).toBe(false);

    // Switch to Standard
    await pageActions.setCustomerType("standard");
    const standardRails = await pageActions.getRailTitles();
    const standardContent = await pageActions.getContentTitles();

    // Verify Standard has neither premium-only nor kids-only content
    expect(standardRails.some((rail) => rail.includes("New TV Releases"))).toBe(
      false,
    );
    expect(
      standardRails.some((rail) => rail.includes("Classic kids shows")),
    ).toBe(false);
    expect(
      standardContent.some((content) => content.includes("Teletubbies")),
    ).toBe(false);
  });

  test("Rail titles are properly detected and categorized", async ({
    pageActions,
  }) => {
    await pageActions.goToHomepage();
    await pageActions.setCustomerType("premium");

    // Get all rail titles
    const railTitles = await pageActions.getRailTitles();

    // Should have some rail titles
    expect(railTitles.length).toBeGreaterThan(0);

    // Check that required premium rails are in the list
    for (const requiredRail of testData.homepageContent.premium.requiredRails) {
      const hasRail = railTitles.some((title) => title.includes(requiredRail));
      expect(hasRail).toBe(true);
    }

    // Check that forbidden rails are not in the list
    for (const forbiddenRail of testData.homepageContent.premium
      .forbiddenRails) {
      const hasRail = railTitles.some((title) => title.includes(forbiddenRail));
      expect(hasRail).toBe(false);
    }
  });

  test("Content titles are properly detected and filtered", async ({
    pageActions,
  }) => {
    await pageActions.goToHomepage();
    await pageActions.setCustomerType("kids");

    // Get all content titles
    const contentTitles = await pageActions.getContentTitles();

    // Should have some content titles
    expect(contentTitles.length).toBeGreaterThan(0);

    // Check that some allowed kids content is present
    let hasAllowedContent = false;
    for (const allowedContent of testData.homepageContent.kids.allowedContent) {
      if (contentTitles.some((title) => title.includes(allowedContent))) {
        hasAllowedContent = true;
        break;
      }
    }
    expect(hasAllowedContent).toBe(true);

    // Check that forbidden adult content is not present
    for (const forbiddenContent of testData.homepageContent.kids
      .forbiddenContent) {
      const hasForbiddenContent = contentTitles.some((title) =>
        title.includes(forbiddenContent),
      );
      expect(hasForbiddenContent).toBe(false);
    }
  });

  test("Validation fixture correctly identifies content violations", async ({
    pageActions,
  }) => {
    await pageActions.goToHomepage();

    // Test each customer type validation
    const customerTypes: ("premium" | "standard" | "kids")[] = [
      "premium",
      "standard",
      "kids",
    ];

    for (const customerType of customerTypes) {
      await pageActions.setCustomerType(customerType);
      const validation = await pageActions.validateHomepageContent(
        customerType,
        testData.homepageContent[customerType],
      );

      // Validation should succeed for proper customer type content
      expect(validation.success).toBe(true);

      // Should have some required rails present
      expect(validation.requiredRailsPresent.length).toBeGreaterThan(0);

      // Should have no forbidden rails present
      expect(validation.forbiddenRailsPresent.length).toBe(0);

      // Should have no forbidden content present
      expect(validation.forbiddenContentPresent.length).toBe(0);

      // Rail counts should be within expected ranges
      for (const [, isCorrect] of Object.entries(
        validation.railCountsCorrect,
      )) {
        expect(isCorrect).toBe(true);
      }
    }
  });
});
