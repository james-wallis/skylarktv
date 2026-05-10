# LocalTV macOS App — Implementation Plan

Plan of record for a self-hosted, Plex-like Mac app that reads your local TV/movie folders. The app lives in `packages/localtv/` alongside SkylarkTV (the Ostmodern demo, unchanged), reuses some of SkylarkTV's UI components, and packages as a signed/notarized Electron `.app` distributed direct-to-recipient. Anything explicitly deferred lives in [`../enhancements/future-mac-app-enhancements.md`](../enhancements/future-mac-app-enhancements.md).

## Goals

- Ship a signed, notarized macOS app (universal binary) for the LocalTV use case.
- SkylarkTV keeps shipping to Vercel from the same commits, untouched.
- Per-recipient rebrandable at build time (name + colors + bundle id).
- Persist user state (chosen folders, future cache) across app restarts and updates.
- Zero logins for the end user. Zero terminal steps for the recipient.
- Battery-conservative defaults.

## Non-goals (Phase 1)

- Reading anything inside the user's chosen folders.
- ffmpeg, ffprobe, thumbnails, video probing.
- TMDB metadata enrichment.
- SQLite catalog or any persisted media data.
- A custom streaming protocol or local HTTP video routes.
- Auto-updates (electron-updater is deferred — see future doc).
- VLC embedding (current decision: HTML5 + ffmpeg fallback in Phase 2).
- Importing SkylarkTV's heavier UI components (rails, hero, thumbnails) — happens in Phase 2 once there is data to feed them.

## Architecture overview

### Package layout

```
packages/
├── skylarktv/   # Ostmodern's demo — unchanged, still ships to Vercel
├── ingestor/    # Unchanged
└── localtv/     # NEW: Next.js renderer + Electron main/preload + builder config
    ├── electron/             # Main process and preload
    ├── build/                # Codesign entitlements
    ├── electron-builder.yml
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json         # Renderer (Next)
    ├── tsconfig.electron.json # Main + preload (CommonJS Node)
    └── src/
        ├── pages/            # Home, TV Shows, Movies, Settings
        ├── components/       # localtv-specific UI (brand header etc.)
        └── styles/
```

SkylarkTV's reusable React components can be imported as `@skylark-apps/skylarktv/src/components/...` once Phase 2 has data to plug into them. `next.config.js` declares `transpilePackages: ["@skylark-apps/skylarktv"]` so this works without a separate library build step.

### Process model

- **Main process** (Node, in Electron): boots a localhost HTTP server serving the static export, opens the `BrowserWindow`, owns `electron-store` and any future native modules, handles IPC.
- **Preload script**: exposes a typed, narrow API to the renderer via `contextBridge`. No direct Node access from renderer.
- **Renderer**: Next.js app with `output: 'export'`. Three-tab nav (Home / TV Shows / Movies) plus a Settings link. Reads `window.electronAPI` from the preload bridge for folder pickers.

### Brand-per-recipient

Build-time env vars rebrand a single binary:

| Env var         | Used for                                                             | Default   |
| --------------- | -------------------------------------------------------------------- | --------- |
| `BRAND_NAME`    | Window title, header wordmark, `productName` (dock/app filename)     | `LocalTV` |
| `BRAND_PRIMARY` | `--brand-primary` CSS var → Tailwind `bg-brand-primary` etc.         | `#5b45ce` |
| `BRAND_ACCENT`  | `--brand-accent` CSS var                                             | `#7760d6` |
| `APP_ID`        | electron-builder `appId` (controls userData dir, codesign bundle id) | required  |

Each gift bundle is a separate `BRAND_NAME=EekenderTV APP_ID=dev.wallis.tv.eekender yarn build:desktop` invocation.

## Stack & dependencies

### Bundled with the app

- **Electron** — Chromium + Node runtime, in the `.app`.
- **Next.js static export** — bundled as static assets, served from disk by the localhost server in main.
- **electron-store** — small JSON wrapper for persistent settings.

### Preinstalled on macOS

