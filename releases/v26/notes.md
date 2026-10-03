Compact L/S chart and trade labels; removed OTHER/GROSS; whole-number leverage and collateral labels with full-precision accounting.

Zoom submenu: min/max, reset, 15m/1h/4h/1d/1w ranges and 1m through 1d OHLC candle intervals. Expanded pinch/wheel bounds and real paged history.

BTC now includes BTCDEGEN public long/short entries, averages and liquidations. Every displayed public trade has a LIQ boundary; missing values are labeled EST until known. Clustered entries retain per-position LIQs.

App switching retains the WebView, zoom, pan and trade state, avoids unnecessary full refresh on quick return, reuses the launcher activity and restores cached chart state after recreation.

Source/native and mobile browser regressions; same signing certificate as 0.25.0. Physical Android lifecycle and funded live orders were not tested.
