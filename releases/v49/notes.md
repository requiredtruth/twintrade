Native background price monitoring now detects stalled usable prices even when heartbeats continue, recovers with bounded outage backoff, ignores old socket callbacks and stops immediately when requested. Watchdog deadlines use Android elapsed time. Includes the previous Polygon/Arbitrum/Base trade-stream reconnect fix.

Validated with 23 JavaScript suites, six native suites, Android compilation/dex packaging and release signature/integrity checks. Physical-device screen-off and battery-restriction tests have not been performed. APK retains the v0.48.0 signing certificate.
