# Twintrade current owner priorities

Completed in v0.62.0: chart legend with shared line styles and mobile rotation checks.

Completed in v0.63.0: native multi-bar history replay keeps timestamp buckets chronological; unchanged replay no longer advances the candle revision or forces a full foreground merge; the selected market now joins native background history catch-up instead of only four hard-coded markets.

Completed in v0.64.0: persistent sampled paper execution deadlines, collateral reservation, execution-time pricing and duplicate-safe opens/manual closes/bulk closes/liquidations across Android and standalone browser. Live execution remains unchanged.

1. Continue background reliability work across screen-off, app switching and process interruption, with actual device/emulator lifecycle evidence. Keep activity until confirmed close within Android constraints. Preserve timestamp rejection for executable quotes; untimestamped legacy price arrays cannot be safely reconstructed as historical bars.
2. Add/edit/remove paper position SL/TP on the v0.64 persistent queue. Test trigger direction, edit/remove, competing actions and replay/background recovery. Never delay real-money protection.
3. Optional Chandelier Exit: completed-bar ATR, configurable lookback/multiplier, never-loosening trails, deterministic trigger precedence, shared legend entry, persistence and no-look-ahead replay tests.

Preserve audio as requested. Fees are working; avoid speculative rewrites. Each next run starts from live main and verifies release/signing continuity.
