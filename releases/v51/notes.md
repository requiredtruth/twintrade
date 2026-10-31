Adds an optional diagnostics section to Stats that separates the price oracle from Polygon, Arbitrum and Base public trade streams. Each row shows current connection state, last valid-data age, retry count and retry timing; the in-memory reconnect history is capped at 32 transitions.

Health changes only after valid parsed data. Invalid price frames cannot reset backoff or claim a healthy feed. Existing reconnect ownership, public snapshots, order controls and execution behavior are preserved.

Validated with 25 JavaScript suites, nine native suites, mobile Chromium layout/rotation checks, Android source compilation, APK signature/alignment/package checks and certificate continuity against v0.50.0. No funded transactions or physical-device network-handoff tests were performed.
