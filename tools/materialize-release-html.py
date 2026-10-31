#!/usr/bin/env python3
"""Rebuild omitted standalone HTML from each release's own source archive."""
from pathlib import Path
import hashlib,json,shutil,subprocess,sys,tempfile,zipfile

root=Path(__file__).resolve().parents[1]
for release in sorted((root/'releases').iterdir()):
    metadata=release/'release.json'; output=release/'TwinTrade.html'
    if not metadata.exists() or output.exists():continue
    archive=release/'TwinTrade-source.zip'
    if not archive.exists():raise SystemExit(f'Missing source archive for {release.name}')
    with tempfile.TemporaryDirectory(prefix='twintrade-release-') as temporary:
        target=Path(temporary)
        with zipfile.ZipFile(archive) as source:source.extractall(target)
        checkout=target/'twintrade'
        subprocess.run([sys.executable,str(checkout/'tools/package-web.py')],cwd=checkout,check=True)
        built=checkout/'dist/TwinTrade.html'
        expected=json.loads(metadata.read_text())['sha256']['TwinTrade.html']
        actual=hashlib.sha256(built.read_bytes()).hexdigest()
        if actual!=expected:raise SystemExit(f'{release.name} HTML mismatch: {actual} != {expected}')
        shutil.copyfile(built,output)
        print('Materialized',release.name,'TwinTrade.html')
