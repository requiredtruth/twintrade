from pathlib import Path
import json, os, subprocess

metas = sorted(Path('releases').glob('*/release.json'), key=lambda p: json.loads(p.read_text()).get('sequence', 0))
for meta in metas:
    info = json.loads(meta.read_text())
    tag = info['tag']
    if subprocess.run(['gh', 'release', 'view', tag], capture_output=True).returncode == 0:
        print('Preserving existing release', tag)
        continue
    args = ['gh', 'release', 'create', tag, '--target', info.get('commit', os.environ['GITHUB_SHA']),
            '--title', info['title'], '--notes-file', str(meta.parent / 'notes.md')]
    if info.get('prerelease'):
        args += ['--prerelease']
    args += [str(meta.parent / name) for name in info['sha256']]
    subprocess.run(args, check=True)
    print('Published', tag)
