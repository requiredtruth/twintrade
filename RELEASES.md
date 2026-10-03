# TwinTrade release lineage

1. v0.3.0-beta — original supplied source ZIP, unmodified; beta APK compiled from that source. Original source tests pass.
2. v0.17.0 — supplied APK preserved byte-for-byte; its exact web assets recovered. Native Java reconstructed from the original source and APK analysis.
3. v0.18.0 — improved reconstructed version with reliability fixes and regression coverage.

The supplied v17 APK has its original certificate. Locally rebuilt beta and final APKs have a new local signing identity. A certificate change requires uninstalling the original APK; export or preserve your wallet backup before uninstalling. No private signing key or wallet key is published.

No live-money transaction is submitted as part of verification. A successful build and tests do not establish end-to-end live exchange reliability.
