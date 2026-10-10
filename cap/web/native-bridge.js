/* ============================================================
   SKY SKIRMISH - NATIVE BRIDGE (Capacitor)
   ------------------------------------------------------------
   window.NativeBridge - safe wrapper around the native plugins:
     init()                        - call once at game boot
     isNative()                    - true inside the Android/iOS app
     showRewarded(cb)              - real AdMob rewarded video.
                                     cb(earned:boolean, message:string|null)
     isBillingReady()              - true when Google Play Billing is up
     buyProduct(productId, cb)     - Google Play purchase sheet.
                                     cb(ok:boolean, message:string|null, diamonds:number)
     restorePurchases(cb)          - re-grants non-consumables (remove_ads).
                                     cb(restoredProductIds:string[]|null)
     priceFor(productId)           - localized Play Store price or null

   Every method is guarded: on web, offline, or on any failure it calls
   back with a polite message instead of throwing. Rewards are granted
   ONLY after the ad is fully watched / the purchase is confirmed.
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.MONETIZATION || {};
  var TEST_MODE = CFG.TEST_MODE !== false;
  var REWARDED_ID = TEST_MODE ? CFG.ADMOB_REWARDED_ID : CFG.REAL_ADMOB_REWARDED_ID;
  var DIAMONDS_FOR = { diamonds_80: 80, diamonds_500: 500, diamonds_1200: 1200, diamonds_2600: 2600 };

  function isNative() {
    try { return !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()); }
    catch (e) { return false; }
  }
  function online() {
    try { return typeof navigator === 'undefined' || navigator.onLine !== false; }
    catch (e) { return true; }
  }
  function validAdId(id) { return typeof id === 'string' && id.indexOf('ca-app-pub-') === 0 && id.indexOf('PASTE') < 0; }

  /* ---------------- REWARDED ADS (AdMob) ---------------- */
  var AdMob = null, adReady = false, adLoading = false;
  var rewardCb = null, rewardEarned = false;

  function finishReward(earned) {
    if (!rewardCb) return;
    var cb = rewardCb; rewardCb = null; rewardEarned = false;
    preloadAd(); // preload the next ad right away
    cb(earned, earned ? null : 'Watch the full ad to earn the reward.');
  }

  function preloadAd() {
    if (!AdMob || adLoading || adReady || !validAdId(REWARDED_ID)) return;
    adLoading = true;
    try {
      AdMob.prepareRewardVideoAd({ adId: REWARDED_ID, isTesting: TEST_MODE })
        .then(function () { adReady = true; adLoading = false; })
        .catch(function () { adReady = false; adLoading = false; });
    } catch (e) { adLoading = false; }
  }

  function initAds() {
    if (!isNative() || !validAdId(REWARDED_ID)) return;
    try {
      AdMob = (Capacitor.Plugins || {}).AdMob;
      if (!AdMob) return;
      AdMob.initialize({ initializeForTesting: TEST_MODE }).catch(function () {});
      AdMob.addListener('onRewardedVideoAdReward', function () { rewardEarned = true; });
      AdMob.addListener('onRewardedVideoAdDismissed', function () { finishReward(rewardEarned); });
      AdMob.addListener('onRewardedVideoAdLoaded', function () { adReady = true; adLoading = false; });
      AdMob.addListener('onRewardedVideoAdFailedToLoad', function () { adReady = false; adLoading = false; });
      AdMob.addListener('onRewardedVideoAdFailedToShow', function () { adReady = false; finishReward(false); });
      preloadAd();
    } catch (e) { AdMob = null; }
  }

  function showRewarded(cb) {
    if (!isNative() || !AdMob) { cb(false, 'Ads are not available right now.'); return; }
    if (!online()) { cb(false, 'No internet connection. Ads are not available right now.'); return; }
    if (rewardCb) return; // one ad at a time
    rewardEarned = false;
    var run = function () {
      rewardCb = cb;
      try {
        AdMob.showRewardVideoAd()
          .then(function () { rewardEarned = true; finishReward(true); })
          .catch(function () { finishReward(rewardEarned); });
      } catch (e) { finishReward(false); }
    };
    if (adReady) { run(); return; }
    preloadAd();
    var waited = 0;
    var iv = setInterval(function () {
      waited += 500;
      if (adReady) { clearInterval(iv); run(); }
      else if (waited >= 8000) { clearInterval(iv); cb(false, 'Ad not available, try again.'); }
    }, 500);
  }

  /* ---------------- IN-APP PURCHASES (Google Play Billing) ---------------- */
  var store = null, billingReady = false, pendingBuy = null;

  function failPending(msg) {
    if (!pendingBuy) return;
    var cb = pendingBuy.cb; pendingBuy = null;
    cb(false, msg, 0);
  }

  function initBilling() {
    if (!isNative()) return;
    try {
      if (!window.CdvPurchase || !CdvPurchase.store) return;
      store = CdvPurchase.store;
      var PT = CdvPurchase.ProductType;
      var ids = ['diamonds_80', 'diamonds_500', 'diamonds_1200', 'diamonds_2600', 'remove_ads'];
      store.register(ids.map(function (id) {
        return { id: id, type: id === 'remove_ads' ? PT.NON_CONSUMABLE : PT.CONSUMABLE };
      }));
      // Approve -> verify locally -> finish (consumes consumables).
      store.when().approved(function (t) { t.verify(); });
      store.when().verified(function (receipt) { receipt.finish(); });
      // Grant per product once verified.
      ids.forEach(function (id) {
        store.when(id).verified(function () {
          if (pendingBuy && pendingBuy.pid === id) {
            var cb = pendingBuy.cb; pendingBuy = null;
            cb(true, null, DIAMONDS_FOR[id] || 0);
          }
        });
        store.when(id).cancelled(function () { failPending('Purchase cancelled.'); });
      });
      store.error(function () { failPending('Purchase failed. Please try again.'); });
      store.when().unverified(function () { failPending('Could not verify the purchase.'); });
      store.ready(function () {
        billingReady = true;
        if (window.__skRefreshPrices) { try { window.__skRefreshPrices(); } catch (e) {} }
      });
      store.initialize().catch(function () { billingReady = false; });
    } catch (e) { store = null; billingReady = false; }
  }

  function buyProduct(pid, cb) {
    if (!isNative() || !store || !billingReady) { cb(false, 'Purchases are not available right now.', 0); return; }
    if (!online()) { cb(false, 'No internet connection. Purchases are not available right now.', 0); return; }
    if (pendingBuy) return;
    var prod = null;
    try { prod = store.get(pid); } catch (e) {}
    if (!prod || !prod.canPurchase) { cb(false, 'This item is not available for purchase right now.', 0); return; }
    pendingBuy = { pid: pid, cb: cb };
    try {
      var r = store.order(pid);
      if (r && r.catch) r.catch(function () { failPending('Purchase failed. Please try again.'); });
    } catch (e) { failPending('Purchase failed. Please try again.'); }
    // Safety net: never leave the callback hanging.
    setTimeout(function () { failPending('Purchase timed out. You were not charged.'); }, 120000);
  }

  function restorePurchases(cb) {
    if (!isNative() || !store || !billingReady) { cb(null); return; }
    if (!online()) { cb(null); return; }
    try {
      store.restorePurchases().then(function () {
        var out = [];
        try {
          if (store.owned('remove_ads')) out.push('remove_ads');
        } catch (e) {}
        cb(out);
      }).catch(function () { cb(null); });
      setTimeout(function () { cb(null); }, 30000); // never hang
    } catch (e) { cb(null); }
  }

  function priceFor(pid) {
    try {
      if (store && billingReady) {
        var p = store.get(pid);
        if (p && p.price) return p.price; // localized price from Google Play
      }
    } catch (e) {}
    return null;
  }

  window.NativeBridge = {
    init: function () { try { initAds(); } catch (e) {} try { initBilling(); } catch (e) {} },
    isNative: isNative,
    isTestMode: function () { return TEST_MODE; },
    showRewarded: showRewarded,
    isBillingReady: function () { return isNative() && !!store && billingReady; },
    buyProduct: buyProduct,
    restorePurchases: restorePurchases,
    priceFor: priceFor
  };
})();
