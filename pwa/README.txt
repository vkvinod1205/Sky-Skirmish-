SKY SKIRMISH: PWA PACKAGE
=========================

What is in this folder
  index.html      the game
  manifest.json   app name, icons, landscape and fullscreen settings
  sw.js           lets the game open offline
  icons/          app icons (normal and Android "maskable")

STEP 1: PUT THE FOLDER ON THE WEB (free, GitHub Pages)
  1. Make a free account at github.com and click New repository. Name it sky-skirmish, set it to Public.
  2. Click "uploading an existing file", drag in ALL the files and the icons folder from this package, click Commit.
  3. Open Settings > Pages. Under Build and deployment choose "Deploy from a branch", branch main, folder /(root), Save.
  4. After a minute your game is live at https://YOURNAME.github.io/sky-skirmish/
     Open that address on your phone to check it works.
  (Netlify Drop at app.netlify.com/drop is an even simpler alternative: drag the folder in.)

STEP 2: MAKE THE ANDROID APP WITH PWABUILDER
  1. Go to pwabuilder.com and paste your web address. Click Start.
  2. When the report finishes, click "Package for stores" and choose Android.
  3. Fill in: package ID (for example com.yourname.skyskirmish), app name Sky Skirmish, version 1.
     Keep Display mode "fullscreen" and Orientation "landscape".
  4. Download the zip. It contains an .aab file (for Google Play) and an .apk (to test on your phone),
     and a signing key file. KEEP THE SIGNING KEY AND ITS PASSWORD SAFE. You need it for every update.
  5. Install the .apk on your Android phone to test.

STEP 3: GOOGLE PLAY
  Create a Google Play Console account ($25 one time), create the app, upload the .aab, fill in the store page,
  privacy policy and age rating, then submit for review.

BEFORE YOU PUBLISH
  - In index.html, search for "DEV_TEST = true" and change it to "DEV_TEST = false" to remove the test diamond/XP buttons.
  - The ads and diamond packs are placeholders. For real earnings you need an ad network (AdMob) and Google Play Billing.
  - When you change the game later, upload the new index.html and change VERSION in sw.js so phones fetch the update.
