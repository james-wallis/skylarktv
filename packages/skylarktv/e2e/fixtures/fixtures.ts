import { test as base, expect, Page } from "@playwright/test";

// Common selectors and utilities
export const selectors = {
  // Search
  searchInput:
    'input[type="search"], input[placeholder*="search" i], input[name*="search"]',

  // Navigation
  moviesLink: 'a[href*="movies"]',
  articlesLink: 'a[href*="articles"]',
  showsLink: 'a[href*="shows"]',
  homeLink: 'a[href="/"], a[href*="home"]',

  // Content
  thumbnails:
    '[data-testid="thumbnail"], .thumbnail, article a, a[href*="/movie/"], a[href*="/episode/"], a[href*="/brand/"], a[href*="/article/"]',

  // UI Elements
  body: "body",
  mainContent: "main",
  navigation: 'nav, [role="navigation"]',

  // Article specific
  articleTitle: "h1",
  articleContent:
    'article, [data-testid="article-content"], main, .article-content',
  paragraphs: "p",

  // Settings/Controls
  settingsButton:
    '[data-testid="settings-button"], [data-testid="dimension-toggle"], button:has-text("Settings")',
  settingsPanel:
    '[data-testid="dimension-settings"], [data-testid="settings-panel"], .settings-panel',
  closeButton:
    '[data-testid="close-settings"], button:has-text("Close"), .close-button',

  // Movie specific
  movieThumbnails: 'a[href*="/movie/"].group',
  movieTitles: 'a[href*="/movie/"] p.mb-0\\.5',
  movieImages: 'a[href*="/movie/"] div[style*="background-image"]',
  genreFilters:
    '[data-testid="genre-filter"], .genre-filter, button[data-genre], .filter-button',
  loadingIndicators:
    '[data-testid="loading"], .loading, .spinner, [data-testid="skeleton"], .skeleton',
  pagination:
    '[data-testid="pagination"], .pagination, button:has-text("Next"), button:has-text("Load More"), [data-testid="load-more"]',
};

// Common page actions
export class PageActions {
  constructor(private page: Page) {}

  // Navigation helpers
  async goToHomepage() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  async goToMovies() {
    await this.page.goto("/movies");
    await this.page.waitForLoadState("networkidle");
  }

  async goToArticles() {
    await this.page.goto("/articles");
    await this.page.waitForLoadState("networkidle");
  }

  async goToShows() {
    await this.page.goto("/shows");
    await this.page.waitForLoadState("networkidle");
  }

  async goToClaudeArticle() {
    await this.page.goto(
      "/article/recafURoqJexXerZY/evolution-of-streaming-time-shifted-viewing",
    );
    await this.page.waitForLoadState("networkidle");
  }

  // Navigation with error handling
  async navigateToPageSafely(path: string) {
    try {
      await this.page.goto(path, { waitUntil: "networkidle" });
    } catch (error) {
      // Handle redirects or other navigation issues
      await this.page.goto(path, { waitUntil: "domcontentloaded" });
    }
    await expect(this.page.locator(selectors.body)).toBeVisible();
  }

  // Search functionality
  async performSearch(query: string) {
    const searchInput = this.page.locator(selectors.searchInput).first();

    if (await searchInput.isVisible()) {
      await searchInput.fill(query);
      await searchInput.press("Enter");
      await this.page.waitForLoadState("networkidle");
      return true;
    }
    return false;
  }

  // Content interaction
  async clickFirstThumbnail() {
    const thumbnails = this.page.locator(selectors.thumbnails).first();
    if (await thumbnails.isVisible()) {
      await thumbnails.click();
      await this.page.waitForLoadState("networkidle");
      return true;
    }
    return false;
  }

  getThumbnailCount() {
    return this.page.locator(selectors.thumbnails).count();
  }

  // Viewport helpers
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  // Content validation
  async validatePageLoaded() {
    await expect(this.page.locator(selectors.body)).toBeVisible();
  }

