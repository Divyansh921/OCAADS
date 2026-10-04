"""Offline snapshot checksum, selection, and failure behavior."""

import json
from pathlib import Path
from shutil import copyfile

import pytest

from app.domain.errors import OrbitalInputError
from app.orbital.dataset import load_dataset

BASE = Path(__file__).resolve().parents[3] / "data" / "fixtures" / "orbital-validation"


@pytest.fixture
def snapshot(tmp_path):
    for name in ("manifest.json", "stations.tle"):
        copyfile(BASE / name, tmp_path / name)
    return tmp_path / "manifest.json"


def test_dataset_window_is_relative_to_target_epoch(snapshot):
    request = load_dataset(snapshot)
    assert request.window.start == request.target.epoch
    assert (request.window.end - request.window.start).days == 7
    assert len(request.comparisons) == 5


def test_modified_snapshot_is_rejected(snapshot):
    with snapshot.with_name("stations.tle").open("a") as stream:
        stream.write("\n")
    with pytest.raises(OrbitalInputError, match="checksum"):
        load_dataset(snapshot)


@pytest.mark.parametrize("comparisons", [None, "norad:49271", ["norad:49271"] * 5])
def test_invalid_manifest_selection_fails_clearly(snapshot, comparisons):
    manifest = json.loads(snapshot.read_text())
    manifest["comparisons"] = comparisons
    snapshot.write_text(json.dumps(manifest))
    with pytest.raises(OrbitalInputError):
        load_dataset(snapshot)


def test_missing_dataset_fails_with_preparation_instructions(tmp_path):
    with pytest.raises(OrbitalInputError, match="fetch_orbital_snapshot.py"):
        load_dataset(tmp_path / "missing.json")
