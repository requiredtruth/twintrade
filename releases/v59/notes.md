Minute-close audio now uses the same gentle, mood-aware warm/chime phrases in the foreground app and Android background monitor. Rising, falling, profitable, losing and neutral states remain distinct while every note stays between 220 and 700 Hz and each phrase contains at most two notes.

The quote at a minute boundary updates movement direction silently, then plays the candle phrase instead of stacking a directional tick underneath it. Native playback also clears queued movement notes; entry crossings, executions and liquidations keep priority. Existing hysteresis, sound level, mute, audio focus, Keep Alive, holding/funding calculations and trading behavior are unchanged.

Validated with the complete JavaScript/native regression suite, mobile browser checks, Android compilation, signature/alignment/package checks and Android 15 lifecycle/audio-focus instrumentation. No funded transaction or physical-device listening test was performed.
