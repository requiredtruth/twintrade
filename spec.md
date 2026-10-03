# TwinTrade 0.3.0

Package `com.twintrade.app`, versionCode 3. Android 8+/API 26, target API 35, current Android System WebView. Signed with the same development certificate as the delivered 0.1.0 APK: install as an update, without uninstalling.

## Requested fixes and implemented behavior

1. **Top and bottom safe area.** A native FrameLayout consumes system-bar, display-cutout and keyboard insets. The WebView is measured inside the remaining area, so its menu/gear are below the status bar and its Long/Short controls are above Android's home/back/recents or gesture area. Compact-height CSS supports smaller viewports.
2. **Screenshots enabled.** The secure-window screenshot restriction is cleared. Screenshots and recordings are allowed.
3. **Past candles on startup.** Fetch up to five hours of Gains one-minute BTC/ETH candles from `https://api.gains.trade/v1/polygon/markets/{BTC-USD|ETH-USD}/candles?interval=1m&from=...&to=...`. Parse the documented `data` array with millisecond time and decimal OHLC strings. Merge with recorded live bars; retain up to 600 candles per market. Retry history on network failure and after reconnect. No invented prices or other-exchange substitution.
4. **Percentage collateral.** Choices: 1%, 2%, 5%, 10%, 25%, 50%, 75%, 100% of available balance. The preview shows the resulting dollar collateral and notional. BTC leverage is capped at the user-specified 200× in the UI, browser paper engine, native paper engine, and order validation. ETH retains its previous configured cap. Live requests still undergo protocol simulation; selection does not override protocol restrictions.
5. **$100 paper account and visible respawn.** Fresh account is $100. Main chart toolbar and sidebar both offer Respawn $100. Confirmation resets paper cash, positions, and history. Existing paper state migrates on update; it is not forcibly discarded.
6. **Other traders' entry AND liquidation lines.** Preload existing open positions from `https://backend-polygon.gains.trade/open-trades`, using `/trading-variables/all` for protocol state. Include BTC/ETH across normal/high leverage and collateral types. Subscribe to the backend event stream for registration, closure, leverage/size changes and reorg invalidation. Refresh snapshots and liquidation calculations. RPC enumeration is a fallback if the backend snapshot is unavailable.
7. **Keep-alive.** User-enabled Android foreground service, ongoing notification, partial wake lock and reconnect watchdog. Native service owns price ingestion, candle construction, persistence and paper liquidation checks. Switching apps does not depend on WebView timers continuing. Resume reads its candle and ledger state. Notification and Settings can stop monitoring. Battery settings can be opened from Settings.

## Chart and public-trader overlays
- Exactly two markets: BTC/USD (pair 0) and ETH/USD (pair 1).
- Gains raw price stream: `wss://backend-pricing.eu.gains.trade/v4`.
- Alternating `[pairIndex, price, ...]`; singleton heartbeats ignored. Trades require a price newer than five seconds.
- Yellow: long entry. Purple: short entry. Pink dashed line: liquidation. Entry labels include leverage and USD collateral amount.
- By default show the nearest 60 public entries and their available liquidation boundaries. Tap a sidebar trader to focus that trader's lines; tap again to restore the overview. The sidebar lists the complete loaded BTC/ETH snapshot.
- Public liquidation prices use official SDK 1.8.10 converters, context builder and liquidation formula, including available fee/holding/threshold data. Event/contract liquidation values are also supported. Unknown liquidation data is labeled loading/unavailable, never replaced with a fabricated value.
- SDK math is bundled locally with a reproducible subset-bundling script. It needs no runtime CDN scripts.
- Price/P&L UI updates four times per second. Public liquidation estimates recalculate every five seconds from the latest available backend state; state refreshes via events and periodic snapshot refresh.
- Both backend and contract-event connections are supported. A bad endpoint or disconnected provider is reported explicitly.

## Native background architecture
`PriceMonitorService` starts in foreground with an ongoing notification. A Java-WebSocket client collects the oracle stream independently of the UI. `MarketStore` is the synchronized owner of candles, quotes, and the paper ledger. Both native UI-bridge order actions and background liquidation processing operate under its lock; the screen cannot overwrite a liquidation with stale paper state.

Minute OHLC candles and paper state persist in app-private preferences. Candle storage checkpoints every five seconds; ledger changes save immediately. A watchdog retries broken/stale streams. History fetching runs on a separate worker and merges chronologically with live data. No duplicated browser pricing socket is used in the APK.

Keep-alive is designed for app switching. Android force-stop, explicit Stop monitoring, a powered-off phone, prolonged network outage, or device-imposed battery restrictions can stop data collection. Foreground-service restart and history backfill recover candle history where the API has it; unseen intra-outage price paths cannot guarantee exact missed paper-liquidation reconstruction. No claim of uninterrupted service through force-stop is made.

## Paper accounting
Paper orders allocate the selected percentage of free paper cash, rounded down to six decimals. Opening/closing fees and adverse fill slippage are applied to the simulation. Holding cost includes borrowing and signed funding by elapsed hours. Positive funding charges longs and credits shorts. Native background ticks execute paper liquidation and persist history even while the UI is inactive.

Default editable **estimates**, not verified exact Gains execution costs:
- Fee 0.03% of initial notional per side.
- Adverse slippage 0.005% per side.
- Borrowing 0.001% of notional per hour.
- Funding 0% per hour initially.
- Liquidation at 90% collateral net loss; gaps may consume all collateral, never produce negative payout.

Each paper trade retains its initial cost settings. Paper prices come from Gains, but paper fee, dynamic spread/impact and liquidation mechanics are not a full protocol replica.

