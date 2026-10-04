Adds six distinct public execution sounds: OPEN L, OPEN S, CLOSE L, CLOSE S, LIQ L and LIQ S. The sound preview includes all six; mute silences them while keeping event text.

Public executions now replace one banner in the chart-top loading-overlay position, showing market/network/action/side/leverage/collateral/price. It expires 4.5 seconds after the latest event without moving the chart or restarting loading progress. Alerts follow the current chart, including BTCDEGEN on BTC, and exclude your loaded wallet.

Fixes false liquidation classification from a trade merely having a liquidation-price line. Confirmed execution types identify liquidation; plain removals use CLOSE. Duplicate backend/contract reports, startup/history queries and periodic snapshots stay quiet. Unknown-reason removals wait briefly for confirmed classification.

JavaScript/native regression suites pass. Chromium audio/banner/rotation checks and Android 15 startup/app-switch/recreation checks gate publication. Same signing certificate as prior rebuilt releases. No funded live trade or physical-device test was performed.

Assets: APK, standalone HTML, source ZIP, spec.md and SHA256SUMS.

Android startup QA waits for the current process to initialize (up to 46 seconds), retries transient UI inspector failures three times, and still requires visible trading UI and no app-process crash for cold launch, app switching and recreation.