  async validatePageHasContent(minLength: number = 100) {
    const bodyText = await this.page.locator(selectors.body).textContent();
    expect(bodyText).toBeTruthy();
    expect(bodyText?.length).toBeGreaterThan(minLength);
  }

  async validateArticleContent() {
    await expect(this.page.locator(selectors.articleTitle)).toBeVisible();
    await expect(this.page.locator(selectors.body)).toContainText(
      "The Evolution of Streaming",
    );
    await expect(this.page.locator(selectors.body)).toContainText("By Claude");

    const paragraphs = this.page.locator(selectors.paragraphs);
    if ((await paragraphs.count()) > 0) {
      await expect(paragraphs.first()).toBeVisible();
    }
  }

  // Error monitoring
  monitorConsoleErrors(
    options: {
      ignoreFavicon?: boolean;
      ignore404?: boolean;
      ignoreTracking?: boolean;
    } = {},
  ) {
    const errors: string[] = [];

    this.page.on("console", (msg) => {
      if (msg.type() === "error") {
        let shouldIgnore = false;

        if (options.ignoreFavicon && msg.text().includes("favicon")) {
          shouldIgnore = true;
        }

        if (options.ignore404 && msg.text().includes("404")) {
          shouldIgnore = true;
        }

        if (
          options.ignoreTracking &&
          (msg.text().includes("Invalid path or write key") ||
            msg.text().includes("Cannot GET") ||
            msg.text().includes("Failed to load resource"))
        ) {
          shouldIgnore = true;
        }

        if (!shouldIgnore) {
          errors.push(msg.text());
        }
      }
    });

    return errors;
  }

