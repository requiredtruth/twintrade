Adds a persistent close-detail dialog and six close choices beside Positions.

- Shows price P&L, opening/closing fees, holding cost or credit, net P&L and cash returned.
- Saves paper settlement receipts from the calculation that updates cash; Android reads the authoritative receipt.
- Fees and holding costs are included in net P&L exactly once.
- Close all / longs / shorts for the current coin or all coins; current BTC and BTCDEGEN scopes remain separate.
- Batch receipts show individual settlements and partial failures, preserving positions with stale quotes.
- Live batches submit sequentially after review, stopping on rejection or unresolved settlement. Live cost details are marked unavailable when no confirmed breakdown exists.

Validated with JavaScript/native accounting tests, deterministic batch transport tests, browser controls, explicit receipt dismissal and phone rotation. The $100 / $14 holding / $7+$7 fees regression returns $125.96 for $53.96 price P&L. CI also checks Android 15 startup/app switching/recreation, live price transport and release integrity. No funded live trade or physical-device test was performed.

Install as an update: signing certificate matches v0.28.0. Includes APK, standalone HTML, source ZIP, spec.md and SHA256SUMS.
