# TwinTrade 0.23.0

Android and standalone browser trading terminal reconstructed from the supplied v17 APK. Paper mode is the default; Android live trading uses Polygon native USDC and requires POL for gas.

## Releases

- [Original source beta](https://github.com/requiredtruth/twintrade/releases/tag/v0.3.0-beta): supplied source ZIP preserved unchanged.
- [Supplied v17](https://github.com/requiredtruth/twintrade/releases/tag/v0.17.0-supplied): original APK preserved unchanged, exact extracted web assets and native dissection.
- v0.20.0: reconstructed native source, corrected live approval, explicit order review, fresh index quotes, bounded receipt waits, reconnect watchdog, market-specific history loading, validated candles/costs and dynamic market limits.

Each release has APK, self-contained HTML, source ZIP, spec.md and SHA256SUMS. See spec.md and V17-AUDIT.md for provenance and validation limits. No funded trade or physical Android-device test was performed. This is a client of Gains/Polygon services; outages can pause trading.

## Build and test

JDK 17+, Node and Python 3 are required.

```sh
./install.sh
./test.sh
./build.sh
./run.sh
```

Set ANDROID_SDK_ROOT for an existing SDK with Android 35 and build-tools 35.0.0. APK: dist/TwinTrade.apk. Browser file: dist/TwinTrade.html. `./cli.sh test`, `./cli.sh build` and `./cli.sh web` expose the same workflows. CI also runs real Chromium layout and rotation checks.

The browser version supports paper trading and public data. Private-key persistence/live signing requires the Android Keystore bridge. It does not silently store keys in browser localStorage.

## APK installation

The supplied v17 APK uses its original certificate. This rebuilt release uses a different certificate. Installing over the original will fail; preserve your wallet recovery material and paper records before uninstalling it. No wallet or signing private keys are included in the repository or public release. Source builds generate a local build/signing.jks; preserve it privately for future updates.

0.20.0 adds stable public trade tracking, reset chart, bold high-leverage averages, 30-second desync warnings and all-market Portfolio / Past trades menu pages. Confirmed live history import covers the backend's past-24h window; missing settlements remain unavailable.

0.21.0 repairs candle gaps with history reconciliation and marked placeholders, aligns own chart labels with net P&L, separates opening/closing fees, and labels holding gains/losses. Paper estimates preserve their entry assumptions; live closing costs remain estimates until settlement.

0.22.0 removes repeating near-LIQ alerts, adds a live Stats popup, fixes own live liquidation lines and stale connection callbacks, and caches unchanged chart averages.

0.23.0 restores foreground prices when Android background monitoring is stopped, writes recovery quotes into the native ledger, and adds price-transport diagnostics and manual reconnection under Stats.
