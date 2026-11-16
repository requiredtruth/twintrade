Combines the reusable reliability improvements from Rough Path Alpha with TwinTrade’s newer trading and background engine. Rough Path indicators, strategies and bots are not included.

- Public oracle/trade/history connections gain service-specific trade/dev failover and recovery, including Android background connections.
- Holding rates now use their source timestamp, reject stale or incomplete data and support nested responses while preserving legacy borrow, V2 borrow and signed funding.
- Top account row shows net P&L / account balance, net P&L / active margin, active margin dollars and open-trade count across all markets. Balance basis includes available cash, active margin and reserved pending-open collateral, excluding unrealized P&L.
- Positions show individual percentages plus collateral-weighted long/short/total returns for the selected market.
- Keeps TwinTrade’s persistent execution queue, fee recovery, replay, audio and Polygon live execution.

Same Android package and signing certificate as v0.64.0; versionCode 65. Full source/native/browser regression tests, Android compilation, signature continuity and alignment checks. Release workflow also gates publication on live oracle and Android startup/lifecycle tests. No funded live trade or physical-device endurance test.
