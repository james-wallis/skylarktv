import { test, expect } from "../fixtures/fixtures";

test.describe("Movies Simple Test", () => {
  test("loads movies page successfully", async ({ page, pageActions }) => {
    await pageActions.goToMovies();
    await pageActions.waitForMoviesToLoad();

    // Check that movies are loaded using direct selector
    const movieLinks = page.locator('a[href*="/movie/"].group');
    const movieCount = await movieLinks.count();
    // eslint-disable-next-line no-console
    console.log("Movie count:", movieCount);

    expect(movieCount).toBeGreaterThan(5);

    // Check movie titles
    const movieTitles = await pageActions.getMovieTitles();
    // eslint-disable-next-line no-console
    console.log("Movie titles count:", movieTitles.length);
    // eslint-disable-next-line no-console
    console.log("First few titles:", movieTitles.slice(0, 3));

    expect(movieTitles.length).toBeGreaterThan(0);

    // Check clicking on first movie
    const clickWorked = await pageActions.clickFirstMovie();
    expect(clickWorked).toBe(true);

    // Check that we're on movie detail page
    const isMovieDetailPage = pageActions.isMovieDetailPage();
    expect(isMovieDetailPage).toBe(true);

    // eslint-disable-next-line no-console
    console.log("Movie detail page URL:", page.url());
  });
});
