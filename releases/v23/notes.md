Fixed a real Android failure path: with Keep Alive off (including after Exit app), the Feed bridge suppressed the foreground price socket even though no background price monitor was running. Trade snapshots could load while prices never went live. Foreground recovery now works independently and passes quotes into the native ledger. A stalled native feed also activates recovery.

Added shared native frame parsing, per-pair malformed-value isolation, saved Keep Alive preference display, and Stats price-transport diagnostics plus Reconnect price feed. Heartbeats and stale/future frames never enable orders.

Checks cover native mark/index ingestion, paper settlement from recovery prices, Android bridge with background off, manual reconnect, all earlier browser/accounting/candle regressions, and a read-only live Gains socket probe before publication. No physical-device or funded live transaction test.

Same signing certificate as v0.22.0; install as an update. Includes APK, standalone HTML, source ZIP, specification and checksums.
