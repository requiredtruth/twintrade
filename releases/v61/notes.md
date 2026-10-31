High-priority execution, crossing, candle and liquidation sounds now flush already-buffered native movement PCM before their replacement phrase begins. This closes the remaining Android overlap path where clearing scheduled notes could still leave a short audible tick tail in AudioTrack.

Preemption retains transient ducking focus and the next phrase starts on a clean stream. Existing event/candle quiet windows, direction state, hysteresis, saved sound profile and level, mute, media routing, Keep Alive, holding/funding calculations and trading behavior remain unchanged.

Validated with the complete JavaScript/native regression suite, mobile browser checks, Android compilation, signature/alignment/package checks and Android 15 instrumentation that stops an active two-second PCM tone and verifies immediate recovery. No funded transaction or physical-device listening test was performed.
