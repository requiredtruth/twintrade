#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 tools/package-web.py
if command -v xdg-open >/dev/null; then xdg-open "$PWD/dist/TwinTrade.html"; else echo "Open $PWD/dist/TwinTrade.html in your browser."; fi
