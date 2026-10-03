Removed the green Ready/loading bar that shifted the chart. Brief sync messages appear above the borrowing rates and clear automatically without moving the chart.

Also fixes accumulated history retries, stale-market retry loops, overlapping fee/chart refreshes, discarded spread metadata, lost snapshot-time reload requests, competing snapshots and missing native history labels. Reduces repeated DOM rebuilds and redundant candle sorting.

Validation: JavaScript/native regression suites and real Chromium controls, status geometry, timer replacement and portrait/landscape rotation checks passed. APK compiled, aligned and signed with the existing update certificate. GitHub CI additionally checks the live read-only Gains socket and release integrity before publishing. No funded transaction or physical-device test performed.

Assets: APK, standalone HTML, source ZIP, spec.md and SHA256SUMS.
