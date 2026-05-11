# Signed `.dmg` Distribution — Runbook

Last open Phase 1 task. The build pipeline is proven (unsigned `.dmg` produced cleanly during Phase 1); this runbook is the steps to add Apple credentials and ship a signed/notarized one.

Expected wall-clock: ~15 min of credential gathering + 10 min of first build (mostly notarization round-trip with Apple's servers).

## Credentials to gather

| Variable           | What it is                                                      | Where to find                                                                                         |
| ------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `APPLE_TEAM_ID`    | 10-char team id                                                 | Top-right of [developer.apple.com](https://developer.apple.com) after logging in                      |
| `APPLE_API_KEY`    | Absolute path to a `.p8` file                                   | Already on disk: `/Users/jameswallis/github/projects/recipe-reader/apps/mobile/AuthKey_ZUXF2H2ZNV.p8` |
| `APPLE_API_KEY_ID` | 10-char key id                                                  | From the filename: `ZUXF2H2ZNV`                                                                       |
| `APPLE_API_ISSUER` | Issuer UUID                                                     | App Store Connect → Users and Access → Integrations → Keys → top of the page                          |
| `APP_ID`           | Reverse-DNS app id (drives codesign bundle id and userData dir) | `dev.wallis.tv`                                                                                       |

Confirm the existing `.p8` key has **Developer** or **Admin** role (not Customer Support / Marketing) — that's the role needed to notarize. Visible on the same App Store Connect Keys page.

## One-time host checks

```bash
# Confirm the Developer ID Application cert is installed in the local keychain.
security find-identity -v -p codesigning | grep "Developer ID Application"
```

If nothing shows, the cert needs generating: developer.apple.com → Certificates → "+", pick "Developer ID Application", download, double-click to import.

## Build

```bash
export APPLE_TEAM_ID=<10-char team id>
export APPLE_API_KEY=/Users/jameswallis/github/projects/recipe-reader/apps/mobile/AuthKey_ZUXF2H2ZNV.p8
export APPLE_API_KEY_ID=ZUXF2H2ZNV
export APPLE_API_ISSUER=<UUID from App Store Connect>
export APP_ID=dev.wallis.tv

yarn build:desktop
```

Internally that runs (from `packages/localtv`):

1. `yarn build:renderer` — Next static export → `out/`
2. `yarn build:electron` — compile main + preload → `dist/electron/`
3. `electron-builder --mac --universal` — sign with Developer ID cert, notarize via the API key, staple the ticket, produce the `.dmg`

Output: `packages/localtv/release/LocalTV-0.1.0-universal.dmg` (~170 MB based on the unsigned build).

## Per-recipient rebrand

To produce a personalised bundle for one person, append the brand env vars:

```bash
BRAND_NAME=EekenderTV \
BRAND_PRIMARY=#226dff \
BRAND_ACCENT=#ff6c51 \
APP_ID=dev.wallis.tv.eekender \
yarn build:desktop
```

`APP_ID` should be **distinct per recipient** — that way two installs from two recipients on the same machine don't share a `userData` directory.

## Verifying the output

Before sending, sanity-check the dmg:

```bash
# Should print the signing identity (your Developer ID Application).
codesign -dv --verbose=4 packages/localtv/release/*.dmg

# Should print "accepted" (notarization staple intact).
spctl --assess --verbose=4 --type install packages/localtv/release/*.dmg
```

Then either AirDrop the `.dmg`, drop it into a chat, or upload to a private GitHub Release. The recipient double-clicks → mounts → drags to Applications → opens. No Gatekeeper prompt, no terminal commands required from them.

## Known failure modes

- **"User-readable timeout" during notarize**: Apple's notary service is slow. The build will keep polling for up to 20 min. Re-run if it times out.
- **"errSecInternalComponent"**: the keychain is locked. `security unlock-keychain login.keychain` and retry.
- **API key invalid**: the `.p8` was generated for a role without notarize permission. Generate a new key with the Developer role.
- **"identity not found"**: `mac.identity` in `electron-builder.yml` is unset and the keychain has multiple Developer IDs. Set it explicitly to `"Developer ID Application: James Wallis (<TEAMID>)"` in `electron-builder.yml`.

## When this is done

- Move the ⏳ in `docs/plans/electron-mac-app-plan.md` (Phase 1 § "what shipped") to ✅.
- Capture the actual signed dmg size and notarize duration for future reference if interesting.
- All of Phase 1 is then complete; Phase 2 can begin.
