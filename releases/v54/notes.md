Execution, crossing and liquidation phrases now take priority over price and candle sonification. Accepted events clear queued native movement notes and reserve a bounded 520 ms quiet window, preventing distracting category overlap in both the foreground and Android background service.

Movement direction, hysteresis and adaptive noise state continue updating silently during that window, so audio resumes from the current market state. Duplicate public events remain suppressed by the existing burst-priority gate; Gentle, Warm and Minimal event profiles, mute, audio focus, holding/funding behavior and trading controls are preserved.

Validated with the complete JavaScript/native regression suite, mobile browser checks, Android compilation, signature/alignment/package checks and Android 15 lifecycle/audio-focus instrumentation. No funded transaction or physical-device listening test was performed.
