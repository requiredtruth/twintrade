#!/usr/bin/env python3
"""Package all bundled web assets into one offline-capable HTML file."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
a=root/'app/src/main/assets'
html=(a/'index.html').read_text()
html=re.sub(r'<link[^>]*href="style.css"[^>]*>',lambda m:'<style>'+(a/'style.css').read_text()+'</style>',html)
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+(a/m[1]).read_text().replace('</script','<\\/script')+'</script>',html)
(root/'dist').mkdir(exist_ok=True)
(root/'dist/TwinTrade.html').write_text(html)
