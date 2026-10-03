#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
case "${1:-test}" in
 test) exec ./test.sh ;;
 build) exec ./build.sh ;;
 web) exec python3 tools/package-web.py ;;
 *) echo 'Usage: ./cli.sh [test|build|web]' >&2; exit 2 ;;
esac
