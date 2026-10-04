Reduces repeated native bridge, chart, history and DOM work while retaining market histories, trades and native liquidation checks. Adds a detailed progress overlay at the top of the chart for history, Polygon/Arbitrum/Base traders, liquidation calculations and retry status; it does not move the chart.

- Incremental selected-market native candle payloads; unchanged paper JSON reused.
- Cached OHLC aggregation, trade clustering and unchanged DOM; large calculations yield to input.
- Retained long-range history refreshes fetch only the newest page; targeted gap repair stays bounded.
- Failed trading-variable imports no longer trigger full snapshots every five seconds.
- Accept valid empty snapshots, preserve active progress until all tasks finish.

Validation: all JavaScript and native Java regressions, including new payload/ledger/history/progress tests; compiled APK certificate and alignment verified. GitHub CI checks Chromium portrait/landscape controls, progress geometry and Android 15 launch/app-switch/recreation before publishing. The local runtime cannot launch Chromium due to socket restrictions; CI owns these checks. No physical-device or funded live trade test was performed.

Assets: APK, standalone HTML, source ZIP, spec.md, SHA256SUMS. Uses the existing rebuilt-release certificate for upgrades.
