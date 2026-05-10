# Future Mac App Enhancements

A scratchpad for ideas that are out of scope for the current Electron build but worth keeping in mind.

## Tauri as a future replacement for Electron

Tauri uses the OS's native webview (WebKit on macOS) instead of bundling Chromium. The trade is well documented:

- **Bundle size**: ~10 MB vs Electron's ~150 MB
- **Idle RAM**: ~50 MB vs ~300 MB
- **Battery**: noticeably better, since there's no Chromium event loop running in the background
- **Security model**: stricter by default (capabilities-based)

Costs to be aware of before switching:

- Dev toolchain requires Rust (`rustup`, `cargo`).
- The renderer runs in WebKit, not Chromium. Anything Chromium-specific in the existing UI (CSS, APIs, codecs) needs auditing.
- MSW's service worker has historically had more friction on WebKit than Chromium — would need verifying that the existing mocks register cleanly.
- Native modules used in Phase 2 (`better-sqlite3`, `ffmpeg-static`) work but are wired up differently — they'd be invoked from Rust commands rather than Node IPC.

**When to revisit:** if the Electron build's battery impact is noticeable in real daily use, or if bundle size becomes a distribution problem. Otherwise leave it — porting is a real chunk of work and the Electron version covers the use case today.

## Over-the-air updates (electron-updater + GitHub Releases)

Deferred from Phase 1 distribution to keep the first build simple, but the path is decided:

- Use `electron-updater` in the main process; one call to `autoUpdater.checkForUpdatesAndNotify()` on app launch.
- `electron-builder` with `publish.provider: github` uploads signed/notarized artifacts (`.dmg`, `.zip`, `latest-mac.yml`) to a draft GitHub Release on each build.
- Publishing the draft on github.com triggers all installed copies to pick up the update on next launch — recipient sees a "restart to update" prompt, no terminal steps.
- Requires the Developer ID signing already in place; electron-updater refuses unsigned updates (this is the security model).
- Free: GitHub Releases hosts the artifacts; no extra infra.
- Build env vars: `GH_TOKEN` (repo scope) plus the existing Apple notary creds.
- Run with `--publish always` flag once enabled.

## Other ideas (placeholder)

- LAN sharing — broadcast the local catalog so a phone or another laptop can browse and stream.
- Watch-progress sync between devices via a small remote backend.
- Subtitle track switching + OpenSubtitles integration.
- Transcoding fallback (ffmpeg) for codecs Chromium can't play (HEVC, some AV1).
