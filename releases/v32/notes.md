Fixes the loading progress bar repeatedly reappearing during background sync. Automatic trader refreshes, reconnects, history refreshes, gap retries and app-resume refreshes now stay quiet. Startup, explicit market/range changes and manual Reload still show progress. Also fixes the Reload handler's stale undeclared variable.

All v0.31.0 performance changes, trade/price monitoring and retained histories are preserved. Native and JavaScript regression tests pass, including repeated automatic refresh and explicit-load checks. Chromium and Android 15 launch/app-switch/recreation tests gate publication. Same signing certificate as the previous rebuilt releases.

Assets: APK, standalone HTML, source ZIP, spec.md and SHA256SUMS.
