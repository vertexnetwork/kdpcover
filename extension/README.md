# KDP Cover Calculator — Chrome Extension

Manifest V3 popup that ports the calculator from [kdpcover.pro](https://kdpcover.pro). Reuses the shared `lib/kdp/*` engine and `components/calculator/*` UI.

## Build

```bash
npm install -D @vitejs/plugin-react vite
npm run build:ext
```

Output goes to `extension/dist/`. Load this folder as an unpacked extension in `chrome://extensions` (Developer Mode → Load unpacked).

## Permissions

None. The extension runs the calc fully offline; no host access required.

## Publish

1. Add icons (`icons/icon-{16,32,48,128}.png`) and re-add the `icons` block to `manifest.json` — the Chrome Web Store will reject the listing without them.
2. Bump `version` in `extension/manifest.json`.
3. `npm run build:ext`.
4. Zip `extension/dist/`.
5. Upload at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
6. Once published, paste the listing URL into `lib/content/extension.ts → chromeWebStoreUrl`. The `/extension` page picks it up automatically.
