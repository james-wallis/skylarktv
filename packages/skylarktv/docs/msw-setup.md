# MSW (Mock Service Worker) Setup

This project is configured to use MSW for mocking GraphQL API responses during development.

## Usage

### Enable MSW

1. Set the environment variable in your `.env.local` file:

   ```
   NEXT_PUBLIC_USE_MSW=true
   ```

2. Start the development server:
   ```bash
   yarn dev
   ```

MSW will intercept all GraphQL requests to your API endpoint and return mocked data instead.

### Disable MSW

To use the real GraphQL API, either:

- Set `NEXT_PUBLIC_USE_MSW=false` in your `.env.local` file
- Or remove the `NEXT_PUBLIC_USE_MSW` variable entirely

## Configuration

### Mock Data

Mock data and handlers are defined in:

- `src/mocks/handlers.ts` - GraphQL request handlers and mock responses
- `src/mocks/browser.ts` - Browser-side MSW setup
- `src/mocks/server.ts` - Server-side MSW setup (for SSR)

### Adding New Mocks

To add a new GraphQL query mock:

1. Open `src/mocks/handlers.ts`
2. Add a new handler:

```typescript
graphql.link(SAAS_API_ENDPOINT).query('YOUR_QUERY_NAME', ({ variables }) => {
  return HttpResponse.json({
    data: {
      // Your mock response data
    },
  });
}),
```

### Mock Data Source

The mock data is loaded from real Airtable exports located at:
`packages/ingestor/outputs/airtable/2023-07-13T12:37:42.851Z.json`

This includes:

- Movies
- Episodes
- Seasons
- Brands
- Live Streams
- People & Credits
- Genres, Themes, Tags, Ratings
- Images
- Sets metadata
- Articles (if available)

The data is automatically converted from Airtable format to GraphQL format using the helper functions in `src/mocks/airtableData.ts`.

### Updating Mock Data

To use a different Airtable export:

1. Update the import in `src/mocks/airtableData.ts` to point to your new JSON file
2. Restart the development server

### Customizing Mock Responses

You can modify the handlers in `src/mocks/handlers.ts` to:

- Add custom business logic
- Simulate error states
- Add delays to simulate network latency
- Return different data based on request variables

## Features

- **Automatic interception**: All GraphQL requests are automatically intercepted when MSW is enabled
- **SSR support**: Works with Next.js server-side rendering
- **Development only**: MSW is only active in development mode
- **Easy toggle**: Enable/disable with a single environment variable
- **Type-safe**: Uses your existing GraphQL types

## Troubleshooting

### MSW not intercepting requests

1. Check that `NEXT_PUBLIC_USE_MSW=true` is set in your environment
2. Ensure the development server was restarted after changing the environment variable
3. Check the browser console for MSW initialization messages
4. Verify the API endpoint in handlers matches your actual endpoint

### Service Worker issues

If you see service worker errors:

1. Clear your browser cache and service workers
2. Ensure `public/mockServiceWorker.js` exists (created by `npx msw init`)
3. Check that the public directory is being served correctly

### TypeScript errors

If you encounter TypeScript errors with MSW:

1. Ensure all MSW dependencies are installed
2. Check that your GraphQL types are generated (`yarn codegen`)
