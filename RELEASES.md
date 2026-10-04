# TwinTrade release lineage

1. v0.3.0-beta — original supplied source ZIP, unmodified; beta APK compiled from that source. Original source tests pass.
2. v0.17.0 — supplied APK preserved byte-for-byte; its exact web assets recovered. Native Java reconstructed from the original source and APK analysis.
3. v0.19.0 — improved reconstructed version with reliability fixes and regression coverage.

The supplied v17 APK has its original certificate. Locally rebuilt beta and final APKs have a new local signing identity. A certificate change requires uninstalling the original APK; export or preserve your wallet backup before uninstalling. No private signing key or wallet key is published.

No live-money transaction is submitted as part of verification. A successful build and tests do not establish end-to-end live exchange reliability.

- v0.20.0: stable public overlays, weighted leverage averages, reset chart, real desync status, all-market account pages. Signed with the v0.19.0 certificate.

- v0.21.0: candle gap repair, consistent net chart P&L and signed holding gains/losses; verified update certificate.

- v0.22.0: no repeating near-LIQ notifications, 30-second desync warnings, current-market Stats popup, live LIQ and connection fixes, cached averages. Same update certificate as v0.21.0.

- v0.23.0: native/foreground price recovery, shared ingestion, saved Keep Alive preference, reconnect and transport diagnostics, Android bridge + live socket regression checks.

- v0.24.0: all-leverage average liquidation lines, labeled missing-price estimates, shared chart/stats coverage.

- v0.25.0: fixed chart geometry during sync, transient text above borrowing rates, bounded history retries, overlapping refresh prevention, preserved spreads, deferred snapshot reloads and less DOM/candle processing. Same update certificate as v0.24.0.

- v0.26.0: compact trade labels, expanded zoom submenu and OHLC intervals, BTCDEGEN overlays on BTC, per-position estimated LIQs, and app-switch state continuity. Same update certificate as v0.25.0.

- **0.27.0**: Saved-session startup recovery, page-ready Android resume and guarded background-monitor startup; Android 15 APK launch regression required before publishing.

- **0.31.0**: Incremental native candle bridge, retained history refresh, cached OHLC/cluster/DOM work, responsive snapshot/liquidation batches and detailed chart-top progress.

- **0.32.0**: Show progress only for initial/explicit loads; silence automatic syncs and retries; repair Reload handler.

- **0.33.0**: Restore combined BTC 500× via BTCDEGEN execution; include own DEGEN positions, PnL, liquidation lines and current-coin close on BTC chart.

- **0.34.0**: Await execution-market holding rates; show leveraged hourly costs/credits; fix vertical pan scale and retain all distant public entry/LIQ strokes.

- **0.35.0**: Six public OPEN/CLOSE/LIQ L/S sounds; replacing chart-top event banner; confirmed liquidation classification and duplicate-report suppression.
