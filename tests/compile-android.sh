#!/usr/bin/env bash
# Compile the CURRENT source even when the private release signing key is unavailable.
set -euo pipefail
cd "$(dirname "$0")/.."
sdk="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$PWD/.android-sdk}}"
bt="$(find "$sdk/build-tools" -mindepth 1 -maxdepth 1 -type d | sort -V | tail -1)"
jar="$sdk/platforms/android-35/android.jar"
out=build/android-source-check
rm -rf "$out"
mkdir -p "$out/classes" "$out/dex"
javac -source 8 -target 8 -bootclasspath "$jar:$bt/core-lambda-stubs.jar" -classpath 'libs/*' -d "$out/classes" app/src/main/java/com/twintrade/app/*.java
"$bt/d8" --lib "$jar" --min-api 26 --output "$out/dex" "$out"/classes/com/twintrade/app/*.class libs/Java-WebSocket-1.5.7.jar libs/slf4j-api-2.0.6.jar
"$bt/aapt" package -f -M app/src/main/AndroidManifest.xml -I "$jar" -A app/src/main/assets -S app/src/main/res -F "$out/unsigned.apk"
(cd "$out/dex" && zip -q -u ../unsigned.apk classes.dex)
"$bt/zipalign" -f -p 4 "$out/unsigned.apk" "$out/aligned-unsigned.apk"
"$bt/zipalign" -c -p 4 "$out/aligned-unsigned.apk"
echo 'PASS: current Android source compiled, dexed and packaged (unsigned QA only; not a release APK).'
