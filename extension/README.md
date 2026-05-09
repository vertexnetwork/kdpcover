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

1. Bump `version` in `extension/manifest.json`.
2. `npm run build:ext`.
3. Zip `extension/dist/`.
4. Upload at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
5. Once published, paste the listing URL into `lib/content/extension.ts → chromeWebStoreUrl`. The `/extension` page picks it up automatically.
