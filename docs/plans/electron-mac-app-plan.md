# SkylarkTV macOS App — Implementation Plan

Plan of record for turning SkylarkTV into a self-hosted, Plex-like Mac app whose UI is the existing streaming front-end and whose data layer eventually points at local files. This document covers Phase 1 in detail and outlines Phase 2 enough to keep design decisions consistent. Anything explicitly deferred lives in [`../enhancements/future-mac-app-enhancements.md`](../enhancements/future-mac-app-enhancements.md).

## Goals

- Ship a signed, notarized macOS app (universal binary) that runs the existing SkylarkTV UI inside Electron.
- Keep the web build deploying to Vercel from the same commits, untouched.
- Persist user state (chosen folders, future cache) across app restarts and updates.
- Zero logins for the end user. Zero terminal steps for the recipient.
- Battery-conservative defaults.
- Single codebase. Two build outputs.

## Non-goals (Phase 1)

- Reading anything inside the user's chosen folders.
- ffmpeg, ffprobe, thumbnails, video probing.
- TMDB metadata enrichment.
- SQLite catalog or any persisted media data.
- A custom streaming protocol or local HTTP video routes.
- Auto-updates (electron-updater is deferred — see future doc).
- VLC embedding (covered separately in design notes; current decision: HTML5 + ffmpeg fallback in Phase 2).

## Architecture overview

### Two build targets, one codebase

```
packages/
├── skylarktv/              # Existing Next.js app — both web and renderer
├── ingestor/               # Unchanged
└── skylarktv-desktop/      # NEW: Electron main + preload + builder config
```

`packages/skylarktv/` stays as-is. A single env var (`BUILD_TARGET=electron`) flips `next.config.js` into static-export mode (`output: 'export'`, `images.unoptimized: true`) without changing any runtime code. The web build runs without the env var and behaves exactly as today.

`packages/skylarktv-desktop/` owns everything Electron-specific: the main process, the preload script, electron-builder config, and the build script that triggers the static export of the renderer package and packages it.

### Process model

- **Main process** (Node, in Electron): boots a localhost HTTP server serving the static export, opens the `BrowserWindow`, owns `electron-store` and any future native modules, handles IPC.
- **Preload script**: exposes a typed, narrow API to the renderer via `contextBridge`. No direct Node access from renderer.
- **Renderer**: the existing Next.js app, unmodified for the web case. Detects desktop capability via the presence of `window.electronAPI` and conditionally renders desktop-only UI (Settings page, future library views).

### MSW + localhost

Service workers can't register on `file://`. The main process spins up `http.createServer` bound to `127.0.0.1:<random port>`, serves the `out/` directory of the static export, and the `BrowserWindow` loads `http://127.0.0.1:<port>`. MSW's existing service worker registers normally against this origin, fixtures resolve as in the dev browser. No new mocking infrastructure required.

## Stack & dependencies

### Bundled with the app

- **Electron** — Chromium + Node runtime. Ships inside the `.app`.
- **Next.js static export** — bundled as static assets in the `.app`.
- **MSW service worker** — `public/mockServiceWorker.js` (already present).
- **electron-store** — small JSON wrapper for persistent settings.

### Preinstalled on macOS

- Nothing required. Phase 1 has zero native dependencies.

### Developer-side (one-time setup)

- Apple Developer Program subscription (already held).
- Developer ID Application certificate (in Keychain).
- App Store Connect API key for notarization (`APPLE_API_KEY`, `APPLE_API_KEY_ID`, `APPLE_API_ISSUER`).
- Team ID.

### Universal binary (Intel + Apple Silicon)

`electron-builder --mac --universal` produces a single `.app` containing both x64 and arm64 slices. With no native modules in Phase 1 this is free; `electron-store` is pure JS.

## Persistent state

`electron-store` writes JSON to `app.getPath('userData')`, which on macOS resolves to:

```
~/Library/Application Support/SkylarkTV/config.json
```

This directory survives app close/reopen, app updates (whether manual reinstall or, later, electron-updater), and macOS upgrades. It is only cleared by explicit user action.

Initial schema:

```jsonc
{
  "schemaVersion": 1,
  "libraries": {
    "tv": null, // absolute path or null
    "movies": null,
  },
}
```

`schemaVersion` is reserved for Phase 2 migrations (when we add `tmdbCache`, `lastScanTime`, etc.). The full media catalog will move to `better-sqlite3` in Phase 2 — JSON is right for settings, wrong for thousands of episodes.

## Phase 1: tasks

### 1. Workspace scaffolding

- Add `packages/skylarktv-desktop/` with its own `package.json`.
- Dev deps: `electron`, `electron-builder`, `electron-store`, `typescript`, `@types/node`.
- TypeScript config extending the root `tsconfig.json`.
- Add scripts at root: `build:desktop`, `dev:desktop`.

### 2. Build-mode toggle in the renderer

- Modify `packages/skylarktv/next.config.js`:
  - When `BUILD_TARGET === 'electron'`: set `output: 'export'`, `images.unoptimized: true`, disable any web-only middleware.
  - Otherwise unchanged.
- Add `build:export` script in `packages/skylarktv` that runs `BUILD_TARGET=electron next build`.

### 3. Static-export audit

- Audit `packages/skylarktv/` for static-export blockers:
  - `pages/api/*` — anything used by the desktop UI must be removable from the export or replaced client-side.
  - `getServerSideProps` — same.
  - Middleware.
  - `next/image` loaders that depend on a runtime image optimizer.
- Fix only what blocks the export. Keep everything else.

### 4. Electron main process

