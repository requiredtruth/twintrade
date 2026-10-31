Directional movement audio now stays within a 220–1080 Hz comfort band in both the foreground app and Android background service. This removes the previous large-move path that could produce accents above 2 kHz.

Micro moves use short chime or warm pulses based on position favorability. Larger rises and falls use distinct warm/chime phrases with no more than three notes; big-move and profitable-position accents share one slot instead of layering into a four-note burst. Existing smoothing, reversal hysteresis, cooldowns, sound profiles, volume, mute and audio focus are preserved. Holding/funding calculations and trading behavior are unchanged.

Validated with the complete JavaScript/native regression suite, mobile browser checks, Android compilation, signature/alignment/package checks and Android 15 lifecycle/audio-focus instrumentation. No funded transaction or physical-device listening test was performed.
