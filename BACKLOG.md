# Twintrade current owner priorities

Completed in v0.62.0: chart legend with shared line styles and mobile rotation checks.

Completed in v0.63.0: native multi-bar history replay keeps timestamp buckets chronological; unchanged replay no longer advances the candle revision or forces a full foreground merge; the selected market now joins native background history catch-up instead of only four hard-coded markets.

1. Continue background reliability work across screen-off, app switching and process interruption, with actual device/emulator lifecycle evidence. Keep activity until confirmed close within Android constraints. Preserve timestamp rejection for executable quotes; untimestamped legacy price arrays cannot be safely reconstructed as historical bars.
2. Add/edit/remove paper position SL/TP, persistent pending state, sampled execution delays and execution-time market pricing. Extend the same persisted 3–10 second / 5% 30-second delay model to all paper opens and closes. Never delay real-money protection.
3. Optional Chandelier Exit: completed-bar ATR, configurable lookback/multiplier, never-loosening trails, deterministic trigger precedence, shared legend entry, persistence and no-look-ahead replay tests.

Preserve audio as requested. Fees are working; avoid speculative rewrites. Each next run starts from live main and verifies release/signing continuity.
