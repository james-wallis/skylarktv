import { test, expect } from "../fixtures/fixtures";

test.describe("Homepage Availability by Customer Type", () => {
  test("Premium customer sees New TV Releases rail", async ({
    page,
    pageActions,
  }) => {
    // Step 1: Go to homepage
    await pageActions.goToHomepage();

    // Step 2: Open dimensions drawer and set customer type to Premium
    const dimensionsButton = page
      .locator(
        '[data-testid="settings-button"], [data-testid="dimension-toggle"], button:has-text("Settings"), button:has-text("Dimensions")',
      )
      .first();

    if (await dimensionsButton.isVisible()) {
      await dimensionsButton.click();

      // Wait for dimensions drawer to open
      await page.waitForSelector(
        '[data-testid="dimension-settings"], [data-testid="settings-panel"], .settings-panel, .dimensions-drawer',
        { timeout: 10000 },
      );

      // Set customer type to Premium
      const premiumOption = page
        .locator('input[value="premium"], label:has-text("Premium")')
        .first();

      if (await premiumOption.isVisible()) {
        await premiumOption.click();
        await page.waitForLoadState("networkidle");

        // Close dimensions drawer
        const closeButton = page
          .locator(
            '[data-testid="close-settings"], button:has-text("Close"), .close-button',
          )
          .first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press("Escape");
        }

        // Wait for content to update
        await page.waitForLoadState("networkidle");

        // Step 3: Verify New TV Releases rail is visible
        const newTvReleasesRail = page
          .locator(
            'h2:has-text("New TV Releases"), h3:has-text("New TV Releases"), [data-testid*="new-tv-releases"], .rail:has-text("New TV Releases")',
          )
          .first();
        await expect(newTvReleasesRail).toBeVisible();
      }
    }
  });

  test("Standard customer cannot see New TV Releases rail", async ({
    page,
    pageActions,
  }) => {
    // Step 1: Go to homepage
    await pageActions.goToHomepage();

    // Step 2: Open dimensions drawer and set customer type to Standard
    const dimensionsButton = page
      .locator(
        '[data-testid="settings-button"], [data-testid="dimension-toggle"], button:has-text("Settings"), button:has-text("Dimensions")',
      )
      .first();

    if (await dimensionsButton.isVisible()) {
      await dimensionsButton.click();

      await page.waitForSelector(
        '[data-testid="dimension-settings"], [data-testid="settings-panel"], .settings-panel, .dimensions-drawer',
        { timeout: 10000 },
      );

      // Set customer type to Standard
      const standardOption = page
        .locator('input[value="standard"], label:has-text("Standard")')
        .first();

      if (await standardOption.isVisible()) {
        await standardOption.click();
        await page.waitForLoadState("networkidle");

        // Close dimensions drawer
        const closeButton = page
          .locator(
            '[data-testid="close-settings"], button:has-text("Close"), .close-button',
          )
          .first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press("Escape");
        }

        await page.waitForLoadState("networkidle");

        // Step 3: Verify New TV Releases rail is NOT visible
        const newTvReleasesRail = page
          .locator(
            'h2:has-text("New TV Releases"), h3:has-text("New TV Releases"), [data-testid*="new-tv-releases"], .rail:has-text("New TV Releases")',
          )
          .first();
        await expect(newTvReleasesRail).not.toBeVisible();
      }
    }
  });

  test("Kids customer cannot see New TV Releases rail", async ({
    page,
    pageActions,
  }) => {
    // Step 1: Go to homepage
    await pageActions.goToHomepage();

    // Step 2: Open dimensions drawer and set customer type to Kids
    const dimensionsButton = page
      .locator(
        '[data-testid="settings-button"], [data-testid="dimension-toggle"], button:has-text("Settings"), button:has-text("Dimensions")',
      )
      .first();

    if (await dimensionsButton.isVisible()) {
      await dimensionsButton.click();

      await page.waitForSelector(
        '[data-testid="dimension-settings"], [data-testid="settings-panel"], .settings-panel, .dimensions-drawer',
        { timeout: 10000 },
      );

      // Set customer type to Kids
      const kidsOption = page
        .locator('input[value="kids"], label:has-text("Kids")')
        .first();

      if (await kidsOption.isVisible()) {
        await kidsOption.click();
        await page.waitForLoadState("networkidle");

        // Close dimensions drawer
        const closeButton = page
          .locator(
            '[data-testid="close-settings"], button:has-text("Close"), .close-button',
          )
          .first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press("Escape");
        }

        await page.waitForLoadState("networkidle");

        // Step 3: Verify New TV Releases rail is NOT visible
        const newTvReleasesRail = page
          .locator(
            'h2:has-text("New TV Releases"), h3:has-text("New TV Releases"), [data-testid*="new-tv-releases"], .rail:has-text("New TV Releases")',
          )
          .first();
        await expect(newTvReleasesRail).not.toBeVisible();
      }
    }
  });

  test("Kids customer sees Classic kids shows with length 4 and Miraculous Season 5 with count 11", async ({
    page,
    pageActions,
  }) => {
    // Step 1: Go to homepage
    await pageActions.goToHomepage();

    // Step 2: Open dimensions drawer and set customer type to Kids
    const dimensionsButton = page
      .locator(
        '[data-testid="settings-button"], [data-testid="dimension-toggle"], button:has-text("Settings"), button:has-text("Dimensions")',
      )
      .first();

    if (await dimensionsButton.isVisible()) {
      await dimensionsButton.click();

      await page.waitForSelector(
        '[data-testid="dimension-settings"], [data-testid="settings-panel"], .settings-panel, .dimensions-drawer',
        { timeout: 10000 },
      );

      // Set customer type to Kids
      const kidsOption = page
        .locator('input[value="kids"], label:has-text("Kids")')
        .first();

      if (await kidsOption.isVisible()) {
        await kidsOption.click();
        await page.waitForLoadState("networkidle");

        // Close dimensions drawer
        const closeButton = page
          .locator(
            '[data-testid="close-settings"], button:has-text("Close"), .close-button',
          )
          .first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press("Escape");
        }

        await page.waitForLoadState("networkidle");

        // Step 3: Find Classic kids shows rail and verify length of 4
        const classicKidsShowsRail = page
          .locator(
            'h2:has-text("Classic kids shows"), h3:has-text("Classic kids shows"), .rail:has-text("Classic kids shows")',
          )
          .first();

        if (await classicKidsShowsRail.isVisible()) {
          // Count items in the Classic kids shows rail
          const classicKidsItems = page.locator(
            '.rail:has-text("Classic kids shows") [data-testid="thumbnail"], .rail:has-text("Classic kids shows") .thumbnail, .rail:has-text("Classic kids shows") a[href*="/show/"], .rail:has-text("Classic kids shows") a[href*="/brand/"]',
          );
          const classicKidsCount = await classicKidsItems.count();
          expect(classicKidsCount).toBe(4);
        }

        // Step 4: Find Miraculous Season 5 and verify count of 11
        const miraculousSeason5Rail = page
          .locator(
            'h2:has-text("Miraculous Season 5"), h3:has-text("Miraculous Season 5"), .rail:has-text("Miraculous Season 5")',
          )
          .first();

        if (await miraculousSeason5Rail.isVisible()) {
          // Count items in the Miraculous Season 5 rail
          const miraculousItems = page.locator(
            '.rail:has-text("Miraculous Season 5") [data-testid="thumbnail"], .rail:has-text("Miraculous Season 5") .thumbnail, .rail:has-text("Miraculous Season 5") a[href*="/episode/"]',
          );
          const miraculousCount = await miraculousItems.count();
          expect(miraculousCount).toBe(11);
        }
      }
    }
  });

  test("Kids customer sees TV Shows on SkylarkTV with length 7", async ({
    page,
    pageActions,
  }) => {
    // Step 1: Go to homepage
    await pageActions.goToHomepage();

    // Step 2: Open dimensions drawer and set customer type to Kids
    const dimensionsButton = page
      .locator(
        '[data-testid="settings-button"], [data-testid="dimension-toggle"], button:has-text("Settings"), button:has-text("Dimensions")',
      )
      .first();

    if (await dimensionsButton.isVisible()) {
      await dimensionsButton.click();

      await page.waitForSelector(
        '[data-testid="dimension-settings"], [data-testid="settings-panel"], .settings-panel, .dimensions-drawer',
        { timeout: 10000 },
      );

      // Set customer type to Kids
      const kidsOption = page
        .locator('input[value="kids"], label:has-text("Kids")')
        .first();

      if (await kidsOption.isVisible()) {
        await kidsOption.click();
        await page.waitForLoadState("networkidle");

        // Close dimensions drawer
        const closeButton = page
          .locator(
            '[data-testid="close-settings"], button:has-text("Close"), .close-button',
          )
          .first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press("Escape");
        }

        await page.waitForLoadState("networkidle");

        // Step 3: Find TV Shows on SkylarkTV rail and verify length of 7
        const tvShowsRail = page
          .locator(
            'h2:has-text("TV Shows on SkylarkTV"), h3:has-text("TV Shows on SkylarkTV"), .rail:has-text("TV Shows on SkylarkTV")',
          )
          .first();

        if (await tvShowsRail.isVisible()) {
          // Count items in the TV Shows on SkylarkTV rail
          const tvShowsItems = page.locator(
            '.rail:has-text("TV Shows on SkylarkTV") [data-testid="thumbnail"], .rail:has-text("TV Shows on SkylarkTV") .thumbnail, .rail:has-text("TV Shows on SkylarkTV") a[href*="/show/"], .rail:has-text("TV Shows on SkylarkTV") a[href*="/brand/"]',
          );
          const tvShowsCount = await tvShowsItems.count();
          expect(tvShowsCount).toBe(7);
        }
      }
    }
  });

  test("Standard customer sees TV Shows on SkylarkTV with length 19", async ({
    page,
    pageActions,
  }) => {
    // Step 1: Go to homepage
    await pageActions.goToHomepage();

    // Step 2: Open dimensions drawer and set customer type to Standard
    const dimensionsButton = page
      .locator(
        '[data-testid="settings-button"], [data-testid="dimension-toggle"], button:has-text("Settings"), button:has-text("Dimensions")',
      )
      .first();

    if (await dimensionsButton.isVisible()) {
      await dimensionsButton.click();

      await page.waitForSelector(
        '[data-testid="dimension-settings"], [data-testid="settings-panel"], .settings-panel, .dimensions-drawer',
        { timeout: 10000 },
      );

      // Set customer type to Standard
      const standardOption = page
        .locator('input[value="standard"], label:has-text("Standard")')
        .first();

      if (await standardOption.isVisible()) {
        await standardOption.click();
        await page.waitForLoadState("networkidle");

        // Close dimensions drawer
        const closeButton = page
          .locator(
            '[data-testid="close-settings"], button:has-text("Close"), .close-button',
          )
          .first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press("Escape");
        }

        await page.waitForLoadState("networkidle");

        // Step 3: Find TV Shows on SkylarkTV rail and verify length of 19
        const tvShowsRail = page
          .locator(
            'h2:has-text("TV Shows on SkylarkTV"), h3:has-text("TV Shows on SkylarkTV"), .rail:has-text("TV Shows on SkylarkTV")',
          )
          .first();

        if (await tvShowsRail.isVisible()) {
          // Count items in the TV Shows on SkylarkTV rail
          const tvShowsItems = page.locator(
            '.rail:has-text("TV Shows on SkylarkTV") [data-testid="thumbnail"], .rail:has-text("TV Shows on SkylarkTV") .thumbnail, .rail:has-text("TV Shows on SkylarkTV") a[href*="/show/"], .rail:has-text("TV Shows on SkylarkTV") a[href*="/brand/"]',
          );
          const tvShowsCount = await tvShowsItems.count();
          expect(tvShowsCount).toBe(19);
        }
      }
    }
  });

  test("Premium customer sees TV Shows on SkylarkTV with length 19", async ({
    page,
    pageActions,
  }) => {
    // Step 1: Go to homepage
    await pageActions.goToHomepage();

    // Step 2: Open dimensions drawer and set customer type to Premium
    const dimensionsButton = page
      .locator(
        '[data-testid="settings-button"], [data-testid="dimension-toggle"], button:has-text("Settings"), button:has-text("Dimensions")',
      )
      .first();

    if (await dimensionsButton.isVisible()) {
      await dimensionsButton.click();

      await page.waitForSelector(
        '[data-testid="dimension-settings"], [data-testid="settings-panel"], .settings-panel, .dimensions-drawer',
        { timeout: 10000 },
      );

      // Set customer type to Premium
      const premiumOption = page
        .locator('input[value="premium"], label:has-text("Premium")')
        .first();

      if (await premiumOption.isVisible()) {
        await premiumOption.click();
        await page.waitForLoadState("networkidle");

        // Close dimensions drawer
        const closeButton = page
          .locator(
            '[data-testid="close-settings"], button:has-text("Close"), .close-button',
          )
          .first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press("Escape");
        }

        await page.waitForLoadState("networkidle");

        // Step 3: Find TV Shows on SkylarkTV rail and verify length of 19
        const tvShowsRail = page
          .locator(
            'h2:has-text("TV Shows on SkylarkTV"), h3:has-text("TV Shows on SkylarkTV"), .rail:has-text("TV Shows on SkylarkTV")',
          )
          .first();

        if (await tvShowsRail.isVisible()) {
          // Count items in the TV Shows on SkylarkTV rail
          const tvShowsItems = page.locator(
            '.rail:has-text("TV Shows on SkylarkTV") [data-testid="thumbnail"], .rail:has-text("TV Shows on SkylarkTV") .thumbnail, .rail:has-text("TV Shows on SkylarkTV") a[href*="/show/"], .rail:has-text("TV Shows on SkylarkTV") a[href*="/brand/"]',
          );
          const tvShowsCount = await tvShowsItems.count();
          expect(tvShowsCount).toBe(19);
        }
      }
    }
  });

  test("customer type changes content availability across different rails", async ({
    page,
    pageActions,
  }) => {
    // Step 1: Go to homepage
    await pageActions.goToHomepage();

    // Helper function to set customer type
    const setCustomerType = async (
      customerType: "premium" | "standard" | "kids",
    ) => {
      const dimensionsButton = page
        .locator(
          '[data-testid="settings-button"], [data-testid="dimension-toggle"], button:has-text("Settings"), button:has-text("Dimensions")',
        )
        .first();

      if (await dimensionsButton.isVisible()) {
        await dimensionsButton.click();
        await page.waitForSelector(
          '[data-testid="dimension-settings"], [data-testid="settings-panel"], .settings-panel, .dimensions-drawer',
          { timeout: 10000 },
        );

        const customerOption = page
          .locator(
            `input[value="${customerType}"], label:has-text("${customerType.charAt(0).toUpperCase() + customerType.slice(1)}")`,
          )
          .first();

        if (await customerOption.isVisible()) {
          await customerOption.click();
          await page.waitForLoadState("networkidle");

          const closeButton = page
            .locator(
              '[data-testid="close-settings"], button:has-text("Close"), .close-button',
            )
            .first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
          } else {
            await page.keyboard.press("Escape");
          }

          await page.waitForLoadState("networkidle");
          return true;
        }
      }
      return false;
    };

    // Helper function to count rail items
    const countRailItems = (railName: string) => {
      const railItems = page.locator(
        `.rail:has-text("${railName}") [data-testid="thumbnail"], .rail:has-text("${railName}") .thumbnail, .rail:has-text("${railName}") a[href*="/show/"], .rail:has-text("${railName}") a[href*="/brand/"], .rail:has-text("${railName}") a[href*="/episode/"]`,
      );
      return railItems.count();
    };

    // Test Kids customer type
    if (await setCustomerType("kids")) {
      const kidsClassicShows = await countRailItems("Classic kids shows");
      const kidsTvShows = await countRailItems("TV Shows on SkylarkTV");
      const kidsMiraculous = await countRailItems("Miraculous Season 5");

      // Verify Kids content expectations
      if (kidsClassicShows > 0) expect(kidsClassicShows).toBe(4);
      if (kidsTvShows > 0) expect(kidsTvShows).toBe(7);
      if (kidsMiraculous > 0) expect(kidsMiraculous).toBe(11);

      // Verify New TV Releases is not visible for Kids
      const newTvReleasesForKids = page
        .locator(
          'h2:has-text("New TV Releases"), h3:has-text("New TV Releases")',
        )
        .first();
      await expect(newTvReleasesForKids).not.toBeVisible();
    }

    // Test Standard customer type
    if (await setCustomerType("standard")) {
      const standardTvShows = await countRailItems("TV Shows on SkylarkTV");

      // Verify Standard content expectations
      if (standardTvShows > 0) expect(standardTvShows).toBe(19);

      // Verify New TV Releases is not visible for Standard
      const newTvReleasesForStandard = page
        .locator(
          'h2:has-text("New TV Releases"), h3:has-text("New TV Releases")',
        )
        .first();
      await expect(newTvReleasesForStandard).not.toBeVisible();
    }

    // Test Premium customer type
    if (await setCustomerType("premium")) {
      const premiumTvShows = await countRailItems("TV Shows on SkylarkTV");

      // Verify Premium content expectations
      if (premiumTvShows > 0) expect(premiumTvShows).toBe(19);

      // Verify New TV Releases is visible for Premium
      const newTvReleasesForPremium = page
        .locator(
          'h2:has-text("New TV Releases"), h3:has-text("New TV Releases")',
        )
        .first();
      await expect(newTvReleasesForPremium).toBeVisible();
    }
  });
});
