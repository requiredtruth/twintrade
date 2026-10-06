#!/usr/bin/env bash
set -euo pipefail
sdk="${ANDROID_SDK_ROOT:-${ANDROID_HOME}}"
bt="$(find "$sdk/build-tools" -mindepth 1 -maxdepth 1 -type d | sort -V | tail -1)"
jar="$sdk/platforms/android-35/android.jar"
if [ "${1:-}" = "--build" ]; then
mkdir -p build/audio-test/classes build/audio-test/dex
# Compile the target interfaces from source; only the two test classes enter the test APK.
javac -source 8 -target 8 -bootclasspath "$jar:$bt/core-lambda-stubs.jar" -classpath 'libs/*' -d build/audio-test/classes app/src/main/java/com/twintrade/app/*.java tests/android-audio/*.java
"$bt/d8" --lib "$jar" --min-api 26 --output build/audio-test/dex build/audio-test/classes/com/twintrade/audiotest/*.class
"$bt/aapt" package -f -M tests/android-audio/AndroidManifest.xml -I "$jar" -F build/audio-test/unsigned.apk
(cd build/audio-test/dex && zip -q -u ../unsigned.apk classes.dex)
"$bt/zipalign" -f -p 4 build/audio-test/unsigned.apk build/audio-test/aligned.apk
if [ ! -f build/signing.jks ]; then
 echo 'Audio instrumentation requires the private target signing key' >&2
 exit 1
fi
"$bt/apksigner" sign --ks build/signing.jks --ks-pass pass:android --out tests/android-audio/test.apk build/audio-test/aligned.apk
 sha256sum app/src/main/java/com/twintrade/app/NativeAudio.java tests/android-audio/*.java tests/android-audio/AndroidManifest.xml tests/android-audio/test.apk > tests/android-audio/SHA256SUMS
 exit 0
fi
sha256sum -c tests/android-audio/SHA256SUMS
adb install -r tests/android-audio/test.apk
adb shell am instrument -w com.twintrade.audiotest/.AudioRecoveryTest | tee build/android-audio-focus.log
rg 'PASS: native PCM' build/android-audio-focus.log
