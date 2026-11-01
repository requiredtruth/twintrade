Native background candle catch-up now includes the currently selected configured market instead of only four hard-coded markets. Replayed history retains its own minute timestamps and chronological order.

An unchanged history replay no longer advances the native candle revision or forces the foreground to merge the complete retained window on resume. A material historical correction still transfers a full corrected snapshot. Existing executable-quote freshness and timestamp rejection remain unchanged; untimestamped live arrays are not fabricated into historical bars.

Validated with reversed multi-bar, duplicate replay, corrected-bar and selected-market fixtures, the complete JavaScript/native suite, mobile Chromium, current Android compilation and release integrity checks. Physical-device screen-off and vendor battery-policy endurance remain untested. No funded transaction was performed.
