Fixes candle gaps with periodic authentic history backfill and amber flat placeholders for missing minutes; real OHLC replaces placeholders when available. Own chart labels now use net P&L consistently with position cards and market-specific average totals.

BTC $100 at 200x has $20,000 notional: standard $7 opening + $7 closing = $14 base round-trip fees. Labels now separate these charges. New paper trades use available Polygon market fee/spread and per-side holding rates; existing paper trades retain their entry assumptions. Holding credits say gain in green, costs say loss in red. Closed paper fee details stop accruing.

Live displays include realized trading fees and P&L, signed funding and trader-discounted base closing fee estimates. Paper remains an estimate without discount/minimum-fee/dynamic-impact/closing-decay modeling; live final settlement can differ from estimates due to these effects and gas.

Includes APK, standalone HTML, source ZIP and updated spec.md. Reuses the v0.19.0/v0.20.0 signing certificate. No reinstall needed when upgrading those versions. Java/native and JavaScript regression tests pass; release publication is gated on Chromium mobile rotation/UI assertions and APK integrity/signature checks.
