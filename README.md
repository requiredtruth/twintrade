# TwinTrade 0.3.0
Android BTC/ETH paper terminal with combined high-leverage views and a Polygon USDC live-order implementation.

**Read spec.md for the implemented behavior and remaining limitations. Live execution has not been end-to-end validated.**

Install the supplied APK as an update over the previous build (same certificate). No uninstall is needed. Android 8+ with a current System WebView is required. Paper mode is the default. A live oracle connection is required to trade. The sidebar preloads open BTC/ETH traders and subscribes to Gains trade events. Entries are yellow/purple, liquidations pink. Tap a trader to focus its lines. The chart preloads Gains one-minute history. Settings contains RPC endpoints, encrypted Android wallet storage, mode selection, and explicitly estimated paper costs.

## This update
- User-supplied Polygon nodes, diamond, native USDC, vault, Pyth address and complete BTC feed ID are registered in config.js.
- BTC orders are capped at 200×. Settings exposes Node HTTPS RPC / Node WSS RPC, defaults restoration, and read-only connection diagnostics.
- Header and Long/Short controls fit between Android status/cutout and navigation bars.
- Screenshots work.
- Collateral uses 1–100% of available balance; the order preview shows dollars.
- Paper begins at $100; Respawn $100 is on the main screen and sidebar.
- A foreground service records candles and checks paper liquidations while other apps are open. Allow notifications; Battery settings is available for unrestricted monitoring. Stop monitoring from its notification or Settings.
- Existing paper state is migrated on upgrade.

## Build on Linux
```sh
./install.sh
./build.sh
```
Use `ANDROID_SDK_ROOT` if you already have an SDK. JDK 17+ is required. Output: `dist/TwinTrade.apk`. The build creates `build/signing.jks`; preserve it for your future updates and do not publish it. A source rebuild does not share the delivered APK's signing certificate.

## Tests
```sh
node tests/engine.test.cjs
node tests/app-smoke.test.cjs
node tests/sdk-liq.test.cjs
node tests/config.test.cjs
node --check app/src/main/assets/app.js
```

## Structure
- `app/src/main/java/.../MainActivity.java`: secure local WebView and Android Keystore vault.
- `app/src/main/assets/engine.js`: paper accounting and pricing parser.
- `app/src/main/assets/app.js`: chart/UI, WebSocket, Polygon events and signed orders.
- `app/src/main/assets/abi.js`: official SDK contract ABI.
- `app/src/main/assets/ethers.js`: bundled Ethers library.
- `spec.md`: requirements, status, protocol details and limitations.

No account credentials are included. No trades were sent while building this app.

Native ledger regression test: compile `tests/java/android/content/*.java`, `MarketStore.java`, and `tests/java/MarketStoreTest.java` with a JDK and org.json 20240303 on the classpath, then run MarketStoreTest. These Android context doubles test the ledger without an emulator.
