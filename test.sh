#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
for f in app/src/main/assets/*.js; do node --check "$f"; done
for t in tests/*.test.cjs; do node "$t"; done
mkdir -p build/native-tests
javac -cp "libs/*" -d build/native-tests tests/java/android/content/*.java app/src/main/java/com/twintrade/app/MarketStore.java app/src/main/java/com/twintrade/app/PriceFeed.java app/src/main/java/com/twintrade/app/BackgroundPriceFeed.java app/src/main/java/com/twintrade/app/BackgroundHistoryPlan.java app/src/main/java/com/twintrade/app/TickSound.java app/src/main/java/com/twintrade/app/CandleSound.java app/src/main/java/com/twintrade/app/EventSoundPalette.java app/src/main/java/com/twintrade/app/EntryCrossing.java app/src/main/java/com/twintrade/app/BackgroundTrades.java tests/java/*.java
for t in MarketStoreTest NativeReliabilityTest CandleFeesTest PriceFeedTest PerformanceTest BackgroundPriceFeedTest BackgroundReplayTest HoldingRecoveryTest TickSoundTest CandleSoundTest EventSoundPaletteTest EntryCrossingTest BackgroundTradesTest; do java -cp build/native-tests:libs/* "$t"; done
python3 tools/package-web.py
