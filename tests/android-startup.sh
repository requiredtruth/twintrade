#!/usr/bin/env bash
set -euo pipefail
apk="${1:-$(find releases -mindepth 2 -maxdepth 2 -name TwinTrade.apk | sort -V | tail -1)}"
adb install -r "$apk"
adb logcat -c
capture() {
 adb logcat -d > build/android-startup.log
 adb shell screencap -p /sdcard/twintrade-startup.png
 adb pull /sdcard/twintrade-startup.png build/android-startup.png
}
trap capture EXIT
app_pids=()
inspect_window() {
 for attempt in 1 2 3; do
  adb shell rm -f /sdcard/twintrade-window.xml
  if timeout 25s adb shell uiautomator dump /sdcard/twintrade-window.xml && adb shell cat /sdcard/twintrade-window.xml > build/android-window.xml; then
   if python3 - <<'CHECK'
from pathlib import Path
s=Path('build/android-window.xml').read_text()
assert 'com.twintrade.app' in s, 'Trading Activity is not visible'
CHECK
   then return 0; fi
  fi
  echo "Retrying UI inspection ($attempt/3)"
  sleep 3
 done
 echo 'Trading Activity inspection failed'; return 1
}
launch() {
 adb shell am start -W -n com.twintrade.app/.MainActivity
 pid="$(adb shell pidof com.twintrade.app | tr -d '\r')"
 test -n "$pid"
 app_pids+=("$pid")
 ready=false
 for attempt in $(seq 1 23); do
  test "$(adb shell pidof com.twintrade.app | tr -d '\r')" = "$pid"
  adb logcat -d --pid="$pid" -s TwinTrade > build/android-page.log
  if grep -q 'Trading page initialized: true' build/android-page.log; then
   ready=true; break
  fi
  sleep 2
 done
 cat build/android-page.log
 test "$ready" = true
 inspect_window
 sleep 3
 inspect_window
 adb logcat -d --pid="$pid" -s TwinTrade > build/android-audio.log
 python3 - <<'AUDIO'
from pathlib import Path
lines=[line for line in Path("build/android-audio.log").read_text().splitlines() if "Audio engine: " in line]
assert lines and lines[-1].endswith(("Audio engine: running","Audio engine: ready")), "Android audio did not recover: " + str(lines[-1:])
AUDIO
}
adb shell pm grant com.twintrade.app android.permission.POST_NOTIFICATIONS
launch
adb shell input keyevent KEYCODE_HOME
sleep 2
launch
adb shell am force-stop com.twintrade.app
launch
adb logcat -d > build/android-startup.log
for pid in "${app_pids[@]}"; do
 adb logcat -d --pid="$pid" > build/android-process.log
 if grep -E 'FATAL EXCEPTION|Fatal signal' build/android-process.log; then
  echo 'Android app startup crashed'; exit 1
 fi
done
adb shell screencap -p /sdcard/twintrade-startup.png
adb pull /sdcard/twintrade-startup.png build/android-startup.png
bash tests/android-audio.sh
printf 'PASS: Android cold startup, app switching, process recreation and automatic audio recovery
'
