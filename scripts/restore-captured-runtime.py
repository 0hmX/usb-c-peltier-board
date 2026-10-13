from pathlib import Path
import hashlib
import json
import shutil

root = Path(__file__).resolve().parent.parent
captured = root / 'archive/runtime'
manifest = json.loads((captured / 'manifest.json').read_text())
records = manifest['runtimeManifest']
assert len(records) == 6
for record in records:
    relative = Path(record['file'])
    assert not relative.is_absolute() and '..' not in relative.parts
    assert relative.parts[0] == 'node_modules'
    payload = (captured / relative).read_bytes()
    assert hashlib.sha256(payload).hexdigest() == record['sha256'], f'Captured runtime changed: {relative}'
    destination = root / relative
    assert destination.resolve().is_relative_to(root), f'Runtime path escapes project: {relative}'
    if relative.name == 'package.json':
        assert destination.is_file(), 'Run bun install --frozen-lockfile first'
        expected = json.loads(payload)
        installed = json.loads(destination.read_text())
        assert (installed['name'], installed['version']) == (expected['name'], expected['version']), f'Installed package version differs: {relative}'
for record in records:
    relative = Path(record['file'])
    destination = root / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(captured / relative, destination)
    assert hashlib.sha256(destination.read_bytes()).hexdigest() == record['sha256']
print(f"Restored and verified six captured runtime files ({manifest['runtimeSha256']})")
