# Sky Skirmish — Android & iOS apps

Your PWA has been wrapped into **real native apps** with Capacitor 8. No rewrite: the
game files ship *inside* the app, so it plays fully offline — no website or hosting needed.

## What was set up

- **Package ID:** `com.skyskirmish.game` (used for both stores; change it *before* your
  first Play/App Store upload if you want a different one)
- **App name:** Sky Skirmish, version 1.0.0
- **Orientation:** landscape locked on both platforms; fullscreen (status/nav bars hidden)
- **Icons:** your game icon applied as the launcher icon on both platforms
- **Theme color:** #120d26 (dark purple) for splash/background
- **Ship-ready:** the test buttons were removed (the package's `DEV_TEST` flag is now off,
  per the README's before-you-publish step)
- Project folder: `sky-skirmish-app/cap/`
  - `web/` — the game (edit here, then re-sync)
  - `android/` — full Android Studio project
  - `ios/` — full Xcode project (`ios/App/App.xcworkspace`)

## Android — install & publish

**Test on your phone (APK):** I couldn't compile the APK on my own machine (it ran
out of memory during the build), but it's a one-click job in Android Studio:
1. Open `cap/android` in Android Studio (free) and let it finish syncing.
2. Menu: Build → Build App Bundle(s) / APK(s) → Build APK(s).
3. Find it at `cap/android/app/build/outputs/apk/debug/app-debug.apk`.
Copy it to your phone (use Google Drive or WhatsApp "send to yourself" — your phone's
browser swallows direct download links, so don't use the Safari-paste trick for this),
tap it, allow "install unknown apps", and play.

**Google Play ($25 one-time):**
1. Open `cap/android` in Android Studio (free).
2. Build → Generate Signed App Bundle/APK → Android App Bundle → create a new keystore
   (.jks). **Back up the .jks file and its passwords forever** — every update must be
   signed with the same key or Google rejects it.
3. Pay $25 at play.google.com/console, create the app, upload the `.aab`, fill in the
   store listing, content rating questionnaire, and (for a game) a privacy policy URL.
4. Submit for review (usually 1–3 days).

## iOS — needs a Mac

Android builds anywhere; **iOS apps can only be built on a Mac with Xcode** (Apple's rule).
1. Copy the whole `sky-skirmish-app` folder to a Mac (or ask me and I'll walk you through it).
2. Open `cap/ios/App/App.xcworkspace` in Xcode.
3. Select the App target → Signing & Capabilities → add your Apple ID as the team, set a
   unique Bundle Identifier (e.g. `com.skyskirmish.game`).
   - Free Apple ID: you can install it on your own iPhone for 7-day testing.
   - App Store: Apple Developer Program, **$99/year**, then Product → Archive → Distribute.
4. App Store review for games usually takes ~1–2 days. Your ads/diamond packs are
   placeholders — wire up AdMob + In-App Purchase before submitting, and Apple requires
   real functionality for anything you charge for.

## Updating the game later

1. Edit the files in `cap/web/` (your game).
2. Run `npx cap sync` inside `cap/` (copies the game into both native projects).
3. Rebuild the APK/AAB in Android Studio, re-archive in Xcode. Bump the version:
   Android `android/app/build.gradle` (`versionCode`/`versionName`), iOS in Xcode
   (Marketing Version / Current Project Version).

## Honest notes

- The ads and diamond packs in the game are placeholders. Real earnings need AdMob
  (ads) and Google Play Billing / Apple In-App Purchase (diamonds) wired into the code.
- Debug APKs show a small "not from Play Store" warning on install — normal; the signed
  release build won't.
- Never lose your Android keystore (.jks) — without it you can never update the app.
