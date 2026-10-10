# Sky Skirmish — Changed files (monetization update, 2026-10-10)

## New files
- `cap/web/admob-config.js` — ONE place for all monetization settings: TEST_MODE
  flag, Google test AdMob IDs, slots for your real AdMob App ID + Rewarded Ad Unit
  ID, and the 5 Google Play product IDs. No secrets in here (IDs are public).
- `cap/web/native-bridge.js` — `window.NativeBridge`: safe wrapper around the native
  plugins. AdMob rewarded flow (preload, show, reward-only-on-completion,
  offline/failure messages) and Play Billing flow (register 4 consumables +
  remove_ads, order, verify→finish→grant, restore, live prices). Every method is
  guarded — on web, offline, or on failure it calls back with a polite message,
  never throws.
- `cap/web/privacy.html` — privacy policy page (ads via AdMob, purchases via Google
  Play Billing, on-device progress, data deletion). Bundled in the app + linked in
  Settings. Host it publicly for the Play Console URL.
- `MONETIZATION-GUIDE.md` — going-live steps, test ads/purchases, signed AAB build,
  signing-key ownership, Data Safety / ads declaration / content rating checklist.
- `CHANGED-FILES.md` — this file.

## Modified files
- `cap/web/index.html`
  - Loads `admob-config.js` + `native-bridge.js` before the game script.
  - `showAd(title, rewardText, cb)`: fake 5-second test-ad screen REPLACED with a
    real AdMob rewarded video via `NativeBridge.showRewarded`. `cb()` fires only on
    earned reward; early close/failure/offline → toast message, no reward. Callers
    (bonus XP, revive, triple XP) untouched. `prof.noAds` owners skip the ad and get
    the reward directly.
  - Store modal: pack buttons now show the **live Google Play price** when billing
    is ready (hard-coded price as fallback); added a "Remove ads (one-time)" row.
  - `data-act="pack"` handler: "checkout is not connected" message REPLACED with a
    real `buyProduct('diamonds_*')` call → on confirmation adds diamonds to
    `prof.dia`, calls `saveProf()` + `paintHome()`; cancel/fail → short message,
    nothing granted.
  - New `data-act="noads"` handler: buys the one-time `remove_ads` product.
  - New `data-act="restore"` handler: `restorePurchases()` re-grants `remove_ads`.
  - Settings screen: added **Restore purchases** button and a **Privacy policy**
    link (opens `privacy.html`).
  - `newProf()` / `loadProf()`: added `noAds: 0` flag (persisted in the save).
  - Boot: calls `NativeBridge.init()` (AdMob initialize + billing register);
    exposes `window.__skRefreshPrices()` so the Store re-renders when Play prices
    arrive.
  - Gameplay, layout, controls, visuals: NOT changed.
- `cap/android/app/src/main/AndroidManifest.xml`
  - Added AdMob `APPLICATION_ID` meta-data (Google test App ID; swap for your real
    one when going live) and the `AD_ID` permission (required on Android 13+).
- `cap/ios/App/App/Info.plist`
  - Added `GADApplicationIdentifier` (test ID so iOS doesn't crash on AdMob init;
    iOS needs its own real AdMob App ID for release).
- `cap/package.json` / `cap/package-lock.json` — added `@capacitor-community/admob`
  and `cordova-plugin-purchase` (installed, `npx cap sync` run).

## Unchanged (still placeholders by design)
- `DEV_TEST` was already `false`.
