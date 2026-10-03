#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v javac >/dev/null || { echo 'Install a full JDK 17 or newer (including javac) first.'; exit 1; }
SDK="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$PWD/.android-sdk}}"
if [ ! -x "$SDK/cmdline-tools/latest/bin/sdkmanager" ]; then
 mkdir -p "$SDK/cmdline-tools"
 curl --fail --location https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -o /tmp/twintrade-sdk.zip
 unzip -q /tmp/twintrade-sdk.zip -d "$SDK/cmdline-tools"
 mv "$SDK/cmdline-tools/cmdline-tools" "$SDK/cmdline-tools/latest"
fi
"$SDK/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK" 'platforms;android-35' 'build-tools;35.0.0'
echo 'Ready. Run ./build.sh'
