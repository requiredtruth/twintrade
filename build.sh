#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
SDK="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$PWD/.android-sdk}}"
BT="$SDK/build-tools/35.0.0"
JAR="$SDK/platforms/android-35/android.jar"
[ -f "$JAR" ] || { echo 'Run install.sh or set ANDROID_SDK_ROOT to an SDK with Android 35 and build-tools 35.0.0.'; exit 1; }
mkdir -p build/classes build/dex dist
javac -source 8 -target 8 -bootclasspath "$JAR:$BT/core-lambda-stubs.jar" -classpath "libs/*" -d build/classes app/src/main/java/com/twintrade/app/*.java
"$BT/d8" --lib "$JAR" --min-api 26 --output build/dex build/classes/com/twintrade/app/*.class libs/*.jar
"$BT/aapt" package -f -M app/src/main/AndroidManifest.xml -I "$JAR" -A app/src/main/assets -S app/src/main/res -F build/unsigned.apk
(cd build/dex && zip -q -u ../unsigned.apk classes.dex)
"$BT/zipalign" -f -p 4 build/unsigned.apk build/aligned.apk
# Keep this locally generated signing key for subsequent updates. Never commit it.
if [ ! -f build/signing.jks ]; then keytool -genkeypair -keystore build/signing.jks -storepass android -keypass android -alias twintrade -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=TwinTrade Local Build'; fi
"$BT/apksigner" sign --ks build/signing.jks --ks-pass pass:android --out dist/TwinTrade.apk build/aligned.apk
"$BT/apksigner" verify --verbose dist/TwinTrade.apk
