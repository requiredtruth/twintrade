from pathlib import Path
import hashlib, json, zipfile

for meta in Path('releases').glob('*/release.json'):
    info = json.loads(meta.read_text())
    for name, digest in info['sha256'].items():
        path = meta.parent / name
        assert path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == digest, f'Checksum mismatch: {path}'
    for name in ['TwinTrade.html', 'TwinTrade.apk', 'spec.md', 'TwinTrade-source.zip', 'SHA256SUMS']:
        assert name in info['sha256'], name
    with zipfile.ZipFile(meta.parent / 'TwinTrade.apk') as apk:
        assert {'classes.dex', 'AndroidManifest.xml'} <= set(apk.namelist())
    assert '<script src=' not in (meta.parent / 'TwinTrade.html').read_text()
    print('Verified', info['tag'])