- `packages/skylarktv-desktop/src/main.ts`:
  - On `app.whenReady`: pick a free port, start `http.createServer` serving the renderer's `out/` directory bound to `127.0.0.1`.
  - Create `BrowserWindow` with `contextIsolation: true`, `nodeIntegration: false`, `webSecurity: true`.
  - `loadURL('http://127.0.0.1:<port>')`.
  - Standard window lifecycle (close-all-windows on macOS keeps app alive in dock; activate re-opens).

### 5. Preload script + IPC bridge

- `packages/skylarktv-desktop/src/preload.ts` — exposes via `contextBridge.exposeInMainWorld('electronAPI', { ... })`:
  - `pickFolder(kind: 'tv' | 'movies'): Promise<string | null>`
  - `getLibraries(): Promise<{ tv: string | null, movies: string | null }>`
  - `clearLibrary(kind: 'tv' | 'movies'): Promise<void>`
- Main-process handlers for each, backed by `electron-store` and `dialog.showOpenDialog`.
- Type definitions exported so the renderer can import them.

### 6. Settings UI in the renderer

- New route `pages/settings.tsx` in `packages/skylarktv/`.
- Capability check: render only when `window.electronAPI` is defined; web build can show a "desktop only" placeholder or hide the route entirely.
- Two rows — "TV Shows folder" and "Movies folder":
  - Currently-stored path (or "not set").
  - "Choose folder…" button → `electronAPI.pickFolder(kind)`.
  - "Clear" button → `electronAPI.clearLibrary(kind)`.
- First-launch behaviour (Electron build only): if both libraries are `null`, redirect to `/settings`.

### 7. Battery hygiene

- In the renderer, when running under Electron, configure React Query defaults:
  - `refetchOnWindowFocus: false`
  - `refetchOnReconnect: false`
  - `refetchInterval: false` for any query that uses one
- No `setInterval` / animation loops running off-screen.
- Leave Chromium hardware acceleration on.
- Leave `BrowserWindow.backgroundThrottling` at its default (true).

### 8. Code signing & notarization

- `packages/skylarktv-desktop/electron-builder.yml`:
  ```yaml
  appId: com.wallis.skylarktv
  productName: SkylarkTV
  mac:
    target:
      - target: dmg
        arch: [universal]
    identity: "Developer ID Application: <your name> (<TEAMID>)"
    hardenedRuntime: true
    gatekeeperAssess: false
    notarize:
      teamId: "<TEAMID>"
    entitlements: build/entitlements.mac.plist
    entitlementsInherit: build/entitlements.mac.plist
  ```
- Minimal entitlements file (hardened runtime requires this).
- Build command: `electron-builder --mac --universal` with `APPLE_API_KEY*` env vars set.

### 9. Distribution

- For Phase 1: drop the `.dmg` into a chat / AirDrop / direct download.
- Recipient double-clicks. Notarization staple means Gatekeeper passes silently. No `xattr` workaround needed.
- GitHub Releases is fine for hosting if a link is preferred over a file transfer.

## Phase 1: definition of done

- A `.dmg` you can hand over a USB stick or direct link.
- Opens on another Mac (Intel or Silicon) with no Gatekeeper prompt.
- App is the existing SkylarkTV UI, fully functional, with all current MSW fixtures behaving exactly as in the dev browser.
- A `/settings` route lets you pick a TV folder and a Movies folder. Selections survive close/reopen.
- The web build still builds and deploys to Vercel from the same commits, behaviour unchanged.
- TypeScript and lint pass across both packages.

## Phase 2: outline (informational)

Documented here only so Phase 1 design choices stay consistent with what comes next.

- **File scanner**: `chokidar` walks the configured TV/Movies folders (event-driven, no polling). Scans only on user action or first launch; chokidar then keeps the catalog live.
- **Filename parser**: `parse-torrent-title` (with `anitomy-js` as fallback for anime). Folder hierarchy is the primary source of truth (`Show/Season N/Episode N.ext`); filename parsing is a fallback.
- **Probe**: `fluent-ffmpeg` + bundled `ffmpeg-static` / `ffprobe-static` for duration, codec, resolution, audio tracks. Thumbnails via frame-grab when TMDB stills aren't available.
- **Metadata**: TMDB API, key bundled into the app (standard pattern for this category — Jellyfin, Kodi, tinyMediaManager all do this). Aggressive on-disk cache.
- **Persistence**: `better-sqlite3` for the catalog, in the same userData directory. `schemaVersion` migration in `electron-store` records the SQLite presence.
- **Mapping to Skylark schema**:
  - Show folder → `Brand`
  - Season subfolder → `Season`
  - Episode file → `Episode`
  - Standalone movie → `Movie`
  - TMDB rating → `audience_rating` (already in `SkylarkTVAdditionalFields`)
  - TMDB poster → image objects, `preferred_image_type` already supported
- **Data layer swap**: a tiny GraphQL server in the main process, on the same localhost origin, replaces MSW for the desktop build. Fixture handlers become resolvers reading from SQLite. Web build keeps MSW.
- **Playback**: HTML5 `<video>` against `http://127.0.0.1:<port>/stream/<id>` served from the main process with HTTP Range support. ffmpeg-static remuxes/transcodes on the fly for files Chromium can't play. "Open in VLC" button as the truly-stubborn-file escape hatch. The existing `react-player` component is reused unchanged — it just receives a new URL.
- **Manual match UI**: filename parsing fails often enough that a "this is wrong, search TMDB myself" dialog is non-optional from day one of Phase 2.

## Out of scope

See [`../enhancements/future-mac-app-enhancements.md`](../enhancements/future-mac-app-enhancements.md) for:

- Tauri as a future replacement for Electron.
- Over-the-air updates via electron-updater + GitHub Releases.
- LAN sharing, watch-progress sync, subtitle integrations, transcoding fallback, etc.
