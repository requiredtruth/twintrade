#!/usr/bin/env python3
"""Standalone browser artifact; all application libraries embedded, no CDN."""
from pathlib import Path
import re
assets=Path('app/src/main/assets')
s=(assets/'index.html').read_text()
s=s.replace('<link rel="stylesheet" href="style.css">','<style>'+ (assets/'style.css').read_text()+'</style>')
s=re.sub(r'<script src="([\w.-]+)"></script>',lambda m:'<script>'+ (assets/m[1]).read_text().replace('</script','<\\/script')+'</script>',s)
Path('dist').mkdir(exist_ok=True)
Path('dist/TwinTrade.html').write_text(s)
