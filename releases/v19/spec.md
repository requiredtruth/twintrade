# TwinTrade 0.19.0 specification

## Provenance and release lineage
The supplied ZIP contains TwinTrade 0.3.0. It is preserved byte-for-byte in the beta release. The supplied APK is 0.17.0 (versionCode 17); it is preserved byte-for-byte in the supplied-v17 release. Its exact eight web assets were extracted, and its application Java was inspected with JADX. This version reconstructs buildable native Java using the original source plus that analysis, then applies the fixes below. It is not a claim that recompilation reproduces the original APK bytes. This APK uses versionCode 19, versionName 0.19.0, package com.twintrade.app, min API 26 and target API 35.

## Delivered behavior
- Bundled BTC/ETH, distinct BTCDEGEN/ETHDEGEN and broader market registry with runtime discovery. Updated remote caps override bundled caps, and disabled markets cannot be selected for new orders. Native paper caps receive the same registry through the secure local bridge.
- $100 paper account, percentage collateral choices, long/short positions, signed funding, borrowing and both entry/exit fee estimates. Existing positions retain their original cost assumptions. Reset explicitly confirms clearing paper state.
- Android foreground monitoring owns the synchronized paper ledger, all market quotes and up to 600 minute candles per market. Liquidation and cash settlement continue while the WebView is backgrounded. Native and browser duplicate closes do not credit twice.
- Gains v4 mark/index parsing, timestamp checks, reconnect watchdogs, chart snapshots and one-minute history. Cached/history candles do not make an order quote fresh. A quote must be positive, finite, at most five seconds old and not future-dated. Older native ticks do not overwrite newer quotes.
- History requests capture their market before awaiting the network. Concurrent BTC/ETH requests merge only into their originating market. Singleton candles and impossible OHLC values are rejected.
- Public open-trader snapshots and streams, global Polygon/Arbitrum/Base views, same-entry/leverage grouping, yellow/purple entries, liquidation overlays, chart drag/pinch/zoom, sounds, data-rate and freshness indicators. Public P&L and fees are estimates, not authoritative accounting.
- Safe-area handling for system bars, display cutouts and keyboard, compact-height layout, settings drawer, native battery settings and full monitor exit.

## Live order execution
Chain: Polygon 137. Diamond 0x209A9A01980377916851af2cA075C2b170452018. Native USDC 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359, six decimals, collateral index 3. HTTPS/WSS nodes are configurable and checked against Polygon. Contract addresses and market names are validated before execution; simulation remains the final contract preflight.

Android Keystore encrypts a user-supplied wallet key. The browser build cannot persist a key or sign without this bridge. Enabling live mode is explicit. Every live open and close requires confirmation. Open review shows market, side, collateral, leverage, notional and maximum slippage before approval/signing. USDC approval is connected to the wallet signer, with an exact allowance. Live expected prices use fresh index quotes rather than chart mark prices. No wallet is generated, funded or traded during development.

Pending requests are persisted and shown. Open/close submission is serialized; unresolved pending/uncertain orders block another order for the wallet. Receipt waits have a 60-second ceiling: timeout means uncertain, not success. Receipt/order reconciliation continues every 12 seconds and when returning to the app. Approval-only submissions reconcile separately. Successful replacement receipts are accepted. Wallet/node/mode changes are blocked while an order is actively submitting. No automatic retry sends another trading transaction.

## Validation
Six JavaScript regression suites cover accounting, SDK liquidation calculations, protocol constants, actual application handlers, duplicate settlement, signer-bound approval, rejected review, pending-order exclusion, market-switch history races, dynamic leverage changes, disabled markets, quote freshness and malformed candles/costs. Two Java ledger suites cover native allocation, liquidation, settlement, DEGEN markets, duplicate settlement, caps and timestamp/candle/cost validation. APK is compiled from the delivered Java/assets, aligned and signature verified. CI runs the standalone HTML in Chromium at 393×852, 852×393, 360×640 and 740×360, including repeated rotations, paper order rendering and settings controls, before release publication.

## Operational limits
No funded end-to-end open/close transaction and no physical Android installation were performed. Browser rendering is verified by CI; native lifecycle/insets still need device testing. Service uptime depends on Android power policy and user notification/background permissions. Public feeds, history APIs, oracle availability and RPC services can fail; stale quotes pause submission. A receipt does not establish oracle execution. Ambiguous order resolution remains visible for chain inspection. The current journal does not retain a signed prebroadcast transaction; a provider failure before returning a hash still requires checking the wallet on-chain before attempting another order. External market/contract changes may require another release. No promise of uninterrupted exchange service is made.

## Signing and artifacts
The original APK retains its original certificate. The rebuilt release has a new certificate and cannot update that installation directly. Back up wallet recovery material before uninstalling. Public release files are TwinTrade.apk, TwinTrade.html, TwinTrade-source.zip, spec.md and SHA256SUMS. Signing private keys and wallet keys are excluded.
