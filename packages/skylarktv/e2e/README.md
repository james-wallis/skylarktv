# E2E Testing Structure

## Directory Organization

```
e2e/
├── fixtures/              # Shared test utilities and helpers
│   └── fixtures.ts         # Main fixtures file with PageActions class
├── specs/                  # All test files
│   ├── snapshots/          # Visual regression screenshot tests (110 screenshots)
│   │   ├── homepage-screenshots.spec.ts # Homepage visual tests
│   │   ├── movies-page-screenshots.spec.ts # Movies page visual tests
│   │   ├── movie-detail-screenshots.spec.ts # Movie detail visual tests
│   │   ├── episode-detail-screenshots.spec.ts # Episode detail visual tests
│   │   ├── person-page-screenshots.spec.ts # Person page visual tests
│   │   └── article-page-screenshots.spec.ts # Article page visual tests
│   ├── articles.spec.ts    # Article page tests
│   ├── availability.spec.ts # Availability system tests
│   ├── basic-smoke.spec.ts # Basic smoke tests
│   ├── claude-article.spec.ts # Claude article specific tests
│   ├── content-browsing.spec.ts # Content browsing tests
│   ├── content-interaction.spec.ts # Content interaction tests
│   ├── episode-detail-page.spec.ts # Episode detail page tests
│   ├── error-handling.spec.ts # Error handling tests
│   ├── home-page-availability.spec.ts # Homepage availability tests
│   ├── homepage-content-validation.spec.ts # Homepage content validation
│   ├── homepage-validation-framework.spec.ts # Homepage validation framework
│   ├── homepage.spec.ts    # Homepage tests
│   ├── movie-detail-page.spec.ts # Movie detail page tests
│   ├── movies-page.spec.ts # Movies page tests
│   ├── navigation.spec.ts  # Navigation tests
│   ├── responsive-design.spec.ts # Responsive design tests
│   ├── search-functionality.spec.ts # Search functionality tests
│   ├── search.spec.ts      # Search tests
│   ├── smoke.spec.ts       # Smoke tests
│   └── time-travel.spec.ts # Time travel functionality tests
├── README.md              # This file
└── TEST_ORGANIZATION.md   # Test organization documentation
```

## Key Features

### Fixtures System

- **PageActions Class**: Reusable methods for common page interactions
- **Selectors**: Centralized selector definitions
- **Test Data**: Shared test data and expectations
- **Helpers**: Utility functions for common operations

### Test Categories

#### Core Pages

- **Homepage**: Content validation, customer type filtering
- **Movies Page**: Loading, filtering, navigation
- **Movie Detail**: Credits, synopsis, person navigation
- **Episode Detail**: Full feature coverage with Game of Thrones data

#### Functionality

- **Search**: Search functionality across different pages
- **Navigation**: Cross-page navigation and routing
- **Availability**: Time travel and dimension filtering
- **Responsive**: Cross-device compatibility

#### Quality Assurance

- **Smoke Tests**: Basic functionality verification
- **Error Handling**: JavaScript error monitoring
- **Content Validation**: Data integrity checks
- **Visual Regression**: Screenshot comparison testing (110 screenshots)

## Running Tests

```bash
# Run all tests
yarn playwright test

# Run specific test file
yarn playwright test movie-detail-page.spec.ts

# Run tests in headed mode (visible browser)
yarn playwright test --headed

# Run tests for specific browser
yarn playwright test --project=chromium

# Run tests with specific grep pattern
yarn playwright test --grep "loads successfully"

# Run screenshot tests
yarn playwright test --grep "screenshots"

# Update screenshot baselines
yarn playwright test --update-snapshots
```

## Test Data

The test suite uses real data from the SkylarkTV application:

- **Movie**: "1917" (rich credits and rails data)
- **Episode**: "Winter is Coming" Game of Thrones (extensive metadata)
- **Time Travel**: House of the Dragon articles
- **Homepage**: 142 movies, multiple customer types

## Visual Regression Testing

### Screenshot Tests (110 screenshots)

The `specs/snapshots/` directory contains comprehensive visual regression tests:

- **Homepage**: Desktop/mobile/tablet with customer types and languages
- **Movies Page**: Filtering, hover states, multi-language support
- **Movie Detail**: "1917" movie with credits, synopsis, rails
- **Episode Detail**: "Winter is Coming" with full feature coverage
- **Person Page**: Biography, filmography, navigation
- **Article Page**: Claude article with scroll positions and interactions

