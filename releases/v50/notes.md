Fixes missing legacy borrowing rates, splits holding/funding charges and credits, and recovers saved paper fallback rates forward without repricing the past. Independent contract reads keep fee components visible when another view fails.

Adds softer sounds, short tick/tock micro-move pulses with confirmed directional reversals, and native background price/candle/market execution sounds until explicit Stop/Exit. Background audio does not depend on WebView timers and yields ownership when the Activity returns.

Validated with 24 JavaScript suites, nine native suites, Android package/signature checks and Android 15 instrumentation for Home/screen-off playback, mute, ownership and competing audio focus. No funded transactions or physical-device OEM/battery tests. APK retains the existing update certificate.