## Live Polygon implementation retained
- Polygon chain 137; USDC collateral index 3, active status, symbol and six decimals checked at runtime.
- Diamond from SDK: `0x209A9A01980377916851af2cA075C2b170452018`.
- Node HTTPS RPC and Node WSS RPC are pre-populated with the user-supplied Polygon nodes; WSS failure falls back to HTTPS event polling.
- Masked Polygon private-key field, AES-GCM encryption with Android Keystore, local signing with bundled Ethers 5.7.2.
- Explicit PAPER/LIVE switch; each launch defaults to PAPER.
- Balance and exact-amount approval check, order review, fresh quote, `eth_call` simulation then signed `openTrade`. USDC approval receipt is distinct from a trade transaction.
- Sending → receipt pending → oracle pending → actual open-trade reconciliation. A mined request is not itself treated as execution. Cancellation and uncertain outcomes are displayed.
- Close via simulated/signed `closeTradeMarket`; receipts/pending order IDs reconcile across reopening.
- WebSocket mark-to-oracle P&L; borrowing, funding, fees and liquidation data refreshed through contract reads. Net live P&L is an estimate; execution price impact/slippage and POL gas can differ. Gas is not converted into USDC P&L.
- Key is never placed in source, localStorage, logs or requests. It exists decrypted in process memory while signing is available. Screenshots are now explicitly allowed as requested.

## Source and build
- `MainActivity.java`: safe-area layout, screenshot behavior, WebView and key/feed bridges.
- `PriceMonitorService.java`: foreground service, connection watchdog and Gains history.
- `MarketStore.java`: synchronized native paper ledger, candle persistence and liquidation.
- `engine.js`: browser fallback accounting, percentage sizing and candle parser.
- `app.js`: UI, public snapshots/events, SDK liquidation and live execution.
- `gains-math.js`: SDK math/converter subset; `tools/bundle-sdk.py` rebuilds it from official SDK 1.8.10.
- `libs/`: Java-WebSocket 1.5.7, SLF4J API 2.0.6, included for offline compilation once Android tools are installed.
- `install.sh`, `build.sh`: JDK 17+ and Android platform/build-tools 35.0.0. Build output `dist/TwinTrade.apk`.

Preserve your locally generated signing key for future source rebuilds. The source archive contains no wallet keys or APK signing private key. The delivered update itself uses the original signing key.

## Verification
Passed:
- Java compilation and Android DEX generation.
- Price parsing, fee/slippage/funding, percentage bounds, chronological history parsing and liquidation-equation tests.
- Application-handler tests with DOM/transport doubles: long/short, percent allocation, settings, market switch and paper close.
- Bundled SDK long/short fee-adjusted liquidation-boundary tests.
- Native ledger tests with in-memory Android-context doubles: percent/100% sizing, background tick liquidation, settlement, minute-candle accumulation and respawn.
- APK signature and alignment checks; upgrade signing certificate comparison.

Not completed here: physical-device layout/install/background-service verification and end-to-end mainnet trading. The environment returned HTTP 403 for public Gains API/backend requests, so the remote snapshot/history integrations remain unverified against a live response here. No funds were sent during development.

## References
- [Gains historical candles](https://docs.gains.trade/api-reference/markets/historical-candles)
- [Gains backend and event stream](https://docs.gains.trade/developer/integrators/backend)
- [Open-trades endpoint migration](https://docs.gains.trade/developer/integrators/guides/backend-endpoint-refactor)
- [Liquidation calculation guide](https://docs.gains.trade/developer/integrators/guides/calculating-liquidation-price)
- [Official Gains SDK](https://www.npmjs.com/package/@gainsnetwork/sdk)

## 0.3.0 — supplied Polygon registry

`config.js` is the shared browser network/market registry; submission snapshots the selected market before asynchronous approvals so switching charts cannot change the order's pair index.

| Setting | Configured value |
| --- | --- |
| Chain ID | 137 — Polygon PoS |
| Node HTTPS RPC | https://polygon-bor-rpc.publicnode.com |
| Automatic default-HTTPS transport fallback | https://polygon-rpc.com |
| Node WSS RPC | wss://polygon-bor-rpc.publicnode.com |
| Trading diamond | 0x209A9A01980377916851af2cA075C2b170452018 |
| Pyth contract | 0xff1a0f4744e8582DF1aE09D5611b887B6a12925C |
| Native USDC | 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 |
| USDC decimals / collateralIndex | 6 / 3 |
| gUSDC vault | 0x29019Fe2e72E8d4D2118E8D0318BeF389ffe2C81 |
| BTC symbol / pairIndex / cap | BTC/USD / 0 / 200× |
| BTC Pyth feed ID | 0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43 |

These values are supplied configuration, not a claim of successful on-chain verification in this environment. Settings exposes the complete registry, Restore Polygon defaults, and Test node and contracts. The read-only diagnostic checks HTTPS/WSS chain IDs, deployed bytecode at all four addresses, active native-USDC collateral and decimals, and BTC/USD at pair zero. The Pyth address and feed ID are registered metadata; the price chart continues using the requested Gains WebSocket, and no independent Pyth transaction is sent.

Live opening checks require the configured native-USDC address and matching base/quote registry, then contract simulation. Transactions use the successfully connected HTTPS provider, including the configured fallback. Wrong-chain HTTPS nodes are rejected rather than silently accepted. Existing custom endpoint settings are preserved; older blank WSS settings migrate to the supplied default. ETH remains available with its earlier configuration; no ETH Pyth feed ID was invented.

Configuration and regression tests pass; compilation/signature checks are repeated for this release. No funded live trade was submitted. Physical-device and live-network validation remain outstanding.
