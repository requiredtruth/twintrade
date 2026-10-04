Repairs missing candles by their actual timestamps, including gaps older than the usual five-hour refresh.

- Retains successful history pages when another page fails.
- Tries alternate Gains history for incomplete missing ranges.
- Repairs three bounded pages per sweep, rotating past unavailable ranges.
- Keeps one retry timer per market with 30-second to five-minute outage backoff.
- Removes native retry chains that could multiply during outages.
- Keeps unavailable candles visibly marked until authentic OHLC is returned.

Validated with JavaScript and native source regression tests, signed APK build, matching update certificate and artifact integrity checks. Browser/Android device checks are configured in CI; local browser download was unavailable. Live history endpoint access returned HTTP 403 in the build environment; recovery transport behavior was validated with deterministic responses. Physical-device and funded-trade testing were not performed.
