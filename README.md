# TwinTrade 0.19.0

Android and standalone browser trading terminal reconstructed from the supplied v17 APK. Paper mode is the default; Android live trading uses Polygon native USDC and requires POL for gas.

## Releases

- [Original source beta](https://github.com/requiredtruth/twintrade/releases/tag/v0.3.0-beta): supplied source ZIP preserved unchanged.
- [Supplied v17](https://github.com/requiredtruth/twintrade/releases/tag/v0.17.0-supplied): original APK preserved unchanged, exact extracted web assets and native dissection.
- v0.19.0: reconstructed native source, corrected live approval, explicit order review, fresh index quotes, bounded receipt waits, reconnect watchdog, market-specific history loading, validated candles/costs and dynamic market limits.

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
