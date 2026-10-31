# Twintrade current owner priorities

Completed in v0.62.0: chart legend with shared line styles and mobile rotation checks.

1. Reproduce replay updates appearing on one bar. Inspect native PriceFeed timestamp rejection, receipt-time fallback for untimestamped arrays, MarketStore candle revisions and foreground snapshot merges. Preserve fresh-quote order gates while testing historical ingestion separately; do not relabel stale quotes as live. Add delayed/batched/out-of-order multi-bar regressions before changing ingestion.
2. Background reliability across screen-off, app switching and process interruption, with actual device/emulator lifecycle evidence. Keep activity until confirmed close within Android constraints.
3. Add/edit/remove paper position SL/TP, persistent pending state, sampled 3–10 second post-trigger delay and execution-time market pricing. Never delay real-money protection.
4. Optional Chandelier Exit: completed-bar ATR, configurable lookback/multiplier, never-loosening trails, deterministic trigger precedence, shared legend entry, persistence and no-look-ahead replay tests.

Preserve audio as requested. Fees are working; avoid speculative rewrites. Each next run starts from live main and verifies release/signing continuity.