- Nothing required. Phase 1 has zero native dependencies.

### Developer-side (one-time setup)

- Apple Developer Program subscription (already held).
- Developer ID Application certificate (in Keychain).
- App Store Connect API key for notarization (`APPLE_API_KEY`, `APPLE_API_KEY_ID`, `APPLE_API_ISSUER`).
- Team ID (`APPLE_TEAM_ID`).

### Universal binary (Intel + Apple Silicon)

`electron-builder --mac --universal` produces a single `.app` containing both x64 and arm64 slices. Phase 1 has no native modules so this is essentially free; `electron-store` is pure JS.

## Persistent state

`electron-store` writes JSON to `app.getPath('userData')`, which on macOS resolves to:

```
~/Library/Application Support/<BRAND_NAME>/config.json
```

The directory survives app close/reopen, app updates, and macOS upgrades. Initial schema:

```jsonc
{
  "schemaVersion": 1,
  "libraries": {
    "tv": null, // absolute path or null
    "movies": null,
  },
}
```

`schemaVersion` is reserved for Phase 2 migrations. The full media catalog will move to `better-sqlite3` in Phase 2 — JSON is right for settings, wrong for thousands of episodes.

## Phase 1: what shipped

- ✅ `packages/localtv/` scaffolded (Next.js renderer + Electron main/preload in one package).
- ✅ Brand env-var pipeline (`BRAND_NAME`, `BRAND_PRIMARY`, `BRAND_ACCENT`, `APP_ID`).
- ✅ Three-tab nav (Home / TV Shows / Movies) + Settings page with folder pickers.
- ✅ IPC bridge: `pickFolder`, `getLibraries`, `clearLibrary`.
- ✅ electron-store persistence under `app.getPath('userData')`.
- ✅ First-launch redirect to `/settings` when both libraries are unset.
- ✅ React Query defaults set for battery (no refetch on focus / reconnect).
- ✅ `electron-builder.yml` configured for sign + notarize + universal dmg.
- ✅ Minimal mac entitlements for hardened runtime + user-selected folder reads.
- ⏳ First signed `.dmg` — pending `APPLE_TEAM_ID`, `APPLE_API_ISSUER`. The unsigned pipeline previously produced a 172MB universal dmg under the old skylarktv-desktop package, so the build flow itself is known-good.

## Phase 2: outline (informational)

Documented here so Phase 1 design choices stay consistent.

- **File scanner**: `chokidar` walks the configured TV/Movies folders. Scans only on user action or first launch; chokidar then keeps the catalog live.
- **Filename parser**: `parse-torrent-title` (with `anitomy-js` as fallback for anime). Folder hierarchy is the primary source of truth (`Show/Season N/Episode N.ext`); filename parsing is the fallback.
- **Probe**: `fluent-ffmpeg` + bundled `ffmpeg-static` / `ffprobe-static` for duration, codec, resolution, audio tracks. Thumbnails via frame-grab when TMDB stills aren't available.
- **Metadata**: TMDB API, key bundled (standard pattern for this category). Aggressive on-disk cache.
- **Persistence**: `better-sqlite3` for the catalog, in the same userData directory. `schemaVersion` bump in `electron-store` records the SQLite presence.
- **UI**: import SkylarkTV's Rail / Thumbnail / Hero components for the Home / TV / Movies pages. Build a manual-match dialog for filename parse failures.
- **Playback**: HTML5 `<video>` against `http://127.0.0.1:<port>/stream/<id>` served from the main process with HTTP Range support. ffmpeg-static remuxes/transcodes on the fly for files Chromium can't play. "Open in VLC" button as the truly-stubborn-file escape hatch.

## Out of scope

See [`../enhancements/future-mac-app-enhancements.md`](../enhancements/future-mac-app-enhancements.md) for:

- Tauri as a future replacement for Electron.
- Over-the-air updates via electron-updater + GitHub Releases.
- LAN sharing, watch-progress sync, subtitle integrations, transcoding fallback, etc.
