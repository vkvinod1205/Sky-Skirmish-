# Sky Skirmish — Monetization Guide (AdMob + Google Play Billing)

Everything is wired. The app is in **TEST MODE**: Google's official test ad IDs are
active and no real money can move. Follow this guide to go live.

## 0. Answer to "is this a native/Capacitor project?"

Yes — it is a **real Capacitor 8 project** (native Android + iOS shells around your
HTML5 game; gameplay, layout, controls and look untouched). Real AdMob rewarded ads
and Google Play Billing are implemented with native plugins:

- **Ads:** `@capacitor-community/admob` (native Google Mobile Ads SDK)
- **Purchases:** `cordova-plugin-purchase` v13 (native Google Play Billing Library)
- No Stripe, no PayPal, no payment links, no secret keys in the app. RevenueCat was
  not used (you didn't provide a key, and none is needed — billing talks to Google
  Play directly).

## 1. Going live with ads

**DONE 2026-10-10:** Vk's real IDs are wired in — `TEST_MODE: false`,
App ID `ca-app-pub-7106551747205025~3740032436`, rewarded unit
`ca-app-pub-7106551747205025/2235379078` (in `admob-config.js` + AndroidManifest).
Re-do these steps only if the IDs ever change:

1. Create/locate your app at [admob.google.com](https://admob.google.com) → Apps →
   add "Sky Skirmish" (Android). Copy your **App ID**
   (`ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`) and create a **Rewarded** ad unit →
   copy its **Ad Unit ID** (`ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`).
2. In `cap/web/admob-config.js`: set `TEST_MODE: false` and paste the two IDs into
   `REAL_ADMOB_APP_ID` / `REAL_ADMOB_REWARDED_ID`.
3. In `cap/android/app/src/main/AndroidManifest.xml`: replace the test App ID in the
   `APPLICATION_ID` meta-data with your real App ID.
   (iOS: same value in `cap/ios/App/App/Info.plist` → `GADApplicationIdentifier`,
   but note iOS needs its *own* AdMob App ID from your AdMob account.)
4. `npx cap sync` inside `cap/`, then rebuild.

**Testing ads:** leave `TEST_MODE: true` — Google's test IDs always show a test ad.
For extra safety on your own device, add it as a test device in AdMob.

## 2. Going live with purchases

1. Play Console → your app → **Monetize → Products → In-app products** → create 4
   **consumable** (managed) products with these EXACT IDs:
   `diamonds_80`, `diamonds_500`, `diamonds_1200`, `diamonds_2600`
   (names/descriptions/prices are yours; the game shows the real localized price
   from Google Play automatically).
2. Create one more product, type **non-consumable**: `remove_ads`.
3. Upload a release build to the **Internal testing** track first (see §4), then test.

**Testing purchases:** Play Console → Settings → License testing → add your Gmail as a
licensed tester (response: "RESPOND_NORMALLY"). Install the app from the internal
testing link on that account — purchases show as test purchases, no real charge.
Real purchases only work in a **signed release build** installed from Play, never
from a debug APK sideloaded by hand.

## 3. What was implemented (behavior)

- `showAd(title, rewardText, cb)` now shows a **real AdMob rewarded video**. `cb()`
  fires **only** when the reward is fully earned. Closed early / failed load →
  no reward + message "Ad not available, try again." / "Watch the full ad to earn
  the reward." Next ad is preloaded after each show. Offline → polite
  "not available right now", no crash. Used by: bonus XP (Upgrades), revive (fail
  screen), triple XP (win screen) — callers unchanged.
- Store diamond packs open the **Google Play purchase sheet**; on confirmation the
  diamonds are added (`prof.dia`), saved (`saveProf()`), home repainted
  (`paintHome()`), and the purchase is consumed so it can be bought again. Cancelled
  / failed → nothing granted + short message.
- Pack buttons show the **real Play Store price** (localized, e.g. ₹/$/€) once
  billing is ready; hard-coded prices remain as fallback.
- "Remove ads" one-time purchase in the Store; **"Restore purchases"** button in
  Settings (re-grants `remove_ads`).
- `DEV_TEST` is `false` — test buttons are gone.
- Privacy policy page bundled at `cap/web/privacy.html` and linked in Settings.

## 4. Building the signed release AAB

1. Open `cap/android` in Android Studio, let it sync.
2. Build → **Generate Signed App Bundle / APK** → **Android App Bundle** →
   **Create new** keystore (`.jks`): pick a strong password, fill the fields.
3. Build type: **release**. The `.aab` lands in
   `cap/android/app/build/outputs/bundle/release/`.
4. Play Console → create app → **Upload the .aab** → complete store listing →
   content rating → Data Safety (§5) → pricing → submit.

**Who holds the signing key? YOU — and only you.** The keystore is created on your
machine in step 2. **Back up the .jks file and both passwords forever** (USB stick /
password manager). Every update must be signed with the same key or Google rejects
it. If you enable **Play App Signing** (recommended), Google holds the final app
signing key and you hold the *upload* key — both are yours, both downloadable /
resettable from Play Console → Setup → App signing. I never saw or held any key.

## 5. Play Console compliance checklist

- **Privacy policy URL (required):** host `privacy.html` on a public URL. Easiest
  free options: drag the file into [Netlify Drop](https://app.netlify.com/drop) or
  put it in a public GitHub repo with GitHub Pages. Paste that URL into Play
  Console → App content → Privacy policy.
- **Ads declaration:** Play Console → App content → **Ads** → answer **"Yes, my app
  contains ads"** (required because of AdMob).
- **Data Safety form** (App content → Data safety): declare —
  - *Data collected:* **Device / advertising ID** (via AdMob SDK) and **Purchase
    history** (via Play Billing). *Collected by:* the SDKs. *Shared with third
    parties:* Google (AdMob). *Purposes:* Advertising / marketing, Fraud prevention
    and security. *Encrypted in transit:* Yes. *Data deletion:* users can reset the
    advertising ID in Android Settings → Privacy → Ads; game progress is deleted
    via in-game Settings → Reset progress.
- **Content rating:** complete the questionnaire honestly — a jetpack shooter with
  cartoon combat typically lands at **Everyone 10+**. Answer the violence questions
  as they apply.
- **Target audience / Designed for Families:** the game is NOT directed at children
  under 13 → do **not** enroll in Designed for Families; set target age 13+.
  In AdMob, leave child-directed treatment OFF (the plugin does not set
  `tagForChildDirectedTreatment`, which is correct for a 13+ game). If you ever
  target under-13s, the whole ads setup must change — ask me first.
- **App access / credentials:** none needed (no login).

## 6. Quick reference — files

See `CHANGED-FILES.md` for every file changed and what changed.
Config you will touch when going live: `cap/web/admob-config.js` (1 flag + 2 IDs)
and the App ID in `cap/android/app/src/main/AndroidManifest.xml`.