### Languages Supported

- **English** (en-gb)
- **Portuguese** (pt-pt)
- **Arabic RTL** (ar) - Middle East region

### Responsive Coverage

- **Desktop**: 1920x1080
- **Tablet**: 768x1024
- **Mobile**: 375x667

### Future Enhancements

- API testing integration
- Performance testing
- Accessibility testing
- Mobile app testing

## Page Actions Available

### Navigation

- `goToHomepage()` - Navigate to homepage with wait
- `goToMovies()` - Navigate to movies page
- `goToArticles()` - Navigate to articles page
- `goToShows()` - Navigate to shows page
- `goToClaudeArticle()` - Navigate to specific Claude article
- `navigateToPageSafely(path)` - Navigate with error handling

### Content Interaction

- `performSearch(query)` - Perform search if available
- `clickFirstThumbnail()` - Click first content thumbnail
- `getThumbnailCount()` - Count available thumbnails

### Movie/Episode Helpers

- `getMovieCount()` - Count movies on page
- `getMovieTitles()` - Get movie titles
- `clickFirstMovie()` - Navigate to first movie
- `filterMoviesByGenre(genre)` - Filter movies by genre
- `checkCreditsSection()` - Validate credits display
- `checkSynopsisSection()` - Check synopsis and show more
- `toggleShowMore()` / `toggleShowLess()` - Toggle synopsis expansion
- `checkMoreByRails()` - Validate "More by X" rails

### Language/Dimensions

- `openDimensionsDrawer()` - Open language/dimension controls
- `changeLanguage(language)` - Switch between languages (en-gb, pt-pt, ar)
- `setCustomerType(type)` - Change customer type
- `setMiddleEastRegion()` - Set Middle East region
- `setMiddleEastArabic()` - Combined Middle East region + Arabic language

### Validation

- `validatePageLoaded()` - Check page loaded successfully
- `validatePageHasContent(minLength)` - Validate meaningful content
- `validateDetailPageStructure()` - Validate detail page layout
- `validateHomepageContent()` - Validate homepage content

### Viewport Management

- `setDesktopViewport()` - Set desktop size (1920x1080)
- `setTabletViewport()` - Set tablet size (768x1024)
- `setMobileViewport()` - Set mobile size (375x667)

### Error Monitoring

- `monitorConsoleErrors(options)` - Monitor console errors with filtering

## Test Data Structure

```typescript
testData = {
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

  movieGenres: {
    action: "Action",
    comedy: "Comedy",
    drama: "Drama",
  },

  homepageContent: {
    premium: {
      requiredRails: ["New TV Releases", "TV Shows on SkylarkTV"],
      forbiddenRails: ["Classic kids shows"],
      forbiddenContent: ["Teletubbies", "Paw Patrol"],
    },
    // ... other customer types
  },
};
```

## Example Usage

### Basic Test with Fixtures

```typescript
import { test, expect, testData } from "../fixtures/fixtures";

test("homepage works", async ({ pageActions }) => {
  await pageActions.goToHomepage();
  await pageActions.validatePageHasContent();
});
```

### Movie Detail Test

```typescript
test("movie detail page", async ({ page, pageActions }) => {
  await page.goto("/movie/recUVmOzaTc7EAcTB");

  const creditsInfo = await pageActions.checkCreditsSection();
  expect(creditsInfo.count).toBeGreaterThan(0);

  const railsInfo = await pageActions.checkMoreByRails();
  expect(railsInfo.count).toBeGreaterThan(0);
});
```

### Portuguese Translation Test

```typescript
test("language switching", async ({ pageActions }) => {
  await pageActions.openDimensionsDrawer();
  const langChanged = await pageActions.changeLanguage("pt-pt");
  expect(langChanged).toBe(true);
});
```

### Screenshot Test Example

```typescript
test("homepage screenshot", async ({ page, pageActions }) => {
  await pageActions.goToHomepage();
  await pageActions.setDesktopViewport();
  await expect(page).toHaveScreenshot("homepage-desktop-default.png");
});
```

### Arabic RTL Test Example

```typescript
test("Arabic RTL layout", async ({ page, pageActions }) => {
  await pageActions.goToHomepage();
  const arabicSet = await pageActions.setMiddleEastArabic();
  if (arabicSet) {
    await expect(page).toHaveScreenshot("homepage-arabic-rtl.png");
  }
});
```
