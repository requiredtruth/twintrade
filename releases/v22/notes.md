Removed the repeating near-liquidation notification and sound. Gains desync warnings now wait 30 seconds.

Added the Stats button: live mark/index prices, quote age, feed state, data rate, chain counts, available balance, pending orders, fees, own net P&L, and weighted long/short entry and liquidation averages with coverage, collateral, notional and leverage bands.

Fixed live-position liquidation lines, stale background socket status callbacks and public gross-P&L labeling. Cached chart averages avoid unchanged recalculation on every redraw.

Compiled, signed and aligned APK; same certificate as v0.21.0 for an in-place update. CI runs accounting/native regressions and mobile-browser popup/rotation checks before publication. No funded live transaction or physical-device test performed.
