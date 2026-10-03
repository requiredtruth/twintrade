# TwinTrade v17 supplied-version dissection

Package com.twintrade.app, versionCode 17, versionName 0.17.0, Android 8+.
The APK is the original upload, unchanged. The standalone HTML embeds its exact assets.

## Added since the supplied-source beta
46 bundled markets plus runtime discovery; separate BTCDEGEN/ETHDEGEN entries; global Polygon/Arbitrum/Base trade history and streams; exact-entry/leverage grouping; richer directional and position sounds; animated event feed; draggable/pinchable chart; live holding-rate display; candle deduplication; average-entry/P&L lines; loading progress and full native exit.
Native MarketStore stores candles/quotes for additional pairs and PriceMonitorService parses v4 mark arrays. These are recovered from the owner's APK with JADX 1.5.3. Decompiled Java is audit material, not guaranteed buildable source: synthetic lambdas and control-flow recovery contain compilation defects. Third-party Java classes are not duplicated; existing JAR dependencies and license notices remain.

## Defects found for the improved release
- Browser/native v4 objects ignore source timestamp freshness. Delayed or future frames can look fresh.
- Native service discards separate index quotes; browser live submission uses chart mark quotes.
- The ERC-20 token instance for approve is connected only to a provider, so it cannot sign approval.
- Pair-name validation has an empty mismatch branch and therefore does not reject a mismatched registry.
- Journal states infer completion when an order disappears; there is no durable prebroadcast signed-transaction recovery.
- Public snapshots label vanished trades as liquidations just because they had a liquidation-price estimate.
- Holding-rate fallback displays Arbitrum rates in the Polygon terminal without a chain-specific qualifier.
- Candle deduplication skips validation for lists with one item.

## Validation and limits
APK signature and alignment verified, package/version inspected, extracted assets compared byte for byte, JavaScript syntax checked. No funded trades or physical-device tests. Source ZIP contains exact browser assets, recovered application Java for audit and this report, not a claim of recompiling the original APK.
