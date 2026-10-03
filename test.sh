#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
for f in app/src/main/assets/*.js; do node --check "$f"; done
for t in tests/*.test.cjs; do node "$t"; done
mkdir -p build/native-tests
javac -cp libs/json-20240303.jar -d build/native-tests tests/java/android/content/*.java app/src/main/java/com/twintrade/app/MarketStore.java tests/java/*.java
for t in MarketStoreTest NativeReliabilityTest CandleFeesTest; do java -cp build/native-tests:libs/json-20240303.jar "$t"; done
python3 tools/package-web.py
