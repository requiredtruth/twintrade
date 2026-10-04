Fixes startup failures from malformed saved chart sessions and public-trade cache rows. Valid cached positions and zoom settings remain available.

- Android resume waits for the trading page to finish loading.
- Background-monitor startup runs on the foreground Activity main thread and handles platform rejections without terminating the app.
- Retains v26 zoom, BTCDEGEN liquidation overlays and app-switch continuity.
- Regression tests cover malformed caches, valid session preservation, native ledger/feed, mobile browser controls, Android 15 cold launch, app switching and process recreation.

Install TwinTrade.apk as an update; the signing certificate matches v26. Includes standalone HTML, source ZIP and spec.md.
