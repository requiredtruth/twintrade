#!/usr/bin/env bash
set -euo pipefail
apk="${1:-releases/v29/TwinTrade.apk}"
adb install -r "$apk"
adb logcat -c
capture() {
 adb logcat -d > build/android-startup.log
 adb shell screencap -p /sdcard/twintrade-startup.png
 adb pull /sdcard/twintrade-startup.png build/android-startup.png
}
trap capture EXIT
launch() {
 adb shell am start -W -n com.twintrade.app/.MainActivity
 sleep 12
 adb shell pidof com.twintrade.app
 adb logcat -d -s TwinTrade | tee build/android-page.log
 grep -q 'Trading page initialized: true' build/android-page.log
 adb shell uiautomator dump /sdcard/twintrade-window.xml
 sleep 3
 adb shell uiautomator dump /sdcard/twintrade-window.xml
 adb shell cat /sdcard/twintrade-window.xml > build/android-window.xml
 python3 - <<'CHECK'
from pathlib import Path
s=Path('build/android-window.xml').read_text()
assert 'com.twintrade.app' in s, 'Trading Activity is not visible'
CHECK
}
adb shell pm grant com.twintrade.app android.permission.POST_NOTIFICATIONS
launch
adb shell input keyevent KEYCODE_HOME
sleep 2
launch
adb shell am force-stop com.twintrade.app
launch
adb logcat -d > build/android-startup.log
if grep -E 'FATAL EXCEPTION|Fatal signal' build/android-startup.log; then
 echo 'Android startup crashed'; exit 1
fi
adb shell screencap -p /sdcard/twintrade-startup.png
adb pull /sdcard/twintrade-startup.png build/android-startup.png
printf 'PASS: Android cold startup, app switching and process recreation
'
