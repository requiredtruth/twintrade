# TwinTrade 0.65.0 integration audit

Compared TwinTrade `6a53a6ae679867e55d1614ccb4815476f6987b58` with Rough Path Alpha `13a3e2d340348f6701b726b2828b0ccd68790c6f`. Rough Path Alpha remains unchanged.

| Area | Integration decision |
| --- | --- |
| Public network routing | Port per-service trade/dev failover, cooldown, healthy-primary probes, bounded frames and stale socket recovery. Apply to foreground oracle and Polygon/Arbitrum/Base streams, public snapshots and candle history. Keep wallet RPC/submission outside this router. |
| Android background | Reuse endpoint selection for oracle, public trade streams, history and fee recovery. Preserve TwinTrade's generation ownership, monotonic watchdog, background ledger, replay and audio. Only valid backend events count as transport health; accept bounded backend snapshots up to 16 MB. |
| Holding-rate inputs | Port alternate response-schema handling and source timestamp validation. Match native/JS rejection of missing/stale/future rates; preserve side-specific legacy borrow, V2 borrow and signed funding units. Keep source date instead of substituting download time. |
| Fee SDK | gains-math.js is byte-identical. Keep TwinTrade's newer on-chain legacy + V2 fee accounting, frozen paper assumptions, forward-only recovery, fee precision and settlement receipts. No new dollar minimum or flat fee rule is introduced. |
| Research-only fee estimation | Do not substitute Alpha's multi-chain research SDK estimates for TwinTrade's Polygon on-chain charges or complete V1+V2 holding rates. Missing market rates remain explicitly labelled assumptions. |
| Net returns | Port collateral-weighted long/short/combined open P&L and per-position percentages. Selected-market totals include its DEGEN family and propagate unknown costs. |
| Account summary | Add balance-based and active-margin-based net return, active margin dollars and open-trade count below total P&L. Account basis = available cash + active collateral + collateral reserved for pending paper opens; excludes unrealized P&L. Account-wide scope matches top net dollars. Zero/unknown denominators show a dash. |
| Candle authority | Preserve Gains history over optional spot history, retaining TwinTrade's newer incremental-tail merging and idempotent background replay. |
| Retained TwinTrade advances | Persistent delayed paper queue, duplicate-safe closes, holding recovery/checkpoints, mobile controls, chart legend, live-chain validation, sound profiles and background behavior. |
| Excluded Alpha components | Rough-path signatures, indicators, channels/projections, arrow bot, signal-driven Chandelier controls, optimizer/research/search UI and strategy backtests. These depend on the explicitly excluded Alpha subsystem. No Alpha engine or bot is loaded. |

Verification: full JavaScript/native regression suites, routing lifecycle and primary recovery tests, source-date/fee-unit cases, P&L denominator/weighting tests, mobile Chromium interaction and rotation checks, Android release compilation, signature continuity and ZIP alignment. CI additionally runs the live oracle and Android 15 startup/app-switch/recreation gates before publishing. No funded trade or physical-device endurance test is performed.
