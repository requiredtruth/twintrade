#!/usr/bin/env python3
"""Bundle the SDK's math and backend converters without wallet/network helpers.
Usage: python tools/bundle-sdk.py path/to/unpacked/sdk/lib
"""
from pathlib import Path
import re,json,sys
root=Path(sys.argv[1]).resolve(); modules={}
# Explicit entry exports; implementation modules remain byte-for-byte upstream.
slim='\n'.join('Object.assign(exports,require('+json.dumps(p)+'));' for p in ['./trade','./constants','./utils','./backend','./pricing','./contracts/types','./contracts/utils/pairs','./backend/tradingVariables/converter'])
def resolve(parent,name):
 q=parent/name
 if q.is_dir():q=q/'index.js'
 elif not q.is_file():q=Path(str(q)+'.js')
 return q.resolve()
def visit(p):
 k=str(p.relative_to(root))
 if k in modules:return
 s=slim if k=='index.js' else p.read_text();modules[k]=(s,{})
 for name in re.findall(r'require\("([^"]+)"\)',s):
  if not name.startswith('.'):
   if name!='ethers':raise RuntimeError('Unexpected external '+name)
   modules[k][1][name]='@ethers';continue
  q=resolve(p.parent,name);modules[k][1][name]=str(q.relative_to(root));visit(q)
visit(root/'index.js')
out='/* Gains SDK 1.8.10 math subset; see GAINS-SDK-LICENSE.txt */\n(function(){const modules={\n'
for k,(s,deps) in modules.items():out+=json.dumps(k)+':[function(require,module,exports){\n'+s+'\n},'+json.dumps(deps)+'],\n'
out+='};const cache={};function load(k){if(k==="@ethers")return ethers;if(cache[k])return cache[k].exports;const m={exports:{}};cache[k]=m;const d=modules[k];d[0](n=>load(d[1][n]),m,m.exports);return m.exports;}window.GainsMath=load("index.js");})();'
Path('app/src/main/assets/gains-math.js').write_text(out);print('Bundled',len(modules),'SDK modules')
