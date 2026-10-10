/* ============================================================
   SKY SKIRMISH - MONETIZATION CONFIG
   ------------------------------------------------------------
   TEST_MODE = true  -> Google's official TEST ad IDs are used.
                        No real ads, no real money. Safe to test.

   GOING LIVE (do all three):
   1. Set TEST_MODE = false below.
   2. Paste your REAL AdMob IDs into REAL_ADMOB_APP_ID and
      REAL_ADMOB_REWARDED_ID below.
   3. Android: open android/app/src/main/AndroidManifest.xml and replace
      the test App ID in the APPLICATION_ID meta-data with your real
      App ID (ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX).
      iOS: same value goes in ios/App/App/Info.plist (GADApplicationIdentifier)
      - note iOS needs its OWN AdMob App ID from your AdMob account.

   NEVER put secret keys in these files. AdMob IDs and product IDs are
   public identifiers, not secrets - they are safe to ship in the app.
   ============================================================ */
window.MONETIZATION = {
  TEST_MODE: false,

  // Google's official test IDs (https://developers.google.com/admob/android/test-ads)
  ADMOB_APP_ID: 'ca-app-pub-3940256099942544~3347511713',
  ADMOB_REWARDED_ID: 'ca-app-pub-3940256099942544/5224354917',

  // --- paste YOUR real IDs here when going live ---
  REAL_ADMOB_APP_ID: 'ca-app-pub-7106551747205025~3740032436',
  REAL_ADMOB_REWARDED_ID: 'ca-app-pub-7106551747205025/2235379078',

  // Google Play product IDs (must match EXACTLY what you create in
  // Play Console > your app > Monetize > Products > In-app products).
  // All four diamond packs are consumable (can be bought again).
  // remove_ads is a one-time (non-consumable) purchase.
  PRODUCTS: {
    DIAMONDS_80: 'diamonds_80',
    DIAMONDS_500: 'diamonds_500',
    DIAMONDS_1200: 'diamonds_1200',
    DIAMONDS_2600: 'diamonds_2600',
    REMOVE_ADS: 'remove_ads'
  }
};
