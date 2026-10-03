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