  // Homepage validation methods
  async setCustomerType(customerType: "premium" | "standard" | "kids") {
    const dimensionsButton = this.page
      .locator(
        '[data-testid="settings-button"], [data-testid="dimension-toggle"], button:has-text("Settings"), button:has-text("Dimensions")',
      )
      .first();

    if (await dimensionsButton.isVisible()) {
      await dimensionsButton.click();
      await this.page.waitForSelector(
        '[data-testid="dimension-settings"], [data-testid="settings-panel"], .settings-panel, .dimensions-drawer',
        { timeout: 10000 },
      );

      const customerOption = this.page
        .locator(
          `input[value="${customerType}"], label:has-text("${customerType.charAt(0).toUpperCase() + customerType.slice(1)}")`,
        )
        .first();

      if (await customerOption.isVisible()) {
        await customerOption.click();
        await this.page.waitForLoadState("networkidle");

        const closeButton = this.page
          .locator(
            '[data-testid="close-settings"], button:has-text("Close"), .close-button',
          )
          .first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await this.page.keyboard.press("Escape");
        }

        await this.page.waitForLoadState("networkidle");
        return true;
      }
    }
    return false;
  }

  async getRailTitles(): Promise<string[]> {
    // Get all rail titles from the homepage
    const railTitleSelectors = [
      "h2",
      "h3",
      '[data-testid*="rail-title"]',
      ".rail-title",
      ".rail h2",
      ".rail h3",
    ];

    const titles: string[] = [];

    for (const selector of railTitleSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();

      for (let i = 0; i < count; i += 1) {
        const text = await elements.nth(i).textContent();
        if (text && text.trim()) {
          titles.push(text.trim());
        }
      }
    }

    // Remove duplicates and return
    return Array.from(new Set(titles));
  }

  countRailItems(railName: string): Promise<number> {
    const railItems = this.page.locator(
      `.rail:has-text("${railName}") [data-testid="thumbnail"], .rail:has-text("${railName}") .thumbnail, .rail:has-text("${railName}") a[href*="/show/"], .rail:has-text("${railName}") a[href*="/brand/"], .rail:has-text("${railName}") a[href*="/episode/"], .rail:has-text("${railName}") a[href*="/movie/"]`,
    );
    return railItems.count();
  }

  async getContentTitles(): Promise<string[]> {
    // Get all content titles visible on the homepage
    const contentSelectors = [
      '[data-testid="thumbnail"] h3',
      '[data-testid="thumbnail"] .title',
      ".thumbnail h3",
      ".thumbnail .title",
      'a[href*="/movie/"] h3',
      'a[href*="/episode/"] h3',
      'a[href*="/brand/"] h3',
    ];

    const titles: string[] = [];

    for (const selector of contentSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();

      for (let i = 0; i < count; i += 1) {
        const text = await elements.nth(i).textContent();
        if (text && text.trim()) {
          titles.push(text.trim());
        }
      }
    }

    return Array.from(new Set(titles));
  }

  async validateHomepageContent(
    customerType: "premium" | "standard" | "kids",
    expectations: {
      requiredRails: string[];
      forbiddenRails: string[];
      railCounts: Record<string, number | { min: number; max: number }>;
      forbiddenContent: string[];
      allowedContent?: string[];
    },
  ) {
    // Use passed expectations to avoid circular dependency

    if (!expectations) {
      throw new Error(
        `No expectations defined for customer type: ${customerType}`,
      );
    }

    // Get actual content from page
    const actualRails = await this.getRailTitles();
    const actualContent = await this.getContentTitles();

    const results = {
      requiredRailsPresent: [] as string[],
      requiredRailsMissing: [] as string[],
      forbiddenRailsPresent: [] as string[],
      railCountsCorrect: {} as Record<string, boolean>,
      railCountsActual: {} as Record<string, number>,
      forbiddenContentPresent: [] as string[],
      allowedContentPresent: [] as string[],
      success: true,
    };

    // Check required rails
    expectations.requiredRails.forEach((requiredRail) => {
      const isPresent = actualRails.some((rail) => rail.includes(requiredRail));
      if (isPresent) {
        results.requiredRailsPresent.push(requiredRail);
      } else {
        results.requiredRailsMissing.push(requiredRail);
        results.success = false;
      }
    });

    // Check forbidden rails
    expectations.forbiddenRails.forEach((forbiddenRail) => {
      const isPresent = actualRails.some((rail) =>
        rail.includes(forbiddenRail),
      );
      if (isPresent) {
        results.forbiddenRailsPresent.push(forbiddenRail);
        results.success = false;
      }
    });

    // Check rail counts
    await Promise.all(
      Object.entries(expectations.railCounts).map(
        async ([railName, expectedCount]) => {
          const actualCount = await this.countRailItems(railName);
          results.railCountsActual[railName] = actualCount;

          if (typeof expectedCount === "number") {
            results.railCountsCorrect[railName] = actualCount === expectedCount;
            if (actualCount !== expectedCount) {
              results.success = false;
            }
          } else if (
            typeof expectedCount === "object" &&
            expectedCount !== null &&
            "min" in expectedCount &&
            "max" in expectedCount
          ) {
            const rangeCount = expectedCount as { min: number; max: number };
            results.railCountsCorrect[railName] =
              actualCount >= rangeCount.min && actualCount <= rangeCount.max;
            if (actualCount < rangeCount.min || actualCount > rangeCount.max) {
              results.success = false;
            }
          }
        },
      ),
    );

    // Check forbidden content
    expectations.forbiddenContent.forEach((forbiddenContent) => {
      const isPresent = actualContent.some((content) =>
        content.includes(forbiddenContent),
      );
      if (isPresent) {
        results.forbiddenContentPresent.push(forbiddenContent);
        results.success = false;
      }
    });

    // Check allowed content (for kids)
    if (expectations.allowedContent) {
      expectations.allowedContent.forEach((allowedContent) => {
        const isPresent = actualContent.some((content) =>
          content.includes(allowedContent),
        );
        if (isPresent) {
          results.allowedContentPresent.push(allowedContent);
        }
      });
    }

    return results;
  }

  // Movie-specific helpers
  getMovieCount(): Promise<number> {
    return this.page.locator(selectors.movieThumbnails).count();
  }

  async getMovieTitles(): Promise<string[]> {
    const movieLinks = this.page.locator(selectors.movieThumbnails);
    const count = await movieLinks.count();
    const titles: string[] = [];

    for (let i = 0; i < count; i += 1) {
      const movieLink = movieLinks.nth(i);
      const titleElement = movieLink.locator("p.mb-0\\.5.mt-2");
      const titleText = await titleElement.textContent();
      if (titleText && titleText.trim()) {
        titles.push(titleText.trim());
      }
    }

    return titles;
  }

  async clickFirstMovie(): Promise<boolean> {
    const firstMovie = this.page.locator(selectors.movieThumbnails).first();
    if (await firstMovie.isVisible()) {
      // Get the href and navigate directly since click doesn't work
      const href = await firstMovie.getAttribute("href");
      if (href) {
        await this.page.goto(href);
        await this.page.waitForLoadState("networkidle");
        return true;
      }
    }
    return false;
  }

  async filterMoviesByGenre(genre: string): Promise<boolean> {
    // Try multiple genre filter approaches
    const genreSelectors = [
      `button:has-text("${genre}")`,
      `label:has-text("${genre}")`,
      `[data-testid="genre-${genre.toLowerCase()}"]`,
      `[data-genre="${genre.toLowerCase()}"]`,
      `.genre-filter[data-genre="${genre.toLowerCase()}"]`,
    ];

    for (const selector of genreSelectors) {
      const genreElement = this.page.locator(selector).first();
      if (await genreElement.isVisible()) {
        await genreElement.click();
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(500);
        return true;
      }
    }

    // Try clicking on genre text directly
    const genreText = this.page.locator(`*:has-text("${genre}")`).first();
    if (await genreText.isVisible()) {
      await genreText.click();
      await this.page.waitForLoadState("networkidle");
      return true;
    }

    return false;
  }

  isMovieDetailPage(): boolean {
    const url = this.page.url();
    return url.includes("/movie/");
  }

  async validateMovieDetailPage(): Promise<boolean> {
    const detailSelectors = [
      "h1",
      '[data-testid="movie-title"]',
      ".movie-title",
      ".movie-details",
      '[data-testid="movie-description"]',
      ".description",
    ];

    for (const selector of detailSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible()) {
        return true;
      }
    }
    return false;
  }

  async waitForMoviesToLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");

    // Wait for loading indicators to disappear
    const loadingElement = this.page
      .locator(selectors.loadingIndicators)
      .first();
    if (await loadingElement.isVisible({ timeout: 1000 })) {
      await expect(loadingElement).not.toBeVisible({ timeout: 10000 });
    }

    // Movies need additional time to load after networkidle
    await this.page.waitForTimeout(2000);
  }

  async tryLoadMoreMovies(): Promise<boolean> {
    const loadMoreButton = this.page.locator(selectors.pagination).first();
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await this.page.waitForLoadState("networkidle");
      return true;
    }

    // Try infinite scroll
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await this.page.waitForTimeout(1000);

    return false;
  }

  // Detail page helpers
  async openDimensionsDrawer(): Promise<boolean> {
    const dimensionsButton = this.page
      .locator(
        '[data-testid="dimension-toggle"], button:has-text("Dimensions"), [data-testid="settings-button"]',
      )
      .first();
    if (await dimensionsButton.isVisible()) {
      await dimensionsButton.click();
      await this.page.waitForTimeout(500);
      return true;
    }
    return false;
  }

  async changeLanguage(language: string): Promise<boolean> {
    try {
      // Look for language selector with various patterns
      const languageSelectors = [
        `text="${language}"`,
        `text="${language.toUpperCase()}"`,
        `text="${language.toLowerCase()}"`,
        `[value="${language}"]`,
        `[data-language="${language}"]`,
        `[lang="${language}"]`,
        `button:has-text("${language}")`,
        `a:has-text("${language}")`,
        `option:has-text("${language}")`,
        `select option[value="${language}"]`,
      ];

      for (const selector of languageSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          await this.page.waitForTimeout(1000);
          return true;
        }
      }

      // Try finding Portuguese/English/Arabic language options with text
      const langMappings = {
        "pt-pt": ["Português", "Portuguese", "pt", "PT"],
        "en-gb": ["English", "en", "EN"],
        ar: ["العربية", "Arabic", "ar", "AR"],
      };

      const possibleTexts = langMappings[
        language as keyof typeof langMappings
      ] || [language];

      for (const text of possibleTexts) {
        const langOptions = this.page.locator(`*:has-text("${text}")`);
        if ((await langOptions.count()) > 0) {
          const langOption = langOptions.first();
          if (await langOption.isVisible()) {
            await langOption.click();
            await this.page.waitForLoadState("networkidle");
            await this.page.waitForTimeout(1000);
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Language change failed:`, error);
      return false;
    }
  }

  // Set Middle East region function
  async setMiddleEastRegion(): Promise<boolean> {
    try {
      // Try to find Middle East region selector
      const middleEastSelectors = [
        'text="Middle East"',
        'text="middle east"',
        'text="ME"',
        'text="MIDDLE EAST"',
        '[value="middle-east"]',
        '[data-region="middle-east"]',
        'button:has-text("Middle East")',
        'a:has-text("Middle East")',
        'option:has-text("Middle East")',
      ];

      for (const selector of middleEastSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          await this.page.waitForTimeout(1000);
          return true;
        }
      }

      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Middle East region selection failed:`, error);
      return false;
    }
  }

  // Combined function to set Middle East region and Arabic language
  async setMiddleEastArabic(): Promise<boolean> {
    try {
      // First try to open dimensions drawer
      const drawerOpened = await this.openDimensionsDrawer();
      if (!drawerOpened) {
        return false;
      }

      // Try to set Middle East region first
      const regionSet = await this.setMiddleEastRegion();
      if (regionSet) {
        await this.page.waitForTimeout(1000);
      }

      // Then try to change to Arabic
      const languageChanged = await this.changeLanguage("ar");
      if (languageChanged) {
        await this.page.waitForTimeout(2000);
        return true;
      }

      // If 'ar' didn't work, try other Arabic variations
      const arabicVariations = [
        "ar-ae",
        "ar-sa",
        "arabic",
        "Arabic",
        "العربية",
      ];
      for (const variation of arabicVariations) {
        const changed = await this.changeLanguage(variation);
        if (changed) {
          await this.page.waitForTimeout(2000);
          return true;
        }
      }

      return false;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Middle East Arabic setup failed:`, error);
      return false;
    }
  }

  async checkCreditsSection(): Promise<{ count: number; visible: boolean }> {
    const creditsElements = this.page.locator(
      '*:has-text("Credits"), *:has-text("Cast"), *:has-text("Crew")',
    );
    const count = await creditsElements.count();
    const visible = count > 0 && (await creditsElements.first().isVisible());
    return { count, visible };
  }

  async checkSynopsisSection(): Promise<{
    hasText: boolean;
    hasShowMore: boolean;
  }> {
    const synopsisElements = this.page.locator(
      '*:has-text("Synopsis"), *:has-text("Description"), p',
    );
    const hasText = (await synopsisElements.count()) > 0;

    const showMoreButtons = this.page.locator(
      'button:has-text("Show more"), button:has-text("show more"), button:has-text("Show More")',
    );
    const hasShowMore = (await showMoreButtons.count()) > 0;

    return { hasText, hasShowMore };
  }

  async toggleShowMore(): Promise<boolean> {
    const showMoreButton = this.page
      .locator(
        'button:has-text("Show more"), button:has-text("show more"), button:has-text("Show More")',
      )
      .first();
    if (await showMoreButton.isVisible()) {
      await showMoreButton.click();
      await this.page.waitForTimeout(500);
      return true;
    }
    return false;
  }

  async toggleShowLess(): Promise<boolean> {
    const showLessButton = this.page
      .locator(
        'button:has-text("Show less"), button:has-text("show less"), button:has-text("Show Less")',
      )
      .first();
    if (await showLessButton.isVisible()) {
      await showLessButton.click();
      await this.page.waitForTimeout(500);
      return true;
    }
    return false;
  }

  async checkMoreByRails(): Promise<{ count: number; titles: string[] }> {
    const railElements = this.page
      .locator("h2, h3")
      .filter({ hasText: /More|Related|Similar/ });
    const count = await railElements.count();
    const titles = await railElements.allTextContents();
    return { count, titles };
  }

  async validateDetailPageStructure(): Promise<{
    hasVideo: boolean;
    hasRightSidebar: boolean;
    hasCredits: boolean;
    hasSynopsis: boolean;
    hasRails: boolean;
  }> {
    // Check for video player
    const videoElements = this.page.locator(
      'video, [data-testid="video-player"], .video-player',
    );
    const hasVideo = (await videoElements.count()) > 0;

    // Check for right sidebar structure
    const rightSidebarElements = this.page.locator(
      '.right-sidebar, [data-testid="right-sidebar"], aside',
    );
    const hasRightSidebar = (await rightSidebarElements.count()) > 0;

    // Check for credits
    const creditsElements = this.page.locator(
      '*:has-text("Credits"), *:has-text("Cast"), *:has-text("Crew")',
    );
    const hasCredits = (await creditsElements.count()) > 0;

    // Check for synopsis
    const synopsisElements = this.page.locator(
      '*:has-text("Synopsis"), *:has-text("Description")',
    );
    const hasSynopsis = (await synopsisElements.count()) > 0;

    // Check for rails
    const railElements = this.page
      .locator("h2, h3")
      .filter({ hasText: /More|Related|Similar/ });
    const hasRails = (await railElements.count()) > 0;

    return {
      hasVideo,
      hasRightSidebar,
      hasCredits,
      hasSynopsis,
      hasRails,
    };
  }

  // Settings/Controls
  async openSettings() {
    const settingsButton = this.page.locator(selectors.settingsButton).first();
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await expect(
        this.page.locator(selectors.settingsPanel).first(),
      ).toBeVisible();
      return true;
    }
    return false;
  }

  async closeSettings() {
    const closeButton = this.page.locator(selectors.closeButton).first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Try clicking outside the panel
      await this.page.locator(selectors.mainContent).click();
    }
    await expect(
      this.page.locator(selectors.settingsPanel).first(),
    ).not.toBeVisible();
  }
}

// Test fixtures
export const test = base.extend<{
  pageActions: PageActions;
  commonSelectors: typeof selectors;
}>({
  pageActions: async ({ page }, use) => {
    const pageActions = new PageActions(page);
    await use(pageActions);
  },

  commonSelectors: async (_, use) => {
    await use(selectors);
  },
});

// Re-export expect for convenience
export { expect } from "@playwright/test";

// Common test data
export const testData = {
  claudeArticle: {
    id: "recafURoqJexXerZY",
    slug: "evolution-of-streaming-time-shifted-viewing",
    title: "The Evolution of Streaming",
    author: "By Claude",
  },

  searchQueries: {
    batman: "batman",
    streaming: "streaming",
    episode: "episode",
  },

  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
  },

  pages: {
    home: "/",
    movies: "/movies",
    articles: "/articles",
    shows: "/shows",
  },

  // Movie-specific test data
  movieGenres: {
    action: "Action",
    comedy: "Comedy",
    drama: "Drama",
    thriller: "Thriller",
    horror: "Horror",
  },

  movieExpectations: {
    minimumMovieCount: 5,
    maximumLoadTime: 10000,
    expectedMovieTitles: [
      "The Dark Knight",
      "Inception",
      "The Matrix",
      "Pulp Fiction",
      "The Godfather",
    ],
    genreFiltering: {
      action: {
        expectedMovies: ["The Dark Knight", "The Matrix"],
        minimumCount: 2,
      },
      comedy: {
        expectedMovies: ["Groundhog Day", "The Grand Budapest Hotel"],
        minimumCount: 1,
      },
    },
  },

  // Homepage content expectations by customer type
  homepageContent: {
    premium: {
      requiredRails: [
        "New TV Releases",
        "TV Shows on SkylarkTV",
        "Featured Movies",
        "Popular Movies",
      ],
      forbiddenRails: [
        "Classic kids shows",
        "Miraculous Season 5",
        "Kids Movies",
        "Family Entertainment",
      ],
      railCounts: {
        "TV Shows on SkylarkTV": 19,
        "New TV Releases": { min: 1, max: 20 },
        "Featured Movies": { min: 1, max: 15 },
        "Popular Movies": { min: 1, max: 15 },
      },
      allowedContentTypes: ["Movie", "Episode", "Brand", "Season"],
      forbiddenContent: ["Teletubbies", "Paw Patrol", "Bluey", "ChuckleVision"],
    },
    standard: {
      requiredRails: [
        "TV Shows on SkylarkTV",
        "Featured Movies",
        "Popular Movies",
      ],
      forbiddenRails: [
        "New TV Releases",
        "Classic kids shows",
        "Miraculous Season 5",
        "Kids Movies",
      ],
      railCounts: {
        "TV Shows on SkylarkTV": 19,
        "Featured Movies": { min: 1, max: 15 },
        "Popular Movies": { min: 1, max: 15 },
      },
      allowedContentTypes: ["Movie", "Episode", "Brand", "Season"],
      forbiddenContent: [
        "Teletubbies",
        "Paw Patrol",
        "Bluey",
        "ChuckleVision",
        "O Grande Hotel Budapeste (Premium)", // Premium-only content
      ],
    },
    kids: {
      requiredRails: [
        "TV Shows on SkylarkTV",
        "Classic kids shows",
        "Miraculous Season 5",
        "Kids Movies",
      ],
      forbiddenRails: ["New TV Releases", "Featured Movies", "Popular Movies"],
      railCounts: {
        "TV Shows on SkylarkTV": 7,
        "Classic kids shows": 4,
        "Miraculous Season 5": 11,
        "Kids Movies": { min: 1, max: 10 },
      },
      allowedContentTypes: ["Movie", "Episode", "Brand", "Season"],
      allowedContent: [
        "Miraculous",
        "Teletubbies",
        "Paw Patrol",
        "Bluey",
        "The Lion King",
        "Snow White",
        "E.T.",
        "My Neighbour Totoro",
        "The Wizard of Oz",
      ],
      forbiddenContent: [
        "The Dark Knight",
        "Inception",
        "Pulp Fiction",
        "The Godfather",
        "Breaking Bad",
        "Game of Thrones",
      ],
    },
  },
};

// Helper functions
export const helpers = {
  // Wait for MSW to be ready
  async waitForMSW(page: Page) {
    await page.waitForLoadState("networkidle");
    // Additional wait to ensure MSW handlers are registered
    await page.waitForTimeout(100);
  },

  // Check if element exists without throwing
  async elementExists(page: Page, selector: string): Promise<boolean> {
    try {
      return (await page.locator(selector).count()) > 0;
    } catch {
      return false;
    }
  },

  // Safe click with existence check
  async safeClick(page: Page, selector: string): Promise<boolean> {
    const element = page.locator(selector).first();
    if (await element.isVisible()) {
      await element.click();
      return true;
    }
    return false;
  },

  // Get text content safely
  async getSafeText(page: Page, selector: string): Promise<string | null> {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        return await element.textContent();
      }
    } catch {
      // Ignore errors
    }
    return null;
  },
};
