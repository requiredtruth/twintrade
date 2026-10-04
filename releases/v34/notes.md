Fixes new 500× paper positions saving fallback costs before BTCDEGEN holding rates finish loading. New orders await the execution market’s rates and save side-specific borrowing/funding assumptions. Previews show leveraged hourly dollar costs/credits and percent of collateral; position rows show their saved hourly rate and source. Existing paper trades keep their saved assumptions. Live market previews are estimates; actual live costs remain contract-derived.

All valid public entries and liquidation levels are stroked, including offscreen levels and sub-cent collateral. Fixes vertical panning changing or reversing the price-range size, so distant lines appear when you reach them without reloading trades.

JavaScript and native regression tests cover 500× holding cost/credit settlement, fresh-rate loading, context and quote guards, and 80 distant trades appearing after panning. Chromium and Android 15 startup/app-switch/recreation checks gate publication. Same signing certificate as prior rebuilt releases. No funded live trade or physical-device testing was performed.

Assets: APK, standalone HTML, source ZIP, spec.md and SHA256SUMS.

Live borrowing now includes both the legacy borrowing component and v10 borrowing returned by the Polygon contracts, avoiding understated BTCDEGEN holding costs. If a component is unavailable, live PnL remains unknown rather than treating it as zero.
