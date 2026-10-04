Latest public trade stays in the chart-top box until replaced, including chart switches, rotation and saved-session recreation. New opens add entry and LIQ lines; closes and liquidations remove both. All six distinct long/short OPEN/CLOSE/LIQ sounds are verified, with mute respected. Fixed closed metadata suppressing a later valid open alert.

Validation: source/native regression suites, Chromium touch audio unlock, persistent banner/recreation and mobile rotation; socket callback tests for entry/LIQ additions/removals on Polygon, Arbitrum and Base, duplicate suppression and stale-snapshot protection. APK retains the existing signing certificate. Android 15 startup/app-switch/recreation and artifact verification gate publication.

Live validation found and fixed a production protocol mismatch: Gains uses singular liveEvent/returnValues (ABI tuple arrays) and top-level new-trade-history. Both now update overlays and execution alerts. Captured real Base/Arbitrum opens and updates were replayed through the real socket callbacks successfully. No funded transaction or physical-device test was performed.

Captured production-frame replay passed: 15 trade changes, including 3 open deliveries. Six distinct sound patterns, real socket callbacks, line additions/removals and persistent banner/recreation checks passed.
