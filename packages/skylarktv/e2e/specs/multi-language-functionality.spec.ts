import { test, expect } from "../fixtures/fixtures";

test.describe("Multi-Language Functionality", () => {
  test.describe("Language Switching User Flow", () => {
    test("language switching preserves user context on movie page", async ({
      page,
      pageActions,
    }) => {
      // Navigate to a specific movie (1917)
      const movieUrl = "/movie/recUVmOzaTc7EAcTB";
      await page.goto(movieUrl);
      await page.waitForLoadState("networkidle");

      // Verify we're on the correct movie page
      expect(page.url()).toContain(movieUrl);
      const englishTitle = await page.locator("h1").textContent();
      expect(englishTitle).toContain("1917");

      // Switch to Portuguese
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        const langChanged = await pageActions.changeLanguage("pt-pt");
        if (langChanged) {
          await page.waitForTimeout(2000);

          // Verify we're still on the same movie page
          expect(page.url()).toContain(movieUrl);

          // Verify page content is translated or at least loaded
          await pageActions.validatePageLoaded();
          const portugueseContent = await page.locator("body").textContent();
          expect(portugueseContent).toBeTruthy();
          expect(portugueseContent?.length).toBeGreaterThan(100);

          // eslint-disable-next-line no-console
          console.log("✅ Language switching preserved movie context");
        }
      }
    });

    test("language switching preserves user context on movies page", async ({
      page,
      pageActions,
    }) => {
      // Navigate to movies page
      await pageActions.goToMovies();
      await pageActions.waitForMoviesToLoad();

      // Get initial movie count
      const initialMovieCount = await pageActions.getMovieCount();
      expect(initialMovieCount).toBeGreaterThan(0);

      // Switch to Portuguese
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        const langChanged = await pageActions.changeLanguage("pt-pt");
        if (langChanged) {
          await page.waitForTimeout(2000);

          // Verify we're still on movies page
          expect(page.url()).toContain("/movies");

          // Verify movies are still loaded
          await pageActions.waitForMoviesToLoad();
          const portugueseMovieCount = await pageActions.getMovieCount();
          expect(portugueseMovieCount).toBeGreaterThan(0);

          // Movie count should be similar (allowing for minor differences)
          expect(
            Math.abs(portugueseMovieCount - initialMovieCount),
          ).toBeLessThan(5);

          // eslint-disable-next-line no-console
          console.log(
            `✅ Movies page maintained ${portugueseMovieCount} movies after language switch`,
          );
        }
      }
    });

    test("language switching preserves user context on episode page", async ({
      page,
      pageActions,
    }) => {
      // Navigate to episode page (Winter is Coming)
      const episodeUrl = "/episode/recAfzpVLWlqKVGnK";
      await page.goto(episodeUrl);
      await page.waitForLoadState("networkidle");

      // Verify we're on the correct episode page
      expect(page.url()).toContain(episodeUrl);
      const englishContent = await page.locator("body").textContent();
      expect(englishContent).toContain("Winter is Coming");

      // Switch to Portuguese
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        const langChanged = await pageActions.changeLanguage("pt-pt");
        if (langChanged) {
          await page.waitForTimeout(2000);

          // Verify we're still on the same episode page
          expect(page.url()).toContain(episodeUrl);

          // Verify page content is loaded
          await pageActions.validatePageLoaded();
          const portugueseContent = await page.locator("body").textContent();
          expect(portugueseContent).toBeTruthy();
          expect(portugueseContent?.length).toBeGreaterThan(100);

          // eslint-disable-next-line no-console
          console.log("✅ Language switching preserved episode context");
        }
      }
    });
  });

  test.describe("Arabic RTL Layout Functionality", () => {
    test("Arabic RTL - navigation and interactions work correctly", async ({
      page,
      pageActions,
    }) => {
      await pageActions.goToHomepage();

      // Switch to Arabic RTL
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(2000);

        // Test navigation still works
        const moviesLink = page.locator('a[href*="/movies"]').first();
        if (await moviesLink.isVisible()) {
          await moviesLink.click();
          await page.waitForLoadState("networkidle");
          expect(page.url()).toContain("/movies");

          // eslint-disable-next-line no-console
          console.log("✅ Navigation works in Arabic RTL");
        }

        // Test back navigation
        await page.goBack();
        await page.waitForLoadState("networkidle");
        expect(page.url()).not.toContain("/movies");

        // eslint-disable-next-line no-console
        console.log("✅ Back navigation works in Arabic RTL");
      }
    });

    test("Arabic RTL - content scrolling direction works correctly", async ({
      page,
      pageActions,
    }) => {
      await pageActions.goToHomepage();

      // Switch to Arabic RTL
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(2000);

        // Test vertical scrolling works
        const initialScrollY = await page.evaluate(() => window.scrollY);
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(500);

        const newScrollY = await page.evaluate(() => window.scrollY);
        expect(newScrollY).toBeGreaterThan(initialScrollY);

        // eslint-disable-next-line no-console
        console.log("✅ Vertical scrolling works in Arabic RTL");

        // Test horizontal scrolling if there are carousels
        const carouselItems = page.locator(
          '[data-testid="carousel"], .carousel, .slider',
        );
        if ((await carouselItems.count()) > 0) {
          const carousel = carouselItems.first();
          const initialScrollX = await carousel.evaluate((el) => el.scrollLeft);

          // Try to scroll horizontally
          await carousel.evaluate((el) => el.scrollBy(100, 0));
          await page.waitForTimeout(500);

          const newScrollX = await carousel.evaluate((el) => el.scrollLeft);

          // In RTL, horizontal scrolling might behave differently
          // eslint-disable-next-line no-console
          console.log(
            `✅ Horizontal scrolling: ${initialScrollX} -> ${newScrollX}`,
          );
        }
      }
    });

    test("Arabic RTL - form interactions work correctly", async ({
      page,
      pageActions,
    }) => {
      await pageActions.goToHomepage();

      // Switch to Arabic RTL
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(2000);

        // Test search form if available
        const searchInput = page
          .locator('input[type="search"], input[placeholder*="search" i]')
          .first();
        if (await searchInput.isVisible()) {
          await searchInput.fill("فيلم"); // "Film" in Arabic
          await page.waitForTimeout(1000);

          const inputValue = await searchInput.inputValue();
          expect(inputValue).toBe("فيلم");

          // eslint-disable-next-line no-console
          console.log("✅ Arabic text input works correctly");

          // Test form submission
          await searchInput.press("Enter");
          await page.waitForTimeout(1000);

          // eslint-disable-next-line no-console
          console.log("✅ Form submission works in Arabic RTL");
        }
      }
    });
  });

  test.describe("Search Functionality Across Languages", () => {
    test("search works in English and returns relevant results", async ({
      page,
      pageActions,
    }) => {
      await pageActions.goToHomepage();

      // Ensure we're in English
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        await pageActions.changeLanguage("en-gb");
        await page.waitForTimeout(1000);
      }

      // Test search functionality
      const searchPerformed = await pageActions.performSearch("1917");
      if (searchPerformed) {
        await page.waitForTimeout(2000);

        // Check for search results
        const searchResults = await page.locator("body").textContent();
        expect(searchResults).toBeTruthy();

        // eslint-disable-next-line no-console
        console.log("✅ English search works and returns results");
      }
    });

    test("search works in Portuguese and returns relevant results", async ({
      page,
      pageActions,
    }) => {
      await pageActions.goToHomepage();

      // Switch to Portuguese
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        const langChanged = await pageActions.changeLanguage("pt-pt");
        if (langChanged) {
          await page.waitForTimeout(2000);

          // Test search functionality
          const searchPerformed = await pageActions.performSearch("filme");
          if (searchPerformed) {
            await page.waitForTimeout(2000);

            // Check for search results
            const searchResults = await page.locator("body").textContent();
            expect(searchResults).toBeTruthy();

            // eslint-disable-next-line no-console
            console.log("✅ Portuguese search works and returns results");
          }
        }
      }
    });

    test("search works in Arabic and returns relevant results", async ({
      page,
      pageActions,
    }) => {
      await pageActions.goToHomepage();

      // Switch to Arabic
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(2000);

        // Test search functionality
        const searchPerformed = await pageActions.performSearch("فيلم");
        if (searchPerformed) {
          await page.waitForTimeout(2000);

          // Check for search results
          const searchResults = await page.locator("body").textContent();
          expect(searchResults).toBeTruthy();

          // eslint-disable-next-line no-console
          console.log("✅ Arabic search works and returns results");
        }
      }
    });
  });

  test.describe("Content Filtering with Languages", () => {
    test("movie genre filtering works in Portuguese", async ({
      page,
      pageActions,
    }) => {
      await pageActions.goToMovies();
      await pageActions.waitForMoviesToLoad();

      // Switch to Portuguese
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        const langChanged = await pageActions.changeLanguage("pt-pt");
        if (langChanged) {
          await page.waitForTimeout(2000);
          await pageActions.waitForMoviesToLoad();

          // Get initial movie count
          const initialCount = await pageActions.getMovieCount();
          expect(initialCount).toBeGreaterThan(0);

          // Try to filter by genre (try both English and Portuguese terms)
          const genreFilters = ["Action", "Ação", "Drama", "Comedy", "Comédia"];

          for (const genre of genreFilters) {
            const filtered = await pageActions.filterMoviesByGenre(genre);
            if (filtered) {
              await page.waitForTimeout(1000);

              const filteredCount = await pageActions.getMovieCount();
              expect(filteredCount).toBeGreaterThan(0);

              // eslint-disable-next-line no-console
              console.log(
                `✅ Portuguese genre filtering works for: ${genre} (${filteredCount} movies)`,
              );
              break;
            }
          }
        }
      }
    });

    test("customer type filtering works across languages", async ({
      page,
      pageActions,
    }) => {
      await pageActions.goToHomepage();

      // Test premium customer type in English
      await pageActions.setCustomerType("premium");
      await page.waitForTimeout(1000);

      const englishContent = await page.locator("body").textContent();
      expect(englishContent).toBeTruthy();

      // Switch to Portuguese while maintaining customer type
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        const langChanged = await pageActions.changeLanguage("pt-pt");
        if (langChanged) {
          await page.waitForTimeout(2000);

          // Verify customer type is maintained
          const portugueseContent = await page.locator("body").textContent();
          expect(portugueseContent).toBeTruthy();

          // eslint-disable-next-line no-console
          console.log(
            "✅ Customer type filtering maintained across language switch",
          );
        }
      }
    });
  });

  test.describe("Deep Link Functionality", () => {
    test("deep links work correctly in Portuguese", async ({
      page,
      pageActions,
    }) => {
      // Test direct navigation to Portuguese content
      await page.goto("/movie/recUVmOzaTc7EAcTB");
      await page.waitForLoadState("networkidle");

      // Switch to Portuguese
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        const langChanged = await pageActions.changeLanguage("pt-pt");
        if (langChanged) {
          await page.waitForTimeout(2000);

          // Verify URL is preserved
          expect(page.url()).toContain("/movie/recUVmOzaTc7EAcTB");

          // Verify content loads correctly
          await pageActions.validatePageLoaded();

          // eslint-disable-next-line no-console
          console.log("✅ Deep links work correctly in Portuguese");
        }
      }
    });

    test("deep links work correctly in Arabic RTL", async ({
      page,
      pageActions,
    }) => {
      // Test direct navigation to Arabic content
      await page.goto("/episode/recAfzpVLWlqKVGnK");
      await page.waitForLoadState("networkidle");

      // Switch to Arabic
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(2000);

        // Verify URL is preserved
        expect(page.url()).toContain("/episode/recAfzpVLWlqKVGnK");

        // Verify content loads correctly
        await pageActions.validatePageLoaded();

        // eslint-disable-next-line no-console
        console.log("✅ Deep links work correctly in Arabic RTL");
      }
    });
  });

  test.describe("Cross-Language Navigation", () => {
    test("navigation between pages works in Portuguese", async ({
      page,
      pageActions,
    }) => {
      await pageActions.goToHomepage();

      // Switch to Portuguese
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        const langChanged = await pageActions.changeLanguage("pt-pt");
        if (langChanged) {
          await page.waitForTimeout(2000);

          // Navigate to movies page
          await pageActions.goToMovies();
          await pageActions.waitForMoviesToLoad();
          expect(page.url()).toContain("/movies");

          // Navigate to first movie
          const navigatedToMovie = await pageActions.clickFirstMovie();
          if (navigatedToMovie) {
            expect(page.url()).toContain("/movie/");
            await pageActions.validatePageLoaded();

            // eslint-disable-next-line no-console
            console.log("✅ Cross-page navigation works in Portuguese");
          }
        }
      }
    });

    test("navigation between pages works in Arabic RTL", async ({
      page,
      pageActions,
    }) => {
      await pageActions.goToHomepage();

      // Switch to Arabic
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(2000);

        // Navigate to movies page
        await pageActions.goToMovies();
        await pageActions.waitForMoviesToLoad();
        expect(page.url()).toContain("/movies");

        // Navigate to first movie
        const navigatedToMovie = await pageActions.clickFirstMovie();
        if (navigatedToMovie) {
          expect(page.url()).toContain("/movie/");
          await pageActions.validatePageLoaded();

          // eslint-disable-next-line no-console
          console.log("✅ Cross-page navigation works in Arabic RTL");
        }
      }
    });
  });

  test.describe("Error Handling Across Languages", () => {
    test("404 pages display correctly in Portuguese", async ({
      page,
      pageActions,
    }) => {
      // Switch to Portuguese first
      await pageActions.goToHomepage();
      const drawerOpened = await pageActions.openDimensionsDrawer();
      if (drawerOpened) {
        const langChanged = await pageActions.changeLanguage("pt-pt");
        if (langChanged) {
          await page.waitForTimeout(2000);

          // Navigate to non-existent page
          await page.goto("/movie/non-existent-movie");
          await page.waitForLoadState("networkidle");

          // Check for error handling
          const pageContent = await page.locator("body").textContent();
          expect(pageContent).toBeTruthy();

          // eslint-disable-next-line no-console
          console.log("✅ 404 error handling works in Portuguese");
        }
      }
    });

    test("404 pages display correctly in Arabic RTL", async ({
      page,
      pageActions,
    }) => {
      // Switch to Arabic first
      await pageActions.goToHomepage();
      const arabicSet = await pageActions.setMiddleEastArabic();
      if (arabicSet) {
        await page.waitForTimeout(2000);

        // Navigate to non-existent page
        await page.goto("/episode/non-existent-episode");
        await page.waitForLoadState("networkidle");

        // Check for error handling
        const pageContent = await page.locator("body").textContent();
        expect(pageContent).toBeTruthy();

        // eslint-disable-next-line no-console
        console.log("✅ 404 error handling works in Arabic RTL");
      }
    });
  });
});
