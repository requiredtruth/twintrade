#!/usr/bin/env python3
"""Refresh v19 artifact bytes and integrity metadata after a verified build."""
from pathlib import Path
import hashlib,json,shutil,zipfile
root=Path(__file__).resolve().parents[1]
out=root/'releases/v19'
for name,source in [('TwinTrade.apk',root/'dist/TwinTrade.apk'),('TwinTrade.html',root/'dist/TwinTrade.html'),('spec.md',root/'spec.md')]:
    shutil.copyfile(source,out/name)
with zipfile.ZipFile(out/'TwinTrade-source.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(root.rglob('*')):
        relative=path.relative_to(root)
        if not path.is_file() or any(part in relative.parts for part in ['build','dist','.git','node_modules','releases','.android-sdk','__pycache__']):continue
        if path.suffix in ['.jks','.keystore','.pem']:continue
        archive.write(path,'twintrade/'+str(relative))
sha={name:hashlib.sha256((out/name).read_bytes()).hexdigest() for name in ['TwinTrade.apk','TwinTrade.html','TwinTrade-source.zip','spec.md']}
(out/'SHA256SUMS').write_text(''.join(value+'  '+name+'\n' for name,value in sha.items()))
sha['SHA256SUMS']=hashlib.sha256((out/'SHA256SUMS').read_bytes()).hexdigest()
metadata=json.loads((out/'release.json').read_text());metadata['sha256']=sha
(out/'release.json').write_text(json.dumps(metadata,indent=2)+'\n')
print('Prepared',metadata['tag'])
